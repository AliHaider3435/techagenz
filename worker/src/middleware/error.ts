/**
 * Centralised error handling for the Tech Agenz Worker.
 * Converts thrown errors / unknown values into consistent JSON responses.
 */

export interface ErrorBody {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}

/**
 * Wraps a route handler so that any thrown error becomes a JSON response.
 * If a handler throws a Response (e.g. from requireAuth), it is returned as-is.
 */
export async function withErrorHandling(handler: () => Promise<Response>): Promise<Response> {
  try {
    return await handler();
  } catch (err) {
    // Allow middleware to throw Response directly (e.g. 401 from requireAuth)
    if (err instanceof Response) {
      return err;
    }

    console.error("[Worker] Unhandled error:", err);

    const body: ErrorBody = {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    };

    return new Response(JSON.stringify(body), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Returns a JSON error response.
 */
export function errorResponse(
  message: string,
  status = 400,
  code = status === 404 ? "NOT_FOUND" : status === 400 ? "BAD_REQUEST" : "REQUEST_ERROR",
): Response {
  const body: ErrorBody = { ok: false, error: { code, message } };
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Returns a JSON success response.
 */
export function jsonResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ ok: true, data }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
