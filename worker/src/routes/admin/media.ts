import { Env } from "../../types";
import { jsonResponse } from "../../middleware/error";

interface MediaAssetRow {
  id: number;
  r2_path: string;
  file_name: string;
  content_type: string;
  size_bytes: number | null;
  alt_text: string | null;
  entity_type: string | null;
  entity_id: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export async function listMediaAssets(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const folder = url.searchParams.get("folder")?.toLowerCase().trim();
  const search = url.searchParams.get("search")?.toLowerCase().trim();
  const limitParam = parseInt(url.searchParams.get("limit") || "60", 10);
  const offsetParam = parseInt(url.searchParams.get("offset") || "0", 10);

  const limit = Number.isSafeInteger(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 60;
  const offset = Number.isSafeInteger(offsetParam) && offsetParam >= 0 ? offsetParam : 0;

  const conditions: string[] = [];
  const bindings: (string | number)[] = [];

  if (folder && folder !== "all") {
    conditions.push("(entity_type = ? OR r2_path LIKE ?)");
    bindings.push(folder, `${folder}/%`);
  }

  if (search) {
    conditions.push("(file_name LIKE ? OR alt_text LIKE ? OR r2_path LIKE ?)");
    const wildcard = `%${search}%`;
    bindings.push(wildcard, wildcard, wildcard);
  }

  const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";

  const totalCount = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM media_assets${whereClause}`,
  )
    .bind(...bindings)
    .first<{ count: number }>();

  const query = `SELECT * FROM media_assets${whereClause} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`;
  bindings.push(limit, offset);

  const { results } = await env.DB.prepare(query)
    .bind(...bindings)
    .all<MediaAssetRow>();

  return jsonResponse({
    assets: results.map((row) => ({
      id: row.id,
      path: row.r2_path,
      url: `/api/r2/${row.r2_path}`,
      fileName: row.file_name,
      contentType: row.content_type,
      sizeBytes: row.size_bytes,
      altText: row.alt_text,
      entityType: row.entity_type,
      entityId: row.entity_id,
      uploadedBy: row.uploaded_by,
      createdAt: row.created_at,
    })),
    total: totalCount?.count ?? 0,
    pagination: { limit, offset },
  });
}
