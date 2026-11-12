import {
  dummyVerifyPassword,
  generateSessionToken,
  generateUuid,
  hashSessionToken,
  timingSafeStringEqual,
  validateSessionTtlHours,
  verifyPassword,
} from "../lib/crypto";
import {
  ADMIN_SESSION_COOKIE_NAME,
  isAdministrator,
  parseSessionCookie,
  unauthorizedResponse,
  verifyAccessJwt,
} from "../middleware/auth";
import { requireAdminOrigin } from "../middleware/cors";
import { errorResponse, jsonResponse } from "../middleware/error";
import { getLoginRateLimitKey } from "../lib/enquiry-rate-limit";
import { validateTurnstile } from "../lib/turnstile";
import { Env } from "../types";

export { validateSessionTtlHours } from "../lib/crypto";
export { getLoginRateLimitKey, normalizeClientIp } from "../lib/enquiry-rate-limit";

/**
 * Handle POST /api/auth/login
 * Production only: Shared team username/password authentication.
 */
export async function handleLogin(request: Request, env: Env): Promise<Response> {
  // Reject password login in non-production environments
  if (env.ENVIRONMENT !== "production") {
    return errorResponse(
      "Password authentication is disabled in development. Please use Cloudflare Access.",
      403,
      "AUTH_METHOD_NOT_SUPPORTED",
    );
  }

  // State-changing endpoint requires trusted admin Origin
  if (!requireAdminOrigin(request, env)) {
    return errorResponse("Forbidden: invalid or missing request Origin", 403, "FORBIDDEN");
  }

  // Fail-closed rate limiting: require ADMIN_LOGIN_RATE_LIMITER binding in production
  if (!env.ADMIN_LOGIN_RATE_LIMITER || typeof env.ADMIN_LOGIN_RATE_LIMITER.limit !== "function") {
    console.error("[Auth Login] ADMIN_LOGIN_RATE_LIMITER binding is missing or unavailable.");
    return errorResponse(
      "Authentication service is temporarily unavailable",
      503,
      "SERVICE_UNAVAILABLE",
    );
  }

  const rateLimitKey = getLoginRateLimitKey(request);
  if (!rateLimitKey) {
    console.error("[Auth Login] Cloudflare client IP is missing or invalid; rejecting request.");
    return errorResponse(
      "Authentication service is temporarily unavailable",
      503,
      "SERVICE_UNAVAILABLE",
    );
  }

  try {
    const limitResult = await env.ADMIN_LOGIN_RATE_LIMITER.limit({ key: rateLimitKey });
    if (!limitResult || limitResult.success === false) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            code: "TOO_MANY_REQUESTS",
            message: "Too many login attempts. Please try again later.",
          },
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        },
      );
    }
  } catch (rlErr) {
    console.error("[Auth Login] Rate limiter check threw an error.");
    return errorResponse(
      "Authentication service is temporarily unavailable",
      503,
      "SERVICE_UNAVAILABLE",
    );
  }

  // Reject oversized request bodies (max 4KB)
  const contentLength = request.headers.get("Content-Length");
  if (contentLength) {
    const parsedLength = parseInt(contentLength, 10);
    if (!Number.isNaN(parsedLength) && parsedLength > 4096) {
      return errorResponse("Request payload too large", 413, "PAYLOAD_TOO_LARGE");
    }
  }

  let bodyText: string;
  try {
    bodyText = await request.text();
  } catch {
    return errorResponse("Unable to read request payload", 400, "BAD_REQUEST");
  }

  if (bodyText.length > 4096) {
    return errorResponse("Request payload too large", 413, "PAYLOAD_TOO_LARGE");
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(bodyText) as Record<string, unknown>;
  } catch {
    return errorResponse("Invalid JSON payload", 400, "BAD_REQUEST");
  }

  if (!body || typeof body !== "object") {
    return errorResponse("Invalid JSON payload", 400, "BAD_REQUEST");
  }

  const rawUsername = body.username;
  const rawPassword = body.password;
  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken.trim() : "";

  if (typeof rawUsername !== "string" || typeof rawPassword !== "string") {
    return errorResponse("Username and password are required", 400, "BAD_REQUEST");
  }

  const username = rawUsername.trim();
  const password = rawPassword;

  if (username.length === 0 || password.length === 0) {
    return errorResponse("Username and password are required", 400, "BAD_REQUEST");
  }

  if (username.length > 128) {
    return errorResponse("Username must not exceed 128 characters", 400, "BAD_REQUEST");
  }

  if (password.length > 1024) {
    return errorResponse("Password must not exceed 1024 characters", 400, "BAD_REQUEST");
  }

  if (!turnstileToken) {
    return errorResponse("Turnstile token is required", 400, "BAD_REQUEST");
  }

  const turnstileValid = await validateTurnstile(
    turnstileToken,
    env.CF_TURNSTILE_SECRET_KEY,
    "admin.techagenz.com",
    request.headers.get("CF-Connecting-IP") ?? undefined,
  );
  if (!turnstileValid) {
    return errorResponse(
      "Bot verification failed. Please try again.",
      422,
      "BOT_VERIFICATION_FAILED",
    );
  }

  const expectedUsername = env.ADMIN_SHARED_USERNAME?.trim();
  const expectedHash = env.ADMIN_SHARED_PASSWORD_HASH?.trim();

  // Fail closed if secrets are unconfigured in production
  if (!expectedUsername || !expectedHash) {
    console.error("[Auth Login] Production shared credentials not configured in environment.");
    return errorResponse("Authentication service is unavailable", 500, "CONFIGURATION_ERROR");
  }

  // Constant-time credential verification to prevent timing side-channels
  const usernameMatches = timingSafeStringEqual(username, expectedUsername);
  let passwordMatches = false;

  if (usernameMatches) {
    passwordMatches = await verifyPassword(password, expectedHash);
  } else {
    // Run dummy PBKDF2 derivation with identical work factor so duration doesn't reveal valid username
    await dummyVerifyPassword();
  }

  if (!usernameMatches || !passwordMatches) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid username or password" },
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  }

  // Validate session TTL
  const ttlHours = validateSessionTtlHours(env.ADMIN_SESSION_TTL_HOURS);
  if (ttlHours === null) {
    console.error("[Auth Login] Invalid ADMIN_SESSION_TTL_HOURS configuration.");
    return errorResponse("Authentication service is misconfigured", 500, "CONFIGURATION_ERROR");
  }

  // Generate cryptographically secure random session token
  const rawToken = generateSessionToken();
  const tokenHash = await hashSessionToken(rawToken);
  const sessionId = generateUuid();
  const expiresDate = new Date(Date.now() + ttlHours * 3600 * 1000);
  const expiresIso = expiresDate.toISOString();
  const userAgent = request.headers.get("User-Agent")?.slice(0, 500) || null;
  const ipAddress = request.headers.get("CF-Connecting-IP") || null;

  // Store token hash in D1
  await env.DB.prepare(
    `INSERT INTO admin_sessions (id, token_hash, username, created_at, expires_at, user_agent, ip_address)
     VALUES (?, ?, ?, datetime('now'), ?, ?, ?)`,
  )
    .bind(sessionId, tokenHash, expectedUsername, expiresIso, userAgent, ipAddress)
    .run();

  const maxAgeSeconds = ttlHours * 3600;
  const isSecure = new URL(request.url).protocol === "https:" || env.ENVIRONMENT === "production";
  const cookieValue = `${ADMIN_SESSION_COOKIE_NAME}=${encodeURIComponent(rawToken)}; Path=/; HttpOnly; SameSite=Strict${isSecure ? "; Secure" : ""}; Max-Age=${maxAgeSeconds}; Expires=${expiresDate.toUTCString()}`;

  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Set-Cookie": cookieValue,
  });

  return new Response(
    JSON.stringify({
      ok: true,
      data: {
        authenticated: true,
        authType: "session",
        username: expectedUsername,
        expiresAt: expiresIso,
      },
    }),
    { status: 200, headers },
  );
}

/**
 * Handle GET /api/auth/session
 * Verify the current session or Cloudflare Access assertion.
 */
export async function handleGetSession(request: Request, env: Env): Promise<Response> {
  if (env.ENVIRONMENT === "production") {
    const token = parseSessionCookie(request.headers.get("Cookie"));
    if (!token) {
      return unauthorizedResponse("No active session");
    }

    const tokenHash = await hashSessionToken(token);
    const session = await env.DB.prepare(
      "SELECT id, username, expires_at, revoked_at FROM admin_sessions WHERE token_hash = ?",
    )
      .bind(tokenHash)
      .first<{ id: string; username: string; expires_at: string; revoked_at: string | null }>();

    if (!session) {
      return unauthorizedResponse("Invalid session");
    }

    if (session.revoked_at !== null) {
      return unauthorizedResponse("Session has been revoked");
    }

    const expiresTime = new Date(session.expires_at).getTime();
    if (Number.isNaN(expiresTime) || expiresTime <= Date.now()) {
      return unauthorizedResponse("Session has expired");
    }

    const headers = new Headers({
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    });

    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          authenticated: true,
          authType: "session",
          username: session.username,
          expiresAt: session.expires_at,
        },
      }),
      { status: 200, headers },
    );
  }

  // Development: verify Cloudflare Access JWT
  const payload = await verifyAccessJwt(request, env);
  if (!payload || !isAdministrator(payload.email, env.ADMIN_ALLOWED_EMAILS)) {
    return unauthorizedResponse("Cloudflare Access session required");
  }

  return jsonResponse({
    authenticated: true,
    authType: "cloudflare_access",
    email: payload.email,
  });
}

/**
 * Handle POST /api/auth/logout
 * Server-side session revocation and cookie clearing.
 */
export async function handleLogout(request: Request, env: Env): Promise<Response> {
  // State-changing endpoint requires trusted admin Origin
  if (!requireAdminOrigin(request, env)) {
    return errorResponse("Forbidden: invalid or missing request Origin", 403, "FORBIDDEN");
  }

  if (env.ENVIRONMENT === "production") {
    const token = parseSessionCookie(request.headers.get("Cookie"));
    if (token) {
      try {
        const tokenHash = await hashSessionToken(token);
        const result = await env.DB.prepare(
          "UPDATE admin_sessions SET revoked_at = datetime('now') WHERE token_hash = ? AND revoked_at IS NULL",
        )
          .bind(tokenHash)
          .run();
        if ((result as unknown as { success?: boolean })?.success === false) {
          console.error("[Auth Logout] D1 revocation returned unsuccessful result.");
          return errorResponse(
            "Unable to complete logout. Please try again.",
            503,
            "DATABASE_ERROR",
          );
        }
      } catch (err) {
        console.error("[Auth Logout] D1 session revocation threw an error.");
        // Do not clear cookie on D1 failure, allowing user to retry
        return errorResponse("Unable to complete logout. Please try again.", 503, "DATABASE_ERROR");
      }
    }
  }

  const isSecure = new URL(request.url).protocol === "https:" || env.ENVIRONMENT === "production";
  const clearCookieHeader = `${ADMIN_SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict${isSecure ? "; Secure" : ""}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Set-Cookie": clearCookieHeader,
  });

  return new Response(
    JSON.stringify({
      ok: true,
      data: {
        loggedOut: true,
      },
    }),
    { status: 200, headers },
  );
}
