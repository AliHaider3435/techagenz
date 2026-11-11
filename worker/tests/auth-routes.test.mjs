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
  kid: "routes-key",
  alg: "RS256",
  use: "sig",
};
let fetchCount = 0;
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input) => {
  fetchCount += 1;
  assert.equal(String(input), `https://${teamDomain}/cdn-cgi/access/certs`);
  return new Response(JSON.stringify({ keys: [jwk] }), { status: 200 });
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
globalThis.fetch = originalFetch;

async function tokenFor(email = developmentAdmin) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    iss: issuer,
    aud: audience,
    sub: `subject-${email}`,
    email,
    iat: now,
    exp: now + 300,
  })
    .setProtectedHeader({ alg: "RS256", kid: "routes-key" })
    .sign(keyPair.privateKey);
}

function env(allowedEmails = developmentAdmin) {
  let puts = 0;
  let deletes = 0;
  let databasePrepares = 0;
  return {
    CF_ACCESS_TEAM_DOMAIN: teamDomain,
    CF_ACCESS_AUD: audience,
    CF_ACCESS_API_HOST: apiHost,
    ADMIN_ALLOWED_EMAILS: allowedEmails,
    DB: {
      prepare() {
        databasePrepares += 1;
        return {
          bind() {
            return this;
          },
          async all() {
            return { results: [] };
          },
          async first() {
            return null;
          },
        };
      },
      get prepareCalls() {
        return databasePrepares;
      },
    },
    ASSETS: {
      async get() {
        return null;
      },
      async put() {
        puts += 1;
      },
      async delete() {
        deletes += 1;
      },
      get writes() {
        return { puts, deletes };
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

async function request(
  path,
  { method = "GET", token, origin, hostname = apiHost, runtimeEnv = env() } = {},
) {
  const headers = token ? { "Cf-Access-Jwt-Assertion": token } : {};
  if (origin) headers.Origin = origin;
  return worker.fetch(
    new Request(`https://${hostname}${path}`, { method, headers }),
    runtimeEnv,
    {},
  );
}

async function assertErrorEnvelope(response, code, message) {
  const body = await response.json();
  assert.equal(body.ok, false);
  assert.equal(body.error.code, code);
  assert.equal(body.error.message, message);
}

test("admin endpoints return 401 for missing or invalid authentication", async () => {
  const missing = await request("/api/admin/team");
  const invalid = await request("/api/admin/team", { token: "bad-token" });

  assert.equal(missing.status, 401);
  assert.equal(invalid.status, 401);
  await assertErrorEnvelope(missing, "UNAUTHORIZED", "Unauthorized");
  await assertErrorEnvelope(invalid, "UNAUTHORIZED", "Unauthorized");
});

test("admin endpoints return 403 for authenticated non-admin identities", async () => {
  const response = await request("/api/admin/team", {
    token: await tokenFor("someone@example.net"),
  });

  assert.equal(response.status, 403);
  await assertErrorEnvelope(response, "FORBIDDEN", "Forbidden");
});

test("approved development administrator is authorized but admin CRUD remains disabled", async () => {
  const response = await request("/api/admin/team", { token: await tokenFor() });

  assert.equal(response.status, 501);
  assert.deepEqual((await response.json()).error, {
    code: "NOT_IMPLEMENTED",
    message: "Not implemented",
  });
});

test("R2 write endpoints require auth and remain disabled after authorization", async () => {
  const runtimeEnv = env();
  const uploadUnauthorized = await request("/api/r2/upload?path=team/photo.webp", {
    method: "POST",
    origin: "https://admin-dev.techagenz.com",
    runtimeEnv,
  });
  const deleteUnauthorized = await request("/api/r2/team/photo.webp", {
    method: "DELETE",
    origin: "https://admin-dev.techagenz.com",
    runtimeEnv,
  });
  const uploadAuthorized = await request("/api/r2/upload?path=team/photo.webp", {
    method: "POST",
    token: await tokenFor(),
    origin: "https://admin-dev.techagenz.com",
    runtimeEnv,
  });
  const deleteAuthorized = await request("/api/r2/team/photo.webp", {
    method: "DELETE",
    token: await tokenFor(),
    origin: "https://admin-dev.techagenz.com",
    runtimeEnv,
  });

  assert.equal(uploadUnauthorized.status, 401);
  assert.equal(deleteUnauthorized.status, 401);
  assert.equal(uploadAuthorized.status, 403);
  assert.equal(deleteAuthorized.status, 403);
  assert.deepEqual(runtimeEnv.ASSETS.writes, { puts: 0, deletes: 0 });
  await assertErrorEnvelope(uploadUnauthorized, "UNAUTHORIZED", "Unauthorized");
});

test("admin mutations reject missing and unapproved Origins before database access", async () => {
  const runtimeEnv = env();
  const token = await tokenFor();
  const mutations = [
    ["/api/admin/team", "POST"],
    ["/api/admin/team/1", "PUT"],
    ["/api/admin/enquiries/1", "PATCH"],
    ["/api/admin/team/1", "DELETE"],
  ];

  for (const [path, method] of mutations) {
    const missing = await request(path, { method, token, runtimeEnv });
    const unapproved = await request(path, {
      method,
      token,
      origin: "https://evil.example",
      runtimeEnv,
    });

    assert.equal(missing.status, 403, `${method} ${path} must reject missing Origin`);
    assert.equal(unapproved.status, 403, `${method} ${path} must reject unapproved Origin`);
  }

  assert.equal(runtimeEnv.DB.prepareCalls, 0);
  assert.deepEqual(runtimeEnv.ASSETS.writes, { puts: 0, deletes: 0 });
});

test("R2 upload and delete reject missing and unapproved Origins before writes", async () => {
  const runtimeEnv = env();
  const token = await tokenFor();
  const mutations = [
    ["/api/r2/upload?path=team/photo.webp", "POST"],
    ["/api/r2/team/photo.webp", "DELETE"],
  ];

  for (const [path, method] of mutations) {
    const missing = await request(path, { method, token, runtimeEnv });
    const unapproved = await request(path, {
      method,
      token,
      origin: "https://evil.example",
      runtimeEnv,
    });

    assert.equal(missing.status, 403, `${method} ${path} must reject missing Origin`);
    assert.equal(unapproved.status, 403, `${method} ${path} must reject unapproved Origin`);
  }

  assert.equal(runtimeEnv.DB.prepareCalls, 0);
  assert.deepEqual(runtimeEnv.ASSETS.writes, { puts: 0, deletes: 0 });
});

test("valid Access assertions cannot authorize requests via the public workers.dev host", async () => {
  const response = await request("/api/admin/team", {
    token: await tokenFor(),
    hostname: "techagenz-api-dev.haider-ly5617.workers.dev",
  });

  assert.equal(response.status, 403);
});

test("public CMS reads remain available without Access authentication", async () => {
  const response = await worker.fetch(
    new Request(`https://${apiHost}/api/cms/team`, {
      headers: { Origin: "https://techagenz.com" },
    }),
    env(),
    {},
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body.data, []);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "https://techagenz.com");
});

test("empty or missing administrator allow-list denies a valid identity", async () => {
  const emptyAllowList = env("");
  const missingAllowList = env();
  delete missingAllowList.ADMIN_ALLOWED_EMAILS;

  for (const runtimeEnv of [emptyAllowList, missingAllowList]) {
    const response = await worker.fetch(
      new Request(`https://${apiHost}/api/admin/team`, {
        headers: { "Cf-Access-Jwt-Assertion": await tokenFor() },
      }),
      runtimeEnv,
      {},
    );
    assert.equal(response.status, 403);
  }
});

test("admin origin receives credentialed CORS without wildcard origins", async () => {
  const actualResponse = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/team`, {
      headers: { Origin: "https://admin-dev.techagenz.com" },
    }),
    env(),
    {},
  );
  const preflight = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/team`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://admin-dev.techagenz.com",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    }),
    env(),
    {},
  );

  assert.equal(actualResponse.status, 401);
  assert.equal(
    actualResponse.headers.get("Access-Control-Allow-Origin"),
    "https://admin-dev.techagenz.com",
  );
  assert.equal(actualResponse.headers.get("Access-Control-Allow-Credentials"), "true");
  assert.equal(preflight.status, 204);
  assert.equal(
    preflight.headers.get("Access-Control-Allow-Origin"),
    "https://admin-dev.techagenz.com",
  );
  assert.equal(preflight.headers.get("Access-Control-Allow-Credentials"), "true");
  assert.equal(preflight.headers.get("Access-Control-Allow-Methods"), "POST");
  assert.equal(preflight.headers.get("Access-Control-Allow-Headers"), "Content-Type");
  assert.notEqual(preflight.headers.get("Access-Control-Allow-Origin"), "*");
  assert.match(preflight.headers.get("Vary"), /Origin/i);
  assert.match(preflight.headers.get("Vary"), /Access-Control-Request-Method/i);
  assert.match(preflight.headers.get("Vary"), /Access-Control-Request-Headers/i);
});

test("public website origins cannot read admin responses", async () => {
  const response = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/team`, {
      headers: { Origin: "https://techagenz.com" },
    }),
    env(),
    {},
  );

  assert.equal(response.status, 403);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
});

test("CORS rejects unapproved and missing preflight origins", async () => {
  const unapproved = await worker.fetch(
    new Request(`https://${apiHost}/api/cms/team`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://attacker.example",
        "Access-Control-Request-Method": "GET",
      },
    }),
    env(),
    {},
  );
  const missing = await worker.fetch(
    new Request(`https://${apiHost}/api/cms/team`, { method: "OPTIONS" }),
    env(),
    {},
  );

  assert.equal(unapproved.status, 403);
  assert.equal(missing.status, 403);
  assert.equal(unapproved.headers.get("Access-Control-Allow-Origin"), null);
});

test("CORS rejects disallowed methods, headers, and browser Access assertions", async () => {
  for (const [method, headers] of [
    ["TRACE", "content-type"],
    ["POST", "x-unknown-header"],
    ["POST", "cf-access-jwt-assertion"],
  ]) {
    const response = await worker.fetch(
      new Request(`https://${apiHost}/api/admin/team`, {
        method: "OPTIONS",
        headers: {
          Origin: "https://admin-dev.techagenz.com",
          "Access-Control-Request-Method": method,
          "Access-Control-Request-Headers": headers,
        },
      }),
      env(),
      {},
    );
    assert.equal(response.status, 403);
    assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
  }
});

test("public origins retain read and enquiry preflight without credentialed CORS", async () => {
  const response = await worker.fetch(
    new Request(`https://${apiHost}/api/enquiries`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://techagenz.com",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    }),
    env(),
    {},
  );

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "https://techagenz.com");
  assert.equal(response.headers.get("Access-Control-Allow-Credentials"), null);
  assert.equal(response.headers.get("Access-Control-Allow-Methods"), "POST");
  assert.equal(response.headers.get("Access-Control-Allow-Headers"), "Content-Type");
});

test("preflight performs no database or R2 operations", async () => {
  const runtimeEnv = env();
  const response = await worker.fetch(
    new Request(`https://${apiHost}/api/r2/upload`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://admin-dev.techagenz.com",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    }),
    runtimeEnv,
    {},
  );

  assert.equal(response.status, 204);
  assert.equal(runtimeEnv.DB.prepareCalls, 0);
  assert.deepEqual(runtimeEnv.ASSETS.writes, { puts: 0, deletes: 0 });
});

test("route verifier fetches the configured JWKS once and caches it", () => {
  assert.equal(fetchCount, 1);
});
