import { decodeProtectedHeader, importJWK, jwtVerify, type JWTHeaderParameters } from "jose";

import { Env } from "../types";

const ACCESS_ASSERTION_HEADER = "Cf-Access-Jwt-Assertion";
const JWKS_CACHE_TTL_MS = 5 * 60 * 1000;
const JWKS_TIMEOUT_MS = 5_000;
const MAX_JWKS_BYTES = 64 * 1024;
const MAX_JWKS_KEYS = 32;
const CLOCK_TOLERANCE_SECONDS = 60;
const ACCESS_TEAM_SUFFIX = ".cloudflareaccess.com";
const ACCESS_JWKS_PATH = "/cdn-cgi/access/certs";

export interface AccessPayload {
  sub: string;
  email: string;
  aud: string[];
  iat: number;
  exp: number;
}

interface CachedJwks {
  teamDomain: string;
  expiresAt: number;
  keys: Map<string, Awaited<ReturnType<typeof importJWK>>>;
}

interface AccessJwtVerifierOptions {
  fetcher?: typeof fetch;
  now?: () => number;
}

function getTeamDomain(value: string | undefined): string | null {
  const domain = value?.trim().toLowerCase();
  if (!domain || domain.length > 253 || domain.includes("://") || domain.includes("/")) {
    return null;
  }
  if (!domain.endsWith(ACCESS_TEAM_SUFFIX)) return null;
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.cloudflareaccess\.com$/.test(domain)) {
    return null;
  }
  return domain;
}

function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 254 || /[\s,]/.test(value)) return false;
  const parts = value.split("@");
  if (parts.length !== 2) return false;

  const [localPart, domain] = parts;
  if (
    !localPart ||
    localPart.length > 64 ||
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..") ||
    !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart)
  ) {
    return false;
  }

  const labels = domain.split(".");
  return (
    labels.length > 1 &&
    labels.every(
      (label) =>
        label.length > 0 &&
        label.length <= 63 &&
        /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(label),
    )
  );
}

function getValidJwk(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const jwk = value as Record<string, unknown>;

  if (
    jwk.kty !== "RSA" ||
    typeof jwk.kid !== "string" ||
    jwk.kid.length === 0 ||
    jwk.kid.length > 256 ||
    typeof jwk.n !== "string" ||
    typeof jwk.e !== "string" ||
    (jwk.alg !== undefined && jwk.alg !== "RS256") ||
    (jwk.use !== undefined && jwk.use !== "sig") ||
    (jwk.key_ops !== undefined &&
      (!Array.isArray(jwk.key_ops) || !jwk.key_ops.includes("verify"))) ||
    "d" in jwk
  ) {
    return null;
  }

  return jwk;
}

async function parseJwks(
  response: Response,
): Promise<Map<string, Awaited<ReturnType<typeof importJWK>>>> {
  if (!response.ok) throw new Error("Unable to fetch Access signing keys");

  const body = await response.text();
  if (new TextEncoder().encode(body).byteLength > MAX_JWKS_BYTES) {
    throw new Error("Access JWKS response exceeds size limit");
  }

  let document: unknown;
  try {
    document = JSON.parse(body);
  } catch {
    throw new Error("Access JWKS response is malformed");
  }

  if (
    !document ||
    typeof document !== "object" ||
    !("keys" in document) ||
    !Array.isArray(document.keys) ||
    document.keys.length === 0 ||
    document.keys.length > MAX_JWKS_KEYS
  ) {
    throw new Error("Access JWKS response has an invalid key set");
  }

  const keys = new Map<string, Awaited<ReturnType<typeof importJWK>>>();
  for (const candidate of document.keys) {
    const jwk = getValidJwk(candidate);
    if (!jwk) continue;

    const kid = jwk.kid as string;
    if (keys.has(kid)) throw new Error("Access JWKS contains duplicate key IDs");
    keys.set(kid, await importJWK(jwk, "RS256"));
  }

  if (keys.size === 0) throw new Error("Access JWKS has no supported signing keys");
  return keys;
}

/**
 * Creates a verifier with bounded JWKS caching. The injected fetcher and clock
 * allow deterministic tests without weakening the production verifier.
 */
export function createAccessJwtVerifier(options: AccessJwtVerifierOptions = {}) {
  const fetcher = options.fetcher ?? fetch;
  const now = options.now ?? Date.now;
  let cachedJwks: CachedJwks | undefined;
  let refreshPromise:
    | Promise<{ teamDomain: string; keys: Map<string, Awaited<ReturnType<typeof importJWK>>> }>
    | undefined;

  async function loadJwks(teamDomain: string, forceRefresh = false, requiredKid?: string) {
    if (!forceRefresh && cachedJwks?.teamDomain === teamDomain && cachedJwks.expiresAt > now()) {
      return cachedJwks.keys;
    }

    if (refreshPromise) {
      const current = await refreshPromise;
      if (
        current.teamDomain === teamDomain &&
        (!forceRefresh || !requiredKid || current.keys.has(requiredKid))
      ) {
        return current.keys;
      }
    }

    const refresh = (async () => {
      const url = `https://${teamDomain}${ACCESS_JWKS_PATH}`;
      const response = await fetcher(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(JWKS_TIMEOUT_MS),
      });
      const keys = await parseJwks(response);
      return { teamDomain, keys };
    })();

    refreshPromise = refresh;
    try {
      const result = await refresh;
      cachedJwks = {
        ...result,
        expiresAt: now() + JWKS_CACHE_TTL_MS,
      };
      return result.keys;
    } finally {
      if (refreshPromise === refresh) refreshPromise = undefined;
    }
  }

  return async function verify(request: Request, env: Env): Promise<AccessPayload | null> {
    const teamDomain = getTeamDomain(env.CF_ACCESS_TEAM_DOMAIN);
    const audience = env.CF_ACCESS_AUD?.trim();
    const token = request.headers.get(ACCESS_ASSERTION_HEADER);
    if (!teamDomain || !audience || !token?.trim()) return null;

    try {
      const header = decodeProtectedHeader(token);
      if (
        header.alg !== "RS256" ||
        typeof header.kid !== "string" ||
        !header.kid ||
        header.jku !== undefined ||
        header.jwk !== undefined ||
        header.x5u !== undefined
      ) {
        return null;
      }

      const resolveKey = async (protectedHeader: JWTHeaderParameters) => {
        if (protectedHeader.alg !== "RS256" || typeof protectedHeader.kid !== "string") {
          throw new Error("Unsupported Access signing key");
        }

        let keys = await loadJwks(teamDomain);
        let key = keys.get(protectedHeader.kid);
        if (!key) {
          keys = await loadJwks(teamDomain, true, protectedHeader.kid);
          key = keys.get(protectedHeader.kid);
        }
        if (!key) throw new Error("No matching Access signing key");
        return key;
      };

      const { payload } = await jwtVerify(token, resolveKey, {
        algorithms: ["RS256"],
        issuer: `https://${teamDomain}`,
        audience,
        requiredClaims: ["iss", "aud", "sub", "email", "iat", "exp"],
        clockTolerance: CLOCK_TOLERANCE_SECONDS,
      });

      const currentTime = Math.floor(now() / 1000);
      if (
        typeof payload.sub !== "string" ||
        payload.sub.trim().length === 0 ||
        payload.sub.length > 512 ||
        !isValidEmail(payload.email) ||
        typeof payload.iat !== "number" ||
        !Number.isFinite(payload.iat) ||
        payload.iat > currentTime + CLOCK_TOLERANCE_SECONDS ||
        typeof payload.exp !== "number" ||
        !Number.isFinite(payload.exp) ||
        payload.iat >= payload.exp ||
        (payload.nbf !== undefined &&
          (typeof payload.nbf !== "number" || !Number.isFinite(payload.nbf)))
      ) {
        return null;
      }

      const tokenAudiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
      if (!tokenAudiences.every((item): item is string => typeof item === "string")) return null;

      return {
        sub: payload.sub,
        email: payload.email,
        aud: tokenAudiences,
        iat: payload.iat,
        exp: payload.exp,
      };
    } catch {
      return null;
    }
  };
}

const verifyConfiguredAccessJwt = createAccessJwtVerifier();

/**
 * Authenticate the Cloudflare Access assertion. Authorization is deliberately
 * separate and is enforced by requireAdmin().
 */
export async function verifyAccessJwt(request: Request, env: Env): Promise<AccessPayload | null> {
  return verifyConfiguredAccessJwt(request, env);
}

export function isAdministrator(email: string, allowListValue: string | undefined): boolean {
  if (!isValidEmail(email) || !allowListValue?.trim()) return false;

  const entries = allowListValue.split(",");
  if (entries.length === 0) return false;
  const allowedEmails: string[] = [];

  for (const entry of entries) {
    const normalized = entry.trim().toLowerCase();
    if (!isValidEmail(normalized)) return false;
    allowedEmails.push(normalized);
  }

  return allowedEmails.includes(email.trim().toLowerCase());
}

export function unauthorizedResponse(message = "Unauthorized"): Response {
  return new Response(
    JSON.stringify({
      ok: false,
      error: { code: "UNAUTHORIZED", message },
    }),
    { status: 401, headers: { "Content-Type": "application/json" } },
  );
}

export function forbiddenResponse(message = "Forbidden"): Response {
  return new Response(
    JSON.stringify({
      ok: false,
      error: { code: "FORBIDDEN", message },
    }),
    { status: 403, headers: { "Content-Type": "application/json" } },
  );
}

export async function requireAuth(request: Request, env: Env): Promise<AccessPayload> {
  const payload = await verifyAccessJwt(request, env);
  if (!payload) throw unauthorizedResponse();
  return payload;
}

export async function requireAdmin(request: Request, env: Env): Promise<AccessPayload> {
  const payload = await requireAuth(request, env);
  const configuredApiHost = env.CF_ACCESS_API_HOST?.trim().toLowerCase();
  if (
    !configuredApiHost ||
    !isAdministrator(payload.email, env.ADMIN_ALLOWED_EMAILS) ||
    new URL(request.url).hostname.toLowerCase() !== configuredApiHost
  ) {
    throw forbiddenResponse();
  }
  return payload;
}
