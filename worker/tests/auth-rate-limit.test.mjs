import assert from "node:assert/strict";
import test from "node:test";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

import { getLoginRateLimitKey, normalizeClientIp } from "../src/lib/enquiry-rate-limit.ts";
import { hashPassword } from "../src/lib/crypto.ts";

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

const PROD_ORIGIN = "https://admin.techagenz.com";
const PROD_API_HOST = "api.techagenz.com";
const TEST_USERNAME = "superadmin";
const TEST_PASSWORD = "CorrectHorseBatteryStaple123!";
const TEST_PASSWORD_HASH = await hashPassword(TEST_PASSWORD);
const TEST_TURNSTILE_TOKEN = "test-turnstile-token";

globalThis.fetch = async (input) => {
  assert.equal(String(input), "https://challenges.cloudflare.com/turnstile/v0/siteverify");
  return new Response(JSON.stringify({ success: true, hostname: "admin.techagenz.com" }), {
    status: 200,
  });
};

function createMockD1() {
  const sessions = new Map();
  return {
    sessions,
    prepare() {
      return {
        bind() {
          return this;
        },
        async run() {
          return { success: true };
        },
        async first() {
          return null;
        },
      };
    },
  };
}

function createProdEnv(overrides = {}) {
  return {
    ENVIRONMENT: "production",
    ADMIN_SHARED_USERNAME: TEST_USERNAME,
    ADMIN_SHARED_PASSWORD_HASH: TEST_PASSWORD_HASH,
    CF_TURNSTILE_SECRET_KEY: "test-secret",
    ADMIN_LOGIN_RATE_LIMITER: {
      async limit() {
        return { success: true };
      },
    },
    DB: createMockD1(),
    ...overrides,
  };
}

function loginRequest(
  headers = {},
  body = {
    username: TEST_USERNAME,
    password: TEST_PASSWORD,
    turnstileToken: TEST_TURNSTILE_TOKEN,
  },
) {
  return new Request(`https://${PROD_API_HOST}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: PROD_ORIGIN,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

// -----------------------------------------------------------------------------
// Unit tests for getLoginRateLimitKey & normalizeClientIp
// -----------------------------------------------------------------------------

test("getLoginRateLimitKey: generates correct IPv4 rate-limit key", () => {
  const req = loginRequest({ "CF-Connecting-IP": "198.51.100.1" });
  assert.equal(getLoginRateLimitKey(req), "admin-login:ipv4:198.51.100.1");
});

test("getLoginRateLimitKey: groups different IPv6 addresses within same /64 subnet into identical key", () => {
  const req1 = loginRequest({ "CF-Connecting-IP": "2001:db8:abcd:12::1" });
  const req2 = loginRequest({ "CF-Connecting-IP": "2001:db8:abcd:12::ffff" });
  const req3 = loginRequest({ "CF-Connecting-IP": "2001:0db8:abcd:0012:0000:0000:0000:0001" });
  const req4 = loginRequest({ "CF-Connecting-IP": "2001:0db8:abcd:0012:ffff:ffff:ffff:ffff" });

  const key1 = getLoginRateLimitKey(req1);
  const key2 = getLoginRateLimitKey(req2);
  const key3 = getLoginRateLimitKey(req3);
  const key4 = getLoginRateLimitKey(req4);

  assert.equal(key1, "admin-login:ipv6:2001:0db8:abcd:0012/64");
  assert.equal(key1, key2);
  assert.equal(key1, key3);
  assert.equal(key1, key4);
});

test("getLoginRateLimitKey: distinguishes different IPv6 /64 subnets", () => {
  const reqSubnet1 = loginRequest({ "CF-Connecting-IP": "2001:db8:abcd:12::1" });
  const reqSubnet2 = loginRequest({ "CF-Connecting-IP": "2001:db8:abcd:13::1" });

  const key1 = getLoginRateLimitKey(reqSubnet1);
  const key2 = getLoginRateLimitKey(reqSubnet2);

  assert.equal(key1, "admin-login:ipv6:2001:0db8:abcd:0012/64");
  assert.equal(key2, "admin-login:ipv6:2001:0db8:abcd:0013/64");
  assert.notEqual(key1, key2);
});

test("getLoginRateLimitKey: returns null for missing or blank client IP", () => {
  const reqNoHeader = loginRequest();
  assert.equal(getLoginRateLimitKey(reqNoHeader), null);

  const reqEmpty = loginRequest({ "CF-Connecting-IP": "" });
  assert.equal(getLoginRateLimitKey(reqEmpty), null);

  const reqWhitespace = loginRequest({ "CF-Connecting-IP": "   " });
  assert.equal(getLoginRateLimitKey(reqWhitespace), null);
});

test("getLoginRateLimitKey: returns null for malformed IP addresses", () => {
  assert.equal(getLoginRateLimitKey(loginRequest({ "CF-Connecting-IP": "not-an-ip" })), null);
  assert.equal(getLoginRateLimitKey(loginRequest({ "CF-Connecting-IP": "999.999.999.999" })), null);
  assert.equal(getLoginRateLimitKey(loginRequest({ "CF-Connecting-IP": "256.0.0.1" })), null);
  assert.equal(getLoginRateLimitKey(loginRequest({ "CF-Connecting-IP": "1.2.3.4.5" })), null);
  assert.equal(getLoginRateLimitKey(loginRequest({ "CF-Connecting-IP": "2001:xyz::1" })), null);
  assert.equal(getLoginRateLimitKey(loginRequest({ "CF-Connecting-IP": ":::1" })), null);
});

test("getLoginRateLimitKey: strictly ignores spoofed forwarding headers", () => {
  // Spoofed headers present alongside valid CF-Connecting-IP
  const reqWithSpoofs = loginRequest({
    "CF-Connecting-IP": "198.51.100.1",
    "X-Forwarded-For": "203.0.113.195, 10.0.0.1",
    "X-Real-IP": "203.0.113.196",
    "True-Client-IP": "203.0.113.197",
    "Client-IP": "203.0.113.198",
  });
  assert.equal(getLoginRateLimitKey(reqWithSpoofs), "admin-login:ipv4:198.51.100.1");

  // Spoofed headers present WITHOUT CF-Connecting-IP must fail (return null)
  const reqOnlySpoofs = loginRequest({
    "X-Forwarded-For": "198.51.100.1",
    "X-Real-IP": "198.51.100.1",
  });
  assert.equal(getLoginRateLimitKey(reqOnlySpoofs), null);
});

test("getLoginRateLimitKey: handles IPv4-mapped IPv6 addresses consistently", () => {
  const req = loginRequest({ "CF-Connecting-IP": "::ffff:198.51.100.1" });
  assert.equal(getLoginRateLimitKey(req), "admin-login:ipv4:198.51.100.1");
});

// -----------------------------------------------------------------------------
// Integration tests with Worker / handleLogin
// -----------------------------------------------------------------------------

test("login rate limiting: fails closed with 503 when CF-Connecting-IP is missing", async () => {
  const env = createProdEnv();
  const req = loginRequest(); // No CF-Connecting-IP

  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 503);
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.equal(body.error.code, "SERVICE_UNAVAILABLE");
  assert.equal(body.error.message, "Authentication service is temporarily unavailable");
});

test("login rate limiting: fails closed with 503 when CF-Connecting-IP is malformed", async () => {
  const env = createProdEnv();
  const req = loginRequest({ "CF-Connecting-IP": "malformed.ip.address" });

  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 503);
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.equal(body.error.code, "SERVICE_UNAVAILABLE");
  assert.equal(body.error.message, "Authentication service is temporarily unavailable");
});

test("login rate limiting: fails closed with 503 when rate limiter throws an exception", async () => {
  const env = createProdEnv({
    ADMIN_LOGIN_RATE_LIMITER: {
      async limit() {
        throw new Error("Cloudflare rate limiting service connection error");
      },
    },
  });
  const req = loginRequest({ "CF-Connecting-IP": "198.51.100.1" });

  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 503);
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.equal(body.error.code, "SERVICE_UNAVAILABLE");
  assert.equal(body.error.message, "Authentication service is temporarily unavailable");
});

test("login rate limiting: returns 429 with Retry-After: 60 when rate limit is exceeded", async () => {
  const env = createProdEnv({
    ADMIN_LOGIN_RATE_LIMITER: {
      async limit() {
        return { success: false };
      },
    },
  });
  const req = loginRequest({ "CF-Connecting-IP": "198.51.100.1" });

  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 429);
  assert.equal(res.headers.get("Retry-After"), "60");
  assert.equal(res.headers.get("Cache-Control"), "no-store, no-cache, must-revalidate");
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.equal(body.error.code, "TOO_MANY_REQUESTS");
  assert.equal(body.error.message, "Too many login attempts. Please try again later.");
});

test("login rate limiting: passes normalized /64 key to rate limiter for IPv6 clients", async () => {
  const passedKeys = [];
  const env = createProdEnv({
    ADMIN_LOGIN_RATE_LIMITER: {
      async limit({ key }) {
        passedKeys.push(key);
        return { success: true };
      },
    },
  });

  const req1 = loginRequest({ "CF-Connecting-IP": "2001:db8:cafe:1::aaaa" });
  const req2 = loginRequest({ "CF-Connecting-IP": "2001:db8:cafe:1::bbbb" });

  const res1 = await worker.fetch(req1, env, {});
  const res2 = await worker.fetch(req2, env, {});

  assert.equal(res1.status, 200);
  assert.equal(res2.status, 200);
  assert.equal(passedKeys.length, 2);
  assert.equal(passedKeys[0], "admin-login:ipv6:2001:0db8:cafe:0001/64");
  assert.equal(passedKeys[1], "admin-login:ipv6:2001:0db8:cafe:0001/64");
  assert.equal(passedKeys[0], passedKeys[1]);
});
