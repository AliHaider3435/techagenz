import { Env } from "../../types";
import { jsonResponse, errorResponse } from "../../middleware/error";

interface EnquiryRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string | null;
  budget: string | null;
  message: string;
  status: string;
  source: string;
  created_at: string;
}

const VALID_STATUSES = ["new", "read", "replied", "archived"] as const;

export async function listEnquiries(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status")?.toLowerCase().trim();
  const limitParam = parseInt(url.searchParams.get("limit") || "50", 10);
  const offsetParam = parseInt(url.searchParams.get("offset") || "0", 10);

  const limit = Number.isSafeInteger(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 50;
  const offset = Number.isSafeInteger(offsetParam) && offsetParam >= 0 ? offsetParam : 0;

  // Compute status counts for tab badges
  const countsPromise = env.DB.prepare(
    `SELECT
       COUNT(*) as total,
       SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_count,
       SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read_count,
       SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied_count,
       SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived_count
     FROM enquiries`,
  ).first<{
    total: number;
    new_count: number | null;
    read_count: number | null;
    replied_count: number | null;
    archived_count: number | null;
  }>();

  let query = "SELECT * FROM enquiries";
  const bindings: (string | number)[] = [];

  if (
    statusFilter &&
    statusFilter !== "all" &&
    (VALID_STATUSES as readonly string[]).includes(statusFilter)
  ) {
    query += " WHERE status = ?";
    bindings.push(statusFilter);
  }

  query += " ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?";
  bindings.push(limit, offset);

  const [enquiriesResult, countsResult] = await Promise.all([
    env.DB.prepare(query)
      .bind(...bindings)
      .all<EnquiryRow>(),
    countsPromise,
  ]);

  return jsonResponse({
    enquiries: enquiriesResult.results,
    pagination: {
      limit,
      offset,
      total: countsResult?.total ?? 0,
    },
    counts: {
      total: countsResult?.total ?? 0,
      new: countsResult?.new_count ?? 0,
      read: countsResult?.read_count ?? 0,
      replied: countsResult?.replied_count ?? 0,
      archived: countsResult?.archived_count ?? 0,
    },
  });
}

export async function updateEnquiryStatus(
  request: Request,
  env: Env,
  idStr: string,
): Promise<Response> {
  const id = parseInt(idStr, 10);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return errorResponse("Invalid enquiry ID", 400, "BAD_REQUEST");
  }

  const existing = await env.DB.prepare("SELECT id, status FROM enquiries WHERE id = ?")
    .bind(id)
    .first<EnquiryRow>();
  if (!existing) {
    return errorResponse("Enquiry not found", 404, "NOT_FOUND");
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errorResponse("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const newStatus = typeof body.status === "string" ? body.status.toLowerCase().trim() : "";
  if (!newStatus || !(VALID_STATUSES as readonly string[]).includes(newStatus)) {
    return errorResponse(
      `Invalid status. Allowed values: ${VALID_STATUSES.join(", ")}`,
      400,
      "VALIDATION_ERROR",
    );
  }

  await env.DB.prepare("UPDATE enquiries SET status = ? WHERE id = ?").bind(newStatus, id).run();

  const updated = await env.DB.prepare("SELECT * FROM enquiries WHERE id = ?")
    .bind(id)
    .first<EnquiryRow>();
  return jsonResponse(updated, 200);
}

export async function deleteEnquiry(_request: Request, env: Env, idStr: string): Promise<Response> {
  const id = parseInt(idStr, 10);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return errorResponse("Invalid enquiry ID", 400, "BAD_REQUEST");
  }

  const existing = await env.DB.prepare("SELECT id FROM enquiries WHERE id = ?").bind(id).first();
  if (!existing) {
    return errorResponse("Enquiry not found", 404, "NOT_FOUND");
  }

  await env.DB.prepare("DELETE FROM enquiries WHERE id = ?").bind(id).run();
  return jsonResponse({ deleted: true, id }, 200);
}
