import assert from "node:assert/strict";
import { build } from "esbuild";
import { generateKeyPair, exportJWK, SignJWT } from "jose";
import test from "node:test";

const teamDomain = "broad-voice-f670.cloudflareaccess.com";
const issuer = `https://${teamDomain}`;
const audience = "4337c569505d0367294fd5adbdc57d49cbe1c0faf4b62f4a27eb8de2ff943a19";
const apiHost = "api-dev.techagenz.com";
const developmentAdmin = "haider.ly5617@gmail.com";
const keyPair = await generateKeyPair("RS256", { modulusLength: 2048 });
const jwk = {
  ...(await exportJWK(keyPair.publicKey)),
  kid: "admin-blog-key",
  alg: "RS256",
  use: "sig",
};

globalThis.fetch = async (input) => {
  if (String(input) === `https://${teamDomain}/cdn-cgi/access/certs`) {
    return new Response(JSON.stringify({ keys: [jwk] }), { status: 200 });
  }
  return new Response(null, { status: 404 });
};

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

async function tokenFor(email = developmentAdmin) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    iss: issuer,
    aud: audience,
    sub: `sub-${email}`,
    email,
    iat: now,
    exp: now + 300,
  })
    .setProtectedHeader({ alg: "RS256", kid: "admin-blog-key" })
    .sign(keyPair.privateKey);
}

function createMockDb() {
  const posts = new Map();
  const keywords = [];
  const takeaways = [];
  const content = [];

  function makeStatement(sql, args = []) {
    return {
      sql,
      args,
      bind(...newArgs) {
        return makeStatement(sql, newArgs);
      },
      async first() {
        if (sql.includes("SELECT id, title, category")) {
          const id = args[0];
          return posts.get(id) || null;
        }
        if (sql.includes("SELECT id FROM blog_posts WHERE id = ?")) {
          const id = args[0];
          return posts.has(id) ? { id } : null;
        }
        return null;
      },
      async all() {
        if (sql.includes("FROM blog_posts")) {
          return { results: Array.from(posts.values()) };
        }
        if (sql.includes("FROM blog_post_keywords WHERE post_id = ?")) {
          const id = args[0];
          return {
            results: keywords
              .filter((k) => k.post_id === id)
              .map((k) => ({ id: 1, keyword: k.keyword })),
          };
        }
        if (sql.includes("FROM blog_post_key_takeaways WHERE post_id = ?")) {
          const id = args[0];
          return {
            results: takeaways
              .filter((t) => t.post_id === id)
              .map((t) => ({ id: 1, takeaway: t.takeaway })),
          };
        }
        if (sql.includes("FROM blog_post_content WHERE post_id = ?")) {
          const id = args[0];
          return {
            results: content
              .filter((c) => c.post_id === id)
              .map((c) => ({ id: 1, paragraph: c.paragraph })),
          };
        }
        return { results: [] };
      },
      async run() {
        if (sql.includes("INSERT INTO blog_posts")) {
          const [
            id,
            title,
            category,
            read_time,
            date,
            publish_date_iso,
            author,
            image,
            excerpt,
            featured,
          ] = args;
          posts.set(id, {
            id,
            title,
            category,
            read_time,
            date,
            publish_date_iso,
            author,
            image,
            excerpt,
            featured,
          });
        } else if (sql.includes("INSERT INTO blog_post_keywords")) {
          const [post_id, keyword, sort_order] = args;
          keywords.push({ post_id, keyword, sort_order });
        } else if (sql.includes("INSERT INTO blog_post_key_takeaways")) {
          const [post_id, takeaway, sort_order] = args;
          takeaways.push({ post_id, takeaway, sort_order });
        } else if (sql.includes("INSERT INTO blog_post_content")) {
          const [post_id, paragraph, sort_order] = args;
          content.push({ post_id, paragraph, sort_order });
        } else if (sql.includes("UPDATE blog_posts")) {
          const [
            title,
            category,
            read_time,
            date,
            publish_date_iso,
            author,
            image,
            excerpt,
            featured,
            id,
          ] = args;
          posts.set(id, {
            id,
            title,
            category,
            read_time,
            date,
            publish_date_iso,
            author,
            image,
            excerpt,
            featured,
          });
        } else if (sql.includes("DELETE FROM blog_post_keywords WHERE post_id = ?")) {
          const id = args[0];
          const keep = keywords.filter((k) => k.post_id !== id);
          keywords.length = 0;
          keywords.push(...keep);
        } else if (sql.includes("DELETE FROM blog_post_key_takeaways WHERE post_id = ?")) {
          const id = args[0];
          const keep = takeaways.filter((t) => t.post_id !== id);
          takeaways.length = 0;
          takeaways.push(...keep);
        } else if (sql.includes("DELETE FROM blog_post_content WHERE post_id = ?")) {
          const id = args[0];
          const keep = content.filter((c) => c.post_id !== id);
          content.length = 0;
          content.push(...keep);
        } else if (sql.includes("DELETE FROM blog_posts WHERE id = ?")) {
          const id = args[0];
          posts.delete(id);
        }
        return { success: true };
      },
    };
  }

  return {
    prepare(sql) {
      return makeStatement(sql);
    },
    async batch(stmts) {
      for (const stmt of stmts) {
        await stmt.run();
      }
      return [];
    },
    getState() {
      return { posts, keywords, takeaways, content };
    },
  };
}

function makeEnv(db) {
  return {
    CF_ACCESS_TEAM_DOMAIN: teamDomain,
    CF_ACCESS_AUD: audience,
    CF_ACCESS_API_HOST: apiHost,
    ADMIN_ALLOWED_EMAILS: developmentAdmin,
    ADMIN_CMS_ENABLED: "true",
    DB: db,
    ASSETS: {
      async get() {
        return null;
      },
      async put() {},
      async delete() {},
    },
    ENQUIRY_RATE_LIMITER: {
      async limit() {
        return { success: true };
      },
    },
    ENVIRONMENT: "development",
    RESEND_API_KEY: "",
    CF_TURNSTILE_SECRET_KEY: "",
  };
}

test("Admin Blog CRUD: list, get, create with child tables, update, delete", async () => {
  const db = createMockDb();
  const runtimeEnv = makeEnv(db);
  const token = await tokenFor();

  // 1. Create a blog post
  const createRes = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/blogs`, {
      method: "POST",
      headers: {
        "Cf-Access-Jwt-Assertion": token,
        Origin: "https://admin-dev.techagenz.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Building Modern AI Pipelines",
        category: "Artificial Intelligence",
        readTime: "6 min read",
        author: "Ali Haider",
        image: "/blog-images/ai-pipelines.webp",
        excerpt: "How to build production AI pipelines with Workers and D1.",
        featured: true,
        keywords: ["AI", "Cloudflare", "D1"],
        keyTakeaways: ["Fast cold starts", "Zero ops database"],
        content: ["First paragraph on architecture.", "Second paragraph on latency."],
      }),
    }),
    runtimeEnv,
    {},
  );

  assert.equal(createRes.status, 201);
  const created = (await createRes.json()).data;
  assert.equal(created.id, "building-modern-ai-pipelines");
  assert.equal(created.title, "Building Modern AI Pipelines");
  assert.equal(created.featured, true);
  assert.deepEqual(created.keywords, ["AI", "Cloudflare", "D1"]);
  assert.deepEqual(created.keyTakeaways, ["Fast cold starts", "Zero ops database"]);
  assert.deepEqual(created.content, [
    "First paragraph on architecture.",
    "Second paragraph on latency.",
  ]);

  // Verify child tables populated
  const state = db.getState();
  assert.equal(state.posts.size, 1);
  assert.equal(state.keywords.length, 3);
  assert.equal(state.takeaways.length, 2);
  assert.equal(state.content.length, 2);

  // 2. Get blog
  const getRes = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/blogs/building-modern-ai-pipelines`, {
      method: "GET",
      headers: { "Cf-Access-Jwt-Assertion": token, Origin: "https://admin-dev.techagenz.com" },
    }),
    runtimeEnv,
    {},
  );
  assert.equal(getRes.status, 200);
  const fetched = (await getRes.json()).data;
  assert.equal(fetched.title, "Building Modern AI Pipelines");

  // 3. Update blog (modify title, replace keywords, takeaways)
  const updateRes = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/blogs/building-modern-ai-pipelines`, {
      method: "PUT",
      headers: {
        "Cf-Access-Jwt-Assertion": token,
        Origin: "https://admin-dev.techagenz.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Building Modern AI Pipelines (2026 Edition)",
        keywords: ["AI", "Edge Computing"],
        keyTakeaways: ["Sub-millisecond routing"],
      }),
    }),
    runtimeEnv,
    {},
  );
  assert.equal(updateRes.status, 200);
  const updated = (await updateRes.json()).data;
  assert.equal(updated.title, "Building Modern AI Pipelines (2026 Edition)");
  assert.deepEqual(updated.keywords, ["AI", "Edge Computing"]);
  assert.deepEqual(updated.keyTakeaways, ["Sub-millisecond routing"]);

  // 4. Delete blog
  const delRes = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/blogs/building-modern-ai-pipelines`, {
      method: "DELETE",
      headers: { "Cf-Access-Jwt-Assertion": token, Origin: "https://admin-dev.techagenz.com" },
    }),
    runtimeEnv,
    {},
  );
  assert.equal(delRes.status, 200);
  assert.equal(state.posts.size, 0);
  assert.equal(state.keywords.length, 0);

  // 5. Validation error
  const badRes = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/blogs`, {
      method: "POST",
      headers: {
        "Cf-Access-Jwt-Assertion": token,
        Origin: "https://admin-dev.techagenz.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "" }),
    }),
    runtimeEnv,
    {},
  );
  assert.equal(badRes.status, 400);
});
