import assert from "node:assert/strict";
import test from "node:test";

import { checkEnquiryRateLimit, getEnquiryRateLimitKey } from "../src/lib/enquiry-rate-limit.ts";

function request(headers = {}) {
  return new Request("https://worker.test/api/enquiries", { headers });
}

test("uses only Cloudflare client IP, not spoofable forwarding headers", () => {
  assert.equal(
    getEnquiryRateLimitKey(
      request({
        "CF-Connecting-IP": "192.0.2.10",
        "X-Forwarded-For": "198.51.100.77",
      }),
    ),
    "public-enquiries:ipv4:192.0.2.10",
  );
  assert.equal(getEnquiryRateLimitKey(request({ "X-Forwarded-For": "198.51.100.77" })), null);
});

test("normalizes IPv6 clients to their /64 to limit address rotation", () => {
  assert.equal(
    getEnquiryRateLimitKey(request({ "CF-Connecting-IP": "2001:db8:abcd:12::1" })),
    getEnquiryRateLimitKey(request({ "CF-Connecting-IP": "2001:db8:abcd:12::ffff" })),
  );
  assert.notEqual(
    getEnquiryRateLimitKey(request({ "CF-Connecting-IP": "2001:db8:abcd:12::1" })),
    getEnquiryRateLimitKey(request({ "CF-Connecting-IP": "2001:db8:abcd:13::1" })),
  );
});

test("rejects invalid client IPs and ignores IPv4-mapped IPv6 address rotation", () => {
  assert.equal(getEnquiryRateLimitKey(request({ "CF-Connecting-IP": "not-an-ip" })), null);
  assert.equal(
    getEnquiryRateLimitKey(request({ "CF-Connecting-IP": "::ffff:192.0.2.10" })),
    "public-enquiries:ipv4:192.0.2.10",
  );
});

test("returns limited when the Cloudflare binding denies a request", async () => {
  const keys = [];
  const limiter = {
    async limit({ key }) {
      keys.push(key);
      return { success: keys.length <= 5 };
    },
  };
  const clientRequest = request({ "CF-Connecting-IP": "192.0.2.10" });

  for (let count = 0; count < 5; count += 1) {
    assert.equal(await checkEnquiryRateLimit(clientRequest, limiter), "allowed");
  }
  assert.equal(await checkEnquiryRateLimit(clientRequest, limiter), "limited");
  assert.ok(keys.every((key) => key === "public-enquiries:ipv4:192.0.2.10"));
});

test("fails closed when the client IP is unavailable or the binding errors", async () => {
  const unusedLimiter = {
    async limit() {
      throw new Error("must not be called");
    },
  };
  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    assert.equal(await checkEnquiryRateLimit(request(), unusedLimiter), "unavailable");

    const failingLimiter = {
      async limit() {
        throw new Error("rate limit unavailable");
      },
    };
    assert.equal(
      await checkEnquiryRateLimit(request({ "CF-Connecting-IP": "192.0.2.10" }), failingLimiter),
      "unavailable",
    );
  } finally {
    console.error = originalConsoleError;
  }
});
