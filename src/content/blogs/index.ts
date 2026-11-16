import type { BlogPost } from "./types";

const blogModules = import.meta.glob<BlogPost>("./*.json", {
  eager: true,
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

export const blogPosts = Object.values(blogModules).sort((a, b) => {
  const dateDifference = Date.parse(b.publishDateIso) - Date.parse(a.publishDateIso);
  return dateDifference || a.id.localeCompare(b.id);
});

export function getBlogBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.id === slug);
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

export function getRelatedBlogPosts(post: BlogPost, limit = 3): BlogPost[] {
  return blogPosts
    .filter(
      (candidate) =>
        candidate.id !== post.id &&
        (candidate.category === post.category ||
          candidate.keywords.some((keyword) => post.keywords.includes(keyword))),
    )
    .slice(0, limit);
}
