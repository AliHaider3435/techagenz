import { Env } from "../types";
import { errorResponse, jsonResponse } from "../middleware/error";
import { requireAdminOrigin } from "../middleware/cors";
import {
  forbiddenResponse,
  requireAdmin,
  unauthorizedResponse,
  AccessPayload,
} from "../middleware/auth";

/**
 * R2 asset management routes — protected by Cloudflare Access JWT.
 *
 * Supported bucket paths:
 *   team/        — Team member photos
 *   blogs/       — Blog cover images
 *   projects/    — Case study cover images
 *   general/     — Misc assets (CV, documents, etc.)
 *
 * Routes:
 *   GET  /api/r2/:path*     — Retrieve an asset (served as raw bytes, public)
 *   POST /api/r2/upload     — Upload an asset (admin only)
 *   DELETE /api/r2/:path*   — Delete an asset (admin only)
 */

const ALLOWED_PREFIXES = ["team/", "blogs/", "projects/", "general/"];
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_CONTENT_TYPES = new Set([
  "image/webp",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "application/pdf",
]);

function isAllowedPath(path: string): boolean {
  return ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-");
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

/**
 * POST /api/r2/upload
 * Admin only — protected by requireAdmin().
 */
export async function uploadAsset(request: Request, env: Env): Promise<Response> {
  if (!requireAdminOrigin(request)) {
    return errorResponse("Forbidden: invalid or missing request Origin", 403, "FORBIDDEN");
  }

  let admin: AccessPayload;
  try {
    admin = await requireAdmin(request, env);
  } catch (err) {
    if (err instanceof Response) return err;
    return unauthorizedResponse();
  }

  if (env.ADMIN_CMS_ENABLED !== "true") {
    return forbiddenResponse("R2 writes are disabled");
  }

  const url = new URL(request.url);
  const contentTypeHeader = request.headers.get("content-type") || "";

  let fileData: Uint8Array | ArrayBuffer | ReadableStream;
  let fileName = "";
  let folder = "general";
  let mimeType = "image/webp";
  let sizeBytes = 0;
  let altText: string | null = null;
  let entityType: string | null = null;
  let entityId: string | null = null;

  if (contentTypeHeader.includes("multipart/form-data")) {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return errorResponse("Invalid multipart form data", 400, "BAD_REQUEST");
    }

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return errorResponse(
        'A valid file is required in form-data field "file"',
        400,
        "VALIDATION_ERROR",
      );
    }

    fileName = sanitizeFileName(file.name || `asset-${Date.now()}`);
    mimeType = file.type || "image/webp";
    sizeBytes = file.size;

    folder = String(formData.get("folder") || "general")
      .toLowerCase()
      .trim();
    altText = formData.get("altText") ? String(formData.get("altText")).trim() : null;
    entityType = formData.get("entityType") ? String(formData.get("entityType")).trim() : folder;
    entityId = formData.get("entityId") ? String(formData.get("entityId")).trim() : null;

    fileData = await file.arrayBuffer();
  } else {
    // Direct binary upload with query parameters
    const pathQuery = url.searchParams.get("path") || "";
    if (pathQuery) {
      const parts = pathQuery.split("/");
      folder = parts[0] || "general";
      fileName = sanitizeFileName(parts.slice(1).join("/") || `asset-${Date.now()}`);
    } else {
      folder = (url.searchParams.get("folder") || "general").toLowerCase().trim();
      fileName = sanitizeFileName(url.searchParams.get("fileName") || `asset-${Date.now()}.webp`);
    }

    mimeType = request.headers.get("content-type") || "image/webp";
    altText = url.searchParams.get("altText") || null;
    entityType = url.searchParams.get("entityType") || folder;
    entityId = url.searchParams.get("entityId") || null;

    const buffer = await request.arrayBuffer();
    sizeBytes = buffer.byteLength;
    fileData = buffer;
  }

  if (sizeBytes > MAX_UPLOAD_BYTES) {
    return errorResponse(
      `File size (${(sizeBytes / (1024 * 1024)).toFixed(1)}MB) exceeds 10MB limit`,
      400,
      "PAYLOAD_TOO_LARGE",
    );
  }

  if (mimeType && !ALLOWED_CONTENT_TYPES.has(mimeType)) {
    return errorResponse(
      `Content type "${mimeType}" is not supported`,
      400,
      "UNSUPPORTED_MEDIA_TYPE",
    );
  }

  // Normalize folder prefix
  if (!folder.endsWith("/")) {
    folder = `${folder}/`;
  }
  if (!ALLOWED_PREFIXES.includes(folder)) {
    return errorResponse(
      `Invalid folder prefix. Allowed: ${ALLOWED_PREFIXES.join(", ")}`,
      400,
      "INVALID_PATH",
    );
  }

  const r2Path = `${folder}${fileName}`;

  // Store in R2 bucket
  await env.ASSETS.put(r2Path, fileData, {
    httpMetadata: {
      contentType: mimeType,
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  // Track in media_assets table if DB is available
  if (env.DB && typeof env.DB.prepare === "function") {
    try {
      await env.DB.prepare(
        `INSERT INTO media_assets (r2_path, file_name, content_type, size_bytes, alt_text, entity_type, entity_id, uploaded_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(r2_path) DO UPDATE SET
           file_name = excluded.file_name,
           content_type = excluded.content_type,
           size_bytes = excluded.size_bytes,
           alt_text = COALESCE(excluded.alt_text, media_assets.alt_text),
           uploaded_by = excluded.uploaded_by`,
      )
        .bind(r2Path, fileName, mimeType, sizeBytes, altText, entityType, entityId, admin.email)
        .run();
    } catch (dbErr) {
      console.warn("[R2 Upload] Note: media_assets catalog write skipped/failed:", dbErr);
    }
  }

  return jsonResponse(
    {
      url: `/api/r2/${r2Path}`,
      path: r2Path,
      fileName,
      contentType: mimeType,
      sizeBytes,
      uploadedBy: admin.email,
    },
    201,
  );
}

/**
 * DELETE /api/r2/:path*
 * Admin only — protected by requireAdmin().
 */
export async function deleteAsset(
  request: Request,
  env: Env,
  assetPath: string,
): Promise<Response> {
  if (!requireAdminOrigin(request)) {
    return errorResponse("Forbidden: invalid or missing request Origin", 403, "FORBIDDEN");
  }

  try {
    await requireAdmin(request, env);
  } catch (err) {
    if (err instanceof Response) return err;
    return unauthorizedResponse();
  }

  if (env.ADMIN_CMS_ENABLED !== "true") {
    return forbiddenResponse("R2 writes are disabled");
  }

  if (!isAllowedPath(assetPath)) {
    return errorResponse("Invalid asset path", 400);
  }

  await env.ASSETS.delete(assetPath);

  if (env.DB && typeof env.DB.prepare === "function") {
    try {
      await env.DB.prepare("DELETE FROM media_assets WHERE r2_path = ?").bind(assetPath).run();
    } catch (dbErr) {
      console.warn("[R2 Delete] Note: media_assets catalog delete skipped/failed:", dbErr);
    }
  }

  return jsonResponse({ deleted: true, path: assetPath }, 200);
}
