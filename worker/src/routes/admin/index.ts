import { Env } from "../../types";
import { requireAdmin, unauthorizedResponse, AccessPayload } from "../../middleware/auth";
import { errorResponse, jsonResponse } from "../../middleware/error";
import { requireAdminOrigin } from "../../middleware/cors";
import {
  listTeamMembers,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "./team";
import { listBlogs, getBlog, createBlog, updateBlog, deleteBlog } from "./blogs";
import { listProjects, getProject, createProject, updateProject, deleteProject } from "./projects";
import { listEnquiries, updateEnquiryStatus, deleteEnquiry } from "./enquiries";
import { listMediaAssets } from "./media";

/**
 * Admin CMS router — all routes strictly protected by Cloudflare Access JWT
 * and administrator allow-list via requireAdmin().
 */
export async function handleAdminRequest(
  request: Request,
  env: Env,
  pathname: string,
): Promise<Response> {
  // Require the exact trusted admin Origin for every state-changing request.
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method) && !requireAdminOrigin(request)) {
    return errorResponse("Forbidden: invalid or missing request Origin", 403, "FORBIDDEN");
  }

  let admin: AccessPayload;
  try {
    admin = await requireAdmin(request, env);
  } catch (err) {
    if (err instanceof Response) return err;
    return unauthorizedResponse();
  }

  // Base probe endpoint: GET /api/admin or /api/admin/
  if (pathname === "/api/admin" || pathname === "/api/admin/") {
    if (request.method !== "GET") {
      return errorResponse("Method not allowed", 405, "METHOD_NOT_ALLOWED");
    }
    if (env.ADMIN_CMS_ENABLED !== "true") {
      return errorResponse("Not implemented", 501, "NOT_IMPLEMENTED");
    }
    return jsonResponse({
      authorized: true,
      email: admin.email,
      cmsEnabled: true,
    });
  }

  // When admin operations are not enabled, fail closed with 501
  if (env.ADMIN_CMS_ENABLED !== "true") {
    return errorResponse("Not implemented", 501, "NOT_IMPLEMENTED");
  }

  const method = request.method;

  // ── Team Members ──────────────────────────────────────────────────────────
  if (pathname === "/api/admin/team") {
    if (method === "GET") return listTeamMembers(request, env);
    if (method === "POST") return createTeamMember(request, env);
  }
  const teamMatch = pathname.match(/^\/api\/admin\/team\/([^/]+)$/);
  if (teamMatch) {
    const id = teamMatch[1];
    if (method === "GET") return getTeamMember(request, env, id);
    if (method === "PUT") return updateTeamMember(request, env, id);
    if (method === "DELETE") return deleteTeamMember(request, env, id);
  }

  // ── Blog Posts ────────────────────────────────────────────────────────────
  if (pathname === "/api/admin/blogs") {
    if (method === "GET") return listBlogs(request, env);
    if (method === "POST") return createBlog(request, env);
  }
  const blogMatch = pathname.match(/^\/api\/admin\/blogs\/([^/]+)$/);
  if (blogMatch) {
    const id = blogMatch[1];
    if (method === "GET") return getBlog(request, env, id);
    if (method === "PUT") return updateBlog(request, env, id);
    if (method === "DELETE") return deleteBlog(request, env, id);
  }

  // ── Projects / Case Studies ───────────────────────────────────────────────
  if (pathname === "/api/admin/projects") {
    if (method === "GET") return listProjects(request, env);
    if (method === "POST") return createProject(request, env);
  }
  const projectMatch = pathname.match(/^\/api\/admin\/projects\/([^/]+)$/);
  if (projectMatch) {
    const slug = projectMatch[1];
    if (method === "GET") return getProject(request, env, slug);
    if (method === "PUT") return updateProject(request, env, slug);
    if (method === "DELETE") return deleteProject(request, env, slug);
  }

  // ── Enquiries ─────────────────────────────────────────────────────────────
  if (pathname === "/api/admin/enquiries") {
    if (method === "GET") return listEnquiries(request, env);
  }
  const enquiryMatch = pathname.match(/^\/api\/admin\/enquiries\/([^/]+)$/);
  if (enquiryMatch) {
    const id = enquiryMatch[1];
    if (method === "PATCH") return updateEnquiryStatus(request, env, id);
    if (method === "DELETE") return deleteEnquiry(request, env, id);
  }

  // ── Media Catalog ─────────────────────────────────────────────────────────
  if (pathname === "/api/admin/media") {
    if (method === "GET") return listMediaAssets(request, env);
  }

  return errorResponse(`Admin route not found: ${method} ${pathname}`, 404, "NOT_FOUND");
}
