import { blogPosts as DEFAULT_BLOGS, type BlogPost } from "./blogs-data";
export type { BlogPost } from "./blogs-data";
import cmsData from "@/data/cms-data.json";

export const AVATAR_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' rx='12' fill='%230d1b2a'/%3E%3Ccircle cx='60' cy='45' r='22' fill='%2322d3ee' opacity='.3'/%3E%3Cellipse cx='60' cy='100' rx='34' ry='22' fill='%2322d3ee' opacity='.2'/%3E%3C/svg%3E";

export interface TeamMember {
  id: string;
  image: string;
  title: string; // Member Name
  subtitle: string; // Role / Designation
  borderColor?: string;
  gradient?: string;
  url?: string;
  location?: string;
  bio?: string;
}

export const DEFAULT_TEAM: TeamMember[] = (cmsData.team as TeamMember[]) || [];

const STORAGE_KEYS = {
  TEAM: "techagenz_cms_team_v1",
  BLOGS: "techagenz_cms_blogs_v1",
} as const;

export const CMS_UPDATE_EVENT = "techagenz_cms_update";
export const CMS_SYNC_STATUS_EVENT = "techagenz_cms_sync_status";

function notifyChange(scope: "team" | "blogs") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CMS_UPDATE_EVENT, { detail: { scope } }));
  }
}

// ==================== CLOUDFLARE BACKEND READINESS STUBS ====================

export interface GitHubConfig {
  token: string;
  repoOwner: string;
  repoName: string;
  branch: string;
  autoSync: boolean;
  lastSyncStatus?: "idle" | "syncing" | "success" | "error";
  lastSyncTime?: string;
  lastCommitSha?: string;
  lastCommitUrl?: string;
  lastError?: string;
}

/**
 * Returns static migration config metadata.
 * In Phase 1, client-side GitHub PAT storage and auto-syncing are completely disabled.
 */
export function getGitHubConfig(): GitHubConfig {
  return {
    token: "",
    repoOwner: "AliHaider3435",
    repoName: "techagenz",
    branch: "main",
    autoSync: false,
    lastSyncStatus: "idle",
  };
}

export function saveGitHubConfig(): GitHubConfig {
  return getGitHubConfig();
}

export async function testGitHubConnection(): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  return {
    success: false,
    error:
      "Direct GitHub token testing has been disabled for security. Cloudflare Access + D1 will manage CMS operations in Phase 2.",
  };
}

export async function syncCmsToGitHub(): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  return {
    success: false,
    error:
      "Direct client-to-GitHub writes are permanently disabled. Content persistence is transitioning to Cloudflare D1.",
  };
}

/**
 * Normalizes team member data to prevent stale hashed assets or unapproved locations
 */
export function sanitizeTeamMember(member: TeamMember): TeamMember {
  let image = member.image;
  const cleanId = (member.id || "").toLowerCase();
  const cleanTitle = (member.title || "").toLowerCase();

  if (cleanId === "ali-haider" || cleanTitle.includes("ali haider")) {
    image = "/team-images/team1.webp";
  } else if (cleanId === "muhammad-rizwan" || cleanTitle.includes("rizwan")) {
    image = "/team-images/team6.jpg";
  } else if (image) {
    if (image.includes("team1")) {
      image = "/team-images/team1.webp";
    } else if (image.includes("team6")) {
      image = "/team-images/team6.jpg";
    }
  }

  const { location, ...rest } = member;
  const sanitizedLocation =
    location && location.toLowerCase().includes("lahore") ? undefined : location;

  return {
    ...rest,
    ...(sanitizedLocation ? { location: sanitizedLocation } : {}),
    image: image || AVATAR_PLACEHOLDER,
  };
}

// ==================== AUTH UTILITIES (PHASE 1 HARDENED) ====================

export interface AuthConfig {
  email: string;
  displayName: string;
}

export interface AuthSession {
  email: string;
  displayName: string;
  expiresAt: number;
}

/**
 * In Phase 1, exposed default credentials have been removed.
 * Real server-side identity will be governed by Cloudflare Access in Phase 2.
 */
export function getAuthConfig(): AuthConfig {
  return {
    email: "",
    displayName: "Administrator",
  };
}

export function updateAuthConfig(): boolean {
  // Client-side credential modification disabled
  return false;
}

export function getAuthSession(): AuthSession | null {
  // Frontend-only session state is disabled
  return null;
}

export function isAuthenticated(): boolean {
  // Client-only route bypass is disabled for security.
  // Server-side Cloudflare Access authorization will be verified in Phase 2.
  return false;
}

export function loginUser(): { success: boolean; message: string } {
  return {
    success: false,
    message:
      "Client-side password authentication has been disabled for Phase 1 security hardening. Cloudflare Access Zero-Trust identity verification is being configured for Phase 2.",
  };
}

export function logoutUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("techagenz_cms_auth_session_v1");
    localStorage.removeItem("techagenz_cms_auth_config_v1");
    localStorage.removeItem("techagenz_cms_github_config_v1");
  } catch {
    // localStorage may be unavailable — session clear is best-effort
  }
}

// ==================== TEAM MEMBER CMS (READ-ONLY IN PHASE 1) ====================

export function getTeamMembers(): TeamMember[] {
  if (typeof window === "undefined") return DEFAULT_TEAM.map(sanitizeTeamMember);
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEAM);
    if (!raw) return DEFAULT_TEAM.map(sanitizeTeamMember);
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TEAM;
    return list.map(sanitizeTeamMember);
  } catch {
    return DEFAULT_TEAM.map(sanitizeTeamMember);
  }
}

export function saveTeamMembers(members: TeamMember[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(members));
    notifyChange("team");
    return true;
  } catch {
    return false;
  }
}

export function addTeamMember(member: Omit<TeamMember, "id"> & { id?: string }): TeamMember {
  const current = getTeamMembers();
  const newMember: TeamMember = {
    ...member,
    id: member.id || `member-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    image: member.image || AVATAR_PLACEHOLDER,
    borderColor: member.borderColor || "#22D3EE",
    gradient:
      member.gradient || `linear-gradient(145deg, ${member.borderColor || "#22D3EE"}, #050B14)`,
  };

  const updated = [...current, newMember];
  saveTeamMembers(updated);
  return newMember;
}

export function updateTeamMember(id: string, updates: Partial<TeamMember>): boolean {
  const current = getTeamMembers();
  const index = current.findIndex((m) => m.id === id);
  if (index === -1) return false;

  current[index] = {
    ...current[index],
    ...updates,
    ...(updates.borderColor && !updates.gradient
      ? { gradient: `linear-gradient(145deg, ${updates.borderColor}, #050B14)` }
      : {}),
  };

  return saveTeamMembers([...current]);
}

export function deleteTeamMember(id: string): boolean {
  const current = getTeamMembers();
  const filtered = current.filter((m) => m.id !== id);
  return saveTeamMembers(filtered);
}

export function resetTeamMembers(): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.removeItem(STORAGE_KEYS.TEAM);
    notifyChange("team");
    return true;
  } catch {
    return false;
  }
}

// ==================== BLOGS CMS (READ-ONLY IN PHASE 1) ====================

export function getBlogs(): BlogPost[] {
  if (typeof window === "undefined") return DEFAULT_BLOGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BLOGS);
    if (!raw) return DEFAULT_BLOGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_BLOGS;
  } catch {
    return DEFAULT_BLOGS;
  }
}

export function getSingleBlog(idOrSlug: string): BlogPost | undefined {
  const all = getBlogs();
  return all.find((p) => p.id === idOrSlug);
}

export function saveBlogs(posts: BlogPost[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(posts));
    notifyChange("blogs");
    return true;
  } catch {
    return false;
  }
}

export function addBlog(
  post: Omit<BlogPost, "id" | "date" | "publishDateIso"> & {
    id?: string;
    date?: string;
    publishDateIso?: string;
  },
): BlogPost {
  const current = getBlogs();
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const slug =
    post.id ||
    post.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") ||
    `blog-${Date.now()}`;

  const newPost: BlogPost = {
    ...post,
    id: slug,
    date: post.date || formattedDate,
    publishDateIso: post.publishDateIso || now.toISOString(),
  };

  const updated = [newPost, ...current];
  saveBlogs(updated);
  return newPost;
}

export function updateBlog(id: string, updates: Partial<BlogPost>): boolean {
  const current = getBlogs();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) return false;

  current[index] = {
    ...current[index],
    ...updates,
  };

  return saveBlogs([...current]);
}

export function deleteBlog(id: string): boolean {
  const current = getBlogs();
  const filtered = current.filter((p) => p.id !== id);
  return saveBlogs(filtered);
}

export function resetBlogs(): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.removeItem(STORAGE_KEYS.BLOGS);
    notifyChange("blogs");
    return true;
  } catch {
    return false;
  }
}

// ==================== IMAGE COMPRESSION ====================

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

/**
 * Compresses an uploaded image file down to lightweight Base64 data URL
 */
export async function compressImageFile(
  file: File,
  options: ImageCompressionOptions = {},
): Promise<string> {
  const { maxWidth = 1000, maxHeight = 1000, quality = 0.8, mimeType = "image/webp" } = options;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Selected file is not an image."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image."));
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Unable to create canvas context."));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        let result = canvas.toDataURL(mimeType, quality);
        if (!result.startsWith(`data:${mimeType}`)) {
          result = canvas.toDataURL("image/jpeg", quality);
        }

        resolve(result);
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

// ==================== BACKUP / EXPORT / IMPORT ====================

export interface CmsBackupData {
  version: 1;
  exportedAt: string;
  team: TeamMember[];
  blogs: BlogPost[];
}

export function exportCmsData(): CmsBackupData {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    team: getTeamMembers(),
    blogs: getBlogs(),
  };
}

export function importCmsData(data: unknown): { success: boolean; message: string } {
  try {
    if (typeof data !== "object" || data === null) {
      return { success: false, message: "Invalid JSON data." };
    }
    const payload = data as Partial<CmsBackupData>;
    if (!Array.isArray(payload.team) && !Array.isArray(payload.blogs)) {
      return { success: false, message: "File does not contain valid team or blog records." };
    }

    if (Array.isArray(payload.team)) {
      saveTeamMembers(payload.team);
    }
    if (Array.isArray(payload.blogs)) {
      saveBlogs(payload.blogs);
    }

    return { success: true, message: "Content successfully loaded in local view." };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error importing data.";
    return { success: false, message: msg };
  }
}
