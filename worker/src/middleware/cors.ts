import { Env } from "../types";

export const DEV_ADMIN_ORIGIN = "https://admin-dev.techagenz.com";
export const PROD_ADMIN_ORIGIN = "https://admin.techagenz.com";

export function getAdminOrigin(env?: Env): string {
  if (env?.ENVIRONMENT === "production") {
    return PROD_ADMIN_ORIGIN;
  }
  return DEV_ADMIN_ORIGIN;
}

const PUBLIC_ORIGINS = new Set([
  "https://techagenz.com",
  "https://www.techagenz.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4173",
]);
const PUBLIC_METHODS = new Set(["GET", "POST"]);
const ADMIN_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);
const PUBLIC_HEADERS = new Map([["content-type", "Content-Type"]]);
const ADMIN_HEADERS = new Map([["content-type", "Content-Type"]]);

function isAdminApiRequest(request: Request): boolean {
  const { pathname } = new URL(request.url);
  const method =
    request.method === "OPTIONS"
      ? request.headers.get("Access-Control-Request-Method")
      : request.method;
  return (
    pathname === "/api/admin" ||
    pathname.startsWith("/api/admin/") ||
    pathname === "/api/auth" ||
    pathname.startsWith("/api/auth/") ||
    (pathname === "/api/r2/upload" && method === "POST") ||
    (pathname.startsWith("/api/r2/") && method === "DELETE")
  );
}

function allowedOrigins(request: Request, env?: Env): Set<string> {
  const adminOrigin = getAdminOrigin(env);
  return isAdminApiRequest(request)
    ? new Set([adminOrigin])
    : new Set([...PUBLIC_ORIGINS, adminOrigin]);
}

function appendVary(headers: Headers, values: string[]): void {
  const current = headers.get("Vary");
  const varyValues = new Set(
    (current ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  for (const value of values) varyValues.add(value);
  headers.set("Vary", [...varyValues].join(", "));
}

function corsHeadersForOrigin(origin: string, env?: Env): Headers {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", origin);
  const adminOrigin = getAdminOrigin(env);
  if (origin === adminOrigin) {
    headers.set("Access-Control-Allow-Credentials", "true");
  }
  return headers;
}

function rejectedCorsResponse(): Response {
  const headers = new Headers({ "Cache-Control": "no-store" });
  appendVary(headers, [
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ]);
  return new Response(null, { status: 403, headers });
}

function parseRequestedHeaders(value: string | null): string[] | null {
  if (value === null || value.trim() === "") return [];
  const headers = value.split(",").map((header) => header.trim().toLowerCase());
  if (headers.some((header) => !header || !/^[a-z0-9-]+$/.test(header))) return null;
  return [...new Set(headers)];
}

/**
 * Validate browser origins independently of authentication. This is a CORS
 * boundary only; protected handlers still verify Access or session
 * authorization for every actual request.
 */
export function isAllowedRequestOrigin(request: Request, env?: Env): boolean {
  const origin = request.headers.get("Origin");
  return !origin || allowedOrigins(request, env).has(origin);
}

/**
 * Handle CORS preflight requests before routing. A successful response does
 * not authenticate the subsequent request or authorize any operation.
 */
export function handleCors(request: Request, env: Env): Response | null {
  const origin = request.headers.get("Origin");
  if (request.method !== "OPTIONS") {
    return origin && !isAllowedRequestOrigin(request, env) ? rejectedCorsResponse() : null;
  }

  const origins = allowedOrigins(request, env);
  if (!origin || !origins.has(origin)) {
    return rejectedCorsResponse();
  }

  const adminOrigin = getAdminOrigin(env);
  const requestedMethod = request.headers.get("Access-Control-Request-Method");
  const methods = origin === adminOrigin ? ADMIN_METHODS : PUBLIC_METHODS;
  const requestedHeaders = parseRequestedHeaders(
    request.headers.get("Access-Control-Request-Headers"),
  );
  const headersAllowList = origin === adminOrigin ? ADMIN_HEADERS : PUBLIC_HEADERS;

  if (
    !requestedMethod ||
    !methods.has(requestedMethod) ||
    requestedHeaders === null ||
    requestedHeaders.some((header) => !headersAllowList.has(header))
  ) {
    return rejectedCorsResponse();
  }

  const headers = corsHeadersForOrigin(origin, env);
  appendVary(headers, ["Origin"]);
  headers.set("Access-Control-Allow-Methods", requestedMethod);
  if (requestedHeaders.length > 0) {
    headers.set(
      "Access-Control-Allow-Headers",
      requestedHeaders.map((header) => headersAllowList.get(header)!).join(", "),
    );
  }
  headers.set("Access-Control-Max-Age", "600");
  appendVary(headers, ["Access-Control-Request-Method", "Access-Control-Request-Headers"]);
  return new Response(null, { status: 204, headers });
}

/**
 * Attach CORS response headers only to requests from explicitly allowed
 * origins. Protected API paths are readable only by the admin frontend.
 */
export function withCors(response: Response, request: Request, env: Env): Response {
  const origin = request.headers.get("Origin");
  if (!origin || !allowedOrigins(request, env).has(origin)) {
    const newResponse = new Response(response.body, response);
    appendVary(newResponse.headers, ["Origin"]);
    return newResponse;
  }

  const newResponse = new Response(response.body, response);
  corsHeadersForOrigin(origin, env).forEach((value, key) => newResponse.headers.set(key, value));
  appendVary(newResponse.headers, ["Origin"]);
  return newResponse;
}

export function requireAdminOrigin(request: Request, env?: Env): boolean {
  const origin = request.headers.get("Origin");
  return origin === getAdminOrigin(env);
}
