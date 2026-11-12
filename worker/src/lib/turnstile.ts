/**
 * Cloudflare Turnstile server-side token validation.
 *
 * Documentation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 *
 * Never use the secret key on the frontend — it must only exist in
 * Cloudflare Worker secrets (wrangler secret put CF_TURNSTILE_SECRET_KEY).
 */

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
  action?: string;
  cdata?: string;
}

/**
 * Verifies a Turnstile token against the Cloudflare siteverify API.
 *
 * @param token            - The token from the user's browser (from widget callback)
 * @param secretKey        - CF_TURNSTILE_SECRET_KEY (injected via wrangler secret)
 * @param expectedHostname - The explicitly configured hostname that must match Siteverify.
 *                           Do NOT pass a client-supplied value here.
 * @param ip               - Optional visitor IP (CF-Connecting-IP header) for extra validation
 * @returns true if the token is valid and hostname matches, false otherwise (fail-closed)
 */
export async function validateTurnstile(
  token: string,
  secretKey: string,
  expectedHostname: string,
  ip?: string,
): Promise<boolean> {
  if (!token.trim()) return false;
  if (!secretKey.trim()) {
    console.error("[Turnstile] CF_TURNSTILE_SECRET_KEY is not set — rejecting validation");
    return false;
  }
  if (!expectedHostname.trim()) {
    console.error("[Turnstile] Expected hostname is not configured — rejecting validation");
    return false;
  }

  const formData = new FormData();
  formData.append("secret", secretKey);
  formData.append("response", token);
  if (ip) formData.append("remoteip", ip);

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("[Turnstile] Verification HTTP error:", response.status);
      return false;
    }

    const result = await response.json<TurnstileVerifyResponse>();

    if (result.success !== true) {
      console.warn("[Turnstile] Verification failed:", result["error-codes"]);
      return false;
    }

    if (result.hostname !== expectedHostname) {
      console.warn(
        `[Turnstile] Hostname mismatch: expected "${expectedHostname}", got "${result.hostname ?? "(missing)"}"`,
      );
      return false;
    }

    return true;
  } catch {
    console.error("[Turnstile] Siteverify request failed — rejecting validation");
    return false;
  }
}
