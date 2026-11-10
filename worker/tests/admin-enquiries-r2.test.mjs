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
  kid: "admin-enq-r2-key",
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
    .setProtectedHeader({ alg: "RS256", kid: "admin-enq-r2-key" })
    .sign(keyPair.privateKey);
}

function createMockDb() {
  const enquiries = new Map([
    [
      1,
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        phone: null,
        company: "Acme",
        service: "AI",
        budget: "$10k",
        message: "Hello",
        status: "new",
        source: "website",
        created_at: "2026-11-09 10:00:00",
      },
    ],
    [
      2,
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        phone: null,
        company: "Beta",
        service: "Web",
        budget: "$5k",
        message: "Hi",
        status: "read",
        source: "website",
        created_at: "2026-11-09 11:00:00",
      },
    ],
    [
      3,
      {
        id: 3,
        name: "Old Client",
        email: "old@example.com",
        phone: null,
        company: null,
        service: null,
        budget: null,
        message: "Done",
        status: "archived",
        source: "website",
        created_at: "2026-11-08 09:00:00",
      },
    ],
  ]);

  const mediaAssets = new Map();

  function makeStatement(sql, args = []) {
    return {
      sql,
      args,
      bind(...newArgs) {
        return makeStatement(sql, newArgs);
      },
      async first() {
        if (
          sql.includes("SELECT id, status FROM enquiries WHERE id = ?") ||
          sql.includes("SELECT * FROM enquiries WHERE id = ?")
        ) {
          const id = args[0];
          return enquiries.get(id) || null;
        }
        if (sql.includes("SELECT id FROM enquiries WHERE id = ?")) {
          const id = args[0];
          return enquiries.has(id) ? { id } : null;
        }
        if (sql.includes("COUNT(*) as total")) {
          let newC = 0,
            readC = 0,
            repliedC = 0,
            archivedC = 0;
          for (const row of enquiries.values()) {
            if (row.status === "new") newC++;
            if (row.status === "read") readC++;
            if (row.status === "replied") repliedC++;
            if (row.status === "archived") archivedC++;
          }
          return {
            total: enquiries.size,
            new_count: newC,
            read_count: readC,
            replied_count: repliedC,
            archived_count: archivedC,
          };
        }
        if (sql.includes("SELECT COUNT(*) as count FROM media_assets")) {
          return { count: mediaAssets.size };
        }
        return null;
      },
      async all() {
        if (sql.includes("FROM enquiries")) {
          const statusMatch = sql.includes("WHERE status = ?");
          let rows = Array.from(enquiries.values());
          if (statusMatch) {
            rows = rows.filter((r) => r.status === args[0]);
          }
          return { results: rows };
        }
        if (sql.includes("FROM media_assets")) {
          return { results: Array.from(mediaAssets.values()) };
        }
        return { results: [] };
      },
      async run() {
        if (sql.includes("UPDATE enquiries SET status = ? WHERE id = ?")) {
          const [status, id] = args;
          const ex = enquiries.get(id);
          if (ex) enquiries.set(id, { ...ex, status });
        } else if (sql.includes("DELETE FROM enquiries WHERE id = ?")) {
          const id = args[0];
          enquiries.delete(id);
        } else if (sql.includes("INSERT INTO media_assets")) {
          const [
            r2_path,
            file_name,
            content_type,
            size_bytes,
            alt_text,
            entity_type,
            entity_id,
            uploaded_by,
          ] = args;
          mediaAssets.set(r2_path, {
            id: mediaAssets.size + 1,
            r2_path,
            file_name,
            content_type,
            size_bytes,
            alt_text,
            entity_type,
            entity_id,
            uploaded_by,
            created_at: new Date().toISOString(),
          });
        } else if (sql.includes("DELETE FROM media_assets WHERE r2_path = ?")) {
          const r2_path = args[0];
          mediaAssets.delete(r2_path);
        }
        return { success: true };
      },
    };
  }

  return {
    prepare(sql) {
      return makeStatement(sql);
    },
    getState() {
      return { enquiries, mediaAssets };
    },
  };
}

function makeEnv(db) {
  const r2Storage = new Map();
  return {
    CF_ACCESS_TEAM_DOMAIN: teamDomain,
    CF_ACCESS_AUD: audience,
    CF_ACCESS_API_HOST: apiHost,
    ADMIN_ALLOWED_EMAILS: developmentAdmin,
    ADMIN_CMS_ENABLED: "true",
    DB: db,
    ASSETS: {
      async get(key) {
        return r2Storage.get(key) || null;
      },
      async put(key, body, options) {
        r2Storage.set(key, { body, options });
      },
      async delete(key) {
        r2Storage.delete(key);
      },
      getStorage() {
        return r2Storage;
      },
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

test("Admin Enquiries: list, filter, update status, delete", async () => {
  const db = createMockDb();
  const runtimeEnv = makeEnv(db);
  const token = await tokenFor();

  // 1. List all enquiries
  const listRes = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/enquiries`, {
      method: "GET",
      headers: { "Cf-Access-Jwt-Assertion": token, Origin: "https://admin-dev.techagenz.com" },
    }),
    runtimeEnv,
    {},
  );
  assert.equal(listRes.status, 200);
  const listData = await listRes.json();
  assert.equal(listData.ok, true);
  assert.equal(listData.data.enquiries.length, 3);
  assert.equal(listData.data.counts.total, 3);
  assert.equal(listData.data.counts.new, 1);
  assert.equal(listData.data.counts.read, 1);

  // 2. Filter by status=new
  const filterRes = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/enquiries?status=new`, {
      method: "GET",
      headers: { "Cf-Access-Jwt-Assertion": token, Origin: "https://admin-dev.techagenz.com" },
    }),
    runtimeEnv,
    {},
  );
  assert.equal(filterRes.status, 200);
  const filterData = await filterRes.json();
  assert.equal(filterData.data.enquiries.length, 1);
  assert.equal(filterData.data.enquiries[0].id, 1);

  // 3. Update status: new -> replied
  const updateRes = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/enquiries/1`, {
      method: "PATCH",
      headers: {
        "Cf-Access-Jwt-Assertion": token,
        Origin: "https://admin-dev.techagenz.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "replied" }),
    }),
    runtimeEnv,
    {},
  );
  assert.equal(updateRes.status, 200);
  const updateData = await updateRes.json();
  assert.equal(updateData.data.status, "replied");

  // 4. Invalid status rejected
  const badRes = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/enquiries/1`, {
      method: "PATCH",
      headers: {
        "Cf-Access-Jwt-Assertion": token,
        Origin: "https://admin-dev.techagenz.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "unknown_status" }),
    }),
    runtimeEnv,
    {},
  );
  assert.equal(badRes.status, 400);

  // 5. Delete enquiry
  const delRes = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/enquiries/1`, {
      method: "DELETE",
      headers: { "Cf-Access-Jwt-Assertion": token, Origin: "https://admin-dev.techagenz.com" },
    }),
    runtimeEnv,
    {},
  );
  assert.equal(delRes.status, 200);
  assert.equal(db.getState().enquiries.size, 2);
});

test("Admin Media & R2: reject SVG uploads without storing or cataloging them", async () => {
  const db = createMockDb();
  const runtimeEnv = makeEnv(db);
  const token = await tokenFor();
  const svgPayload = new TextEncoder().encode(
    '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
  );

  const response = await worker.fetch(
    new Request(`https://${apiHost}/api/r2/upload?folder=blogs&fileName=unsafe.svg`, {
      method: "POST",
      headers: {
        "Cf-Access-Jwt-Assertion": token,
        Origin: "https://admin-dev.techagenz.com",
        "Content-Type": "image/svg+xml",
      },
      body: svgPayload,
    }),
    runtimeEnv,
    {},
  );

  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.ok, false);
  assert.equal(body.error.code, "UNSUPPORTED_MEDIA_TYPE");
  assert.equal(runtimeEnv.ASSETS.getStorage().size, 0);
  assert.equal(db.getState().mediaAssets.size, 0);
});

test("Admin Media & R2: upload, catalog query, delete", async () => {
  const db = createMockDb();
  const runtimeEnv = makeEnv(db);
  const token = await tokenFor();

  // 1. Upload asset via direct binary
  const binaryPayload = new TextEncoder().encode("fake-image-bytes");
  const uploadRes = await worker.fetch(
    new Request(
      `https://${apiHost}/api/r2/upload?folder=blogs&fileName=my-diagram.webp&altText=Architecture+Diagram`,
      {
        method: "POST",
        headers: {
          "Cf-Access-Jwt-Assertion": token,
          Origin: "https://admin-dev.techagenz.com",
          "Content-Type": "image/webp",
        },
        body: binaryPayload,
      },
    ),
    runtimeEnv,
    {},
  );
  assert.equal(uploadRes.status, 201);
  const uploadData = await uploadRes.json();
  assert.equal(uploadData.data.path, "blogs/my-diagram.webp");
  assert.equal(uploadData.data.url, "/api/r2/blogs/my-diagram.webp");

  // Verify stored in R2 and media_assets
  assert.ok(runtimeEnv.ASSETS.getStorage().has("blogs/my-diagram.webp"));
  assert.ok(db.getState().mediaAssets.has("blogs/my-diagram.webp"));

  // 2. Reject unapproved folder prefix
  const badPrefixRes = await worker.fetch(
    new Request(`https://${apiHost}/api/r2/upload?folder=secret-folder&fileName=test.webp`, {
      method: "POST",
      headers: {
        "Cf-Access-Jwt-Assertion": token,
        Origin: "https://admin-dev.techagenz.com",
        "Content-Type": "image/webp",
      },
      body: binaryPayload,
    }),
    runtimeEnv,
    {},
  );
  assert.equal(badPrefixRes.status, 400);

  // 3. Query Media Catalog
  const mediaListRes = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/media?folder=blogs`, {
      method: "GET",
      headers: { "Cf-Access-Jwt-Assertion": token, Origin: "https://admin-dev.techagenz.com" },
    }),
    runtimeEnv,
    {},
  );
  assert.equal(mediaListRes.status, 200);
  const mediaListData = await mediaListRes.json();
  assert.equal(mediaListData.data.assets.length, 1);
  assert.equal(mediaListData.data.assets[0].path, "blogs/my-diagram.webp");

  // 4. Delete asset
  const delRes = await worker.fetch(
    new Request(`https://${apiHost}/api/r2/blogs/my-diagram.webp`, {
      method: "DELETE",
      headers: { "Cf-Access-Jwt-Assertion": token, Origin: "https://admin-dev.techagenz.com" },
    }),
    runtimeEnv,
    {},
  );
  assert.equal(delRes.status, 200);
  assert.ok(!runtimeEnv.ASSETS.getStorage().has("blogs/my-diagram.webp"));
  assert.ok(!db.getState().mediaAssets.has("blogs/my-diagram.webp"));
});
