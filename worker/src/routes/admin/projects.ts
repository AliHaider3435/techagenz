import { Env, CaseStudyDto } from "../../types";
import { jsonResponse, errorResponse } from "../../middleware/error";

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function fetchFullProject(env: Env, row: CaseStudyRow): Promise<CaseStudyDto> {
  const [tags, painPoints, deliverables, stack, flowSteps, stats, bullets, features] =
    await Promise.all([
      env.DB.prepare(
        "SELECT id, tag AS value FROM case_study_tags WHERE slug = ? ORDER BY sort_order ASC, id ASC",
      )
        .bind(row.slug)
        .all<TextChildRow>(),
      env.DB.prepare(
        "SELECT id, point AS value FROM case_study_pain_points WHERE slug = ? ORDER BY sort_order ASC, id ASC",
      )
        .bind(row.slug)
        .all<TextChildRow>(),
      env.DB.prepare(
        "SELECT id, deliverable AS value FROM case_study_deliverables WHERE slug = ? ORDER BY sort_order ASC, id ASC",
      )
        .bind(row.slug)
        .all<TextChildRow>(),
      env.DB.prepare(
        "SELECT id, tech AS value FROM case_study_stack WHERE slug = ? ORDER BY sort_order ASC, id ASC",
      )
        .bind(row.slug)
        .all<TextChildRow>(),
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
      env.DB.prepare(
        "SELECT id, bullet AS value FROM case_study_result_bullets WHERE slug = ? ORDER BY sort_order ASC, id ASC",
      )
        .bind(row.slug)
        .all<TextChildRow>(),
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
    tags: tags.results.map((r) => r.value),
    featuredOnHome: row.featured_on_home === 1,
    order: row.sort_order,
    timeline: row.timeline,
    status: row.status,
    problem: {
      heading: row.problem_heading,
      description: row.problem_description,
      painPoints: painPoints.results.map((r) => r.value),
    },
    solution: {
      heading: row.solution_heading,
      description: row.solution_description,
      keyDeliverables: deliverables.results.map((r) => r.value),
    },
    stack: stack.results.map((r) => r.value),
    architecture: {
      overview: row.architecture_overview,
      flowSteps: flowSteps.results.map((r) => ({
        step: r.step_code,
        title: r.title,
        description: r.description,
      })),
    },
    results: {
      stats: stats.results.map((r) => ({
        metric: r.value,
        label: r.label,
        context: r.context,
      })),
      bullets: bullets.results.map((r) => r.value),
    },
    keyFeatures: features.results.map((r) => ({
      title: r.title,
      description: r.description,
      tag: r.tag,
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

export async function listProjects(_request: Request, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    "SELECT * FROM case_studies ORDER BY sort_order ASC, slug ASC",
  ).all<CaseStudyRow>();

  const projects = await Promise.all(results.map((row) => fetchFullProject(env, row)));
  return jsonResponse(projects);
}

export async function getProject(_request: Request, env: Env, slug: string): Promise<Response> {
  const row = await env.DB.prepare("SELECT * FROM case_studies WHERE slug = ?")
    .bind(slug)
    .first<CaseStudyRow>();

  if (!row) {
    return errorResponse("Project not found", 404, "NOT_FOUND");
  }

  return jsonResponse(await fetchFullProject(env, row));
}

function buildChildInserts(
  slug: string,
  body: Record<string, unknown>,
  env: Env,
): D1PreparedStatement[] {
  const stmts: D1PreparedStatement[] = [];
  const problem = body.problem as Record<string, unknown> | undefined;
  const solution = body.solution as Record<string, unknown> | undefined;
  const architecture = body.architecture as Record<string, unknown> | undefined;
  const results = body.results as Record<string, unknown> | undefined;

  // Tags
  if (Array.isArray(body.tags)) {
    body.tags.forEach((tag: unknown, idx: number) => {
      const clean = String(tag).trim();
      if (clean) {
        stmts.push(
          env.DB.prepare(
            "INSERT INTO case_study_tags (slug, tag, sort_order) VALUES (?, ?, ?)",
          ).bind(slug, clean, idx),
        );
      }
    });
  }

  // Pain points
  const painPoints = Array.isArray(problem?.painPoints)
    ? problem.painPoints
    : Array.isArray(body.painPoints)
      ? body.painPoints
      : [];
  painPoints.forEach((pt: unknown, idx: number) => {
    const clean = String(pt).trim();
    if (clean) {
      stmts.push(
        env.DB.prepare(
          "INSERT INTO case_study_pain_points (slug, point, sort_order) VALUES (?, ?, ?)",
        ).bind(slug, clean, idx),
      );
    }
  });

  // Deliverables
  const deliverables = Array.isArray(solution?.keyDeliverables)
    ? solution.keyDeliverables
    : Array.isArray(body.keyDeliverables)
      ? body.keyDeliverables
      : [];
  deliverables.forEach((deliv: unknown, idx: number) => {
    const clean = String(deliv).trim();
    if (clean) {
      stmts.push(
        env.DB.prepare(
          "INSERT INTO case_study_deliverables (slug, deliverable, sort_order) VALUES (?, ?, ?)",
        ).bind(slug, clean, idx),
      );
    }
  });

  // Stack
  if (Array.isArray(body.stack)) {
    body.stack.forEach((tech: unknown, idx: number) => {
      const clean = String(tech).trim();
      if (clean) {
        stmts.push(
          env.DB.prepare(
            "INSERT INTO case_study_stack (slug, tech, sort_order) VALUES (?, ?, ?)",
          ).bind(slug, clean, idx),
        );
      }
    });
  }

  // Flow steps
  const flowSteps = Array.isArray(architecture?.flowSteps)
    ? architecture.flowSteps
    : Array.isArray(body.flowSteps)
      ? body.flowSteps
      : [];
  flowSteps.forEach((fs: unknown, idx: number) => {
    const r = fs as Record<string, unknown>;
    const stepCode = typeof r.step === "string" ? r.step : String(idx + 1).padStart(2, "0");
    const title = typeof r.title === "string" ? r.title : "";
    const desc = typeof r.description === "string" ? r.description : "";
    const legacyStep = title ? `${stepCode}: ${title}` : stepCode;
    stmts.push(
      env.DB.prepare(
        "INSERT INTO case_study_flow_steps (slug, step, step_code, title, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
      ).bind(slug, legacyStep, stepCode, title, desc, idx),
    );
  });

  // Stats
  const stats = Array.isArray(results?.stats)
    ? results.stats
    : Array.isArray(body.stats)
      ? body.stats
      : [];
  stats.forEach((st: unknown, idx: number) => {
    const s = st as Record<string, unknown>;
    const label = typeof s.label === "string" ? s.label : "";
    const value =
      typeof s.metric === "string" ? s.metric : typeof s.value === "string" ? s.value : "";
    const context = typeof s.context === "string" ? s.context : "";
    stmts.push(
      env.DB.prepare(
        "INSERT INTO case_study_stats (slug, label, value, context, sort_order) VALUES (?, ?, ?, ?, ?)",
      ).bind(slug, label, value, context, idx),
    );
  });

  // Bullets
  const bullets = Array.isArray(results?.bullets)
    ? results.bullets
    : Array.isArray(body.bullets)
      ? body.bullets
      : [];
  bullets.forEach((b: unknown, idx: number) => {
    const clean = String(b).trim();
    if (clean) {
      stmts.push(
        env.DB.prepare(
          "INSERT INTO case_study_result_bullets (slug, bullet, sort_order) VALUES (?, ?, ?)",
        ).bind(slug, clean, idx),
      );
    }
  });

  // Key features
  const features = Array.isArray(body.keyFeatures)
    ? body.keyFeatures
    : Array.isArray(body.key_features)
      ? body.key_features
      : [];
  features.forEach((kf: unknown, idx: number) => {
    const k = kf as Record<string, unknown>;
    const title = typeof k.title === "string" ? k.title : "";
    const description = typeof k.description === "string" ? k.description : "";
    const tag = typeof k.tag === "string" && k.tag.trim() ? k.tag.trim() : null;
    stmts.push(
      env.DB.prepare(
        "INSERT INTO case_study_key_features (slug, title, description, tag, sort_order) VALUES (?, ?, ?, ?, ?)",
      ).bind(slug, title, description, tag, idx),
    );
  });

  return stmts;
}

export async function createProject(request: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errorResponse("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return errorResponse("Project title is required", 400, "VALIDATION_ERROR");
  }

  const problem = body.problem as Record<string, unknown> | undefined;
  const solution = body.solution as Record<string, unknown> | undefined;
  const architecture = body.architecture as Record<string, unknown> | undefined;
  const testimonial = body.testimonial as Record<string, unknown> | undefined;

  let slug =
    typeof body.slug === "string" && body.slug.trim() ? slugify(body.slug) : slugify(title);
  if (!slug) {
    slug = `project-${Date.now()}`;
  }

  const existing = await env.DB.prepare("SELECT slug FROM case_studies WHERE slug = ?")
    .bind(slug)
    .first();
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const shortTitle =
    typeof body.shortTitle === "string"
      ? body.shortTitle.trim()
      : typeof body.short_title === "string"
        ? body.short_title.trim()
        : title;
  const formulaSummary =
    typeof body.formulaSummary === "string"
      ? body.formulaSummary.trim()
      : typeof body.formula_summary === "string"
        ? body.formula_summary.trim()
        : "";
  const clientType =
    typeof body.clientType === "string"
      ? body.clientType.trim()
      : typeof body.client_name === "string"
        ? body.client_name.trim()
        : "";
  const clientName =
    typeof body.clientName === "string"
      ? body.clientName.trim()
      : typeof body.client_name === "string"
        ? body.client_name.trim()
        : "";
  const category = typeof body.category === "string" ? body.category.trim() : "AI & Web Solutions";
  const coverImage =
    typeof body.coverImage === "string"
      ? body.coverImage.trim()
      : typeof body.cover_image === "string"
        ? body.cover_image.trim()
        : "";
  const featuredOnHome =
    body.featuredOnHome === true || body.featured_on_home === 1 || body.featured_on_home === "1"
      ? 1
      : 0;
  const sortOrder =
    typeof body.order === "number"
      ? body.order
      : typeof body.sortOrder === "number"
        ? body.sortOrder
        : typeof body.sort_order === "number"
          ? body.sort_order
          : 0;
  const timeline = typeof body.timeline === "string" ? body.timeline.trim() : "";
  const status =
    typeof body.status === "string" && body.status.trim()
      ? body.status.trim()
      : "Live in Production";

  const problemHeading =
    typeof problem?.heading === "string"
      ? problem.heading
      : typeof body.problem_heading === "string"
        ? body.problem_heading
        : "";
  const problemDescription =
    typeof problem?.description === "string"
      ? problem.description
      : typeof body.problem_description === "string"
        ? body.problem_description
        : "";
  const solutionHeading =
    typeof solution?.heading === "string"
      ? solution.heading
      : typeof body.solution_heading === "string"
        ? body.solution_heading
        : "";
  const solutionDescription =
    typeof solution?.description === "string"
      ? solution.description
      : typeof body.solution_description === "string"
        ? body.solution_description
        : "";
  const architectureOverview =
    typeof architecture?.overview === "string"
      ? architecture.overview
      : typeof body.architecture_overview === "string"
        ? body.architecture_overview
        : "";

  const testimonialQuote = testimonial?.quote ? String(testimonial.quote) : null;
  const testimonialAuthor = testimonial?.author ? String(testimonial.author) : null;
  const testimonialRole = testimonial?.role ? String(testimonial.role) : null;
  const testimonialCompany = testimonial?.organization
    ? String(testimonial.organization)
    : testimonial?.company
      ? String(testimonial.company)
      : null;

  const statements: D1PreparedStatement[] = [
    env.DB.prepare(
      `INSERT INTO case_studies (
        slug, title, short_title, formula_summary, client_type, client_name, category,
        cover_image, featured_on_home, sort_order, timeline, status,
        problem_heading, problem_description, solution_heading, solution_description,
        architecture_overview, testimonial_quote, testimonial_author, testimonial_role, testimonial_company,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    ).bind(
      slug,
      title,
      shortTitle,
      formulaSummary,
      clientType,
      clientName,
      category,
      coverImage,
      featuredOnHome,
      sortOrder,
      timeline,
      status,
      problemHeading,
      problemDescription,
      solutionHeading,
      solutionDescription,
      architectureOverview,
      testimonialQuote,
      testimonialAuthor,
      testimonialRole,
      testimonialCompany,
    ),
  ];

  statements.push(...buildChildInserts(slug, body, env));
  await env.DB.batch(statements);

  const created = await env.DB.prepare("SELECT * FROM case_studies WHERE slug = ?")
    .bind(slug)
    .first<CaseStudyRow>();
  return jsonResponse(await fetchFullProject(env, created!), 201);
}

export async function updateProject(request: Request, env: Env, slug: string): Promise<Response> {
  const existing = await env.DB.prepare("SELECT * FROM case_studies WHERE slug = ?")
    .bind(slug)
    .first<CaseStudyRow>();
  if (!existing) {
    return errorResponse("Project not found", 404, "NOT_FOUND");
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errorResponse("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const title = typeof body.title === "string" ? body.title.trim() : existing.title;
  if (!title) {
    return errorResponse("Project title cannot be empty", 400, "VALIDATION_ERROR");
  }

  const problem = body.problem as Record<string, unknown> | undefined;
  const solution = body.solution as Record<string, unknown> | undefined;
  const architecture = body.architecture as Record<string, unknown> | undefined;
  const testimonialBody = body.testimonial as Record<string, unknown> | null | undefined;

  const shortTitle =
    typeof body.shortTitle === "string"
      ? body.shortTitle.trim()
      : typeof body.short_title === "string"
        ? body.short_title.trim()
        : existing.short_title;
  const formulaSummary =
    typeof body.formulaSummary === "string"
      ? body.formulaSummary.trim()
      : typeof body.formula_summary === "string"
        ? body.formula_summary.trim()
        : existing.formula_summary;
  const clientType =
    typeof body.clientType === "string"
      ? body.clientType.trim()
      : typeof body.client_name === "string"
        ? body.client_name.trim()
        : existing.client_type;
  const clientName =
    typeof body.clientName === "string"
      ? body.clientName.trim()
      : typeof body.client_name === "string"
        ? body.client_name.trim()
        : existing.client_name;
  const category = typeof body.category === "string" ? body.category.trim() : existing.category;
  const coverImage =
    typeof body.coverImage === "string"
      ? body.coverImage.trim()
      : typeof body.cover_image === "string"
        ? body.cover_image.trim()
        : existing.cover_image;
  const featuredOnHome =
    body.featuredOnHome !== undefined
      ? body.featuredOnHome === true || body.featured_on_home === 1 || body.featured_on_home === "1"
        ? 1
        : 0
      : existing.featured_on_home;
  const sortOrder =
    typeof body.order === "number"
      ? body.order
      : typeof body.sortOrder === "number"
        ? body.sortOrder
        : typeof body.sort_order === "number"
          ? body.sort_order
          : existing.sort_order;
  const timeline = typeof body.timeline === "string" ? body.timeline.trim() : existing.timeline;
  const status = typeof body.status === "string" ? body.status.trim() : existing.status;

  const problemHeading =
    typeof problem?.heading === "string"
      ? problem.heading
      : typeof body.problem_heading === "string"
        ? body.problem_heading
        : existing.problem_heading;
  const problemDescription =
    typeof problem?.description === "string"
      ? problem.description
      : typeof body.problem_description === "string"
        ? body.problem_description
        : existing.problem_description;
  const solutionHeading =
    typeof solution?.heading === "string"
      ? solution.heading
      : typeof body.solution_heading === "string"
        ? body.solution_heading
        : existing.solution_heading;
  const solutionDescription =
    typeof solution?.description === "string"
      ? solution.description
      : typeof body.solution_description === "string"
        ? body.solution_description
        : existing.solution_description;
  const architectureOverview =
    typeof architecture?.overview === "string"
      ? architecture.overview
      : typeof body.architecture_overview === "string"
        ? body.architecture_overview
        : existing.architecture_overview;

  let testimonialQuote = existing.testimonial_quote;
  let testimonialAuthor = existing.testimonial_author;
  let testimonialRole = existing.testimonial_role;
  let testimonialCompany = existing.testimonial_company;

  if (body.testimonial !== undefined) {
    if (testimonialBody === null) {
      testimonialQuote = null;
      testimonialAuthor = null;
      testimonialRole = null;
      testimonialCompany = null;
    } else if (testimonialBody) {
      testimonialQuote = testimonialBody.quote ? String(testimonialBody.quote) : null;
      testimonialAuthor = testimonialBody.author ? String(testimonialBody.author) : null;
      testimonialRole = testimonialBody.role ? String(testimonialBody.role) : null;
      testimonialCompany = testimonialBody.organization
        ? String(testimonialBody.organization)
        : testimonialBody.company
          ? String(testimonialBody.company)
          : null;
    }
  }

  const statements: D1PreparedStatement[] = [
    env.DB.prepare(
      `UPDATE case_studies
       SET title = ?, short_title = ?, formula_summary = ?, client_type = ?, client_name = ?, category = ?,
           cover_image = ?, featured_on_home = ?, sort_order = ?, timeline = ?, status = ?,
           problem_heading = ?, problem_description = ?, solution_heading = ?, solution_description = ?,
           architecture_overview = ?, testimonial_quote = ?, testimonial_author = ?, testimonial_role = ?, testimonial_company = ?,
           updated_at = datetime('now')
       WHERE slug = ?`,
    ).bind(
      title,
      shortTitle,
      formulaSummary,
      clientType,
      clientName,
      category,
      coverImage,
      featuredOnHome,
      sortOrder,
      timeline,
      status,
      problemHeading,
      problemDescription,
      solutionHeading,
      solutionDescription,
      architectureOverview,
      testimonialQuote,
      testimonialAuthor,
      testimonialRole,
      testimonialCompany,
      slug,
    ),
  ];

  // If any child structures were supplied in body, wipe and re-insert
  const resultsBody = body.results as Record<string, unknown> | undefined;
  if (
    Array.isArray(body.tags) ||
    problem?.painPoints ||
    solution?.keyDeliverables ||
    Array.isArray(body.stack) ||
    architecture?.flowSteps ||
    resultsBody?.stats ||
    resultsBody?.bullets ||
    Array.isArray(body.keyFeatures)
  ) {
    statements.push(
      env.DB.prepare("DELETE FROM case_study_tags WHERE slug = ?").bind(slug),
      env.DB.prepare("DELETE FROM case_study_pain_points WHERE slug = ?").bind(slug),
      env.DB.prepare("DELETE FROM case_study_deliverables WHERE slug = ?").bind(slug),
      env.DB.prepare("DELETE FROM case_study_stack WHERE slug = ?").bind(slug),
      env.DB.prepare("DELETE FROM case_study_flow_steps WHERE slug = ?").bind(slug),
      env.DB.prepare("DELETE FROM case_study_stats WHERE slug = ?").bind(slug),
      env.DB.prepare("DELETE FROM case_study_result_bullets WHERE slug = ?").bind(slug),
      env.DB.prepare("DELETE FROM case_study_key_features WHERE slug = ?").bind(slug),
    );
    statements.push(...buildChildInserts(slug, body, env));
  }

  await env.DB.batch(statements);

  const updated = await env.DB.prepare("SELECT * FROM case_studies WHERE slug = ?")
    .bind(slug)
    .first<CaseStudyRow>();
  return jsonResponse(await fetchFullProject(env, updated!), 200);
}

export async function deleteProject(_request: Request, env: Env, slug: string): Promise<Response> {
  const existing = await env.DB.prepare("SELECT slug FROM case_studies WHERE slug = ?")
    .bind(slug)
    .first();
  if (!existing) {
    return errorResponse("Project not found", 404, "NOT_FOUND");
  }

  await env.DB.batch([
    env.DB.prepare("DELETE FROM case_study_tags WHERE slug = ?").bind(slug),
    env.DB.prepare("DELETE FROM case_study_pain_points WHERE slug = ?").bind(slug),
    env.DB.prepare("DELETE FROM case_study_deliverables WHERE slug = ?").bind(slug),
    env.DB.prepare("DELETE FROM case_study_stack WHERE slug = ?").bind(slug),
    env.DB.prepare("DELETE FROM case_study_flow_steps WHERE slug = ?").bind(slug),
    env.DB.prepare("DELETE FROM case_study_stats WHERE slug = ?").bind(slug),
    env.DB.prepare("DELETE FROM case_study_result_bullets WHERE slug = ?").bind(slug),
    env.DB.prepare("DELETE FROM case_study_key_features WHERE slug = ?").bind(slug),
    env.DB.prepare("DELETE FROM case_studies WHERE slug = ?").bind(slug),
  ]);

  return jsonResponse({ deleted: true, slug }, 200);
}
