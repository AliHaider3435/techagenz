/**
 * Cryptographic utilities for Tech Agenz Production Shared Team Authentication.
 * Uses standard Web Crypto API (SubtleCrypto) natively supported by Cloudflare Workers.
 */

const DEFAULT_PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BYTES = 32;

export function bytesToHex(bytes: Uint8Array): string {
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

export function hexToBytes(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) {
    return null;
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Constant-time byte array comparison.
 */
export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  let c = 0;
  for (let i = 0; i < a.byteLength; i++) {
    c |= a[i] ^ b[i];
  }
  return c === 0;
}

/**
 * Constant-time string comparison.
 */
export function timingSafeStringEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aBytes = enc.encode(a);
  const bBytes = enc.encode(b);
  if (aBytes.byteLength !== bBytes.byteLength) {
    // Perform dummy comparison of equal length to avoid timing leaks
    timingSafeEqual(aBytes, aBytes);
    return false;
  }
  return timingSafeEqual(aBytes, bBytes);
}

/**
 * Hash a password using PBKDF2-SHA256 with a unique random salt.
 * Format: pbkdf2:sha256:<iterations>:<salt_hex>:<hash_hex>
 */
export async function hashPassword(
  password: string,
  iterations = DEFAULT_PBKDF2_ITERATIONS,
): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));

  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);

  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_BYTES * 8,
  );

  const saltHex = bytesToHex(salt);
  const hashHex = bytesToHex(new Uint8Array(derived));

  return `pbkdf2_sha256$${iterations}$${saltHex}$${hashHex}`;
}

/**
 * Verify a plaintext password against a stored PBKDF2 hash using constant-time comparison.
 * Accepts both pbkdf2_sha256$<iterations>$<salt>$<hash> and pbkdf2:sha256:<iterations>:<salt>:<hash>.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (typeof password !== "string" || typeof storedHash !== "string") {
    return false;
  }

  let iterations = 0;
  let saltHex = "";
  let hashHex = "";

  if (storedHash.includes("$")) {
    const parts = storedHash.split("$");
    if (parts.length === 4 && (parts[0] === "pbkdf2_sha256" || parts[0] === "pbkdf2-sha256")) {
      iterations = parseInt(parts[1], 10);
      saltHex = parts[2];
      hashHex = parts[3];
    }
  } else if (storedHash.includes(":")) {
    const parts = storedHash.split(":");
    if (parts.length === 5 && parts[0] === "pbkdf2" && parts[1] === "sha256") {
      iterations = parseInt(parts[2], 10);
      saltHex = parts[3];
      hashHex = parts[4];
    }
  }

  if (!iterations || !saltHex || !hashHex) {
    return false;
  }

  if (!Number.isInteger(iterations) || iterations < 10_000 || iterations > 1_000_000) {
    return false;
  }

  const salt = hexToBytes(saltHex);
  const expectedHash = hexToBytes(hashHex);

  if (
    !salt ||
    !expectedHash ||
    salt.byteLength !== SALT_BYTES ||
    expectedHash.byteLength !== KEY_BYTES
  ) {
    return false;
  }

  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);

  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_BYTES * 8,
  );

  return timingSafeEqual(new Uint8Array(derived), expectedHash);
}

/**
 * Dummy password verification with fixed work factor to mitigate timing side-channels
 * when a username does not match.
 */
export async function dummyVerifyPassword(): Promise<void> {
  const enc = new TextEncoder();
  const dummySalt = new Uint8Array(SALT_BYTES);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode("invalid-dummy-password"),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: dummySalt,
      iterations: DEFAULT_PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_BYTES * 8,
  );
}

/**
 * Generate a cryptographically secure random session token (64-character hex string).
 */
export function generateSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToHex(bytes);
}

/**
 * Generate a UUID v4 string for session IDs.
 */
export function generateUuid(): string {
  return crypto.randomUUID();
}

/**
 * Hash a session token with SHA-256 to ensure raw tokens are never stored at rest in D1.
 */
export async function hashSessionToken(token: string): Promise<string> {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(token));
  return bytesToHex(new Uint8Array(digest));
}

/**
 * Validate ADMIN_SESSION_TTL_HOURS.
 * Default to 8 hours when unset.
 * Accept only integer values from 1 through 24.
 * Return validated integer or null if invalid.
 */
export function validateSessionTtlHours(raw: string | undefined): number | null {
  if (raw === undefined || raw === null || raw.trim() === "") {
    return 8;
  }
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  const val = Number(trimmed);
  if (!Number.isInteger(val) || val < 1 || val > 24) {
    return null;
  }
  return val;
}
