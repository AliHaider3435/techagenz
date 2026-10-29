import { blogPosts as DEFAULT_BLOGS, type BlogPost } from "./blogs-data";
export type { BlogPost } from "./blogs-data";
import team1 from "@/assets/team1.webp";
import team6 from "@/assets/team6.jpg";

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

export const DEFAULT_TEAM: TeamMember[] = [
  {
    id: "ali-haider",
    image: team1,
    title: "Ali Haider",
    subtitle: "Founder & AI Engineer",
    borderColor: "#38BDF8",
    gradient: "linear-gradient(145deg, #38BDF8, #050B14)",
    url: "",
  },
  {
    id: "irfan-ul-haq",
    image: AVATAR_PLACEHOLDER,
    title: "Irfan Ul Haq",
    subtitle: "UI/UX Designer",
    borderColor: "#0EA5E9",
    gradient: "linear-gradient(210deg, #0EA5E9, #050B14)",
    url: "",
  },
  {
    id: "muhammad-faizan",
    image: AVATAR_PLACEHOLDER,
    title: "Muhammad Faizan",
    subtitle: "Automation Engineer",
    borderColor: "#22D3EE",
    gradient: "linear-gradient(165deg, #22D3EE, #050B14)",
    url: "",
  },
  {
    id: "saad-arif",
    image: AVATAR_PLACEHOLDER,
    title: "Saad Arif",
    subtitle: "Product Designer",
    borderColor: "#60A5FA",
    gradient: "linear-gradient(195deg, #60A5FA, #050B14)",
    url: "",
  },
  {
    id: "laraib",
    image: AVATAR_PLACEHOLDER,
    title: "Laraib",
    subtitle: "Full-Stack Developer",
    borderColor: "#2563EB",
    gradient: "linear-gradient(225deg, #2563EB, #050B14)",
    url: "",
  },
  {
    id: "muhammad-rizwan",
    image: team6,
    title: "Muhammad Rizwan",
    subtitle: "Data Scientist",
    borderColor: "#0891B2",
    gradient: "linear-gradient(135deg, #0891B2, #050B14)",
    url: "",
  },
];

const STORAGE_KEYS = {
  TEAM: "techagenz_cms_team_v1",
  BLOGS: "techagenz_cms_blogs_v1",
  AUTH_CONFIG: "techagenz_cms_auth_config_v1",
  AUTH_SESSION: "techagenz_cms_auth_session_v1",
} as const;

export const CMS_UPDATE_EVENT = "techagenz_cms_update";

function notifyChange(scope: "team" | "blogs" | "auth") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CMS_UPDATE_EVENT, { detail: { scope } }));
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
  if (typeof window === "undefined") return DEFAULT_TEAM;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEAM);
    if (!raw) return DEFAULT_TEAM;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TEAM;
  } catch {
    return DEFAULT_TEAM;
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
        ctx.drawImage(img, 0, 1, width, height);

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
      saveTeamMembers(payload.team);
    }
    if (Array.isArray(payload.blogs)) {
      saveBlogs(payload.blogs);
    }

    return { success: true, message: "Content successfully restored!" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error importing data.";
    return { success: false, message: msg };
  }
}
