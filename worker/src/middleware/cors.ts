import { Env } from "../types";

const PUBLIC_ORIGINS = new Set([
  "https://techagenz.com",
  "https://www.techagenz.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4173",
]);

const ALLOWED_METHODS = new Set(["GET", "POST"]);
const ALLOWED_HEADERS = new Map([["content-type", "Content-Type"]]);

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

function corsHeadersForOrigin(origin: string): Headers {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", origin);
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

export function isAllowedRequestOrigin(request: Request): boolean {
  const origin = request.headers.get("Origin");
  return !origin || PUBLIC_ORIGINS.has(origin);
}

/**
 * Handle CORS preflight requests for public API endpoints.
 */
export function handleCors(request: Request, _env: Env): Response | null {
  const origin = request.headers.get("Origin");
  if (request.method !== "OPTIONS") {
    return origin && !isAllowedRequestOrigin(request) ? rejectedCorsResponse() : null;
  }

  if (!origin || !PUBLIC_ORIGINS.has(origin)) {
    return rejectedCorsResponse();
  }

  const requestedMethod = request.headers.get("Access-Control-Request-Method");
  const requestedHeaders = parseRequestedHeaders(
    request.headers.get("Access-Control-Request-Headers"),
  );

  if (
    !requestedMethod ||
    !ALLOWED_METHODS.has(requestedMethod) ||
    requestedHeaders === null ||
    requestedHeaders.some((header) => !ALLOWED_HEADERS.has(header))
  ) {
    return rejectedCorsResponse();
  }

  const headers = corsHeadersForOrigin(origin);
  appendVary(headers, ["Origin"]);
  headers.set("Access-Control-Allow-Methods", requestedMethod);
  if (requestedHeaders.length > 0) {
    headers.set(
      "Access-Control-Allow-Headers",
      requestedHeaders.map((header) => ALLOWED_HEADERS.get(header)!).join(", "),
    );
  }
  headers.set("Access-Control-Max-Age", "600");
  appendVary(headers, ["Access-Control-Request-Method", "Access-Control-Request-Headers"]);
  return new Response(null, { status: 204, headers });
}

/**
 * Attach CORS response headers to requests from explicitly allowed public origins.
 */
export function withCors(response: Response, request: Request, _env: Env): Response {
  const origin = request.headers.get("Origin");
  if (!origin || !PUBLIC_ORIGINS.has(origin)) {
    const newResponse = new Response(response.body, response);
    appendVary(newResponse.headers, ["Origin"]);
    return newResponse;
  }

  const newResponse = new Response(response.body, response);
  corsHeadersForOrigin(origin).forEach((value, key) => newResponse.headers.set(key, value));
  appendVary(newResponse.headers, ["Origin"]);
  return newResponse;
}
