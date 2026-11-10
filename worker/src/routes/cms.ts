import { Env } from "../types";
import { jsonResponse, errorResponse } from "../middleware/error";
import { BlogDetailDto, BlogListDto, CaseStudyDto, TeamMemberDto } from "../types";

interface TeamRow {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  border_color: string;
  gradient: string;
  sort_order: number;
}

interface BlogRow {
  id: string;
  title: string;
  category: string;
  read_time: string;
  date: string;
  publish_date_iso: string;
  author: string;
  image: string;
  excerpt: string;
  featured: number;
}

interface CaseStudyRow {
  slug: string;
  title: string;
  short_title: string;
  formula_summary: string;
  client_type: string;
  client_name: string;
  category: string;
  cover_image: string;
  featured_on_home: number;
  sort_order: number;
  timeline: string;
  status: string;
  problem_heading: string;
  problem_description: string;
  solution_heading: string;
  solution_description: string;
  architecture_overview: string;
  testimonial_quote: string | null;
  testimonial_author: string | null;
  testimonial_role: string | null;
  testimonial_company: string | null;
}

interface IdRow {
  id: number;
}

interface BlogKeywordRow extends IdRow {
  keyword: string;
}

interface BlogTakeawayRow extends IdRow {
  takeaway: string;
}

interface BlogContentRow extends IdRow {
  paragraph: string;
}

interface TextChildRow extends IdRow {
  value: string;
}

interface FlowStepRow extends IdRow {
  step_code: string;
  title: string;
  description: string;
}

interface StatRow extends IdRow {
  label: string;
  value: string;
  context: string;
}

interface FeatureRow extends IdRow {
  title: string;
  description: string;
  tag: string | null;
}

function mapTeamMember(row: TeamRow): TeamMemberDto {
  return {
    id: row.id,
    name: row.title,
    role: row.subtitle,
    image: row.image,
    borderColor: row.border_color,
    gradient: row.gradient,
    sortOrder: row.sort_order,
  };
}

function mapBlogPost(row: BlogRow, keywords: string[]): BlogListDto {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    readTime: row.read_time,
    date: row.date,
    publishDateIso: row.publish_date_iso,
    author: row.author,
    image: row.image,
    excerpt: row.excerpt,
    featured: row.featured === 1,
    keywords,
  };
}

function parsePublicationDate(value: string): number | null {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const dateTime =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/i.exec(
      value,
    );
  const match = dateOnly ?? dateTime;
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const monthLengths = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const daysInMonth = monthLengths[month - 1] ?? 0;
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth) return null;

  if (dateTime) {
    const hour = Number(dateTime[4]);
    const minute = Number(dateTime[5]);
    const second = Number(dateTime[6] ?? 0);
    if (hour > 23 || minute > 59 || second > 59) return null;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function orderBlogPosts(rows: BlogRow[]): BlogRow[] {
  return [...rows].sort((a, b) => {
    const aDate = parsePublicationDate(a.publish_date_iso);
    const bDate = parsePublicationDate(b.publish_date_iso);
    if (aDate !== null && bDate !== null && aDate !== bDate) return bDate - aDate;
    if (aDate !== null && bDate === null) return -1;
    if (aDate === null && bDate !== null) return 1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

function singleQueryValue(url: URL, name: string): string | null | undefined {
  const values = url.searchParams.getAll(name);
  if (values.length > 1) return undefined;
  return values.length === 0 ? null : values[0];
}

function parsePaginationValue(
  value: string | null | undefined,
  fallback: number,
  maximum: number,
  allowZero: boolean,
): number | null {
  if (value === null) return fallback;
  if (value === undefined || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed > maximum || (!allowZero && parsed === 0)) {
    return null;
  }
  return parsed;
}

async function blogKeywords(env: Env, postId: string): Promise<string[]> {
  const { results } = await env.DB.prepare(
    "SELECT id, keyword FROM blog_post_keywords WHERE post_id = ? ORDER BY sort_order ASC, id ASC",
  )
    .bind(postId)
    .all<BlogKeywordRow>();
  return results.map((row) => row.keyword);
}

async function serializeBlog(
  env: Env,
  row: BlogRow,
  detail: boolean,
): Promise<BlogListDto | BlogDetailDto> {
  const keywords = await blogKeywords(env, row.id);
  const base = mapBlogPost(row, keywords);
  if (!detail) return base;

  const [takeaways, content] = await Promise.all([
    env.DB.prepare(
      "SELECT id, takeaway FROM blog_post_key_takeaways WHERE post_id = ? ORDER BY sort_order ASC, id ASC",
    )
      .bind(row.id)
      .all<BlogTakeawayRow>(),
    env.DB.prepare(
      "SELECT id, paragraph FROM blog_post_content WHERE post_id = ? ORDER BY sort_order ASC, id ASC",
    )
      .bind(row.id)
      .all<BlogContentRow>(),
  ]);
  return {
    ...base,
    keyTakeaways: takeaways.results.map((item) => item.takeaway),
    content: content.results.map((item) => item.paragraph),
  };
}

async function childValues(
  env: Env,
  table: string,
  column: string,
  slug: string,
): Promise<string[]> {
  const { results } = await env.DB.prepare(
    `SELECT id, ${column} AS value FROM ${table} WHERE slug = ? ORDER BY sort_order ASC, id ASC`,
  )
    .bind(slug)
    .all<TextChildRow>();
  return results.map((row) => row.value);
}

async function serializeProject(env: Env, row: CaseStudyRow): Promise<CaseStudyDto> {
  const [tags, painPoints, deliverables, stack, flowSteps, stats, bullets, features] =
    await Promise.all([
      childValues(env, "case_study_tags", "tag", row.slug),
      childValues(env, "case_study_pain_points", "point", row.slug),
      childValues(env, "case_study_deliverables", "deliverable", row.slug),
      childValues(env, "case_study_stack", "tech", row.slug),
      env.DB.prepare(
        "SELECT id, step_code, title, description FROM case_study_flow_steps WHERE slug = ? ORDER BY sort_order ASC, id ASC",
      )
        .bind(row.slug)
        .all<FlowStepRow>(),
      env.DB.prepare(
        "SELECT id, label, value, context FROM case_study_stats WHERE slug = ? ORDER BY sort_order ASC, id ASC",
      )
        .bind(row.slug)
        .all<StatRow>(),
      childValues(env, "case_study_result_bullets", "bullet", row.slug),
      env.DB.prepare(
        "SELECT id, title, description, tag FROM case_study_key_features WHERE slug = ? ORDER BY sort_order ASC, id ASC",
      )
        .bind(row.slug)
        .all<FeatureRow>(),
    ]);

  return {
    slug: row.slug,
    title: row.title,
    shortTitle: row.short_title,
    formulaSummary: row.formula_summary,
    clientType: row.client_type,
    clientName: row.client_name,
    category: row.category,
    coverImage: row.cover_image,
    tags,
    featuredOnHome: row.featured_on_home === 1,
    order: row.sort_order,
    timeline: row.timeline,
    status: row.status,
    problem: {
      heading: row.problem_heading,
      description: row.problem_description,
      painPoints,
    },
    solution: {
      heading: row.solution_heading,
      description: row.solution_description,
      keyDeliverables: deliverables,
    },
    stack,
    architecture: {
      overview: row.architecture_overview,
      flowSteps: flowSteps.results.map(({ step_code, title, description }) => ({
        step: step_code,
        title,
        description,
      })),
    },
    results: {
      stats: stats.results.map(({ label, value, context }) => ({
        metric: value,
        label,
        context,
      })),
      bullets,
    },
    keyFeatures: features.results.map(({ title, description, tag }) => ({
      title,
      description,
      tag,
    })),
    testimonial:
      row.testimonial_quote !== null
        ? {
            quote: row.testimonial_quote,
            author: row.testimonial_author,
            role: row.testimonial_role,
            organization: row.testimonial_company,
          }
        : null,
  };
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export async function getTeam(_request: Request, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    "SELECT id, image, title, subtitle, border_color, gradient, sort_order FROM team_members ORDER BY sort_order ASC, id ASC",
  ).all<TeamRow>();
  return jsonResponse(results.map(mapTeamMember));
}

export async function getTeamMember(_request: Request, env: Env, id: string): Promise<Response> {
  const member = await env.DB.prepare(
    "SELECT id, image, title, subtitle, border_color, gradient, sort_order FROM team_members WHERE id = ?",
  )
    .bind(id)
    .first<TeamRow>();

  if (!member) return errorResponse("Team member not found", 404, "NOT_FOUND");
  return jsonResponse(mapTeamMember(member));
}

// ─── Blog Posts ───────────────────────────────────────────────────────────────

export async function getBlogs(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const category = singleQueryValue(url, "category");
  const featured = singleQueryValue(url, "featured");
  const limit = parsePaginationValue(singleQueryValue(url, "limit"), 50, 100, false);
  const offset = parsePaginationValue(
    singleQueryValue(url, "offset"),
    0,
    Number.MAX_SAFE_INTEGER,
    true,
  );

  if (
    category === undefined ||
    featured === undefined ||
    limit === null ||
    offset === null ||
    (category !== null && category.length === 0) ||
    (featured !== null && featured !== "0" && featured !== "1")
  ) {
    return errorResponse("Invalid blog query parameters", 400, "BAD_REQUEST");
  }

  const conditions: string[] = [];
  const bindings: (string | number)[] = [];
  if (category !== null) {
    conditions.push("category = ?");
    bindings.push(category);
  }
  if (featured === "1" || featured === "0") {
    conditions.push("featured = ?");
    bindings.push(Number(featured));
  }

  let query =
    "SELECT id, title, category, read_time, date, publish_date_iso, author, image, excerpt, featured FROM blog_posts";
  if (conditions.length > 0) query += ` WHERE ${conditions.join(" AND ")}`;
  const { results } = await env.DB.prepare(query)
    .bind(...bindings)
    .all<BlogRow>();
  const ordered = orderBlogPosts(results);
  const page = ordered.slice(offset, offset + limit);
  const posts = await Promise.all(page.map((post) => serializeBlog(env, post, false)));
  return jsonResponse(posts);
}

export async function getBlog(_request: Request, env: Env, id: string): Promise<Response> {
  const post = await env.DB.prepare(
    "SELECT id, title, category, read_time, date, publish_date_iso, author, image, excerpt, featured FROM blog_posts WHERE id = ?",
  )
    .bind(id)
    .first<BlogRow>();
  if (!post) return errorResponse("Blog post not found", 404, "NOT_FOUND");
  return jsonResponse(await serializeBlog(env, post, true));
}

// ─── Case Studies ─────────────────────────────────────────────────────────────

export async function getProjects(_request: Request, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    "SELECT * FROM case_studies ORDER BY sort_order ASC, slug ASC",
  ).all<CaseStudyRow>();
  const projects = await Promise.all(results.map((row) => serializeProject(env, row)));
  return jsonResponse(projects);
}

export async function getProject(_request: Request, env: Env, slug: string): Promise<Response> {
  const project = await env.DB.prepare("SELECT * FROM case_studies WHERE slug = ?")
    .bind(slug)
    .first<CaseStudyRow>();
  if (!project) return errorResponse("Project not found", 404, "NOT_FOUND");
  return jsonResponse(await serializeProject(env, project));
}
