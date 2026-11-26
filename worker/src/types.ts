/**
 * Cloudflare Worker environment bindings.
 * All secrets are injected at runtime via `wrangler secret put`
 * or `.dev.vars` for local development — never hardcoded here.
 */
export interface Env {
  // ── Cloudflare D1 (relational database) ──────────────────────────────────
  DB: D1Database;

  // ── Cloudflare R2 (object storage) ───────────────────────────────────────
  ASSETS: R2Bucket;

  // ── Non-secret vars (set in wrangler.toml) ─────────────────────────────────
  ENVIRONMENT: string;

  // ── Cloudflare-native public endpoint rate limiting ─────────────────────
  ENQUIRY_RATE_LIMITER: RateLimit;

  // ── Secrets (set via `wrangler secret put`) ───────────────────────────────
  RESEND_API_KEY: string;
  CF_TURNSTILE_SECRET_KEY: string;

  /** Expected Turnstile hostname for public enquiry requests outside production. */
  TURNSTILE_ENQUIRY_HOSTNAME?: string;
}

// ─── Shared response shapes ───────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ─── Domain types (mirrors cms-data.json + projects-data.ts) ─────────────────

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
    stats: { metric: string; label: string; context: string }[];
    bullets: string[];
  };
  keyFeatures: { title: string; description: string; tag: string | null }[];
  testimonial: {
    quote: string;
    author: string | null;
    role: string | null;
    organization: string | null;
  } | null;
}

export interface Enquiry {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  budget?: string;
  message: string;
  status?: string;
  source?: string;
  turnstile_token: string;
  created_at?: string;
}
