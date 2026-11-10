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
