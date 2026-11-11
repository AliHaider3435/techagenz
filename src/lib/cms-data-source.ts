import {
  CmsApiClientError,
  type CmsBlogDetailPost,
  type CmsBlogListPost,
  type CmsCaseStudy,
  type CmsClient,
  type CmsTeamMember,
} from "../api/cms-client.ts";

export type CmsDataSource = "worker" | "fallback";

export interface CmsDataResult<T> {
  data: T;
  source: CmsDataSource;
}

export interface CmsDetailResult<T> {
  data: T | null;
  source: CmsDataSource;
}

export interface PublicCmsFallbacks {
  team: CmsTeamMember[];
  blogs: CmsBlogDetailPost[];
  projects: CmsCaseStudy[];
}

const WORKER_CACHE_MS = 30_000;
const FALLBACK_CACHE_MS = 5_000;

interface CacheEntry<T> {
  expiresAt: number;
  promise: Promise<T>;
}

export function filterBlogPosts(
  posts: CmsBlogListPost[],
  activeCategory: string,
  searchQuery: string,
): CmsBlogListPost[] {
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

export function filterProjectsByCategory(
  caseStudies: CmsCaseStudy[],
  activeCategory: string,
): CmsCaseStudy[] {
  return activeCategory === "All"
    ? caseStudies
    : caseStudies.filter((project) => project.category === activeCategory);
}

export function getFeaturedHomepageProjects(caseStudies: CmsCaseStudy[]): CmsCaseStudy[] {
  return caseStudies.filter((project) => project.featuredOnHome);
}

export function getRelatedCmsProjects(
  caseStudies: CmsCaseStudy[],
  slug: string,
  limit = 2,
): CmsCaseStudy[] {
  return caseStudies.filter((project) => project.slug !== slug).slice(0, limit);
}

export function getRelatedCmsBlogs(
  posts: CmsBlogListPost[],
  post: CmsBlogDetailPost,
  limit = 3,
): CmsBlogListPost[] {
  return posts
    .filter(
      (candidate) =>
        candidate.id !== post.id &&
        (candidate.category === post.category ||
          candidate.keywords.some((keyword) => post.keywords.includes(keyword))),
    )
    .slice(0, limit);
}

export function resolveCmsImageUrl(image: string, siteOrigin = "https://techagenz.com"): string {
  try {
    return new URL(image, siteOrigin).toString();
  } catch {
    return image;
  }
}

export function createPublicCmsDataSource(client: CmsClient, fallbacks: PublicCmsFallbacks) {
  const teamCache = new Map<string, CacheEntry<CmsDataResult<CmsTeamMember[]>>>();
  const blogsCache = new Map<string, CacheEntry<CmsDataResult<CmsBlogListPost[]>>>();
  const blogDetailCache = new Map<string, CacheEntry<CmsDetailResult<CmsBlogDetailPost>>>();
  const projectsCache = new Map<string, CacheEntry<CmsDataResult<CmsCaseStudy[]>>>();
  const projectDetailCache = new Map<string, CacheEntry<CmsDetailResult<CmsCaseStudy>>>();

  function cached<T extends { source: CmsDataSource }>(
    cache: Map<string, CacheEntry<T>>,
    key: string,
    load: () => Promise<T>,
  ): Promise<T> {
    const now = Date.now();
    const existing = cache.get(key);
    if (existing?.expiresAt && existing.expiresAt > now) return existing.promise;

    const promise = load()
      .then((result) => {
        const ttl = result.source === "worker" ? WORKER_CACHE_MS : FALLBACK_CACHE_MS;
        if (cache.get(key)?.promise === promise) {
          cache.set(key, { expiresAt: Date.now() + ttl, promise });
        }
        return result;
      })
      .catch((error: unknown) => {
        if (cache.get(key)?.promise === promise) cache.delete(key);
        throw error;
      });
    cache.set(key, { expiresAt: now + WORKER_CACHE_MS, promise });
    return promise;
  }

  function reportFallback(error: unknown): void {
    if (error instanceof CmsApiClientError && error.kind === "configuration") {
      console.warn(`[CMS] ${error.message} Bundled content will be used until configured.`);
      return;
    }
    console.warn("[CMS] Worker data is unavailable; using bundled content.");
  }

  async function getAllBlogsFromWorker(): Promise<CmsBlogListPost[]> {
    const posts: CmsBlogListPost[] = [];
    const seen = new Set<string>();
    let offset = 0;

    while (true) {
      const page = await client.getBlogs({ limit: 100, offset });
      if (page.length > 100) {
        throw new Error("The CMS returned more blog records than requested.");
      }

      let newRecords = 0;
      for (const post of page) {
        if (!seen.has(post.id)) {
          seen.add(post.id);
          posts.push(post);
          newRecords += 1;
        }
      }

      if (page.length < 100) return posts;
      if (newRecords === 0) {
        throw new Error("The CMS blog pagination did not advance.");
      }
      offset += page.length;
    }
  }

  return {
    getTeam(): Promise<CmsDataResult<CmsTeamMember[]>> {
      return cached(teamCache, "team", async () => {
        try {
          return { data: await client.getTeam(), source: "worker" };
        } catch (error) {
          reportFallback(error);
          return { data: fallbacks.team, source: "fallback" };
        }
      });
    },

    getBlogs(): Promise<CmsDataResult<CmsBlogListPost[]>> {
      return cached(blogsCache, "blogs", async () => {
        try {
          return { data: await getAllBlogsFromWorker(), source: "worker" };
        } catch (error) {
          reportFallback(error);
          return {
            data: fallbacks.blogs.map(
              ({ keyTakeaways: _takeaways, content: _content, ...post }) => ({
                ...post,
                keywords: [...post.keywords],
              }),
            ),
            source: "fallback",
          };
        }
      });
    },

    getBlog(id: string): Promise<CmsDetailResult<CmsBlogDetailPost>> {
      return cached(blogDetailCache, id, async () => {
        try {
          return { data: await client.getBlog(id), source: "worker" };
        } catch (error) {
          if (
            error instanceof CmsApiClientError &&
            error.kind === "worker" &&
            error.code === "NOT_FOUND"
          ) {
            return { data: null, source: "worker" };
          }
          reportFallback(error);
          return {
            data: fallbacks.blogs.find((post) => post.id === id) ?? null,
            source: "fallback",
          };
        }
      });
    },

    getProjects(): Promise<CmsDataResult<CmsCaseStudy[]>> {
      return cached(projectsCache, "projects", async () => {
        try {
          return { data: await client.getProjects(), source: "worker" };
        } catch (error) {
          reportFallback(error);
          return { data: fallbacks.projects, source: "fallback" };
        }
      });
    },

    getProject(slug: string): Promise<CmsDetailResult<CmsCaseStudy>> {
      return cached(projectDetailCache, slug, async () => {
        try {
          return { data: await client.getProject(slug), source: "worker" };
        } catch (error) {
          if (
            error instanceof CmsApiClientError &&
            error.kind === "worker" &&
            error.code === "NOT_FOUND"
          ) {
            return { data: null, source: "worker" };
          }
          reportFallback(error);
          return {
            data: fallbacks.projects.find((project) => project.slug === slug) ?? null,
            source: "fallback",
          };
        }
      });
    },
  };
}
