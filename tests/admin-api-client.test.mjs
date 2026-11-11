import assert from "node:assert/strict";
import test from "node:test";
import { createAdminApiClient, resolveAdminApiBaseUrl } from "../src/api/admin-client.ts";

const apiBaseUrl = "https://api-dev.techagenz.com";

test("admin client requires an explicit API base and rejects workers.dev", () => {
  assert.equal(resolveAdminApiBaseUrl(undefined), null);
  assert.equal(resolveAdminApiBaseUrl(""), null);
  assert.equal(resolveAdminApiBaseUrl("https://techagenz-api-dev.haider-ly5617.workers.dev"), null);
  assert.equal(resolveAdminApiBaseUrl("http://api.example.com"), null);
  assert.equal(resolveAdminApiBaseUrl("https://user:password@api.example.com"), null);
  assert.equal(resolveAdminApiBaseUrl("https://api.example.com/path"), null);
  assert.equal(resolveAdminApiBaseUrl("https://api-dev.techagenz.com/"), apiBaseUrl);
});

test("unconfigured client does not issue a request", async () => {
  let fetchCalls = 0;
  const client = createAdminApiClient(undefined, async () => {
    fetchCalls += 1;
    return new Response();
  });

  assert.equal(client.accessUrl, null);
  assert.deepEqual(await client.verifyAccess(), { state: "unconfigured" });
  assert.equal(fetchCalls, 0);
});

test("admin authorization probe includes browser credentials without Access headers", async () => {
  let capturedUrl;
  let capturedInit;
  const client = createAdminApiClient(apiBaseUrl, async (url, init) => {
    capturedUrl = String(url);
    capturedInit = init;
    return new Response(JSON.stringify({ ok: false, error: "Not implemented", status: 501 }), {
      status: 501,
      headers: { "Content-Type": "application/json" },
    });
  });

  assert.deepEqual(await client.verifyAccess(), { state: "authorized-read-only" });
  assert.equal(capturedUrl, `${apiBaseUrl}/api/admin`);
  assert.equal(capturedInit.method, "GET");
  assert.equal(capturedInit.credentials, "include");
  assert.equal(capturedInit.cache, "no-store");
  assert.equal(capturedInit.redirect, "manual");
  assert.deepEqual(Object.keys(capturedInit.headers), ["Accept"]);
  assert.equal(client.accessUrl, `${apiBaseUrl}/api/admin`);
});

test("admin authorization probe maps unauthenticated and forbidden responses safely", async () => {
  const unauthenticated = createAdminApiClient(
    apiBaseUrl,
    async () => new Response(null, { status: 401 }),
  );
  const redirected = createAdminApiClient(
    apiBaseUrl,
    async () =>
      new Response(null, { status: 302, headers: { Location: "https://access.example/login" } }),
  );
  const forbidden = createAdminApiClient(
    apiBaseUrl,
    async () => new Response(null, { status: 403 }),
  );

  assert.deepEqual(await unauthenticated.verifyAccess(), { state: "session-required" });
  assert.deepEqual(await redirected.verifyAccess(), { state: "session-required" });
  assert.deepEqual(await forbidden.verifyAccess(), { state: "forbidden" });
});

test("unexpected responses and network errors do not claim authorization", async () => {
  const unexpected = createAdminApiClient(
    apiBaseUrl,
    async () =>
      new Response(JSON.stringify({ ok: false, error: "Other response", status: 501 }), {
        status: 501,
      }),
  );
  const serverError = createAdminApiClient(
    apiBaseUrl,
    async () => new Response("internal details", { status: 500 }),
  );
  const networkError = createAdminApiClient(apiBaseUrl, async () => {
    throw new Error("private network error");
  });

  assert.deepEqual(await unexpected.verifyAccess(), { state: "unavailable" });
  assert.deepEqual(await serverError.verifyAccess(), { state: "unavailable" });
  assert.deepEqual(await networkError.verifyAccess(), { state: "unavailable" });
});

test("admin client login sends credentials with credentials: 'include'", async () => {
  let capturedUrl;
  let capturedInit;

  const client = createAdminApiClient(apiBaseUrl, async (url, init) => {
    capturedUrl = String(url);
    capturedInit = init;
    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          authenticated: true,
          username: "admin",
          authType: "session",
          expiresAt: "2026-11-12T00:00:00Z",
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });

  const res = await client.login("admin", "secret123");
  assert.equal(capturedUrl, `${apiBaseUrl}/api/auth/login`);
  assert.equal(capturedInit.method, "POST");
  assert.equal(capturedInit.credentials, "include");
  assert.equal(JSON.parse(capturedInit.body).username, "admin");
  assert.equal(res.username, "admin");
  assert.equal(res.authType, "session");
});

test("admin client logout sends POST /api/auth/logout with credentials: 'include'", async () => {
  let capturedUrl;
  let capturedInit;

  const client = createAdminApiClient(apiBaseUrl, async (url, init) => {
    capturedUrl = String(url);
    capturedInit = init;
    return new Response(JSON.stringify({ ok: true, data: { loggedOut: true } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  await client.logout();
  assert.equal(capturedUrl, `${apiBaseUrl}/api/auth/logout`);
  assert.equal(capturedInit.method, "POST");
  assert.equal(capturedInit.credentials, "include");
});

test("admin client logout throws AdminApiClientError on HTTP failure", async () => {
  const client = createAdminApiClient(apiBaseUrl, async () => {
    return new Response(
      JSON.stringify({
        ok: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Unable to complete logout. Please try again.",
        },
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  });

  await assert.rejects(
    async () => {
      await client.logout();
    },
    (err) => {
      assert.equal(err.status, 503);
      assert.equal(err.code, "DATABASE_ERROR");
      assert.equal(err.message, "Unable to complete logout. Please try again.");
      return true;
    },
  );
});

test("admin client logout throws AdminApiClientError on network failure", async () => {
  const client = createAdminApiClient(apiBaseUrl, async () => {
    throw new Error("Connection terminated");
  });

  await assert.rejects(
    async () => {
      await client.logout();
    },
    (err) => {
      assert.ok(err.message.includes("Connection terminated"));
      return true;
    },
  );
});

test("admin client getSession calls GET /api/auth/session and maps response", async () => {
  let capturedUrl;

  const client = createAdminApiClient(apiBaseUrl, async (url) => {
    capturedUrl = String(url);
    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          authenticated: true,
          username: "admin",
          authType: "session",
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });

  const res = await client.getSession();
  assert.equal(capturedUrl, `${apiBaseUrl}/api/auth/session`);
  assert.equal(res.state, "authorized");
  assert.equal(res.username, "admin");
  assert.equal(res.authType, "session");
});

test("verifyAccess maps production session response with username and authType", async () => {
  const client = createAdminApiClient(apiBaseUrl, async () => {
    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          status: "authorized",
          username: "superadmin",
          authType: "session",
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });

  const res = await client.verifyAccess();
  assert.equal(res.state, "authorized");
  assert.equal(res.username, "superadmin");
  assert.equal(res.authType, "session");
});
