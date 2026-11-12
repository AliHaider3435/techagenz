import assert from "node:assert/strict";
import test from "node:test";
import { createAdminApiClient, isDevelopmentAdminApi } from "../../src/api/admin-client.ts";

const developmentAdminUrl = "https://api-dev.techagenz.com/api/admin";
const productionAdminUrl = "https://api.techagenz.com/api/admin";

test("admin session-required handling distinguishes development Access from production login", () => {
  assert.equal(isDevelopmentAdminApi(developmentAdminUrl), true);
  assert.equal(isDevelopmentAdminApi(productionAdminUrl), false);
  assert.equal(
    isDevelopmentAdminApi("https://api-dev.techagenz.com.evil.example/api/admin"),
    false,
  );
});

test("admin session probe classifies Cloudflare Access redirects as session-required without following them", async () => {
  let requestUrl;
  let requestOptions;
  const client = createAdminApiClient("https://api-dev.techagenz.com", async (input, init) => {
    requestUrl = String(input);
    requestOptions = init;
    return new Response(null, {
      status: 302,
      headers: { Location: "https://team.cloudflareaccess.com/login" },
    });
  });

  const result = await client.getSession();

  assert.equal(result.state, "session-required");
  assert.equal(requestUrl, "https://api-dev.techagenz.com/api/auth/session");
  assert.equal(requestOptions.redirect, "manual");
  assert.equal(requestOptions.credentials, "include");
});

test("admin session probe classifies an opaque Cloudflare Access redirect as session-required", async () => {
  const client = createAdminApiClient("https://api-dev.techagenz.com", async () => ({
    type: "opaqueredirect",
    status: 0,
  }));

  assert.equal((await client.getSession()).state, "session-required");
});

test("production session probe keeps unauthenticated sessions classified for login redirect", async () => {
  const client = createAdminApiClient(
    "https://api.techagenz.com",
    async () => new Response(null, { status: 401 }),
  );

  assert.equal((await client.getSession()).state, "session-required");
});
