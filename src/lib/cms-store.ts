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
  AUTH_CONFIG: "techagenz_cms_auth_config_v1",
  AUTH_SESSION: "techagenz_cms_auth_session_v1",
  GITHUB_CONFIG: "techagenz_cms_github_config_v1",
} as const;

export const CMS_UPDATE_EVENT = "techagenz_cms_update";
export const CMS_SYNC_STATUS_EVENT = "techagenz_cms_sync_status";

function notifyChange(scope: "team" | "blogs" | "auth" | "github") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CMS_UPDATE_EVENT, { detail: { scope } }));
  }
}

function notifySyncStatus(status: {
  state: "idle" | "syncing" | "success" | "error";
  message?: string;
  commitSha?: string;
  commitUrl?: string;
  error?: string;
}) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CMS_SYNC_STATUS_EVENT, { detail: status }));
  }
}

// ==================== GITHUB AUTO-SYNC CONFIG ====================

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

const DEFAULT_GITHUB_CONFIG: GitHubConfig = {
  token: "",
  repoOwner: "AliHaider3435",
  repoName: "techagenz",
  branch: "main",
  autoSync: true,
  lastSyncStatus: "idle",
};

export function getGitHubConfig(): GitHubConfig {
  if (typeof window === "undefined") return DEFAULT_GITHUB_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GITHUB_CONFIG);
    if (!raw) return DEFAULT_GITHUB_CONFIG;
    return { ...DEFAULT_GITHUB_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_GITHUB_CONFIG;
  }
}

export function saveGitHubConfig(config: Partial<GitHubConfig>): GitHubConfig {
  const current = getGitHubConfig();
  const updated: GitHubConfig = { ...current, ...config };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.GITHUB_CONFIG, JSON.stringify(updated));
      notifyChange("github");
    } catch {}
  }
  return updated;
}

/**
 * Helper to encode utf-8 string to base64 in browser or node
 */
function utf8ToBase64(str: string): string {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return window.btoa(unescape(encodeURIComponent(str)));
  }
  return Buffer.from(str, "utf-8").toString("base64");
}

/**
 * Direct client-side GitHub connection test (bypasses any serverless 404s)
 */
async function directGitHubTest(token: string, owner: string, repo: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  warning?: string;
  repo?: string;
}> {
  try {
    const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!ghRes.ok) {
      if (ghRes.status === 401) {
        return { success: false, error: "Invalid GitHub token. Please verify token permissions." };
      }
      if (ghRes.status === 404) {
        return {
          success: false,
          error: `Repository ${owner}/${repo} not found, or token lacks access to private repositories. Ensure 'repo' scope is selected.`,
        };
      }
      const errData = await ghRes.json().catch(() => ({}));
      return { success: false, error: errData.message || `GitHub error (${ghRes.status})` };
    }

    const repoData = await ghRes.json();
    const permissions = repoData.permissions || {};

    if (permissions.push === false) {
      return {
        success: false,
        warning: `Connected to ${repoData.full_name}, but token only has READ permission. Create a token with 'repo' (write) scope.`,
        repo: repoData.full_name,
      };
    }

    return {
      success: true,
      message: `Connected to GitHub repository ${repoData.full_name} (${repoData.private ? "Private" : "Public"})!`,
      repo: repoData.full_name,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error contacting GitHub directly";
    return { success: false, error: msg };
  }
}

/**
 * Direct client-side GitHub commit (bypasses any serverless 404s)
 */
async function directGitHubSync(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  commitMessage: string,
  payloadData: unknown,
): Promise<{
  success: boolean;
  message?: string;
  commitSha?: string;
  commitUrl?: string;
  error?: string;
}> {
  const targetPath = "src/data/cms-data.json";

  try {
    // 1. Get current SHA if file exists
    let existingSha: string | undefined;
    try {
      const checkRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${targetPath}?ref=${branch}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        },
      );
      if (checkRes.ok) {
        const existingData = await checkRes.json();
        existingSha = existingData.sha;
      }
    } catch {}

    // 2. Put file to GitHub
    const jsonString = JSON.stringify(payloadData, null, 2);
    const base64Content = utf8ToBase64(jsonString);

    const putRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${targetPath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          message: commitMessage,
          content: base64Content,
          branch,
          ...(existingSha ? { sha: existingSha } : {}),
        }),
      },
    );

    if (!putRes.ok) {
      const errPayload = await putRes.json().catch(() => ({}));
      return {
        success: false,
        error: errPayload.message || `GitHub commit error (${putRes.status})`,
      };
    }

    const commitData = await putRes.json();
    return {
      success: true,
      commitSha: commitData.commit?.sha?.slice(0, 7) || "latest",
      commitUrl: commitData.commit?.html_url,
      message: `Pushed to ${owner}/${repo} (${branch})! Vercel auto-deploy is running.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error syncing directly to GitHub";
    return { success: false, error: msg };
  }
}

/**
 * Tests connection to GitHub repository using specified or saved token
 */
export async function testGitHubConnection(customToken?: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  warning?: string;
  repo?: string;
}> {
  const config = getGitHubConfig();
  const token = (customToken ?? config.token).trim();

  if (!token) {
    return { success: false, error: "Please enter your GitHub Personal Access Token." };
  }

  try {
    const res = await fetch("/api/github-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        repoOwner: config.repoOwner,
        repoName: config.repoName,
      }),
    });

    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      const data = await res.json();
      return data;
    }

    // If serverless endpoint returned HTML 404 or non-JSON, fallback directly to GitHub API
    return await directGitHubTest(token, config.repoOwner, config.repoName);
  } catch {
    // Fallback directly to GitHub API
    return await directGitHubTest(token, config.repoOwner, config.repoName);
  }
}

/**
 * Commits and pushes the current state of Team and Blogs to GitHub repository
 */
export async function syncCmsToGitHub(commitMessage?: string): Promise<{
  success: boolean;
  message?: string;
  commitSha?: string;
  commitUrl?: string;
  error?: string;
}> {
  const config = getGitHubConfig();
  const team = getTeamMembers();
  const blogs = getBlogs();
  const token = config.token.trim();

  if (!token) {
    const errMsg = "GitHub token required. Please enter your Personal Access Token in Settings.";
    saveGitHubConfig({ lastSyncStatus: "error", lastError: errMsg });
    notifySyncStatus({ state: "error", error: errMsg });
    return { success: false, error: errMsg };
  }

  notifySyncStatus({ state: "syncing", message: "Pushing changes to GitHub repository..." });

  const finalCommitMsg =
    commitMessage || `CMS update: sync blogs & team (${new Date().toLocaleString()})`;

  const payloadData = {
    version: 1,
    lastSyncedAt: new Date().toISOString(),
    team,
    blogs,
  };

  try {
    const res = await fetch("/api/github-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        repoOwner: config.repoOwner,
        repoName: config.repoName,
        branch: config.branch,
        commitMessage: finalCommitMsg,
        team,
        blogs,
      }),
    });

    const contentType = res.headers.get("content-type") || "";
    let data: {
      success: boolean;
      message?: string;
      commitSha?: string;
      commitUrl?: string;
      error?: string;
    };

    if (res.ok && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      // Fallback directly to GitHub REST API
      data = await directGitHubSync(
        token,
        config.repoOwner,
        config.repoName,
        config.branch,
        finalCommitMsg,
        payloadData,
      );
    }

    if (data.success) {
      saveGitHubConfig({
        lastSyncStatus: "success",
        lastSyncTime: new Date().toISOString(),
        lastCommitSha: data.commitSha,
        lastCommitUrl: data.commitUrl,
        lastError: undefined,
      });

      notifySyncStatus({
        state: "success",
        message: data.message,
        commitSha: data.commitSha,
        commitUrl: data.commitUrl,
      });

      return data;
    } else {
      saveGitHubConfig({
        lastSyncStatus: "error",
        lastError: data.error,
      });

      notifySyncStatus({
        state: "error",
        error: data.error,
      });

      return data;
    }
  } catch {
    // Final direct fallback to GitHub API
    const fallbackRes = await directGitHubSync(
      token,
      config.repoOwner,
      config.repoName,
      config.branch,
      finalCommitMsg,
      payloadData,
    );

    if (fallbackRes.success) {
      saveGitHubConfig({
        lastSyncStatus: "success",
        lastSyncTime: new Date().toISOString(),
        lastCommitSha: fallbackRes.commitSha,
        lastCommitUrl: fallbackRes.commitUrl,
        lastError: undefined,
      });

      notifySyncStatus({
        state: "success",
        message: fallbackRes.message,
        commitSha: fallbackRes.commitSha,
        commitUrl: fallbackRes.commitUrl,
      });
    } else {
      saveGitHubConfig({
        lastSyncStatus: "error",
        lastError: fallbackRes.error,
      });

      notifySyncStatus({
        state: "error",
        error: fallbackRes.error,
      });
    }

    return fallbackRes;
  }
}

/**
 * Triggers background GitHub sync if autoSync is enabled
 */
function triggerAutoSync(actionDesc: string) {
  const config = getGitHubConfig();
  if (config.autoSync) {
    // Run asynchronously without blocking UI
    setTimeout(() => {
      syncCmsToGitHub(`CMS auto-sync: ${actionDesc}`).catch((err) => {
        console.warn("[CMS AutoSync Error]:", err);
      });
    }, 500);
  }
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

/**
 * Fetches live data from the server API so any visitor gets updated content immediately
 */
export async function fetchLiveCmsData(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await fetch("/api/cms");
    if (!res.ok) return false;
    const json = await res.json();
    if (!json.success || !json.data) return false;

    const { team, blogs } = json.data;
    let changed = false;

    if (Array.isArray(team) && team.length > 0) {
      const sanitizedTeam = team.map(sanitizeTeamMember);
      const currentTeam = localStorage.getItem(STORAGE_KEYS.TEAM);
      const newTeamStr = JSON.stringify(sanitizedTeam);
      if (currentTeam !== newTeamStr) {
        localStorage.setItem(STORAGE_KEYS.TEAM, newTeamStr);
        changed = true;
      }
    }

    if (Array.isArray(blogs) && blogs.length > 0) {
      const currentBlogs = localStorage.getItem(STORAGE_KEYS.BLOGS);
      const newBlogsStr = JSON.stringify(blogs);
      if (currentBlogs !== newBlogsStr) {
        localStorage.setItem(STORAGE_KEYS.BLOGS, newBlogsStr);
        changed = true;
      }
    }

    if (changed) {
      notifyChange("team");
      notifyChange("blogs");
    }

    return true;
  } catch {
    return false;
  }
}

// ==================== AUTH UTILITIES ====================

export interface AuthConfig {
  email: string;
  passwordHash: string; // Plain or hashed string for demonstration
  displayName: string;
}

export interface AuthSession {
  email: string;
  displayName: string;
  token: string;
  expiresAt: number;
}

const DEFAULT_AUTH: AuthConfig = {
  email: "admin@techagenz.com",
  passwordHash: "techagenz2026!",
  displayName: "Tech Agenz Team",
};

export function getAuthConfig(): AuthConfig {
  if (typeof window === "undefined") return DEFAULT_AUTH;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_CONFIG);
    if (!raw) return DEFAULT_AUTH;
    return { ...DEFAULT_AUTH, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AUTH;
  }
}

export function updateAuthConfig(config: Partial<AuthConfig>): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getAuthConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEYS.AUTH_CONFIG, JSON.stringify(updated));
    notifyChange("auth");
    return true;
  } catch {
    return false;
  }
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      logoutUser();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getAuthSession() !== null;
}

export function loginUser(email: string, password: string): { success: boolean; message?: string } {
  const config = getAuthConfig();
  const normalizedEmail = email.trim().toLowerCase();
  const targetEmail = config.email.trim().toLowerCase();

  // Accept configured email OR team alias "team@techagenz.com"
  const isEmailMatch =
    normalizedEmail === targetEmail || normalizedEmail === "team@techagenz.com";

  if (!isEmailMatch || password !== config.passwordHash) {
    return { success: false, message: "Invalid email or password. Please try again." };
  }

  const session: AuthSession = {
    email: normalizedEmail,
    displayName: config.displayName,
    token: `tok_${Math.random().toString(36).substring(2)}${Date.now()}`,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days session
  };

  try {
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    notifyChange("auth");
    return { success: true };
  } catch {
    return { success: false, message: "Storage error. Please enable cookies/storage." };
  }
}

export function logoutUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    notifyChange("auth");
  } catch {}
}

// ==================== TEAM MEMBER CMS ====================

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

export function saveTeamMembers(members: TeamMember[], skipSync = false): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(members));
    notifyChange("team");
    if (!skipSync) {
      triggerAutoSync("updated team members");
    }
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
      member.gradient ||
      `linear-gradient(145deg, ${member.borderColor || "#22D3EE"}, #050B14)`,
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
    triggerAutoSync("reset team members to default");
    return true;
  } catch {
    return false;
  }
}

// ==================== BLOGS CMS ====================

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

export function saveBlogs(posts: BlogPost[], skipSync = false): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(posts));
    notifyChange("blogs");
    if (!skipSync) {
      triggerAutoSync("updated blog posts");
    }
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

  // Prepend so new blog appears at top
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
    triggerAutoSync("reset blogs to default");
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
 * suited for fast display and compact storage.
 */
export async function compressImageFile(
  file: File,
  options: ImageCompressionOptions = {},
): Promise<string> {
  const { maxWidth = 1000, maxHeight = 1000, quality = 0.8, mimeType = "image/webp" } = options;

  return new Promise((resolve, reject) => {
    // Validate file type
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

        // Maintain aspect ratio while bounding dimensions
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

        // Try preferred format (webp) or fallback to jpeg
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
      saveTeamMembers(payload.team, true);
    }
    if (Array.isArray(payload.blogs)) {
      saveBlogs(payload.blogs, true);
    }

    // Trigger one sync for imported data
    triggerAutoSync("restored CMS backup");

    return { success: true, message: "Content successfully restored & synced!" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error importing data.";
    return { success: false, message: msg };
  }
}
