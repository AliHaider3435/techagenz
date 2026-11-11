import type { TeamMember } from "../lib/cms-store.ts";
import type { BlogPost } from "../lib/blogs-data.ts";
import type { CaseStudy } from "../lib/projects-data.ts";

export interface CmsApiSuccess<T> {
  ok: true;
  data: T;
}

export interface CmsApiErrorResponse {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}

export type CmsApiResponse<T> = CmsApiSuccess<T> | CmsApiErrorResponse;

export interface TeamMemberDto {
  id: string;
  name: string;
  role: string;
  image: string;
  borderColor: string;
  gradient: string;
  sortOrder: number;
}

export interface BlogListDto {
  id: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  publishDateIso: string;
  author: string;
  image: string;
  excerpt: string;
  featured: boolean;
  keywords: string[];
}

export interface BlogDetailDto extends BlogListDto {
  keyTakeaways: string[];
  content: string[];
}

export interface CaseStudyDto {
  slug: string;
  title: string;
  shortTitle: string;
  formulaSummary: string;
  clientType: string;
  clientName: string;
  category: string;
  coverImage: string;
  tags: string[];
  featuredOnHome: boolean;
  order: number;
  timeline: string;
  status: string;
  problem: {
    heading: string;
    description: string;
    painPoints: string[];
  };
  solution: {
    heading: string;
    description: string;
    keyDeliverables: string[];
  };
  stack: string[];
  architecture: {
    overview: string;
    flowSteps: {
      step: string;
      title: string;
      description: string;
    }[];
  };
  results: {
    stats: {
      metric: string;
      label: string;
      context: string;
    }[];
    bullets: string[];
  };
  keyFeatures: {
    title: string;
    description: string;
    tag: string | null;
  }[];
  testimonial: {
    quote: string;
    author: string | null;
    role: string | null;
    organization: string | null;
  } | null;
}

export type CmsTeamMember = TeamMember & { sortOrder: number };

export type CmsBlogListPost = Omit<
  BlogPost,
  "category" | "featured" | "keyTakeaways" | "content"
> & {
  category: string;
  featured: boolean;
};

export interface CmsBlogDetailPost extends CmsBlogListPost {
  keyTakeaways: string[];
  content: string[];
}

export type CmsCaseStudy = Omit<
  CaseStudy,
  "category" | "status" | "keyFeatures" | "testimonial"
> & {
  category: string;
  status: string;
  keyFeatures: {
    title: string;
    description: string;
    tag: string | null;
  }[];
  testimonial: CaseStudyDto["testimonial"];
};

export interface BlogCollectionQuery {
  category?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export type CmsApiErrorKind = "configuration" | "network" | "http" | "response" | "worker";

export class CmsApiClientError extends Error {
  readonly kind: CmsApiErrorKind;
  readonly status?: number;
  readonly code?: string;

  constructor(message: string, options: { kind: CmsApiErrorKind; status?: number; code?: string }) {
    super(message);
    this.name = "CmsApiClientError";
    this.kind = options.kind;
    this.status = options.status;
    this.code = options.code;
  }
}

export interface CmsClient {
  getTeam(): Promise<CmsTeamMember[]>;
  getTeamMember(id: string): Promise<CmsTeamMember>;
  getBlogs(query?: BlogCollectionQuery): Promise<CmsBlogListPost[]>;
  getBlog(id: string): Promise<CmsBlogDetailPost>;
  getProjects(): Promise<CmsCaseStudy[]>;
  getProject(slug: string): Promise<CmsCaseStudy>;
}

export function resolveCmsApiBaseUrl(value: string | undefined): string | null {
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
      (url.pathname !== "" && url.pathname !== "/")
    ) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

export function adaptTeamMember(dto: TeamMemberDto): CmsTeamMember {
  return {
    id: dto.id,
    title: dto.name,
    subtitle: dto.role,
    image: dto.image,
    borderColor: dto.borderColor,
    gradient: dto.gradient,
    sortOrder: dto.sortOrder,
  };
}

export function adaptBlogListPost(dto: BlogListDto): CmsBlogListPost {
  return {
    id: dto.id,
    title: dto.title,
    category: dto.category,
    readTime: dto.readTime,
    date: dto.date,
    publishDateIso: dto.publishDateIso,
    author: dto.author,
    image: dto.image,
    excerpt: dto.excerpt,
    featured: dto.featured,
    keywords: [...dto.keywords],
  };
}

export function adaptBlogDetailPost(dto: BlogDetailDto): CmsBlogDetailPost {
  return {
    ...adaptBlogListPost(dto),
    keyTakeaways: [...dto.keyTakeaways],
    content: [...dto.content],
  };
}

export function adaptCaseStudy(dto: CaseStudyDto): CmsCaseStudy {
  return {
    ...dto,
    tags: [...dto.tags],
    problem: { ...dto.problem, painPoints: [...dto.problem.painPoints] },
    solution: { ...dto.solution, keyDeliverables: [...dto.solution.keyDeliverables] },
    stack: [...dto.stack],
    architecture: {
      ...dto.architecture,
      flowSteps: dto.architecture.flowSteps.map((step) => ({ ...step })),
    },
    results: {
      stats: dto.results.stats.map((stat) => ({ ...stat })),
      bullets: [...dto.results.bullets],
    },
    keyFeatures: dto.keyFeatures.map((feature) => ({ ...feature })),
    testimonial: dto.testimonial ? { ...dto.testimonial } : null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getWorkerError(value: unknown): CmsApiErrorResponse["error"] | null {
  if (!isRecord(value) || value.ok !== false || !isRecord(value.error)) return null;
  const { code, message } = value.error;
  if (typeof code !== "string" || typeof message !== "string") return null;
  return { code, message };
}

function buildUrl(baseUrl: string, path: string, query?: BlogCollectionQuery): URL {
  const url = new URL(path.replace(/^\/+/, ""), `${baseUrl}/`);
  if (!query) return url;

  if (query.category !== undefined) {
    if (!query.category.trim()) {
      throw new CmsApiClientError("The blog category filter cannot be empty.", {
        kind: "configuration",
      });
    }
    url.searchParams.set("category", query.category);
  }
  if (query.featured !== undefined) {
    url.searchParams.set("featured", query.featured ? "1" : "0");
  }
  if (query.limit !== undefined) {
    if (!Number.isSafeInteger(query.limit) || query.limit < 1 || query.limit > 100) {
      throw new CmsApiClientError("The blog limit must be an integer from 1 to 100.", {
        kind: "configuration",
      });
    }
    url.searchParams.set("limit", String(query.limit));
  }
  if (query.offset !== undefined) {
    if (!Number.isSafeInteger(query.offset) || query.offset < 0) {
      throw new CmsApiClientError("The blog offset must be a non-negative integer.", {
        kind: "configuration",
      });
    }
    url.searchParams.set("offset", String(query.offset));
  }
  return url;
}

export function createCmsClient(
  baseUrl: string | undefined,
  fetcher: typeof fetch = fetch,
): CmsClient {
  const resolvedBaseUrl = resolveCmsApiBaseUrl(baseUrl);

  async function request<T>(path: string, query?: BlogCollectionQuery): Promise<T> {
    if (!resolvedBaseUrl) {
      throw new CmsApiClientError(
        "Set VITE_API_BASE_URL to the HTTPS origin of the Cloudflare Worker API.",
        { kind: "configuration" },
      );
    }

    const url = buildUrl(resolvedBaseUrl, path, query);
    let response: Response;
    try {
      response = await fetcher(url);
    } catch {
      throw new CmsApiClientError(
        "Unable to reach the CMS service. Check your connection and try again.",
        { kind: "network" },
      );
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      if (!response.ok) {
        throw new CmsApiClientError(
          `The CMS service returned HTTP ${response.status}. Please try again later.`,
          { kind: "http", status: response.status },
        );
      }
      throw new CmsApiClientError("The CMS service returned invalid JSON.", {
        kind: "response",
        status: response.status,
      });
    }

    const workerError = getWorkerError(body);
    if (workerError) {
      throw new CmsApiClientError(workerError.message, {
        kind: "worker",
        code: workerError.code,
        status: response.status,
      });
    }

    if (!response.ok) {
      if (response.status === 404 && isRecord(body) && body.ok === false) {
        throw new CmsApiClientError("The requested CMS record was not found.", {
          kind: "worker",
          code: "NOT_FOUND",
          status: response.status,
        });
      }

      throw new CmsApiClientError(
        `The CMS service returned HTTP ${response.status}. Please try again later.`,
        { kind: "http", status: response.status },
      );
    }

    if (!isRecord(body) || body.ok !== true || !("data" in body)) {
      throw new CmsApiClientError("The CMS service returned an invalid response.", {
        kind: "response",
        status: response.status,
      });
    }

    return body.data as T;
  }

  function pathSegment(value: string, label: string): string {
    if (!value.trim()) {
      throw new CmsApiClientError(`A ${label} is required to request this CMS record.`, {
        kind: "configuration",
      });
    }
    return encodeURIComponent(value);
  }

  return {
    async getTeam() {
      const members = await request<TeamMemberDto[]>("/api/cms/team");
      return members.map(adaptTeamMember);
    },
    async getTeamMember(id) {
      return adaptTeamMember(
        await request<TeamMemberDto>(`/api/cms/team/${pathSegment(id, "team member ID")}`),
      );
    },
    async getBlogs(query) {
      const posts = await request<BlogListDto[]>("/api/cms/blogs", query);
      return posts.map(adaptBlogListPost);
    },
    async getBlog(id) {
      return adaptBlogDetailPost(
        await request<BlogDetailDto>(`/api/cms/blogs/${pathSegment(id, "blog ID")}`),
      );
    },
    async getProjects() {
      const projects = await request<CaseStudyDto[]>("/api/cms/projects");
      return projects.map(adaptCaseStudy);
    },
    async getProject(slug) {
      return adaptCaseStudy(
        await request<CaseStudyDto>(`/api/cms/projects/${pathSegment(slug, "project slug")}`),
      );
    },
  };
}

export const cmsClient = createCmsClient(import.meta.env?.VITE_API_BASE_URL);
