import type { TeamMemberDto, BlogDetailDto, CaseStudyDto } from "./cms-client";

export type AdminApiAccessState =
  | "unconfigured"
  | "checking"
  | "session-required"
  | "forbidden"
  | "authorized-read-only"
  | "authorized"
  | "unavailable";

export interface AdminApiAccessResult {
  state: Exclude<AdminApiAccessState, "checking">;
  email?: string;
  username?: string;
  authType?: "cloudflare_access" | "session";
}

export interface EnquiryDto {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string | null;
  budget: string | null;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  source: string;
  created_at: string;
}

export interface EnquiryListResponse {
  enquiries: EnquiryDto[];
  pagination: { limit: number; offset: number; total: number };
  counts: { total: number; new: number; read: number; replied: number; archived: number };
}

export interface MediaAssetDto {
  id: number;
  path: string;
  url: string;
  fileName: string;
  contentType: string;
  sizeBytes: number | null;
  altText: string | null;
  entityType: string | null;
  entityId: string | null;
  uploadedBy: string | null;
  createdAt: string;
}

export interface MediaListResponse {
  assets: MediaAssetDto[];
  total: number;
  pagination: { limit: number; offset: number };
}

export class AdminApiClientError extends Error {
  readonly status?: number;
  readonly code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = "AdminApiClientError";
    this.status = status;
    this.code = code;
  }
}

export interface AdminApiClient {
  accessUrl: string | null;
  login(credentials: { username: string; password: string; turnstileToken: string }): Promise<{
    success: boolean;
    username?: string;
    authType?: "session";
    user?: { username: string };
  }>;
  logout(): Promise<void>;
  getSession(): Promise<AdminApiAccessResult>;

  // Team
  listTeam(): Promise<TeamMemberDto[]>;
  getTeamMember(id: string): Promise<TeamMemberDto>;
  createTeamMember(data: Partial<TeamMemberDto>): Promise<TeamMemberDto>;
  updateTeamMember(id: string, data: Partial<TeamMemberDto>): Promise<TeamMemberDto>;
  deleteTeamMember(id: string): Promise<void>;

  // Blogs
  listBlogs(): Promise<BlogDetailDto[]>;
  getBlog(id: string): Promise<BlogDetailDto>;
  createBlog(data: Partial<BlogDetailDto>): Promise<BlogDetailDto>;
  updateBlog(id: string, data: Partial<BlogDetailDto>): Promise<BlogDetailDto>;
  deleteBlog(id: string): Promise<void>;

  // Projects
  listProjects(): Promise<CaseStudyDto[]>;
  getProject(slug: string): Promise<CaseStudyDto>;
  createProject(data: Partial<CaseStudyDto>): Promise<CaseStudyDto>;
  updateProject(slug: string, data: Partial<CaseStudyDto>): Promise<CaseStudyDto>;
  deleteProject(slug: string): Promise<void>;

  // Enquiries
  listEnquiries(status?: string, limit?: number, offset?: number): Promise<EnquiryListResponse>;
  updateEnquiryStatus(id: number, status: string): Promise<EnquiryDto>;
  deleteEnquiry(id: number): Promise<void>;

  // Media & R2
  listMedia(folder?: string, search?: string): Promise<MediaListResponse>;
  uploadMedia(
    file: File | Blob,
    folder?: string,
    fileName?: string,
    altText?: string,
  ): Promise<{ url: string; path: string; fileName: string }>;
  deleteMedia(path: string): Promise<void>;
}

export function resolveAdminApiBaseUrl(value: string | undefined): string | null {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value.trim());
    const isLocalHttp =
      url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    if (
      (url.protocol !== "https:" && !isLocalHttp) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      (url.pathname !== "" && url.pathname !== "/") ||
      url.hostname === "workers.dev" ||
      url.hostname.endsWith(".workers.dev")
    ) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

export function isDevelopmentAdminApi(accessUrl: string | null): boolean {
  return accessUrl === "https://api-dev.techagenz.com/api/admin";
}

export function createAdminApiClient(
  baseUrl: string | undefined,
  fetcher: typeof fetch = fetch,
): AdminApiClient {
  const resolvedBaseUrl = resolveAdminApiBaseUrl(baseUrl);
  const accessUrl = resolvedBaseUrl ? `${resolvedBaseUrl}/api/admin` : null;

  async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!resolvedBaseUrl) {
      throw new AdminApiClientError("Admin API base URL is not configured.");
    }

    const url = `${resolvedBaseUrl}${endpoint}`;
    let response: Response;
    try {
      response = await fetcher(url, {
        credentials: "include",
        cache: "no-store",
        ...options,
        headers: {
          Accept: "application/json",
          ...options.headers,
        },
      });
    } catch (err) {
      throw new AdminApiClientError(
        err instanceof Error ? err.message : "Network error contacting Admin API.",
      );
    }

    if (response.status === 401 || (response.status >= 300 && response.status < 400)) {
      throw new AdminApiClientError(
        "Session required. Please re-authenticate.",
        401,
        "UNAUTHORIZED",
      );
    }
    if (response.status === 403) {
      throw new AdminApiClientError("Forbidden. Administrator access required.", 403, "FORBIDDEN");
    }

    let body: Record<string, unknown>;
    try {
      body = (await response.json()) as Record<string, unknown>;
    } catch {
      if (!response.ok) {
        throw new AdminApiClientError(
          `Request failed with status ${response.status}`,
          response.status,
        );
      }
      return {} as T;
    }

    if (!response.ok || body?.ok === false) {
      const errObj = body?.error as Record<string, unknown> | undefined;
      const msg = errObj?.message || body?.error || `Request failed with status ${response.status}`;
      const code = errObj?.code || (response.status === 404 ? "NOT_FOUND" : "REQUEST_ERROR");
      throw new AdminApiClientError(String(msg), response.status, String(code));
    }

    return (body?.data !== undefined ? body.data : body) as T;
  }

  return {
    accessUrl,

    async login(credentials: {
      username: string;
      password: string;
      turnstileToken: string;
    }): Promise<{
      success: boolean;
      username?: string;
      authType?: "session";
      user?: { username: string };
    }> {
      if (!resolvedBaseUrl) {
        throw new AdminApiClientError("Admin API base URL is not configured.");
      }

      const url = `${resolvedBaseUrl}/api/auth/login`;
      let response: Response;
      try {
        response = await fetcher(url, {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(credentials),
        });
      } catch (err) {
        throw new AdminApiClientError(
          err instanceof Error ? err.message : "Network error contacting Admin API.",
        );
      }

      let body: Record<string, unknown> | null = null;
      try {
        body = (await response.json()) as Record<string, unknown>;
      } catch {
        // non-JSON response handled below
      }

      if (!response.ok) {
        const errObj = body?.error as Record<string, unknown> | undefined;
        const msg =
          errObj?.message ||
          (response.status === 401
            ? "Invalid username or password"
            : `Login failed with status ${response.status}`);
        const code =
          (errObj?.code as string) ||
          (response.status === 401 ? "INVALID_CREDENTIALS" : "LOGIN_FAILED");
        throw new AdminApiClientError(String(msg), response.status, code);
      }

      const data = body?.data as Record<string, unknown> | undefined;
      const resolvedUsername = data?.username ? String(data.username) : credentials.username;
      return {
        success: true,
        username: resolvedUsername,
        authType: "session",
        user: { username: resolvedUsername },
      };
    },

    async logout(): Promise<void> {
      if (!resolvedBaseUrl) {
        throw new AdminApiClientError("Admin API base URL is not configured.");
      }
      let response: Response;
      try {
        response = await fetcher(`${resolvedBaseUrl}/api/auth/logout`, {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
      } catch (err) {
        throw new AdminApiClientError(
          err instanceof Error ? err.message : "Network error contacting Admin API.",
        );
      }

      let body: Record<string, unknown> | null = null;
      try {
        body = (await response.json()) as Record<string, unknown>;
      } catch {
        // non-JSON handled below
      }

      if (!response.ok || body?.ok === false) {
        const errObj = body?.error as Record<string, unknown> | undefined;
        const msg =
          errObj?.message ||
          (body?.error as string) ||
          `Logout failed with status ${response.status}`;
        const code =
          (errObj?.code as string) || (response.status === 403 ? "FORBIDDEN" : "LOGOUT_FAILED");
        throw new AdminApiClientError(String(msg), response.status, code);
      }
    },

    async getSession(): Promise<AdminApiAccessResult> {
      if (!resolvedBaseUrl) return { state: "unconfigured" };
      try {
        const res = await fetcher(`${resolvedBaseUrl}/api/auth/session`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          redirect: "manual",
          headers: { Accept: "application/json" },
        });
        if (res.type === "opaqueredirect" || res.status === 0) {
          return { state: "session-required" };
        }
        if (res.status === 200) {
          const body = (await res.json()) as Record<string, unknown>;
          if (body && body.ok === true) {
            const data = body.data as Record<string, unknown> | undefined;
            return {
              state: "authorized",
              email: data?.email as string | undefined,
              username: data?.username as string | undefined,
              authType: data?.authType as "cloudflare_access" | "session" | undefined,
            };
          }
        }
        if (res.status === 401 || (res.status >= 300 && res.status < 400)) {
          return { state: "session-required" };
        }
        if (res.status === 403) return { state: "forbidden" };
        return { state: "unavailable" };
      } catch {
        return { state: "unavailable" };
      }
    },

    // ── Team ────────────────────────────────────────────────────────────────
    async listTeam(): Promise<TeamMemberDto[]> {
      return apiRequest<TeamMemberDto[]>("/api/admin/team", { method: "GET" });
    },
    async getTeamMember(id: string): Promise<TeamMemberDto> {
      return apiRequest<TeamMemberDto>(`/api/admin/team/${encodeURIComponent(id)}`, {
        method: "GET",
      });
    },
    async createTeamMember(data: Partial<TeamMemberDto>): Promise<TeamMemberDto> {
      return apiRequest<TeamMemberDto>("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    async updateTeamMember(id: string, data: Partial<TeamMemberDto>): Promise<TeamMemberDto> {
      return apiRequest<TeamMemberDto>(`/api/admin/team/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    async deleteTeamMember(id: string): Promise<void> {
      await apiRequest(`/api/admin/team/${encodeURIComponent(id)}`, { method: "DELETE" });
    },

    // ── Blogs ───────────────────────────────────────────────────────────────
    async listBlogs(): Promise<BlogDetailDto[]> {
      return apiRequest<BlogDetailDto[]>("/api/admin/blogs", { method: "GET" });
    },
    async getBlog(id: string): Promise<BlogDetailDto> {
      return apiRequest<BlogDetailDto>(`/api/admin/blogs/${encodeURIComponent(id)}`, {
        method: "GET",
      });
    },
    async createBlog(data: Partial<BlogDetailDto>): Promise<BlogDetailDto> {
      return apiRequest<BlogDetailDto>("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    async updateBlog(id: string, data: Partial<BlogDetailDto>): Promise<BlogDetailDto> {
      return apiRequest<BlogDetailDto>(`/api/admin/blogs/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    async deleteBlog(id: string): Promise<void> {
      await apiRequest(`/api/admin/blogs/${encodeURIComponent(id)}`, { method: "DELETE" });
    },

    // ── Projects ────────────────────────────────────────────────────────────
    async listProjects(): Promise<CaseStudyDto[]> {
      return apiRequest<CaseStudyDto[]>("/api/admin/projects", { method: "GET" });
    },
    async getProject(slug: string): Promise<CaseStudyDto> {
      return apiRequest<CaseStudyDto>(`/api/admin/projects/${encodeURIComponent(slug)}`, {
        method: "GET",
      });
    },
    async createProject(data: Partial<CaseStudyDto>): Promise<CaseStudyDto> {
      return apiRequest<CaseStudyDto>("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    async updateProject(slug: string, data: Partial<CaseStudyDto>): Promise<CaseStudyDto> {
      return apiRequest<CaseStudyDto>(`/api/admin/projects/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    async deleteProject(slug: string): Promise<void> {
      await apiRequest(`/api/admin/projects/${encodeURIComponent(slug)}`, { method: "DELETE" });
    },

    // ── Enquiries ───────────────────────────────────────────────────────────
    async listEnquiries(status = "all", limit = 50, offset = 0): Promise<EnquiryListResponse> {
      const query = new URLSearchParams({
        status,
        limit: String(limit),
        offset: String(offset),
      });
      return apiRequest<EnquiryListResponse>(`/api/admin/enquiries?${query.toString()}`, {
        method: "GET",
      });
    },
    async updateEnquiryStatus(id: number, status: string): Promise<EnquiryDto> {
      return apiRequest<EnquiryDto>(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    },
    async deleteEnquiry(id: number): Promise<void> {
      await apiRequest(`/api/admin/enquiries/${id}`, { method: "DELETE" });
    },

    // ── Media & R2 ──────────────────────────────────────────────────────────
    async listMedia(folder = "all", search = ""): Promise<MediaListResponse> {
      const params = new URLSearchParams();
      if (folder && folder !== "all") params.set("folder", folder);
      if (search) params.set("search", search);
      const query = params.toString() ? `?${params.toString()}` : "";
      return apiRequest<MediaListResponse>(`/api/admin/media${query}`, { method: "GET" });
    },
    async uploadMedia(
      file: File | Blob,
      folder = "general",
      fileName?: string,
      altText?: string,
    ): Promise<{ url: string; path: string; fileName: string }> {
      const formData = new FormData();
      formData.append("file", file, fileName || (file instanceof File ? file.name : "upload.webp"));
      formData.append("folder", folder);
      if (altText) formData.append("altText", altText);

      return apiRequest<{ url: string; path: string; fileName: string }>("/api/r2/upload", {
        method: "POST",
        body: formData,
      });
    },
    async deleteMedia(path: string): Promise<void> {
      await apiRequest(`/api/r2/${path.replace(/^\/+/, "")}`, { method: "DELETE" });
    },
  };
}
