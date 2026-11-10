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
  kid: "admin-team-key",
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
    .setProtectedHeader({ alg: "RS256", kid: "admin-team-key" })
    .sign(keyPair.privateKey);
}

function createMockDb(initialRows = []) {
  const store = new Map(initialRows.map((r) => [r.id, { ...r }]));

  return {
    prepare(sql) {
      let boundArgs = [];
      return {
        bind(...args) {
          boundArgs = args;
          return this;
        },
        async first() {
          if (sql.includes("SELECT id, image, title, subtitle")) {
            const id = boundArgs[0];
            return store.get(id) || null;
          }
          if (sql.includes("SELECT id FROM team_members WHERE id = ?")) {
            const id = boundArgs[0];
            return store.has(id) ? { id } : null;
          }
          if (sql.includes("MAX(sort_order)")) {
            let max = 0;
            for (const row of store.values()) {
              if (row.sort_order > max) max = row.sort_order;
            }
            return { max_order: max };
          }
          return null;
        },
        async all() {
          if (sql.includes("SELECT id, image, title, subtitle")) {
            const rows = Array.from(store.values());
            rows.sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id));
            return { results: rows };
          }
          return { results: [] };
        },
        async run() {
          if (sql.includes("INSERT INTO team_members")) {
            const [id, image, title, subtitle, border_color, gradient, url, sort_order] = boundArgs;
            store.set(id, { id, image, title, subtitle, border_color, gradient, url, sort_order });
            return { success: true };
          }
          if (sql.includes("UPDATE team_members")) {
            const [image, title, subtitle, border_color, gradient, url, sort_order, id] = boundArgs;
            const existing = store.get(id);
            if (existing) {
              store.set(id, {
                ...existing,
                image,
                title,
                subtitle,
                border_color,
                gradient,
                url,
                sort_order,
              });
            }
            return { success: true };
          }
          if (sql.includes("DELETE FROM team_members")) {
            const id = boundArgs[0];
            store.delete(id);
            return { success: true };
          }
          return { success: true };
        },
      };
    },
    getStore() {
      return store;
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

test("Admin Team CRUD: list, get, create, update, delete", async () => {
  const initial = [
    {
      id: "member-1",
      image: "/img1.webp",
      title: "Alice",
      subtitle: "Dev",
      border_color: "#22D3EE",
      gradient: "g1",
      url: "",
      sort_order: 1,
    },
    {
      id: "member-2",
      image: "/img2.webp",
      title: "Bob",
      subtitle: "QA",
      border_color: "#38BDF8",
      gradient: "g2",
      url: "",
      sort_order: 2,
    },
  ];
  const db = createMockDb(initial);
  const runtimeEnv = makeEnv(db);
  const token = await tokenFor();

  // 1. List
  const listRes = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/team`, {
      method: "GET",
      headers: { "Cf-Access-Jwt-Assertion": token, Origin: "https://admin-dev.techagenz.com" },
    }),
    runtimeEnv,
    {},
  );
  assert.equal(listRes.status, 200);
  const listData = await listRes.json();
  assert.equal(listData.ok, true);
  assert.equal(listData.data.length, 2);
  assert.equal(listData.data[0].name, "Alice");

  // 2. Get single
  const getRes = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/team/member-1`, {
      method: "GET",
      headers: { "Cf-Access-Jwt-Assertion": token, Origin: "https://admin-dev.techagenz.com" },
    }),
    runtimeEnv,
    {},
  );
  assert.equal(getRes.status, 200);
  const getData = await getRes.json();
  assert.equal(getData.data.name, "Alice");

  // 3. Create
  const createRes = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/team`, {
      method: "POST",
      headers: {
        "Cf-Access-Jwt-Assertion": token,
        Origin: "https://admin-dev.techagenz.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Charlie Chaplin",
        role: "Designer",
        borderColor: "#8B5CF6",
      }),
    }),
    runtimeEnv,
    {},
  );
  assert.equal(createRes.status, 201);
  const createData = await createRes.json();
  assert.equal(createData.ok, true);
  assert.equal(createData.data.name, "Charlie Chaplin");
  assert.equal(createData.data.role, "Designer");
  assert.equal(createData.data.id, "charlie-chaplin");
  assert.equal(db.getStore().size, 3);

  // 4. Update
  const updateRes = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/team/charlie-chaplin`, {
      method: "PUT",
      headers: {
        "Cf-Access-Jwt-Assertion": token,
        Origin: "https://admin-dev.techagenz.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Charlie C.",
        role: "Lead Designer",
      }),
    }),
    runtimeEnv,
    {},
  );
  assert.equal(updateRes.status, 200);
  const updateData = await updateRes.json();
  assert.equal(updateData.data.name, "Charlie C.");
  assert.equal(updateData.data.role, "Lead Designer");

  // 5. Delete
  const delRes = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/team/charlie-chaplin`, {
      method: "DELETE",
      headers: { "Cf-Access-Jwt-Assertion": token, Origin: "https://admin-dev.techagenz.com" },
    }),
    runtimeEnv,
    {},
  );
  assert.equal(delRes.status, 200);
  const delData = await delRes.json();
  assert.equal(delData.data.deleted, true);
  assert.equal(db.getStore().size, 2);

  // 6. Validation error on missing name
  const badCreate = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/team`, {
      method: "POST",
      headers: {
        "Cf-Access-Jwt-Assertion": token,
        Origin: "https://admin-dev.techagenz.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "" }),
    }),
    runtimeEnv,
    {},
  );
  assert.equal(badCreate.status, 400);
  assert.equal((await badCreate.json()).error.code, "VALIDATION_ERROR");
});
