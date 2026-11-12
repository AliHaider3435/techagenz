import { Env } from "../types";
import { jsonResponse, errorResponse } from "../middleware/error";
import { validateTurnstile } from "../lib/turnstile";
import { sendEnquiryEmail } from "../lib/resend";
import { checkEnquiryRateLimit } from "../lib/enquiry-rate-limit";

/**
 * POST /api/enquiries
 * Public endpoint — protected by Cloudflare Turnstile.
 * Saves the enquiry to D1 and sends a notification email via Resend.
 */
export async function submitEnquiry(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  const rateLimitResult = await checkEnquiryRateLimit(request, env.ENQUIRY_RATE_LIMITER);
  if (rateLimitResult === "limited") {
    const response = errorResponse("Too many enquiry submissions. Please try again later.", 429);
    response.headers.set("Retry-After", "60");
    return response;
  }
  if (rateLimitResult === "unavailable") {
    return errorResponse("Enquiry protection is temporarily unavailable.", 503);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json<Record<string, unknown>>();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  // ── Validate required fields ───────────────────────────────────────────────
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken.trim() : "";

  if (!name || name.length < 2) return errorResponse("Name is required (min 2 chars)", 422);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return errorResponse("Valid email is required", 422);
  if (!message || message.length < 10)
    return errorResponse("Message is required (min 10 chars)", 422);
  if (!turnstileToken) return errorResponse("Turnstile token is required", 422);

  // ── Optional fields ────────────────────────────────────────────────────────
  const phone = typeof body.phone === "string" ? body.phone.trim() : null;
  const company = typeof body.company === "string" ? body.company.trim() : null;
  const service = typeof body.service === "string" ? body.service.trim() : null;
  const budget = typeof body.budget === "string" ? body.budget.trim() : null;

  // ── Turnstile server-side verification ─────────────────────────────────────
  const expectedHostname =
    env.ENVIRONMENT === "production"
      ? "techagenz.com"
      : env.TURNSTILE_ENQUIRY_HOSTNAME?.trim() || "techagenz.com";

  const ip = request.headers.get("CF-Connecting-IP") ?? undefined;
  const turnstileValid = await validateTurnstile(
    turnstileToken,
    env.CF_TURNSTILE_SECRET_KEY,
    expectedHostname,
    ip,
  );
  if (!turnstileValid) {
    return errorResponse("Bot protection check failed. Please try again.", 422);
  }

  // ── Persist to D1 ──────────────────────────────────────────────────────────
  const result = await env.DB.prepare(
    `INSERT INTO enquiries (name, email, phone, company, service, budget, message, status, source, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'new', 'website', datetime('now'))`,
  )
    .bind(name, email, phone, company, service, budget, message)
    .run();

  if (!result.success) {
    console.error("[Enquiries] D1 insert failed:", result.error);
    return errorResponse("Failed to save enquiry. Please try again.", 500);
  }

  let emailNotification: Awaited<ReturnType<typeof sendEnquiryEmail>>;
  try {
    emailNotification = await sendEnquiryEmail(env, {
      name,
      email,
      phone,
      company,
      service,
      budget,
      message,
    });
  } catch {
    emailNotification = "failed";
  }
  if (emailNotification === "not_configured") {
    console.warn("[Enquiries] Enquiry saved, but email notification is not configured");
  } else if (emailNotification === "failed") {
    console.error("[Enquiries] Enquiry saved, but email notification failed");
  }

  return jsonResponse(
    {
      enquirySaved: true,
      emailNotification,
    },
    201,
  );
}
