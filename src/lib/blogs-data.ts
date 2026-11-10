import cmsData from "@/data/cms-data.json";

export interface BlogPost {
  id: string;
  title: string;
  category: "AI & ML" | "Custom Software" | "Automation" | "Enterprise ERP" | "Industry Solutions";
  readTime: string;
  date: string;
  publishDateIso: string;
  author: string;
  excerpt: string;
  image: string;
  keywords: string[];
  keyTakeaways: string[];
  content: string[];
  featured?: boolean;
}

export const blogCategories = [
  "All",
  "AI & ML",
  "Custom Software",
  "Automation",
  "Enterprise ERP",
  "Industry Solutions",
] as const;

export const blogPosts: BlogPost[] = (cmsData.blogs as BlogPost[]) || [];

export function getAllBlogs(): BlogPost[] {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("techagenz_cms_blogs_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // localStorage may be blocked in private browsing — ignore
    }
  }
  return blogPosts;
}

export function getBlogPost(id: string): BlogPost | undefined {
  const all = getAllBlogs();
  return all.find((p) => p.id === id);
}

export function getRelatedBlogPosts(id: string, limit = 3): BlogPost[] {
  const all = getAllBlogs();
  const current = getBlogPost(id);
  if (!current) return all.slice(0, limit);
  return all
    .filter(
      (p) =>
        p.id !== id &&
        (p.category === current.category || p.keywords.some((k) => current.keywords.includes(k))),
    )
    .slice(0, limit);
}
