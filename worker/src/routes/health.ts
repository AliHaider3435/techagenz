import { Env } from "../types";
import { jsonResponse } from "../middleware/error";

/**
 * GET /health
 * Public health check — no auth required.
 */
export async function handleHealth(_request: Request, env: Env): Promise<Response> {
  const data = {
    status: "ok",
    service: "techagenz-api",
    environment: env.ENVIRONMENT ?? "unknown",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
  };
  return jsonResponse(data);
}
