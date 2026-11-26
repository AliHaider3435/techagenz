import { Env } from "../types";
import { errorResponse } from "../middleware/error";

/**
 * R2 asset delivery route.
 *
 * Supported bucket paths:
 *   team/        — Team member photos
 *   blogs/       — Blog cover images
 *   projects/    — Case study cover images
 *   general/     — Misc assets (CV, documents, etc.)
 *
 * Routes:
 *   GET  /api/r2/:path*     — Retrieve an asset (served as raw bytes, public)
 */

const ALLOWED_PREFIXES = ["team/", "blogs/", "projects/", "general/"];

function isAllowedPath(path: string): boolean {
  return ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

/**
 * GET /api/r2/:path*
 * Public read (assets are not secret).
 */
export async function getAsset(_request: Request, env: Env, assetPath: string): Promise<Response> {
  if (!isAllowedPath(assetPath)) {
    return errorResponse("Invalid asset path", 400);
  }

  const object = await env.ASSETS.get(assetPath);
  if (!object) return errorResponse("Asset not found", 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(object.body, { headers });
}
