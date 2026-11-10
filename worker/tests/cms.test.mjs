import assert from "node:assert/strict";
import { build } from "esbuild";
import test from "node:test";

const { outputFiles } = await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  format: "esm",
  platform: "browser",
  write: false,
});
const { default: worker } = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString("base64")}`
);

const teamRows = [
  {
    id: "zeta",
    image: "/zeta.webp",
    title: "Zeta",
    subtitle: "Engineer",
    border_color: "purple",
    gradient: "linear-gradient(purple, white)",
    sort_order: 1,
  },
  {
    id: "zoe",
    image: "/zoe.webp",
    title: "Zoe",
    subtitle: "Designer",
    border_color: "blue",
    gradient: "linear-gradient(blue, white)",
    sort_order: 2,
  },
  {
    id: "ali-haider",
    image: "/ali.webp",
    title: "Ali Haider",
    subtitle: "Founder",
    border_color: "green",
    gradient: "linear-gradient(green, white)",
    sort_order: 1,
  },
  {
    id: "alpha",
    image: "/alpha.webp",
    title: "Alpha",
    subtitle: "Engineer",
    border_color: "orange",
    gradient: "linear-gradient(orange, white)",
    sort_order: 1,
  },
];

const blogRows = [
  {
    id: "invalid-date",
    title: "Invalid date",
    category: "Tech",
    read_time: "3 min",
    date: "Unknown",
    publish_date_iso: "not-a-date",
    author: "Author",
    image: "/invalid.webp",
    excerpt: "Excerpt",
    featured: 0,
  },
  {
    id: "date-only",
    title: "Date only",
    category: "Tech",
    read_time: "3 min",
    date: "Jan 2",
    publish_date_iso: "2024-01-02",
    author: "Author",
    image: "/date.webp",
    excerpt: "Excerpt",
    featured: 1,
  },
  {
    id: "offset-newest",
    title: "Offset newest",
    category: "Business",
    read_time: "3 min",
    date: "Jan 2",
    publish_date_iso: "2024-01-02T00:00:00-05:00",
    author: "Author",
    image: "/offset.webp",
    excerpt: "Excerpt",
    featured: 1,
  },
  {
    id: "reduced-offset",
    title: "Reduced precision offset",
    category: "Dates",
    read_time: "3 min",
    date: "Jan 3",
    publish_date_iso: "2024-01-03T00:00+05:00",
    author: "Author",
    image: "/reduced-offset.webp",
    excerpt: "Excerpt",
    featured: 0,
  },
  {
    id: "utc-comparison",
    title: "UTC comparison",
    category: "Dates",
    read_time: "3 min",
    date: "Jan 2",
    publish_date_iso: "2024-01-02T18:30:00Z",
    author: "Author",
    image: "/utc.webp",
    excerpt: "Excerpt",
    featured: 0,
  },
  {
    id: "tie-a",
    title: "Tie A",
    category: "Tech",
    read_time: "3 min",
    date: "Jan 1",
    publish_date_iso: "2024-01-01T00:00:00Z",
    author: "Author",
    image: "/tie-a.webp",
    excerpt: "Excerpt",
    featured: 0,
  },
  {
    id: "tie-b",
    title: "Tie B",
    category: "Tech",
    read_time: "3 min",
    date: "Jan 1",
    publish_date_iso: "2024-01-01T00:00:00Z",
    author: "Author",
    image: "/tie-b.webp",
    excerpt: "Excerpt",
    featured: 0,
  },
];

const projectRow = {
  slug: "project-one",
  title: "Project One",
  short_title: "One",
  formula_summary: "Summary",
  client_type: "Healthcare",
  client_name: "Client",
  category: "Web",
  cover_image: "/cover.webp",
  featured_on_home: 1,
  sort_order: 1,
  timeline: "4 weeks",
  status: "Live",
  problem_heading: "Problem",
  problem_description: "Problem description",
  solution_heading: "Solution",
  solution_description: "Solution description",
  architecture_overview: "Architecture",
  testimonial_quote: "Great work",
  testimonial_author: "Client Name",
  testimonial_role: "Director",
  testimonial_company: "Client Org",
};

const projectWithoutTestimonial = {
  ...projectRow,
  slug: "project-without-testimonial",
  testimonial_quote: null,
  testimonial_author: null,
  testimonial_role: null,
  testimonial_company: null,
};

const childRows = {
  case_study_tags: [
    { id: 2, tag: "second", sort_order: 1 },
    { id: 1, tag: "first", sort_order: 1 },
  ],
  case_study_pain_points: [
    { id: 2, point: "Second pain", sort_order: 2 },
    { id: 1, point: "First pain", sort_order: 1 },
  ],
  case_study_deliverables: [
    { id: 2, deliverable: "Second deliverable", sort_order: 2 },
    { id: 1, deliverable: "First deliverable", sort_order: 1 },
  ],
  case_study_stack: [
    { id: 2, tech: "Workers", sort_order: 2 },
    { id: 1, tech: "TypeScript", sort_order: 1 },
  ],
  case_study_flow_steps: [
    {
      id: 2,
      step_code: "02",
      title: "Build",
      description: "Build description",
      step: "legacy flattened build",
      sort_order: 2,
    },
    {
      id: 1,
      step_code: "01",
      title: "Plan",
      description: "Plan description",
      step: "legacy flattened plan",
      sort_order: 1,
    },
  ],
  case_study_stats: [
    { id: 2, label: "Second metric", value: "25%", context: "Second context", sort_order: 1 },
    { id: 1, label: "Wait time", value: "40%", context: "Reduced wait", sort_order: 1 },
    { id: 3, label: "Third metric", value: "10%", context: "Third context", sort_order: 2 },
  ],
  case_study_result_bullets: [
    { id: 2, bullet: "Second outcome", sort_order: 2 },
    { id: 1, bullet: "First outcome", sort_order: 1 },
  ],
  case_study_key_features: [
    {
      id: 2,
      title: "Queue dashboard",
      description: "Live queue visibility",
      tag: "Operations",
      sort_order: 1,
    },
    { id: 1, title: "Check-in", description: "Fast check-in", tag: "Workflow", sort_order: 1 },
    {
      id: 3,
      title: "Reminders",
      description: "Automated reminders",
      tag: "Automation",
      sort_order: 2,
    },
  ],
};

function makeEnv({ fail = false, blogs = blogRows, projects = [projectRow] } = {}) {
  const queries = [];
  const db = {
    prepare(sql) {
      const statement = {
        args: [],
        bind(...args) {
          this.args = args;
          return this;
        },
        async all() {
          queries.push({ sql, args: this.args });
          if (fail) throw new Error("D1 query failed");
          return { results: rowsFor(sql, this.args, blogs, projects) };
        },
        async first() {
          queries.push({ sql, args: this.args });
          if (fail) throw new Error("D1 query failed");
          return firstFor(sql, this.args, blogs, projects);
        },
      };
      return statement;
    },
  };
  return {
    runtimeEnv: {
      DB: db,
      ASSETS: {
        async get() {
          return null;
        },
      },
      ENVIRONMENT: "development",
      ENQUIRY_RATE_LIMITER: {
        async limit() {
          return { success: true };
        },
      },
      RESEND_API_KEY: "",
      CF_TURNSTILE_SECRET_KEY: "",
    },
    queries,
  };
}

function rowsFor(sql, args, blogs, projects) {
  if (sql.includes("FROM team_members")) {
    return [...teamRows].sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id));
  }
  if (sql.includes("FROM blog_posts")) {
    let rows = [...blogs];
    if (sql.includes("category = ?")) {
      rows = rows.filter((row) => row.category === args[0]);
    }
    if (sql.includes("featured = ?")) {
      const index = sql.includes("category = ?") ? 1 : 0;
      rows = rows.filter((row) => row.featured === args[index]);
    }
    return rows;
  }
  const table = Object.keys(childRows).find((name) => sql.includes(`FROM ${name}`));
  if (table) {
    const rows = args[0] === "project-without-testimonial" ? [] : [...childRows[table]];
    return rows
      .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
      .map((row) => {
        if (sql.includes("AS value")) {
          const column = /SELECT id, (\w+) AS value/.exec(sql)?.[1];
          return { id: row.id, value: row[column] };
        }
        if (sql.includes("SELECT id, keyword")) return { id: row.id, keyword: row.keyword };
        if (sql.includes("SELECT id, takeaway")) return { id: row.id, takeaway: row.takeaway };
        if (sql.includes("SELECT id, paragraph")) return { id: row.id, paragraph: row.paragraph };
        return row;
      });
  }
  if (sql.includes("FROM case_studies")) return projects;
  if (sql.includes("FROM blog_post_keywords")) {
    return orderByChildSql(sql, [
      { id: 2, keyword: "second", sort_order: 1 },
      { id: 1, keyword: "first", sort_order: 0 },
    ]);
  }
  if (sql.includes("FROM blog_post_key_takeaways")) {
    return orderByChildSql(sql, [
      { id: 2, takeaway: "Second", sort_order: 1 },
      { id: 1, takeaway: "First", sort_order: 0 },
    ]);
  }
  if (sql.includes("FROM blog_post_content")) {
    return orderByChildSql(sql, [
      { id: 2, paragraph: "Second paragraph", sort_order: 1 },
      { id: 1, paragraph: "First paragraph", sort_order: 0 },
    ]);
  }
  return [];
}

function orderByChildSql(sql, rows) {
  if (!sql.includes("ORDER BY sort_order ASC, id ASC")) return rows;
  return [...rows].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
}

function firstFor(sql, args, blogs, projects) {
  if (sql.includes("FROM team_members")) return teamRows.find((row) => row.id === args[0]) ?? null;
  if (sql.includes("FROM blog_posts")) return blogs.find((row) => row.id === args[0]) ?? null;
  if (sql.includes("FROM case_studies"))
    return projects.find((row) => row.slug === args[0]) ?? null;
  return null;
}

async function request(path, runtimeEnv) {
  return worker.fetch(new Request(`https://api-dev.techagenz.com${path}`), runtimeEnv, {});
}

test("Team DTOs preserve string IDs and sort by sort_order then ID", async () => {
  const { runtimeEnv, queries } = makeEnv();
  const response = await request("/api/cms/team", runtimeEnv);
  const { data } = await response.json();

  assert.deepEqual(
    data.map(({ id }) => id),
    ["ali-haider", "alpha", "zeta", "zoe"],
  );
  assert.equal(typeof data[0].id, "string");
  assert.match(queries[0].sql, /ORDER BY sort_order ASC, id ASC/);
  assert.deepEqual(data[0], {
    id: "ali-haider",
    name: "Ali Haider",
    role: "Founder",
    image: "/ali.webp",
    borderColor: "green",
    gradient: "linear-gradient(green, white)",
    sortOrder: 1,
  });
});

test("Team detail performs an exact string-ID lookup and missing details return a structured 404", async () => {
  const { runtimeEnv, queries } = makeEnv();
  const found = await request("/api/cms/team/ali-haider", runtimeEnv);
  assert.equal((await found.json()).data.id, "ali-haider");
  assert.deepEqual(queries[0].args, ["ali-haider"]);

  const missing = await request("/api/cms/team/unknown", runtimeEnv);
  assert.equal(missing.status, 404);
  assert.deepEqual((await missing.json()).error, {
    code: "NOT_FOUND",
    message: "Team member not found",
  });
});

test("Blog DTOs convert featured to boolean and order keywords, takeaways, and content", async () => {
  const { runtimeEnv, queries } = makeEnv();
  const response = await request("/api/cms/blogs/tie-a", runtimeEnv);
  const body = await response.json();
  const { data } = body;

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.ok("data" in body);
  assert.deepEqual(data, {
    id: "tie-a",
    title: "Tie A",
    category: "Tech",
    readTime: "3 min",
    date: "Jan 1",
    publishDateIso: "2024-01-01T00:00:00Z",
    author: "Author",
    image: "/tie-a.webp",
    excerpt: "Excerpt",
    featured: false,
    keywords: ["first", "second"],
    keyTakeaways: ["First", "Second"],
    content: ["First paragraph", "Second paragraph"],
  });

  const listResponse = await request("/api/cms/blogs?category=Tech&featured=1", runtimeEnv);
  const [listPost] = (await listResponse.json()).data;
  assert.deepEqual(listPost, {
    id: "date-only",
    title: "Date only",
    category: "Tech",
    readTime: "3 min",
    date: "Jan 2",
    publishDateIso: "2024-01-02",
    author: "Author",
    image: "/date.webp",
    excerpt: "Excerpt",
    featured: true,
    keywords: ["first", "second"],
  });

  const childQueries = queries.filter((query) =>
    /FROM blog_post_(keywords|key_takeaways|content)/.test(query.sql),
  );
  assert.equal(childQueries.length, 4);
  for (const table of ["blog_post_keywords", "blog_post_key_takeaways", "blog_post_content"]) {
    assert.ok(
      childQueries.some(
        ({ sql }) =>
          sql.includes(`FROM ${table}`) && sql.includes("ORDER BY sort_order ASC, id ASC"),
      ),
      `expected ordered SQL for ${table}`,
    );
  }
});

test("blogs order valid dates newest first, support date-only and offsets, then invalid dates and ID ties", async () => {
  const { runtimeEnv } = makeEnv();
  const response = await request("/api/cms/blogs", runtimeEnv);
  const { data } = await response.json();

  assert.deepEqual(
    data.map(({ id }) => id),
    [
      "reduced-offset",
      "utc-comparison",
      "offset-newest",
      "date-only",
      "tie-a",
      "tie-b",
      "invalid-date",
    ],
  );
});

test("blog category, featured, limit, and offset filters validate and paginate correctly", async () => {
  const { runtimeEnv } = makeEnv();
  const valid = await request(
    "/api/cms/blogs?category=Tech&featured=0&limit=1&offset=0",
    runtimeEnv,
  );
  const body = await valid.json();
  assert.equal(valid.status, 200);
  assert.deepEqual(
    body.data.map(({ id }) => id),
    ["tie-a"],
  );

  for (const query of [
    "?limit=-1",
    "?limit=0",
    "?limit=1.5",
    "?offset=abc",
    "?featured=true",
    "?featured=2",
    "?featured=1&featured=0",
  ]) {
    const response = await request(`/api/cms/blogs${query}`, runtimeEnv);
    assert.equal(response.status, 400, query);
    assert.deepEqual((await response.json()).error, {
      code: "BAD_REQUEST",
      message: "Invalid blog query parameters",
    });
  }
});

test("blog pagination defaults, maximum, offsets, and pages preserve global date ordering", async () => {
  const paginationBlogs = Array.from({ length: 105 }, (_, index) => {
    const ageInDays = 104 - index;
    return {
      ...blogRows[0],
      id: `page-${String(ageInDays).padStart(3, "0")}`,
      title: `Post ${ageInDays}`,
      category: "Pagination",
      publish_date_iso: new Date(Date.UTC(2024, 0, 1 + ageInDays)).toISOString(),
    };
  });
  const { runtimeEnv } = makeEnv({ blogs: paginationBlogs });

  const defaultsResponse = await request("/api/cms/blogs?category=Pagination", runtimeEnv);
  const defaults = (await defaultsResponse.json()).data;
  assert.equal(defaults.length, 50);
  assert.deepEqual(
    defaults.map(({ id }) => id),
    Array.from({ length: 50 }, (_, index) => `page-${String(104 - index).padStart(3, "0")}`),
  );

  const firstPageResponse = await request(
    "/api/cms/blogs?category=Pagination&limit=3&offset=0",
    runtimeEnv,
  );
  const secondPageResponse = await request(
    "/api/cms/blogs?category=Pagination&limit=3&offset=3",
    runtimeEnv,
  );
  const firstPage = (await firstPageResponse.json()).data;
  const secondPage = (await secondPageResponse.json()).data;
  assert.deepEqual(
    firstPage.map(({ id }) => id),
    ["page-104", "page-103", "page-102"],
  );
  assert.deepEqual(
    secondPage.map(({ id }) => id),
    ["page-101", "page-100", "page-099"],
  );

  const maximumResponse = await request("/api/cms/blogs?category=Pagination&limit=100", runtimeEnv);
  assert.equal((await maximumResponse.json()).data.length, 100);
  const overMaximumResponse = await request(
    "/api/cms/blogs?category=Pagination&limit=101",
    runtimeEnv,
  );
  assert.equal(overMaximumResponse.status, 400);

  const beyondEndResponse = await request(
    "/api/cms/blogs?category=Pagination&limit=3&offset=105",
    runtimeEnv,
  );
  assert.deepEqual((await beyondEndResponse.json()).data, []);
});

test("Case Study DTOs map all nested children from structured columns", async () => {
  const { runtimeEnv } = makeEnv();
  const response = await request("/api/cms/projects", runtimeEnv);
  const { data } = await response.json();
  const project = data[0];

  assert.equal(project.featuredOnHome, true);
  assert.deepEqual(project.tags, ["first", "second"]);
  assert.deepEqual(project.problem.painPoints, ["First pain", "Second pain"]);
  assert.deepEqual(project.solution.keyDeliverables, ["First deliverable", "Second deliverable"]);
  assert.deepEqual(project.stack, ["TypeScript", "Workers"]);
  assert.deepEqual(project.architecture.flowSteps, [
    { step: "01", title: "Plan", description: "Plan description" },
    { step: "02", title: "Build", description: "Build description" },
  ]);
  assert.deepEqual(project.results.stats, [
    { metric: "40%", label: "Wait time", context: "Reduced wait" },
    { metric: "25%", label: "Second metric", context: "Second context" },
    { metric: "10%", label: "Third metric", context: "Third context" },
  ]);
  assert.deepEqual(project.results.bullets, ["First outcome", "Second outcome"]);
  assert.deepEqual(project.keyFeatures, [
    { title: "Check-in", description: "Fast check-in", tag: "Workflow" },
    { title: "Queue dashboard", description: "Live queue visibility", tag: "Operations" },
    { title: "Reminders", description: "Automated reminders", tag: "Automation" },
  ]);
  assert.deepEqual(project.testimonial, {
    quote: "Great work",
    author: "Client Name",
    role: "Director",
    organization: "Client Org",
  });
});

test("missing Blog and Case Study detail records return structured 404 envelopes", async () => {
  const { runtimeEnv: blogEnv } = makeEnv({ blogs: [] });
  const missingBlogResponse = await request("/api/cms/blogs/missing-post", blogEnv);
  assert.equal(missingBlogResponse.status, 404);
  assert.deepEqual(await missingBlogResponse.json(), {
    ok: false,
    error: {
      code: "NOT_FOUND",
      message: "Blog post not found",
    },
  });

  const { runtimeEnv: projectEnv } = makeEnv({ projects: [] });
  const missingProjectResponse = await request("/api/cms/projects/missing-project", projectEnv);
  assert.equal(missingProjectResponse.status, 404);
  assert.deepEqual(await missingProjectResponse.json(), {
    ok: false,
    error: {
      code: "NOT_FOUND",
      message: "Project not found",
    },
  });
});

test("Case Study DTO uses null when the source has no testimonial", async () => {
  const { runtimeEnv } = makeEnv({ projects: [projectWithoutTestimonial] });
  const response = await request("/api/cms/projects/project-without-testimonial", runtimeEnv);
  const { data } = await response.json();

  assert.equal(data.testimonial, null);
});

test("Case Study detail directly queries the requested slug and matches collection DTO shape", async () => {
  const { runtimeEnv, queries } = makeEnv();
  const collectionResponse = await request("/api/cms/projects", runtimeEnv);
  const collectionProject = (await collectionResponse.json()).data[0];
  queries.length = 0;
  const detailResponse = await request("/api/cms/projects/project-one", runtimeEnv);
  const detailBody = await detailResponse.json();
  const detailProject = detailBody.data;

  assert.equal(detailResponse.status, 200);
  assert.equal(detailBody.ok, true);
  assert.ok("data" in detailBody);
  assert.deepEqual(detailProject, collectionProject);
  const parentQueries = queries.filter((query) => query.sql.includes("FROM case_studies"));
  assert.ok(parentQueries.some((query) => query.sql.includes("WHERE slug = ?")));
  assert.ok(!parentQueries.some((query) => !query.sql.includes("WHERE slug = ?")));
});

test("CMS collection routes accept trailing slashes and remain unauthenticated", async () => {
  const { runtimeEnv } = makeEnv();
  for (const route of ["/api/cms/team/", "/api/cms/blogs/", "/api/cms/projects/"]) {
    const response = await request(route, runtimeEnv);
    assert.equal(response.status, 200, route);
    assert.deepEqual((await response.json()).ok, true);
  }
});

test("D1 failures return a sanitized structured 500 response", async (t) => {
  const { runtimeEnv } = makeEnv({ fail: true });
  t.mock.method(console, "error", () => {});

  const response = await request("/api/cms/team", runtimeEnv);
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
  });
});
