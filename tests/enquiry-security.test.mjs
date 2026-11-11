import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import vercelEnquiryHandler from "../api/send-enquiry.ts";
import { createWorkerEnquiryRequest, getWorkerEnquiryEndpoint } from "../src/api/send-enquiry.ts";
import nitroEnquiryHandler from "../server/api/send-enquiry.post.ts";
import { getResponseStatus, mockEvent } from "h3";

test("legacy Vercel enquiry endpoint is permanently disabled", async () => {
  let statusCode;
  let payload;
  const response = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(value) {
      payload = value;
      return this;
    },
  };

  await vercelEnquiryHandler(
    { method: "POST", body: { name: "Direct request", email: "attacker@example.com" } },
    response,
  );

  assert.equal(statusCode, 410);
  assert.equal(payload.success, false);
});

test("legacy Nitro enquiry endpoint is permanently disabled", async () => {
  const event = mockEvent(
    new Request("https://local.test/api/send-enquiry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Direct request", email: "attacker@example.com" }),
    }),
  );

  const payload = await nitroEnquiryHandler(event);

  assert.equal(getResponseStatus(event), 410);
  assert.equal(payload.success, false);
});

test("both frontend enquiry forms use the Worker helper and Turnstile widget", async () => {
  const [contact, homepage] = await Promise.all([
    readFile(new URL("../src/routes/contact.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8"),
  ]);

  for (const source of [contact, homepage]) {
    assert.match(source, /submitEnquiry\(formData, turnstileToken\)/);
    assert.match(source, /<TurnstileWidget/);
    assert.doesNotMatch(source, /fetch\s*\(\s*["'`][^"'`]*\/api\/send-enquiry/);
    assert.match(source, /Your enquiry was saved/);
    assert.doesNotMatch(source, /message has been sent|email you back within 24 hours/);
  }
});

test("frontend requests include Turnstile token and target only the HTTPS Worker endpoint", () => {
  const formData = {
    name: "Test User",
    email: "test@example.com",
    company: "",
    message: "A test enquiry message",
  };
  const request = createWorkerEnquiryRequest(
    "https://techagenz-api-dev.haider-ly5617.workers.dev/",
    formData,
    "turnstile-test-token",
  );

  assert.equal(
    getWorkerEnquiryEndpoint("https://techagenz-api-dev.haider-ly5617.workers.dev"),
    "https://techagenz-api-dev.haider-ly5617.workers.dev/api/enquiries",
  );
  assert.equal(
    request.endpoint,
    "https://techagenz-api-dev.haider-ly5617.workers.dev/api/enquiries",
  );
  assert.equal(request.init.method, "POST");
  assert.equal(JSON.parse(request.init.body).turnstileToken, "turnstile-test-token");
  assert.throws(
    () => createWorkerEnquiryRequest(undefined, formData, "turnstile-test-token"),
    /not configured/,
  );
  assert.throws(
    () => createWorkerEnquiryRequest("http://example.com", formData, "turnstile-test-token"),
    /HTTPS/,
  );
  assert.throws(
    () => createWorkerEnquiryRequest("https://worker.example", formData, ""),
    /security check/,
  );
});
