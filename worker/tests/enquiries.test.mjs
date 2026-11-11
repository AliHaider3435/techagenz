import assert from "node:assert/strict";
import { build } from "esbuild";
import test from "node:test";

const { outputFiles } = await build({
  entryPoints: ["src/routes/enquiries.ts"],
  bundle: true,
  format: "esm",
  platform: "browser",
  write: false,
});
const { submitEnquiry } = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString("base64")}`
);

function request(body, ip = "192.0.2.10") {
  return new Request("https://worker.test/api/enquiries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CF-Connecting-IP": ip,
    },
    body: JSON.stringify(body),
  });
}

function testEnvironment({
  rateLimitSuccess = true,
  turnstileSecret = "test-secret",
  resendApiKey = "",
} = {}) {
  let writes = 0;
  const env = {
    ENQUIRY_RATE_LIMITER: {
      async limit() {
        return { success: rateLimitSuccess };
      },
    },
    CF_TURNSTILE_SECRET_KEY: turnstileSecret,
    DB: {
      prepare() {
        return {
          bind() {
            return {
              async run() {
                writes += 1;
                return { success: true };
              },
            };
          },
        };
      },
    },
    ASSETS: {},
    ENVIRONMENT: "test",
    RESEND_API_KEY: resendApiKey,
    CF_ACCESS_TEAM_DOMAIN: "",
    CF_ACCESS_AUD: "",
  };
  return {
    env,
    get writes() {
      return writes;
    },
  };
}

async function withEmailFetch(resendResponse, callback) {
  const originalFetch = globalThis.fetch;
  let emailRequests = 0;
  globalThis.fetch = async (input) => {
    if (String(input).includes("challenges.cloudflare.com")) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
    if (String(input).includes("api.resend.com")) {
      emailRequests += 1;
      return resendResponse;
    }
    throw new Error("Unexpected mocked fetch URL");
  };

  try {
    return await callback(() => emailRequests);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

const validFields = {
  name: "Test User",
  email: "test@example.com",
  company: "",
  message: "A valid test enquiry message",
};

test("Worker enquiry endpoint rejects missing Turnstile token without a D1 write", async () => {
  const environment = testEnvironment();
  const response = await submitEnquiry(request(validFields), environment.env);
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.equal(body.ok, false);
  assert.equal(body.error.code, "REQUEST_ERROR");
  assert.equal(body.error.message, "Turnstile token is required");
  assert.equal(environment.writes, 0);
});

test("Worker enquiry endpoint fails closed without a Turnstile secret", async () => {
  const environment = testEnvironment({ turnstileSecret: "" });
  const response = await submitEnquiry(
    request({ ...validFields, turnstileToken: "test-token" }),
    environment.env,
  );
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.equal(body.ok, false);
  assert.equal(body.error.code, "REQUEST_ERROR");
  assert.equal(body.error.message, "Bot protection check failed. Please try again.");
  assert.equal(environment.writes, 0);
});

test("Worker enquiry endpoint rejects invalid Turnstile verification without a D1 write", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ success: false }), { status: 200 });
  try {
    const environment = testEnvironment();
    const response = await submitEnquiry(
      request({ ...validFields, turnstileToken: "invalid-test-token" }),
      environment.env,
    );
    const body = await response.json();

    assert.equal(response.status, 422);
    assert.equal(body.ok, false);
    assert.equal(body.error.code, "REQUEST_ERROR");
    assert.equal(body.error.message, "Bot protection check failed. Please try again.");
    assert.equal(environment.writes, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Worker enquiry endpoint returns 429 with Retry-After when rate limited", async () => {
  const environment = testEnvironment({ rateLimitSuccess: false });
  const response = await submitEnquiry(
    request({ ...validFields, turnstileToken: "any-token" }),
    environment.env,
  );

  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "60");
  assert.equal(environment.writes, 0);
});

test("Worker reports D1 save and Resend acceptance separately", async () => {
  await withEmailFetch(new Response("{}", { status: 200 }), async (emailRequests) => {
    const environment = testEnvironment({ resendApiKey: "test-resend-key" });
    const response = await submitEnquiry(
      request({ ...validFields, turnstileToken: "valid-test-token" }),
      environment.env,
    );
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.data.enquirySaved, true);
    assert.equal(body.data.emailNotification, "accepted");
    assert.equal(environment.writes, 1);
    assert.equal(emailRequests(), 1);
  });
});

test("Worker reports missing Resend key without losing the saved enquiry", async () => {
  await withEmailFetch(new Response("{}", { status: 200 }), async (emailRequests) => {
    const environment = testEnvironment();
    const response = await submitEnquiry(
      request({ ...validFields, turnstileToken: "valid-test-token" }),
      environment.env,
    );
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.data.enquirySaved, true);
    assert.equal(body.data.emailNotification, "not_configured");
    assert.equal(environment.writes, 1);
    assert.equal(emailRequests(), 0);
  });
});

test("Worker reports Resend failure without exposing provider details or losing the enquiry", async () => {
  await withEmailFetch(
    new Response("private provider diagnostics", { status: 500 }),
    async (emailRequests) => {
      const environment = testEnvironment({ resendApiKey: "test-resend-key" });
      const response = await submitEnquiry(
        request({ ...validFields, turnstileToken: "valid-test-token" }),
        environment.env,
      );
      const responseText = await response.text();
      const body = JSON.parse(responseText);

      assert.equal(response.status, 201);
      assert.equal(body.data.enquirySaved, true);
      assert.equal(body.data.emailNotification, "failed");
      assert.equal(environment.writes, 1);
      assert.equal(emailRequests(), 1);
      assert.doesNotMatch(responseText, /private provider diagnostics|test-resend-key/);
    },
  );
});
