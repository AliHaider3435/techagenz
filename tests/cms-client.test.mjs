import assert from "node:assert/strict";
import test from "node:test";
import {
  CmsApiClientError,
  adaptCaseStudy,
  createCmsClient,
  resolveCmsApiBaseUrl,
} from "../src/api/cms-client.ts";

const apiBaseUrl = "https://api-dev.techagenz.com";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const teamDto = {
  id: "ali-haider",
  name: "Ali Haider",
  role: "Founder & AI Engineer",
  image: "/team-images/team1.webp",
  borderColor: "#38BDF8",
  gradient: "linear-gradient(145deg, #38BDF8, #050B14)",
  sortOrder: 1,
};

const blogDto = {
  id: "ai-systems",
  title: "AI Systems",
  category: "AI & ML",
  readTime: "6 min read",
  date: "Nov 9, 2026",
  publishDateIso: "2026-11-09T09:00:00Z",
  author: "Tech Agenz",
  image: "/blog-images/ai-systems.webp",
  excerpt: "An overview.",
  featured: false,
  keywords: ["AI"],
};

const caseStudyDto = {
  slug: "project-one",
  title: "Project One",
  shortTitle: "Project One",
  formulaSummary: "A useful system.",
  clientType: "Business",
  clientName: "Client One",
  category: "New category",
  coverImage: "/project-images/project-one.webp",
  tags: ["Automation"],
  featuredOnHome: true,
  order: 2,
  timeline: "12 weeks",
  status: "In progress",
  problem: {
    heading: "Problem",
    description: "Description",
    painPoints: ["Manual work"],
  },
  solution: {
    heading: "Solution",
    description: "A solution.",
    keyDeliverables: ["A portal"],
  },
  stack: ["TypeScript"],
  architecture: {
    overview: "A flow.",
    flowSteps: [{ step: "01", title: "Start", description: "A detailed step." }],
  },
  results: {
    stats: [{ metric: "40%", label: "Improvement", context: "Measured in production" }],
    bullets: ["Faster work"],
  },
  keyFeatures: [{ title: "Feature", description: "Preserved description", tag: null }],
  testimonial: {
    quote: "A quote.",
    author: null,
    role: "Director",
    organization: null,
  },
};

test("resolves and normalizes an explicit Worker API origin", () => {
  assert.equal(resolveCmsApiBaseUrl(` ${apiBaseUrl}/ `), apiBaseUrl);
  assert.equal(resolveCmsApiBaseUrl("http://localhost:8787/"), "http://localhost:8787");
  assert.equal(resolveCmsApiBaseUrl(undefined), null);
  assert.equal(resolveCmsApiBaseUrl("https://example.com/api"), null);
  assert.equal(resolveCmsApiBaseUrl("http://example.com"), null);
  assert.equal(resolveCmsApiBaseUrl("https://user:pass@example.com"), null);
});

test("maps Worker Team DTO fields without changing IDs or image paths", async () => {
  const client = createCmsClient(`${apiBaseUrl}/`, async (url) => {
    assert.equal(String(url), `${apiBaseUrl}/api/cms/team`);
    return jsonResponse({ ok: true, data: [teamDto] });
  });

  assert.deepEqual(await client.getTeam(), [
    {
      id: "ali-haider",
      title: "Ali Haider",
      subtitle: "Founder & AI Engineer",
      image: "/team-images/team1.webp",
      borderColor: "#38BDF8",
      gradient: "linear-gradient(145deg, #38BDF8, #050B14)",
      sortOrder: 1,
    },
  ]);
});

test("fetches Team and Project detail and collection endpoints", async () => {
  const requestedUrls = [];
  const client = createCmsClient(apiBaseUrl, async (url) => {
    requestedUrls.push(String(url));
    if (String(url).endsWith("/api/cms/team/ali%2Fhaider")) {
      return jsonResponse({ ok: true, data: teamDto });
    }
    if (String(url).endsWith("/api/cms/projects")) {
      return jsonResponse({ ok: true, data: [caseStudyDto] });
    }
    return jsonResponse({ ok: true, data: caseStudyDto });
  });

  const member = await client.getTeamMember("ali/haider");
  const projects = await client.getProjects();
  const project = await client.getProject("project/one");

  assert.equal(member.id, "ali-haider");
  assert.equal(projects[0].slug, "project-one");
  assert.equal(project.slug, "project-one");
  assert.deepEqual(requestedUrls, [
    `${apiBaseUrl}/api/cms/team/ali%2Fhaider`,
    `${apiBaseUrl}/api/cms/projects`,
    `${apiBaseUrl}/api/cms/projects/project%2Fone`,
  ]);
});

test("keeps Blog collection and detail adapters distinct", async () => {
  const client = createCmsClient(apiBaseUrl, async (url) => {
    if (String(url).endsWith("/api/cms/blogs")) {
      return jsonResponse({ ok: true, data: [blogDto] });
    }
    return jsonResponse({
      ok: true,
      data: { ...blogDto, keyTakeaways: ["Keep detail"], content: ["Full content"] },
    });
  });

  const [listPost] = await client.getBlogs();
  assert.equal(listPost.featured, false);
  assert.equal(listPost.category, "AI & ML");
  assert.equal("keyTakeaways" in listPost, false);
  assert.equal("content" in listPost, false);

  const detailPost = await client.getBlog("ai-systems");
  assert.deepEqual(detailPost.keyTakeaways, ["Keep detail"]);
  assert.deepEqual(detailPost.content, ["Full content"]);
  assert.equal(detailPost.featured, false);
});

test("constructs only supported Blog query parameters and encodes path segments", async () => {
  let collectionUrl;
  let detailUrl;
  const client = createCmsClient(apiBaseUrl, async (url) => {
    if (String(url).includes("/api/cms/blogs?")) {
      collectionUrl = new URL(String(url));
      return jsonResponse({ ok: true, data: [] });
    }
    detailUrl = String(url);
    return jsonResponse({ ok: true, data: { ...blogDto, keyTakeaways: [], content: [] } });
  });

  await client.getBlogs({ category: "AI & ML", featured: false, limit: 25, offset: 50 });
  assert.equal(collectionUrl.pathname, "/api/cms/blogs");
  assert.deepEqual(
    [...collectionUrl.searchParams.entries()],
    [
      ["category", "AI & ML"],
      ["featured", "0"],
      ["limit", "25"],
      ["offset", "50"],
    ],
  );
  await client.getBlog("id/with space");
  assert.equal(detailUrl, `${apiBaseUrl}/api/cms/blogs/id%2Fwith%20space`);
});

test("rejects invalid Blog pagination before making a request", async () => {
  let fetchCalls = 0;
  const client = createCmsClient(apiBaseUrl, async () => {
    fetchCalls += 1;
    return jsonResponse({ ok: true, data: [] });
  });

  await assert.rejects(client.getBlogs({ limit: 101 }), {
    name: "CmsApiClientError",
    kind: "configuration",
  });
  await assert.rejects(client.getBlogs({ offset: -1 }), {
    name: "CmsApiClientError",
    kind: "configuration",
  });
  assert.equal(fetchCalls, 0);
});

test("preserves nullable Case Study fields and nested DTO content", () => {
  const mapped = adaptCaseStudy(caseStudyDto);

  assert.equal(mapped.category, "New category");
  assert.equal(mapped.status, "In progress");
  assert.equal(mapped.keyFeatures[0].tag, null);
  assert.equal(mapped.keyFeatures[0].description, "Preserved description");
  assert.equal(mapped.testimonial.author, null);
  assert.equal(mapped.testimonial.organization, null);
  assert.deepEqual(mapped.architecture.flowSteps, caseStudyDto.architecture.flowSteps);
  assert.deepEqual(mapped.results.stats, caseStudyDto.results.stats);
});

test("preserves a null Case Study testimonial", () => {
  const mapped = adaptCaseStudy({ ...caseStudyDto, testimonial: null });
  assert.equal(mapped.testimonial, null);
});

test("preserves structured Worker errors and status", async () => {
  const client = createCmsClient(apiBaseUrl, async () =>
    jsonResponse({ ok: false, error: { code: "NOT_FOUND", message: "Blog post not found" } }, 404),
  );

  await assert.rejects(client.getBlog("missing"), (error) => {
    assert.ok(error instanceof CmsApiClientError);
    assert.equal(error.kind, "worker");
    assert.equal(error.code, "NOT_FOUND");
    assert.equal(error.status, 404);
    assert.equal(error.message, "Blog post not found");
    return true;
  });
});

test("normalizes the development API's legacy 404 envelope", async () => {
  const client = createCmsClient(apiBaseUrl, async () =>
    jsonResponse({ ok: false, error: "Blog post not found", status: 404 }, 404),
  );

  await assert.rejects(client.getBlog("missing"), (error) => {
    assert.ok(error instanceof CmsApiClientError);
    assert.equal(error.kind, "worker");
    assert.equal(error.code, "NOT_FOUND");
    assert.equal(error.status, 404);
    assert.equal(error.message, "The requested CMS record was not found.");
    return true;
  });
});

test("rejects non-success HTTP responses without exposing response bodies", async () => {
  const client = createCmsClient(
    apiBaseUrl,
    async () => new Response("private internal details", { status: 500 }),
  );

  await assert.rejects(client.getTeam(), (error) => {
    assert.equal(error.kind, "http");
    assert.equal(error.status, 500);
    assert.equal(error.message.includes("private internal details"), false);
    return true;
  });
});

test("rejects malformed JSON and malformed response envelopes", async () => {
  const invalidJsonClient = createCmsClient(
    apiBaseUrl,
    async () => new Response("{invalid", { status: 200 }),
  );
  const invalidEnvelopeClient = createCmsClient(apiBaseUrl, async () =>
    jsonResponse({ success: true, data: [] }),
  );

  await assert.rejects(invalidJsonClient.getTeam(), { kind: "response" });
  await assert.rejects(invalidEnvelopeClient.getTeam(), { kind: "response" });
});

test("distinguishes missing configuration from network failures", async () => {
  let fetchCalls = 0;
  const unconfigured = createCmsClient(undefined, async () => {
    fetchCalls += 1;
    return jsonResponse({ ok: true, data: [] });
  });
  await assert.rejects(unconfigured.getTeam(), {
    kind: "configuration",
    message: "Set VITE_API_BASE_URL to the HTTPS origin of the Cloudflare Worker API.",
  });
  assert.equal(fetchCalls, 0);

  const networkFailure = createCmsClient(apiBaseUrl, async () => {
    throw new Error("sensitive network detail");
  });
  await assert.rejects(networkFailure.getTeam(), (error) => {
    assert.equal(error.kind, "network");
    assert.equal(error.message.includes("sensitive network detail"), false);
    return true;
  });
});
