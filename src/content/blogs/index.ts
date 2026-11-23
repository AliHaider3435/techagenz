import type { BlogPost } from "./types";

const blogModules = import.meta.glob<BlogPost>("./*.json", {
  import: "default",
});

export type { BlogPost } from "./types";

export const blogCategories = [
  "All",
  "AI & ML",
  "Custom Software",
  "Automation",
  "Enterprise ERP",
  "Industry Solutions",
] as const;

export async function loadBlogPosts(): Promise<BlogPost[]> {
  const posts = await Promise.all(Object.values(blogModules).map((loadPost) => loadPost()));
  return posts.sort((a, b) => {
    const dateDifference = Date.parse(b.publishDateIso) - Date.parse(a.publishDateIso);
    return dateDifference || a.id.localeCompare(b.id);
  });
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | undefined> {
  const loadPost = blogModules[`./${slug}.json`];
  return loadPost ? loadPost() : undefined;
}

export function filterBlogPosts(
  posts: BlogPost[],
  activeCategory: string,
  searchQuery: string,
): BlogPost[] {
  const query = searchQuery.toLowerCase().trim();
  return posts.filter((post) => {
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    if (!matchesCategory || !query) return matchesCategory;

    return (
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.keywords.some((keyword) => keyword.toLowerCase().includes(query)) ||
      post.category.toLowerCase().includes(query)
    );
  });
}

export async function getRelatedBlogPosts(post: BlogPost, limit = 3): Promise<BlogPost[]> {
  const blogPosts = await loadBlogPosts();
  return blogPosts
    .filter(
      (candidate) =>
        candidate.id !== post.id &&
        (candidate.category === post.category ||
          candidate.keywords.some((keyword) => post.keywords.includes(keyword))),
    )
    .slice(0, limit);
}
