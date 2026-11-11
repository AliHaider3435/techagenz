import assert from "node:assert/strict";
import test from "node:test";
import { createAdminApiClient, AdminApiClientError } from "../src/api/admin-client.ts";

const apiBaseUrl = "https://api-dev.techagenz.com";

test("admin client executes Team CRUD operations correctly", async () => {
  const requests = [];
  const client = createAdminApiClient(apiBaseUrl, async (url, init = {}) => {
    requests.push({
      url: String(url),
      method: init.method,
      body: init.body ? JSON.parse(init.body) : null,
    });

    if (init.method === "GET" && String(url).endsWith("/api/admin/team")) {
      return new Response(
        JSON.stringify({ ok: true, data: [{ id: "alice", name: "Alice", role: "Dev" }] }),
      );
    }
    if (init.method === "POST" && String(url).endsWith("/api/admin/team")) {
      return new Response(
        JSON.stringify({ ok: true, data: { id: "bob", name: "Bob", role: "Design" } }),
        { status: 201 },
      );
    }
    if (init.method === "PUT" && String(url).endsWith("/api/admin/team/bob")) {
      return new Response(
        JSON.stringify({ ok: true, data: { id: "bob", name: "Bob V2", role: "Lead" } }),
      );
    }
    if (init.method === "DELETE" && String(url).endsWith("/api/admin/team/bob")) {
      return new Response(JSON.stringify({ ok: true, data: { deleted: true } }));
    }
    return new Response(null, { status: 404 });
  });

  const list = await client.listTeam();
  assert.equal(list.length, 1);
  assert.equal(list[0].name, "Alice");

  const created = await client.createTeamMember({ name: "Bob", role: "Design" });
  assert.equal(created.id, "bob");
  assert.equal(created.name, "Bob");

  const updated = await client.updateTeamMember("bob", { name: "Bob V2", role: "Lead" });
  assert.equal(updated.name, "Bob V2");

  await client.deleteTeamMember("bob");
  assert.equal(requests[3].method, "DELETE");
});

test("admin client executes Blog CRUD operations correctly", async () => {
  const requests = [];
  const client = createAdminApiClient(apiBaseUrl, async (url, init = {}) => {
    requests.push({ url: String(url), method: init.method });

    if (init.method === "GET" && String(url).endsWith("/api/admin/blogs")) {
      return new Response(JSON.stringify({ ok: true, data: [{ id: "blog-1", title: "Blog 1" }] }));
    }
    if (init.method === "POST" && String(url).endsWith("/api/admin/blogs")) {
      return new Response(JSON.stringify({ ok: true, data: { id: "blog-2", title: "Blog 2" } }), {
        status: 201,
      });
    }
    if (init.method === "DELETE" && String(url).endsWith("/api/admin/blogs/blog-2")) {
      return new Response(JSON.stringify({ ok: true, data: { deleted: true } }));
    }
    return new Response(null, { status: 404 });
  });

  const blogs = await client.listBlogs();
  assert.equal(blogs.length, 1);

  const created = await client.createBlog({ title: "Blog 2" });
  assert.equal(created.id, "blog-2");

  await client.deleteBlog("blog-2");
  assert.equal(requests[2].method, "DELETE");
});

test("admin client executes Enquiries and Media operations", async () => {
  const client = createAdminApiClient(apiBaseUrl, async (url, init = {}) => {
    if (init.method === "GET" && String(url).includes("/api/admin/enquiries")) {
      return new Response(
        JSON.stringify({
          ok: true,
          data: {
            enquiries: [{ id: 1, name: "Prospect", status: "new" }],
            pagination: { total: 1, limit: 50, offset: 0 },
            counts: { total: 1, new: 1, read: 0, replied: 0, archived: 0 },
          },
        }),
      );
    }
    if (init.method === "PATCH" && String(url).endsWith("/api/admin/enquiries/1")) {
      return new Response(JSON.stringify({ ok: true, data: { id: 1, status: "read" } }));
    }
    if (init.method === "GET" && String(url).includes("/api/admin/media")) {
      return new Response(
        JSON.stringify({
          ok: true,
          data: {
            assets: [{ id: 1, path: "blogs/photo.webp", url: "/api/r2/blogs/photo.webp" }],
            total: 1,
          },
        }),
      );
    }
    if (init.method === "DELETE" && String(url).endsWith("/api/r2/blogs/photo.webp")) {
      return new Response(JSON.stringify({ ok: true, data: { deleted: true } }));
    }
    return new Response(null, { status: 404 });
  });

  const enquiriesRes = await client.listEnquiries("new");
  assert.equal(enquiriesRes.enquiries.length, 1);
  assert.equal(enquiriesRes.counts.new, 1);

  const updatedEnq = await client.updateEnquiryStatus(1, "read");
  assert.equal(updatedEnq.status, "read");

  const mediaRes = await client.listMedia("blogs");
  assert.equal(mediaRes.assets.length, 1);
  assert.equal(mediaRes.assets[0].path, "blogs/photo.webp");

  await client.deleteMedia("blogs/photo.webp");
});

test("admin client handles 401 session-required and 403 forbidden with typed error", async () => {
  const unauthorizedClient = createAdminApiClient(
    apiBaseUrl,
    async () => new Response(null, { status: 401 }),
  );
  const forbiddenClient = createAdminApiClient(
    apiBaseUrl,
    async () => new Response(null, { status: 403 }),
  );

  await assert.rejects(
    async () => unauthorizedClient.listTeam(),
    (err) => {
      assert.ok(err instanceof AdminApiClientError);
      assert.equal(err.status, 401);
      assert.equal(err.code, "UNAUTHORIZED");
      return true;
    },
  );

  await assert.rejects(
    async () => forbiddenClient.listTeam(),
    (err) => {
      assert.ok(err instanceof AdminApiClientError);
      assert.equal(err.status, 403);
      assert.equal(err.code, "FORBIDDEN");
      return true;
    },
  );
});
