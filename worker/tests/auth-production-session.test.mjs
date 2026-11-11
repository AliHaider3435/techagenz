import assert from "node:assert/strict";
import { build } from "esbuild";
import test from "node:test";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  hashSessionToken,
  timingSafeEqual,
  timingSafeStringEqual,
  validateSessionTtlHours,
} from "../src/lib/crypto.ts";

const indexPath = fileURLToPath(new URL("../src/index.ts", import.meta.url));

const { outputFiles } = await build({
  entryPoints: [indexPath],
  bundle: true,
  format: "esm",
  platform: "browser",
  write: false,
});

const { default: worker } = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString("base64")}`
);

const TEST_USERNAME = "superadmin";
const TEST_PASSWORD = "CorrectHorseBatteryStaple123!";
const TEST_PASSWORD_HASH = await hashPassword(TEST_PASSWORD);
const PROD_ORIGIN = "https://admin.techagenz.com";
const PROD_API_HOST = "api.techagenz.com";
const DEFAULT_CLIENT_IP = "198.51.100.1";

function createMockD1(options = {}) {
  const sessions = new Map(); // tokenHash -> session record

  return {
    sessions,
    prepare(sql) {
      let boundParams = [];
      return {
        bind(...args) {
          boundParams = args;
          return this;
        },
        async run() {
          if (sql.includes("INSERT INTO admin_sessions")) {
            // [id, token_hash, username, expires_at, user_agent, ip_address]
            const [id, token_hash, username, expires_at, user_agent, ip_address] = boundParams;
            sessions.set(token_hash, {
              id,
              token_hash,
              username,
              created_at: new Date().toISOString(),
              expires_at,
              revoked_at: null,
              user_agent,
              ip_address,
            });
            return { success: true };
          }
          if (sql.includes("UPDATE admin_sessions SET revoked_at")) {
            if (options.failRevocation) {
              throw new Error("D1 connection failure");
            }
            // WHERE token_hash = ? AND revoked_at IS NULL
            const [token_hash] = boundParams;
            const session = sessions.get(token_hash);
            if (session) {
              session.revoked_at = new Date().toISOString();
            }
            return { success: true };
          }
          return { success: true };
        },
        async first() {
          if (sql.includes("SELECT id, username, expires_at, revoked_at FROM admin_sessions")) {
            // WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > datetime('now')
            const [token_hash] = boundParams;
            const session = sessions.get(token_hash);
            if (!session) return null;
            if (session.revoked_at !== null) return null;
            if (new Date(session.expires_at).getTime() <= Date.now()) return null;
            return {
              id: session.id,
              username: session.username,
              expires_at: session.expires_at,
              revoked_at: session.revoked_at,
            };
          }
          return null;
        },
        async all() {
          return { results: [] };
        },
      };
    },
  };
}

function createProdEnv(overrides = {}) {
  const db = overrides.DB || createMockD1();
  let rateLimiterSuccess = true;
  if (overrides.rateLimiterSuccess !== undefined) {
    rateLimiterSuccess = overrides.rateLimiterSuccess;
  }

  let rateLimiter = {
    async limit() {
      return { success: rateLimiterSuccess };
    },
  };
  if (overrides.rateLimiterMissing) {
    rateLimiter = undefined;
  } else if (overrides.rateLimiterThrows) {
    rateLimiter = {
      async limit() {
        throw new Error("KV Rate limiter connection failure");
      },
    };
  } else if (overrides.ADMIN_LOGIN_RATE_LIMITER !== undefined) {
    rateLimiter = overrides.ADMIN_LOGIN_RATE_LIMITER;
  }

  return {
    ENVIRONMENT: "production",
    ADMIN_CMS_ENABLED: "true",
    ADMIN_SHARED_USERNAME: TEST_USERNAME,
    ADMIN_SHARED_PASSWORD_HASH: TEST_PASSWORD_HASH,
    ADMIN_SESSION_TTL_HOURS: "8",
    DB: db,
    ADMIN_LOGIN_RATE_LIMITER: rateLimiter,
    ENQUIRY_RATE_LIMITER: {
      async limit() {
        return { success: true };
      },
    },
    ASSETS: {
      async get() {
        return null;
      },
      async put() {
        return null;
      },
      async delete() {
        return null;
      },
    },
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Crypto Unit Tests
// ─────────────────────────────────────────────────────────────────────────────
test("crypto: hashPassword and verifyPassword work correctly with $ format", async () => {
  const password = "Secr3tPassword!456";
  const hash = await hashPassword(password);
  assert.ok(hash.startsWith("pbkdf2_sha256$100000$"));

  const valid = await verifyPassword(password, hash);
  assert.equal(valid, true);

  const invalid = await verifyPassword("WrongPassword", hash);
  assert.equal(invalid, false);
});

test("crypto: verifyPassword works with legacy colon format", async () => {
  const password = "ColonPassword";
  // generate legacy colon hash
  const salt = "0123456789abcdef0123456789abcdef";
  const derived = crypto
    .pbkdf2Sync(password, Buffer.from(salt, "hex"), 100000, 32, "sha256")
    .toString("hex");
  const colonHash = `pbkdf2:sha256:100000:${salt}:${derived}`;

  const valid = await verifyPassword(password, colonHash);
  assert.equal(valid, true);

  const invalid = await verifyPassword("Wrong", colonHash);
  assert.equal(invalid, false);
});

test("crypto: timingSafeEqual and timingSafeStringEqual behave correctly", () => {
  const enc = new TextEncoder();
  assert.equal(timingSafeEqual(enc.encode("hello"), enc.encode("hello")), true);
  assert.equal(timingSafeEqual(enc.encode("hello"), enc.encode("world")), false);

  assert.equal(timingSafeStringEqual("hello", "hello"), true);
  assert.equal(timingSafeStringEqual("hello", "world"), false);
  assert.equal(timingSafeStringEqual("hello", "hell"), false);
});

test("crypto: session token generation and hashing", async () => {
  const token = generateSessionToken();
  assert.equal(typeof token, "string");
  assert.equal(token.length, 64); // 32 bytes hex = 64 chars

  const hash1 = await hashSessionToken(token);
  const hash2 = await hashSessionToken(token);
  assert.equal(hash1, hash2);
  assert.equal(hash1.length, 64);
});

// ─────────────────────────────────────────────────────────────────────────────
// Production Session Authentication Tests (Section H)
// ─────────────────────────────────────────────────────────────────────────────

test("1. Successful production login sets HttpOnly, SameSite=Strict cookie and returns username", async () => {
  const mockDb = createMockD1();
  const env = createProdEnv({ DB: mockDb });

  const req = new Request(`https://${PROD_API_HOST}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: PROD_ORIGIN,
      "CF-Connecting-IP": DEFAULT_CLIENT_IP,
    },
    body: JSON.stringify({
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
    }),
  });

  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 200);

  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.data.username, TEST_USERNAME);
  assert.equal(body.data.authType, "session");

  // Check Set-Cookie
  const setCookie = res.headers.get("Set-Cookie");
  assert.ok(setCookie, "Set-Cookie header must be present");
  assert.ok(setCookie.includes("admin_session="), "Must set admin_session cookie");
  assert.ok(setCookie.includes("HttpOnly"), "Must be HttpOnly");
  assert.ok(setCookie.includes("SameSite=Strict"), "Must be SameSite=Strict");
  assert.ok(setCookie.includes("Secure"), "Must be Secure");
  assert.ok(setCookie.includes("Path=/"), "Must have Path=/");
  assert.ok(!setCookie.includes("Domain="), "Must be host-only (no Domain attribute)");
});

test("2. Invalid username returns 401 with generic message, no session created", async () => {
  const mockDb = createMockD1();
  const env = createProdEnv({ DB: mockDb });

  const req = new Request(`https://${PROD_API_HOST}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: PROD_ORIGIN,
      "CF-Connecting-IP": DEFAULT_CLIENT_IP,
    },
    body: JSON.stringify({
      username: "nonexistent_user",
      password: TEST_PASSWORD,
    }),
  });

  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 401);

  const body = await res.json();
  assert.equal(body.ok, false);
  assert.equal(body.error.message, "Invalid username or password");
  assert.equal(mockDb.sessions.size, 0, "No session should be created in D1");
  assert.equal(res.headers.get("Set-Cookie"), null);
});

test("3. Invalid password returns 401 with generic message, no session created", async () => {
  const mockDb = createMockD1();
  const env = createProdEnv({ DB: mockDb });

  const req = new Request(`https://${PROD_API_HOST}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: PROD_ORIGIN,
      "CF-Connecting-IP": DEFAULT_CLIENT_IP,
    },
    body: JSON.stringify({
      username: TEST_USERNAME,
      password: "completelyWrongPassword!",
    }),
  });

  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 401);

  const body = await res.json();
  assert.equal(body.ok, false);
  assert.equal(body.error.message, "Invalid username or password");
  assert.equal(mockDb.sessions.size, 0, "No session should be created in D1");
  assert.equal(res.headers.get("Set-Cookie"), null);
});

test("4. Error messages for invalid user and invalid password are identical", async () => {
  const env = createProdEnv();

  const reqUser = new Request(`https://${PROD_API_HOST}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
    body: JSON.stringify({ username: "wrong_user", password: TEST_PASSWORD }),
  });
  const resUser = await worker.fetch(reqUser, env, {});
  const bodyUser = await resUser.json();

  const reqPass = new Request(`https://${PROD_API_HOST}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
    body: JSON.stringify({ username: TEST_USERNAME, password: "wrong_password" }),
  });
  const resPass = await worker.fetch(reqPass, env, {});
  const bodyPass = await resPass.json();

  assert.equal(resUser.status, 401);
  assert.equal(resPass.status, 401);
  assert.equal(bodyUser.error.message, bodyPass.error.message);
});

test("5. Login rate limiting returns 429 when rate limiter fails", async () => {
  const env = createProdEnv({ rateLimiterSuccess: false });

  const req = new Request(`https://${PROD_API_HOST}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: PROD_ORIGIN,
      "CF-Connecting-IP": DEFAULT_CLIENT_IP,
    },
    body: JSON.stringify({
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
    }),
  });

  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 429);
  assert.equal(res.headers.get("Retry-After"), "60");
  const body = await res.json();
  assert.equal(body.error.code, "TOO_MANY_REQUESTS");
});

test("6. Successful session verification GET /api/auth/session returns 200 with principal", async () => {
  const mockDb = createMockD1();
  const env = createProdEnv({ DB: mockDb });

  // 1. Login
  const loginReq = new Request(`https://${PROD_API_HOST}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
    body: JSON.stringify({ username: TEST_USERNAME, password: TEST_PASSWORD }),
  });
  const loginRes = await worker.fetch(loginReq, env, {});
  const setCookie = loginRes.headers.get("Set-Cookie");
  const cookieValue = setCookie.split(";")[0]; // "admin_session=..."

  // 2. Verify Session
  const sessionReq = new Request(`https://${PROD_API_HOST}/api/auth/session`, {
    headers: {
      Cookie: cookieValue,
      Origin: PROD_ORIGIN,
      "CF-Connecting-IP": DEFAULT_CLIENT_IP,
    },
  });
  const sessionRes = await worker.fetch(sessionReq, env, {});
  assert.equal(sessionRes.status, 200);

  const sessionBody = await sessionRes.json();
  assert.equal(sessionBody.ok, true);
  assert.equal(sessionBody.data.authenticated, true);
  assert.equal(sessionBody.data.username, TEST_USERNAME);
  assert.equal(sessionBody.data.authType, "session");
});

test("7. Missing session returns 401 on GET /api/auth/session", async () => {
  const env = createProdEnv();

  const req = new Request(`https://${PROD_API_HOST}/api/auth/session`, {
    headers: { Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
  });
  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 401);
  const body = await res.json();
  assert.equal(body.ok, false);
});

test("8. Expired session returns 401 on GET /api/auth/session", async () => {
  const mockDb = createMockD1();
  const env = createProdEnv({ DB: mockDb });

  // Create an expired session directly in DB
  const rawToken = generateSessionToken();
  const tokenHash = await hashSessionToken(rawToken);
  mockDb.sessions.set(tokenHash, {
    id: "expired-sess-id",
    token_hash: tokenHash,
    username: TEST_USERNAME,
    created_at: new Date(Date.now() - 36000000).toISOString(),
    expires_at: new Date(Date.now() - 1000).toISOString(), // expired 1s ago
    revoked_at: null,
  });

  const req = new Request(`https://${PROD_API_HOST}/api/auth/session`, {
    headers: {
      Cookie: `techagenz_admin_session=${rawToken}`,
      Origin: PROD_ORIGIN,
      "CF-Connecting-IP": DEFAULT_CLIENT_IP,
    },
  });
  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 401);
});

test("9. Revoked session returns 401 on GET /api/auth/session", async () => {
  const mockDb = createMockD1();
  const env = createProdEnv({ DB: mockDb });

  const rawToken = generateSessionToken();
  const tokenHash = await hashSessionToken(rawToken);
  mockDb.sessions.set(tokenHash, {
    id: "revoked-sess-id",
    token_hash: tokenHash,
    username: TEST_USERNAME,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 3600000).toISOString(),
    revoked_at: new Date().toISOString(), // revoked!
  });

  const res = await worker.fetch(
    new Request(`https://${PROD_API_HOST}/api/auth/session`, {
      headers: { Cookie: `techagenz_admin_session=${rawToken}`, Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
    }),
    env,
    {},
  );
  assert.equal(res.status, 401);
});

test("10. Logout revocation POST /api/auth/logout sets revoked_at in D1 and clears cookie", async () => {
  const mockDb = createMockD1();
  const env = createProdEnv({ DB: mockDb });

  // 1. Login
  const loginReq = new Request(`https://${PROD_API_HOST}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
    body: JSON.stringify({ username: TEST_USERNAME, password: TEST_PASSWORD }),
  });
  const loginRes = await worker.fetch(loginReq, env, {});
  const cookieValue = loginRes.headers.get("Set-Cookie").split(";")[0];

  // 2. Logout
  const logoutReq = new Request(`https://${PROD_API_HOST}/api/auth/logout`, {
    method: "POST",
    headers: {
      Cookie: cookieValue,
      Origin: PROD_ORIGIN,
      "CF-Connecting-IP": DEFAULT_CLIENT_IP,
    },
  });
  const logoutRes = await worker.fetch(logoutReq, env, {});
  assert.equal(logoutRes.status, 200);

  const clearCookie = logoutRes.headers.get("Set-Cookie");
  assert.ok(clearCookie.includes("admin_session="));
  assert.ok(clearCookie.includes("Max-Age=0"));

  // Check DB revoked_at
  const sessionInDb = Array.from(mockDb.sessions.values())[0];
  assert.ok(sessionInDb.revoked_at !== null, "Session must have revoked_at timestamp set");

  // Subsequent check should fail with 401
  const checkReq = new Request(`https://${PROD_API_HOST}/api/auth/session`, {
    headers: { Cookie: cookieValue, Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
  });
  const checkRes = await worker.fetch(checkReq, env, {});
  assert.equal(checkRes.status, 401);
});

test("11. Cookie attributes strictly enforce security (HttpOnly, SameSite=Strict, Secure, Max-Age)", async () => {
  const env = createProdEnv();

  const req = new Request(`https://${PROD_API_HOST}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
    body: JSON.stringify({ username: TEST_USERNAME, password: TEST_PASSWORD }),
  });
  const res = await worker.fetch(req, env, {});
  const setCookie = res.headers.get("Set-Cookie");

  assert.ok(setCookie.includes("HttpOnly"));
  assert.ok(setCookie.includes("SameSite=Strict"));
  assert.ok(setCookie.includes("Secure"));
  assert.ok(setCookie.includes("Path=/"));
  assert.ok(setCookie.includes("Max-Age=28800")); // 8 hours = 28800s
  assert.ok(!setCookie.includes("Domain="));
});

test("12. Only session token hash is stored in D1, not raw plaintext token", async () => {
  const mockDb = createMockD1();
  const env = createProdEnv({ DB: mockDb });

  const req = new Request(`https://${PROD_API_HOST}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
    body: JSON.stringify({ username: TEST_USERNAME, password: TEST_PASSWORD }),
  });
  const res = await worker.fetch(req, env, {});
  const setCookie = res.headers.get("Set-Cookie");
  const rawToken = setCookie.match(/admin_session=([^;]+)/)[1];

  const sessionInDb = Array.from(mockDb.sessions.values())[0];
  assert.notEqual(sessionInDb.token_hash, rawToken, "D1 token_hash must not be raw token");

  const expectedHash = await hashSessionToken(rawToken);
  assert.equal(sessionInDb.token_hash, expectedHash, "D1 must store SHA-256 token hash");
});

test("13. Unauthorized admin GET returns 401 in production", async () => {
  const env = createProdEnv();

  const req = new Request(`https://${PROD_API_HOST}/api/admin`, {
    method: "GET",
    headers: { Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
  });
  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 401);
});

test("14. Unauthorized admin POST/PUT/PATCH/DELETE returns 401 in production", async () => {
  const env = createProdEnv();

  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    const req = new Request(`https://${PROD_API_HOST}/api/admin/blogs`, {
      method,
      headers: { Origin: PROD_ORIGIN,
      "CF-Connecting-IP": DEFAULT_CLIENT_IP, "Content-Type": "application/json" },
      body: method !== "DELETE" ? JSON.stringify({ title: "Test" }) : undefined,
    });
    const res = await worker.fetch(req, env, {});
    assert.equal(res.status, 401, `Method ${method} without auth must return 401`);
  }
});

test("15. Unauthorized R2 upload returns 401 in production", async () => {
  const env = createProdEnv();

  const req = new Request(`https://${PROD_API_HOST}/api/r2/upload`, {
    method: "POST",
    headers: { Origin: PROD_ORIGIN,
      "CF-Connecting-IP": DEFAULT_CLIENT_IP, "Content-Type": "multipart/form-data; boundary=---boundary" },
    body: '---boundary\r\nContent-Disposition: form-data; name="folder"\r\n\r\ntest\r\n---boundary--\r\n',
  });
  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 401);
});

test("16. Unauthorized R2 delete returns 401 in production", async () => {
  const env = createProdEnv();

  const req = new Request(`https://${PROD_API_HOST}/api/r2/test.png`, {
    method: "DELETE",
    headers: { Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
  });
  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 401);
});

test("17. Invalid Origin on state-changing requests returns 403 (CSRF defense)", async () => {
  const mockDb = createMockD1();
  const env = createProdEnv({ DB: mockDb });

  // 1. Valid login to obtain session cookie
  const loginReq = new Request(`https://${PROD_API_HOST}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
    body: JSON.stringify({ username: TEST_USERNAME, password: TEST_PASSWORD }),
  });
  const loginRes = await worker.fetch(loginReq, env, {});
  const cookieValue = loginRes.headers.get("Set-Cookie").split(";")[0];

  // 2. Post from malicious origin
  const maliciousReq = new Request(`https://${PROD_API_HOST}/api/admin/blogs`, {
    method: "POST",
    headers: {
      Cookie: cookieValue,
      Origin: "https://evil.attacker.com",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: "Attacker post" }),
  });
  const maliciousRes = await worker.fetch(maliciousReq, env, {});
  assert.equal(maliciousRes.status, 403, "Invalid Origin must be rejected with 403");

  // 3. Logout from malicious origin
  const maliciousLogout = new Request(`https://${PROD_API_HOST}/api/auth/logout`, {
    method: "POST",
    headers: {
      Cookie: cookieValue,
      Origin: "https://evil.attacker.com",
    },
  });
  const logoutRes = await worker.fetch(maliciousLogout, env, {});
  assert.equal(logoutRes.status, 403, "Logout with invalid Origin must be rejected with 403");
});

test("validateSessionTtlHours: validates integer hours between 1 and 24 and handles defaults", () => {
  assert.equal(validateSessionTtlHours(undefined), 8);
  assert.equal(validateSessionTtlHours(""), 8);
  assert.equal(validateSessionTtlHours("   "), 8);
  assert.equal(validateSessionTtlHours("1"), 1);
  assert.equal(validateSessionTtlHours("8"), 8);
  assert.equal(validateSessionTtlHours("24"), 24);

  // Invalid values
  assert.equal(validateSessionTtlHours("0"), null);
  assert.equal(validateSessionTtlHours("-1"), null);
  assert.equal(validateSessionTtlHours("25"), null);
  assert.equal(validateSessionTtlHours("999"), null);
  assert.equal(validateSessionTtlHours("8.5"), null);
  assert.equal(validateSessionTtlHours("invalid"), null);
});

test("18. Missing ADMIN_LOGIN_RATE_LIMITER returns safe 503 configuration error", async () => {
  const env = createProdEnv({ rateLimiterMissing: true });

  const req = new Request(`https://${PROD_API_HOST}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
    body: JSON.stringify({ username: TEST_USERNAME, password: TEST_PASSWORD }),
  });

  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 503);
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.equal(body.error.code, "SERVICE_UNAVAILABLE");
  assert.equal(body.error.message, "Authentication service is temporarily unavailable");
});

test("19. Thrown error in ADMIN_LOGIN_RATE_LIMITER returns safe 503 error without leak", async () => {
  const env = createProdEnv({ rateLimiterThrows: true });

  const req = new Request(`https://${PROD_API_HOST}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
    body: JSON.stringify({ username: TEST_USERNAME, password: TEST_PASSWORD }),
  });

  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 503);
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.equal(body.error.code, "SERVICE_UNAVAILABLE");
  assert.equal(body.error.message, "Authentication service is temporarily unavailable");
});

test("20. Custom valid session TTL sets matching database expires_at and cookie Max-Age", async () => {
  const mockDb = createMockD1();
  const env = createProdEnv({ DB: mockDb, ADMIN_SESSION_TTL_HOURS: "12" });

  const req = new Request(`https://${PROD_API_HOST}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
    body: JSON.stringify({ username: TEST_USERNAME, password: TEST_PASSWORD }),
  });

  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 200);

  const setCookie = res.headers.get("Set-Cookie");
  assert.ok(setCookie.includes("Max-Age=43200")); // 12 * 3600 = 43200

  const session = Array.from(mockDb.sessions.values())[0];
  const expiresMs = new Date(session.expires_at).getTime();
  const diffHours = (expiresMs - Date.now()) / (3600 * 1000);
  assert.ok(diffHours > 11.9 && diffHours <= 12.1);
});

test("21. Invalid session TTL returns 500 error and creates no session", async () => {
  const mockDb = createMockD1();
  const env = createProdEnv({ DB: mockDb, ADMIN_SESSION_TTL_HOURS: "99" });

  const req = new Request(`https://${PROD_API_HOST}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
    body: JSON.stringify({ username: TEST_USERNAME, password: TEST_PASSWORD }),
  });

  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 500);
  const body = await res.json();
  assert.equal(body.error.code, "CONFIGURATION_ERROR");
  assert.equal(mockDb.sessions.size, 0);
});

test("22. Logout with D1 failure returns safe 503 and does NOT clear session cookie", async () => {
  const mockDb = createMockD1({ failRevocation: true });
  const env = createProdEnv({ DB: mockDb });

  const rawToken = generateSessionToken();
  const tokenHash = await hashSessionToken(rawToken);
  mockDb.sessions.set(tokenHash, {
    id: "active-sess-id",
    token_hash: tokenHash,
    username: TEST_USERNAME,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 3600000).toISOString(),
    revoked_at: null,
  });

  const logoutReq = new Request(`https://${PROD_API_HOST}/api/auth/logout`, {
    method: "POST",
    headers: {
      Cookie: `techagenz_admin_session=${rawToken}`,
      Origin: PROD_ORIGIN,
      "CF-Connecting-IP": DEFAULT_CLIENT_IP,
    },
  });

  const res = await worker.fetch(logoutReq, env, {});
  assert.equal(res.status, 503);
  const body = await res.json();
  assert.equal(body.error.code, "DATABASE_ERROR");
  assert.equal(body.error.message, "Unable to complete logout. Please try again.");
  assert.equal(res.headers.get("Set-Cookie"), null, "Must NOT clear cookie on D1 failure");

  const session = mockDb.sessions.get(tokenHash);
  assert.equal(session.revoked_at, null, "Session must not be marked revoked if D1 failed");
});

test("23. Logout without session cookie returns 200 and clears cookie safely", async () => {
  const env = createProdEnv();

  const logoutReq = new Request(`https://${PROD_API_HOST}/api/auth/logout`, {
    method: "POST",
    headers: { Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
  });

  const res = await worker.fetch(logoutReq, env, {});
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.data.loggedOut, true);
  const clearCookie = res.headers.get("Set-Cookie");
  assert.ok(clearCookie.includes("Max-Age=0"));
});

test("24. Repeated logout succeeds without error", async () => {
  const mockDb = createMockD1();
  const env = createProdEnv({ DB: mockDb });

  const rawToken = generateSessionToken();
  const tokenHash = await hashSessionToken(rawToken);
  mockDb.sessions.set(tokenHash, {
    id: "sess-repeat",
    token_hash: tokenHash,
    username: TEST_USERNAME,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 3600000).toISOString(),
    revoked_at: null,
  });

  const req1 = new Request(`https://${PROD_API_HOST}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: `techagenz_admin_session=${rawToken}`, Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
  });
  const res1 = await worker.fetch(req1, env, {});
  assert.equal(res1.status, 200);

  const req2 = new Request(`https://${PROD_API_HOST}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: `techagenz_admin_session=${rawToken}`, Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
  });
  const res2 = await worker.fetch(req2, env, {});
  assert.equal(res2.status, 200);
  const body2 = await res2.json();
  assert.equal(body2.data.loggedOut, true);
});

test("25. Oversized login request body (> 4096 bytes) returns 413 Payload Too Large", async () => {
  const env = createProdEnv();
  const oversizedPayload = JSON.stringify({
    username: TEST_USERNAME,
    password: "A".repeat(5000),
  });

  const req = new Request(`https://${PROD_API_HOST}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: PROD_ORIGIN,
      "CF-Connecting-IP": DEFAULT_CLIENT_IP,
      "Content-Length": String(oversizedPayload.length),
    },
    body: oversizedPayload,
  });

  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 413);
  const body = await res.json();
  assert.equal(body.error.code, "PAYLOAD_TOO_LARGE");
});

test("26. Username exceeding 128 characters returns 400 Bad Request", async () => {
  const env = createProdEnv();

  const req = new Request(`https://${PROD_API_HOST}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
    body: JSON.stringify({
      username: "u".repeat(129), // 129 chars > 128
      password: TEST_PASSWORD,
    }),
  });

  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error.code, "BAD_REQUEST");
  assert.ok(body.error.message.includes("128"));
});

test("27. Password exceeding 1024 characters returns 400 Bad Request", async () => {
  const env = createProdEnv();

  const req = new Request(`https://${PROD_API_HOST}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
    body: JSON.stringify({
      username: TEST_USERNAME,
      password: "P".repeat(1025), // 1025 chars > 1024
    }),
  });

  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error.code, "BAD_REQUEST");
  assert.ok(body.error.message.includes("1024"));
});

test("28. Empty username or password returns 400 Bad Request", async () => {
  const env = createProdEnv();

  const reqEmptyUser = new Request(`https://${PROD_API_HOST}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
    body: JSON.stringify({ username: "   ", password: TEST_PASSWORD }),
  });
  const resEmptyUser = await worker.fetch(reqEmptyUser, env, {});
  assert.equal(resEmptyUser.status, 400);

  const reqEmptyPass = new Request(`https://${PROD_API_HOST}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: PROD_ORIGIN, "CF-Connecting-IP": DEFAULT_CLIENT_IP },
    body: JSON.stringify({ username: TEST_USERNAME, password: "" }),
  });
  const resEmptyPass = await worker.fetch(reqEmptyPass, env, {});
  assert.equal(resEmptyPass.status, 400);
});
