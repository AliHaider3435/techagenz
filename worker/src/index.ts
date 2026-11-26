/**
 * Tech Agenz — Cloudflare Worker entry point.
 *
 * Route table:
 *   GET  /health                   — Health check (public)
 *   GET  /api/cms/team             — Team members (public)
 *   GET  /api/cms/team/:id         — Single team member (public)
 *   GET  /api/cms/blogs            — Blog posts (public, filterable)
 *   GET  /api/cms/blogs/:id        — Single blog post (public)
 *   GET  /api/cms/projects         — Case studies (public)
 *   GET  /api/cms/projects/:slug   — Single case study (public)
 *   POST /api/enquiries            — Submit enquiry (Turnstile protected)
 *   GET  /api/r2/:path*            — Get asset from R2 (public)
 */

import { Env } from "./types";
import { handleCors, withCors } from "./middleware/cors";
import { withErrorHandling, errorResponse } from "./middleware/error";
import { handleHealth } from "./routes/health";
import { getTeam, getTeamMember, getBlogs, getBlog, getProjects, getProject } from "./routes/cms";
import { submitEnquiry } from "./routes/enquiries";
import { getAsset } from "./routes/r2";

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    // ── CORS preflight ─────────────────────────────────────────────────────
    const preflightResponse = handleCors(request, env);
    if (preflightResponse) return preflightResponse;

    const url = new URL(request.url);
    const collectionPath = url.pathname.endsWith("/") ? url.pathname.slice(0, -1) : url.pathname;
    const pathname =
      collectionPath === "/api/cms/team" ||
      collectionPath === "/api/cms/blogs" ||
      collectionPath === "/api/cms/projects"
        ? collectionPath
        : url.pathname;
    const method = request.method;

    const response = await withErrorHandling(async () => {
      // ── Health check ───────────────────────────────────────────────────
      if (pathname === "/health" && method === "GET") {
        return handleHealth(request, env);
      }

      // ── CMS: Team ──────────────────────────────────────────────────────
      if (pathname === "/api/cms/team" && method === "GET") {
        return getTeam(request, env);
      }
      const teamMatch = pathname.match(/^\/api\/cms\/team\/([^/]+)$/);
      if (teamMatch && method === "GET") {
        return getTeamMember(request, env, teamMatch[1]);
      }

      // ── CMS: Blogs ─────────────────────────────────────────────────────
      if (pathname === "/api/cms/blogs" && method === "GET") {
        return getBlogs(request, env);
      }
      const blogMatch = pathname.match(/^\/api\/cms\/blogs\/([^/]+)$/);
      if (blogMatch && method === "GET") {
        return getBlog(request, env, blogMatch[1]);
      }

      // ── CMS: Projects ──────────────────────────────────────────────────
      if (pathname === "/api/cms/projects" && method === "GET") {
        return getProjects(request, env);
      }
      const projectMatch = pathname.match(/^\/api\/cms\/projects\/([^/]+)$/);
      if (projectMatch && method === "GET") {
        return getProject(request, env, projectMatch[1]);
      }

      // ── Enquiries ──────────────────────────────────────────────────────
      if (pathname === "/api/enquiries" && method === "POST") {
        return submitEnquiry(request, env);
      }

      // ── R2 Assets (Public Read) ─────────────────────────────────────────
      const r2Match = pathname.match(/^\/api\/r2\/(.+)$/);
      if (r2Match && method === "GET") {
        return getAsset(request, env, r2Match[1]);
      }

      // ── 404 ────────────────────────────────────────────────────────────
      return errorResponse(`Route not found: ${method} ${pathname}`, 404);
    });

    // Attach CORS headers to every response
    return withCors(response, request, env);
  },
};
