import { Env, TeamMemberDto } from "../../types";
import { jsonResponse, errorResponse } from "../../middleware/error";

interface TeamRow {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  border_color: string;
  gradient: string;
  url: string;
  sort_order: number;
}

function mapTeamRow(row: TeamRow): TeamMemberDto {
  return {
    id: row.id,
    name: row.title,
    role: row.subtitle,
    image: row.image,
    borderColor: row.border_color,
    gradient: row.gradient,
    sortOrder: row.sort_order,
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function listTeamMembers(_request: Request, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    "SELECT id, image, title, subtitle, border_color, gradient, url, sort_order FROM team_members ORDER BY sort_order ASC, id ASC",
  ).all<TeamRow>();

  return jsonResponse(results.map(mapTeamRow));
}

export async function getTeamMember(_request: Request, env: Env, id: string): Promise<Response> {
  const row = await env.DB.prepare(
    "SELECT id, image, title, subtitle, border_color, gradient, url, sort_order FROM team_members WHERE id = ?",
  )
    .bind(id)
    .first<TeamRow>();

  if (!row) {
    return errorResponse("Team member not found", 404, "NOT_FOUND");
  }

  return jsonResponse(mapTeamRow(row));
}

export async function createTeamMember(request: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errorResponse("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const name =
    typeof body.name === "string"
      ? body.name.trim()
      : typeof body.title === "string"
        ? body.title.trim()
        : "";
  const role =
    typeof body.role === "string"
      ? body.role.trim()
      : typeof body.subtitle === "string"
        ? body.subtitle.trim()
        : "";

  if (!name) {
    return errorResponse("Team member name is required", 400, "VALIDATION_ERROR");
  }
  if (!role) {
    return errorResponse("Team member role is required", 400, "VALIDATION_ERROR");
  }

  let id = typeof body.id === "string" && body.id.trim() ? slugify(body.id) : slugify(name);
  if (!id) {
    id = `member-${Date.now()}`;
  }

  // Check if ID already exists
  const existing = await env.DB.prepare("SELECT id FROM team_members WHERE id = ?")
    .bind(id)
    .first();
  if (existing) {
    id = `${id}-${Date.now().toString(36)}`;
  }

  const image =
    typeof body.image === "string" && body.image.trim()
      ? body.image.trim()
      : "/team-images/team1.webp";
  const borderColor =
    typeof body.borderColor === "string"
      ? body.borderColor
      : typeof body.border_color === "string"
        ? body.border_color
        : "#22D3EE";
  const gradient =
    typeof body.gradient === "string" && body.gradient.trim()
      ? body.gradient.trim()
      : `linear-gradient(145deg, ${borderColor}, #050B14)`;
  const url = typeof body.url === "string" ? body.url.trim() : "";

  let sortOrder =
    typeof body.sortOrder === "number"
      ? body.sortOrder
      : typeof body.sort_order === "number"
        ? body.sort_order
        : null;
  if (sortOrder === null) {
    const maxOrder = await env.DB.prepare(
      "SELECT MAX(sort_order) as max_order FROM team_members",
    ).first<{ max_order: number | null }>();
    sortOrder = (maxOrder?.max_order ?? 0) + 1;
  }

  await env.DB.prepare(
    `INSERT INTO team_members (id, image, title, subtitle, border_color, gradient, url, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
  )
    .bind(id, image, name, role, borderColor, gradient, url, sortOrder)
    .run();

  const created = await env.DB.prepare(
    "SELECT id, image, title, subtitle, border_color, gradient, url, sort_order FROM team_members WHERE id = ?",
  )
    .bind(id)
    .first<TeamRow>();

  return jsonResponse(mapTeamRow(created!), 201);
}

export async function updateTeamMember(request: Request, env: Env, id: string): Promise<Response> {
  const existing = await env.DB.prepare(
    "SELECT id, image, title, subtitle, border_color, gradient, url, sort_order FROM team_members WHERE id = ?",
  )
    .bind(id)
    .first<TeamRow>();

  if (!existing) {
    return errorResponse("Team member not found", 404, "NOT_FOUND");
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errorResponse("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const name =
    typeof body.name === "string"
      ? body.name.trim()
      : typeof body.title === "string"
        ? body.title.trim()
        : existing.title;
  const role =
    typeof body.role === "string"
      ? body.role.trim()
      : typeof body.subtitle === "string"
        ? body.subtitle.trim()
        : existing.subtitle;

  if (!name) {
    return errorResponse("Team member name cannot be empty", 400, "VALIDATION_ERROR");
  }
  if (!role) {
    return errorResponse("Team member role cannot be empty", 400, "VALIDATION_ERROR");
  }

  const image = typeof body.image === "string" ? body.image.trim() : existing.image;
  const borderColor =
    typeof body.borderColor === "string"
      ? body.borderColor
      : typeof body.border_color === "string"
        ? body.border_color
        : existing.border_color;
  const gradient = typeof body.gradient === "string" ? body.gradient : existing.gradient;
  const url = typeof body.url === "string" ? body.url : existing.url;
  const sortOrder =
    typeof body.sortOrder === "number"
      ? body.sortOrder
      : typeof body.sort_order === "number"
        ? body.sort_order
        : existing.sort_order;

  await env.DB.prepare(
    `UPDATE team_members
     SET image = ?, title = ?, subtitle = ?, border_color = ?, gradient = ?, url = ?, sort_order = ?, updated_at = datetime('now')
     WHERE id = ?`,
  )
    .bind(image, name, role, borderColor, gradient, url, sortOrder, id)
    .run();

  const updated = await env.DB.prepare(
    "SELECT id, image, title, subtitle, border_color, gradient, url, sort_order FROM team_members WHERE id = ?",
  )
    .bind(id)
    .first<TeamRow>();

  return jsonResponse(mapTeamRow(updated!), 200);
}

export async function deleteTeamMember(_request: Request, env: Env, id: string): Promise<Response> {
  const existing = await env.DB.prepare("SELECT id FROM team_members WHERE id = ?")
    .bind(id)
    .first();
  if (!existing) {
    return errorResponse("Team member not found", 404, "NOT_FOUND");
  }

  await env.DB.prepare("DELETE FROM team_members WHERE id = ?").bind(id).run();

  return jsonResponse({ deleted: true, id }, 200);
}
