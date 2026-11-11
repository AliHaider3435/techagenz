import assert from "node:assert/strict";
import test from "node:test";
import { CmsApiClientError, createCmsClient } from "../src/api/cms-client.ts";
import {
  createPublicCmsDataSource,
  filterBlogPosts,
  filterProjectsByCategory,
  getFeaturedHomepageProjects,
  getRelatedCmsBlogs,
  getRelatedCmsProjects,
  resolveCmsImageUrl,
} from "../src/lib/cms-data-source.ts";

const blog = (id, overrides = {}) => ({
  id,
  title: `Title ${id}`,
  category: "AI & ML",
  readTime: "5 min read",
  date: "Nov 9, 2026",
  publishDateIso: "2026-11-09T09:00:00Z",
  author: "Tech Agenz",
  image: "/blog-images/article.webp",
  excerpt: `Excerpt ${id}`,
  featured: false,
  keywords: ["automation"],
  ...overrides,
});

const detailBlog = (id, overrides = {}) => ({
  ...blog(id),
  keyTakeaways: ["Key takeaway"],
  content: ["Article content"],
  ...overrides,
});

const teamMember = { id: "worker-id", name: "Live Name", role: "Live Role" };
const fallbackTeam = [{ id: "static-id", title: "Static Name", subtitle: "Static Role" }];
const fallbackBlogs = [detailBlog("static-blog")];
const fallbackProjects = [{ slug: "static-project", featuredOnHome: true }];

function emptyFallbacks(overrides = {}) {
  return {
    team: fallbackTeam,
    blogs: fallbackBlogs,
    projects: fallbackProjects,
    ...overrides,
  };
}

function fakeClient(overrides = {}) {
  return {
    getTeam: async () => [],
    getTeamMember: async () => {
      throw new Error("not configured");
    },
    getBlogs: async () => [],
    getBlog: async () => {
      throw new Error("not configured");
    },
    getProjects: async () => [],
    getProject: async () => {
      throw new Error("not configured");
    },
    ...overrides,
  };
}

test("prefers live Worker data over stale browser storage and avoids storage during SSR", async () => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw new Error("SSR must not access localStorage");
    },
  });

  const source = createPublicCmsDataSource(
    fakeClient({ getTeam: async () => [teamMember] }),
    emptyFallbacks(),
  );
  const result = await source.getTeam();

  assert.equal(result.source, "worker");
  assert.deepEqual(result.data, [teamMember]);
  delete globalThis.localStorage;
});

test("uses static fallback on Worker failures without treating it as live data", async () => {
  const source = createPublicCmsDataSource(
    fakeClient({
      getTeam: async () => {
        throw new CmsApiClientError("network unavailable", { kind: "network" });
      },
    }),
    emptyFallbacks(),
  );

  const result = await source.getTeam();
  assert.equal(result.source, "fallback");
  assert.deepEqual(result.data, fallbackTeam);
});

test("keeps successful empty Worker collections authoritative", async () => {
  const source = createPublicCmsDataSource(
    fakeClient({ getTeam: async () => [] }),
    emptyFallbacks(),
  );
  const result = await source.getTeam();

  assert.equal(result.source, "worker");
  assert.deepEqual(result.data, []);
});

test("does not fall back to static Blogs when the Worker returns an empty collection", async () => {
  const source = createPublicCmsDataSource(
    fakeClient({ getBlogs: async () => [] }),
    emptyFallbacks(),
  );
  const result = await source.getBlogs();

  assert.equal(result.source, "worker");
  assert.deepEqual(result.data, []);
});

test("coalesces overlapping collection requests", async () => {
  let fetchCalls = 0;
  const source = createPublicCmsDataSource(
    fakeClient({
      getProjects: async () => {
        fetchCalls += 1;
        await new Promise((resolve) => setTimeout(resolve, 5));
        return [{ slug: "live-project", featuredOnHome: true }];
      },
    }),
    emptyFallbacks(),
  );

  const [first, second] = await Promise.all([source.getProjects(), source.getProjects()]);
  assert.equal(fetchCalls, 1);
  assert.deepEqual(first, second);
});

test("loads all Blog pages beyond 100 and deduplicates records", async () => {
  const records = Array.from({ length: 201 }, (_, index) => blog(`post-${index}`));
  const requestedOffsets = [];
  const source = createPublicCmsDataSource(
    fakeClient({
      getBlogs: async ({ limit, offset }) => {
        assert.equal(limit, 100);
        requestedOffsets.push(offset);
        if (offset === 0) return records.slice(0, 100);
        if (offset === 100) return [records[99], ...records.slice(100, 199)];
        return records.slice(199);
      },
    }),
    emptyFallbacks(),
  );

  const result = await source.getBlogs();
  assert.equal(result.source, "worker");
  assert.deepEqual(requestedOffsets, [0, 100, 200]);
  assert.equal(result.data.length, 201);
  assert.equal(new Set(result.data.map((post) => post.id)).size, 201);
  assert.deepEqual(
    result.data.map((post) => post.id),
    records.map((post) => post.id),
  );
});

test("falls back to the complete bundled Blog collection if a later page fails", async () => {
  let calls = 0;
  const source = createPublicCmsDataSource(
    fakeClient({
      getBlogs: async () => {
        calls += 1;
        if (calls === 1) return Array.from({ length: 100 }, (_, index) => blog(`live-${index}`));
        throw new CmsApiClientError("unavailable", { kind: "network" });
      },
    }),
    emptyFallbacks(),
  );

  const result = await source.getBlogs();
  assert.equal(result.source, "fallback");
  assert.deepEqual(
    result.data.map((post) => post.id),
    ["static-blog"],
  );
});

test("does not revive a static detail after an authoritative Worker not-found response", async () => {
  const notFound = new CmsApiClientError("Blog post not found", {
    kind: "worker",
    code: "NOT_FOUND",
    status: 404,
  });
  const source = createPublicCmsDataSource(
    fakeClient({ getBlog: async () => Promise.reject(notFound) }),
    emptyFallbacks(),
  );

  assert.deepEqual(await source.getBlog("static-blog"), { data: null, source: "worker" });
});

test("does not revive static detail for the development API's legacy 404 envelope", async () => {
  const client = createCmsClient(
    "https://api-dev.techagenz.com",
    async () =>
      new Response(JSON.stringify({ ok: false, error: "Blog post not found", status: 404 }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }),
  );
  const source = createPublicCmsDataSource(client, emptyFallbacks());

  assert.deepEqual(await source.getBlog("static-blog"), { data: null, source: "worker" });
});

test("uses not-found Worker detail as authoritative for both Blogs and Projects", async () => {
  const notFound = () =>
    new CmsApiClientError("Record not found", {
      kind: "worker",
      code: "NOT_FOUND",
      status: 404,
    });
  const source = createPublicCmsDataSource(
    fakeClient({
      getBlog: async () => Promise.reject(notFound()),
      getProject: async () => Promise.reject(notFound()),
    }),
    emptyFallbacks(),
  );

  assert.deepEqual(await source.getBlog("static-blog"), { data: null, source: "worker" });
  assert.deepEqual(await source.getProject("static-project"), { data: null, source: "worker" });
});

test("falls back to bundled detail content when the Worker is unavailable", async () => {
  const source = createPublicCmsDataSource(
    fakeClient({
      getBlog: async () => {
        throw new CmsApiClientError("unavailable", { kind: "network" });
      },
    }),
    emptyFallbacks(),
  );

  const result = await source.getBlog("static-blog");
  assert.equal(result.source, "fallback");
  assert.deepEqual(result.data.content, ["Article content"]);
});

test("loads Projects by slug and falls back only when the Worker is unavailable", async () => {
  const liveProject = { slug: "live-project", featuredOnHome: false };
  const liveSource = createPublicCmsDataSource(
    fakeClient({ getProject: async () => liveProject }),
    emptyFallbacks(),
  );
  const fallbackSource = createPublicCmsDataSource(
    fakeClient({
      getProject: async () => {
        throw new CmsApiClientError("unavailable", { kind: "network" });
      },
    }),
    emptyFallbacks(),
  );

  assert.deepEqual(await liveSource.getProject("live-project"), {
    data: liveProject,
    source: "worker",
  });
  assert.deepEqual(await fallbackSource.getProject("static-project"), {
    data: fallbackProjects[0],
    source: "fallback",
  });
});

test("preserves live Project collections and static Project fallback on errors", async () => {
  const liveProjects = [{ slug: "live-project", featuredOnHome: false }];
  const liveSource = createPublicCmsDataSource(
    fakeClient({ getProjects: async () => liveProjects }),
    emptyFallbacks(),
  );
  const fallbackSource = createPublicCmsDataSource(
    fakeClient({
      getProjects: async () => {
        throw new CmsApiClientError("unavailable", { kind: "http", status: 503 });
      },
    }),
    emptyFallbacks(),
  );

  assert.deepEqual(await liveSource.getProjects(), { data: liveProjects, source: "worker" });
  assert.deepEqual(await fallbackSource.getProjects(), {
    data: fallbackProjects,
    source: "fallback",
  });
});

test("preserves category and text filtering, featured projects, and related ordering", () => {
  const posts = [
    blog("one", { keywords: ["workflow"] }),
    blog("two", { category: "Automation", excerpt: "Workflow systems" }),
    blog("three", { category: "Automation" }),
  ];
  assert.deepEqual(
    filterBlogPosts(posts, "Automation", "workflow").map((post) => post.id),
    ["two"],
  );
  assert.deepEqual(
    filterBlogPosts(posts, "All", "KEYWORD").map((post) => post.id),
    [],
  );

  const projects = [
    { slug: "first", category: "Healthcare", featuredOnHome: true },
    { slug: "current", category: "Legal Tech", featuredOnHome: false },
    { slug: "last", category: "Healthcare", featuredOnHome: true },
  ];
  assert.deepEqual(
    filterProjectsByCategory(projects, "Healthcare").map((item) => item.slug),
    ["first", "last"],
  );
  assert.deepEqual(
    getFeaturedHomepageProjects(projects).map((item) => item.slug),
    ["first", "last"],
  );
  assert.deepEqual(
    getRelatedCmsProjects(projects, "current", 1).map((item) => item.slug),
    ["first"],
  );
  assert.deepEqual(
    getRelatedCmsBlogs(posts, detailBlog("current", { category: "Automation" }), 2).map(
      (post) => post.id,
    ),
    ["two", "three"],
  );
});

test("resolves relative SEO images while preserving absolute image URLs", () => {
  assert.equal(
    resolveCmsImageUrl("/blog-images/article.webp"),
    "https://techagenz.com/blog-images/article.webp",
  );
  assert.equal(
    resolveCmsImageUrl("https://cdn.example.com/article.webp"),
    "https://cdn.example.com/article.webp",
  );
});
