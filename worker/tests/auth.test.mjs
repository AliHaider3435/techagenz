import assert from "node:assert/strict";
import { build } from "esbuild";
import { generateKeyPair, exportJWK, SignJWT } from "jose";
import test from "node:test";

const { outputFiles } = await build({
  entryPoints: ["src/middleware/auth.ts"],
  bundle: true,
  format: "esm",
  platform: "browser",
  write: false,
});
const auth = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString("base64")}`
);

const teamDomain = "broad-voice-f670.cloudflareaccess.com";
const issuer = `https://${teamDomain}`;
const audience = "4337c569505d0367294fd5adbdc57d49cbe1c0faf4b62f4a27eb8de2ff943a19";
const apiHost = "api-dev.techagenz.com";
const primary = await generateKeyPair("RS256", { modulusLength: 2048 });
const alternate = await generateKeyPair("RS256", { modulusLength: 2048 });

async function jwkFor(publicKey, kid) {
  return { ...(await exportJWK(publicKey)), kid, alg: "RS256", use: "sig" };
}

const primaryJwk = await jwkFor(primary.publicKey, "key-1");
const alternateJwk = await jwkFor(alternate.publicKey, "key-2");

async function signedToken({ keyPair = primary, kid = "key-1", claims = {}, alg = "RS256" } = {}) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: issuer,
    aud: audience,
    sub: "access-user-1",
    email: "Admin@TechAgenz.com",
    iat: now,
    exp: now + 300,
    ...claims,
  };
  const signingKey =
    alg === "HS256" ? new TextEncoder().encode("test-only-secret") : keyPair.privateKey;
  return new SignJWT(payload).setProtectedHeader({ alg, kid }).sign(signingKey);
}

function jwksResponse(keys) {
  return new Response(JSON.stringify({ keys }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function environment(overrides = {}) {
  return {
    CF_ACCESS_TEAM_DOMAIN: teamDomain,
    CF_ACCESS_AUD: audience,
    CF_ACCESS_API_HOST: apiHost,
    ADMIN_ALLOWED_EMAILS: "admin@techagenz.com",
    ...overrides,
  };
}

function accessRequest(token, url = `https://${apiHost}/api/admin/team`) {
  const headers = token ? { "Cf-Access-Jwt-Assertion": token } : {};
  return new Request(url, { headers });
}

function verifierFor(fetcher) {
  return auth.createAccessJwtVerifier({ fetcher });
}

test("accepts a correctly signed Access token from the configured fixed JWKS endpoint", async () => {
  const requestedUrls = [];
  const verify = verifierFor(async (url) => {
    requestedUrls.push(url);
    return jwksResponse([primaryJwk]);
  });
  const token = await signedToken();

  const identity = await verify(accessRequest(token), environment());

  assert.equal(identity.email, "Admin@TechAgenz.com");
  assert.equal(identity.sub, "access-user-1");
  assert.equal(requestedUrls.length, 1);
  assert.equal(requestedUrls[0], `https://${teamDomain}/cdn-cgi/access/certs`);
});

test("rejects missing and malformed assertions without fetching JWKS", async () => {
  let fetches = 0;
  const verify = verifierFor(async () => {
    fetches += 1;
    return jwksResponse([primaryJwk]);
  });

  assert.equal(await verify(accessRequest(undefined), environment()), null);
  assert.equal(await verify(accessRequest("not-a-jwt"), environment()), null);
  const bearerOnly = new Request(`https://${apiHost}/api/admin/team`, {
    headers: { Authorization: `Bearer ${await signedToken()}` },
  });
  assert.equal(await verify(bearerOnly, environment()), null);
  assert.equal(fetches, 0);
});

test("rejects invalid signatures and unsupported algorithms", async () => {
  const verify = verifierFor(async () => jwksResponse([primaryJwk]));
  const invalidSignature = await signedToken({ keyPair: alternate, kid: "key-1" });
  const unsupportedAlgorithm = await signedToken({ alg: "HS256" });

  assert.equal(await verify(accessRequest(invalidSignature), environment()), null);
  assert.equal(await verify(accessRequest(unsupportedAlgorithm), environment()), null);
});

test("rejects wrong issuer and audience", async () => {
  const verify = verifierFor(async () => jwksResponse([primaryJwk]));

  assert.equal(
    await verify(
      accessRequest(await signedToken({ claims: { iss: "https://other.cloudflareaccess.com" } })),
      environment(),
    ),
    null,
  );
  assert.equal(
    await verify(
      accessRequest(await signedToken({ claims: { aud: "wrong-audience" } })),
      environment(),
    ),
    null,
  );
});

test("rejects expired, future not-before, and future issued-at claims", async () => {
  const verify = verifierFor(async () => jwksResponse([primaryJwk]));
  const now = Math.floor(Date.now() / 1000);

  assert.equal(
    await verify(accessRequest(await signedToken({ claims: { exp: now - 120 } })), environment()),
    null,
  );
  assert.equal(
    await verify(accessRequest(await signedToken({ claims: { nbf: now + 120 } })), environment()),
    null,
  );
  assert.equal(
    await verify(accessRequest(await signedToken({ claims: { iat: now + 120 } })), environment()),
    null,
  );
});

test("rejects tokens missing required identity claims", async () => {
  const verify = verifierFor(async () => jwksResponse([primaryJwk]));

  for (const claims of [
    { sub: undefined },
    { email: undefined },
    { iat: undefined },
    { iat: "not-a-number" },
    { iat: Math.floor(Date.now() / 1000) + 10, exp: Math.floor(Date.now() / 1000) + 5 },
    { exp: undefined },
  ]) {
    const token = await signedToken({ claims });
    assert.equal(await verify(accessRequest(token), environment()), null);
  }
});

test("rejects unknown kids when the refreshed JWKS still lacks the key", async () => {
  let fetches = 0;
  const verify = verifierFor(async () => {
    fetches += 1;
    return jwksResponse([primaryJwk]);
  });
  const token = await signedToken({ keyPair: alternate, kid: "unknown-key" });

  assert.equal(await verify(accessRequest(token), environment()), null);
  assert.equal(fetches, 2);
});

test("refreshes cached JWKS for key rotation and accepts the rotated key", async () => {
  let activeKeys = [primaryJwk];
  let fetches = 0;
  const verify = verifierFor(async () => {
    fetches += 1;
    return jwksResponse(activeKeys);
  });

  assert.ok(await verify(accessRequest(await signedToken()), environment()));
  activeKeys = [primaryJwk, alternateJwk];
  assert.ok(
    await verify(
      accessRequest(await signedToken({ keyPair: alternate, kid: "key-2" })),
      environment(),
    ),
  );
  assert.equal(fetches, 2);
});

test("fails closed on unavailable, malformed, or invalid JWKS", async () => {
  const unavailable = verifierFor(async () => new Response("", { status: 503 }));
  const malformed = verifierFor(async () => new Response("{not-json", { status: 200 }));
  const noSupportedKeys = verifierFor(async () =>
    jwksResponse([{ kty: "EC", kid: "unsupported", x: "x", y: "y" }]),
  );
  const token = await signedToken();

  assert.equal(await unavailable(accessRequest(token), environment()), null);
  assert.equal(await malformed(accessRequest(token), environment()), null);
  assert.equal(await noSupportedKeys(accessRequest(token), environment()), null);
});

test("rejects missing or invalid Access configuration", async () => {
  let fetches = 0;
  const verify = verifierFor(async () => {
    fetches += 1;
    return jwksResponse([primaryJwk]);
  });
  const token = await signedToken();

  assert.equal(
    await verify(accessRequest(token), environment({ CF_ACCESS_TEAM_DOMAIN: "https://evil.test" })),
    null,
  );
  assert.equal(await verify(accessRequest(token), environment({ CF_ACCESS_AUD: "" })), null);
  assert.equal(fetches, 0);
});

test("administrator allow-list requires exact normalized email matches", () => {
  assert.equal(auth.isAdministrator("Admin@TechAgenz.com", " admin@techagenz.com "), true);
  assert.equal(
    auth.isAdministrator("admin@techagenz.com.attacker.test", "admin@techagenz.com"),
    false,
  );
  assert.equal(auth.isAdministrator("admin@techagenz.com", "techagenz.com"), false);
  assert.equal(auth.isAdministrator("admin@techagenz.com", ""), false);
  assert.equal(auth.isAdministrator("admin@techagenz.com", "not-an-email"), false);
});
