/**
 * Resend email dispatch helper for the Cloudflare Worker.
 *
 * Uses the Resend REST API directly (no npm package needed in the Worker —
 * just a fetch call, keeping the Worker bundle lean).
 *
 * The RESEND_API_KEY must be set via: wrangler secret put RESEND_API_KEY
 * It must NEVER appear in wrangler.toml or committed files.
 */

import { Env } from "../types";

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_ADDRESS = "Tech Agenz <noreply@techagenz.com>";
const NOTIFICATION_TO = "info@techagenz.com";

interface EnquiryEmailData {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  budget?: string | null;
  message: string;
}

export type EnquiryEmailResult = "accepted" | "not_configured" | "failed";

/**
 * Sends an internal notification email when a new enquiry is submitted.
 * A notification failure must not invalidate an enquiry already saved to D1.
 */
export async function sendEnquiryEmail(
  env: Env,
  data: EnquiryEmailData,
): Promise<EnquiryEmailResult> {
  if (!env.RESEND_API_KEY) {
    return "not_configured";
  }

  const html = `
    <h2>New Enquiry — Tech Agenz</h2>
    <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:600px;">
      <tr><th align="left" style="border-bottom:1px solid #eee;width:140px;">Name</th><td>${escapeHtml(data.name)}</td></tr>
      <tr><th align="left" style="border-bottom:1px solid #eee;">Email</th><td><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
      ${data.phone ? `<tr><th align="left" style="border-bottom:1px solid #eee;">Phone</th><td>${escapeHtml(data.phone)}</td></tr>` : ""}
      ${data.company ? `<tr><th align="left" style="border-bottom:1px solid #eee;">Company</th><td>${escapeHtml(data.company)}</td></tr>` : ""}
      ${data.service ? `<tr><th align="left" style="border-bottom:1px solid #eee;">Service</th><td>${escapeHtml(data.service)}</td></tr>` : ""}
      ${data.budget ? `<tr><th align="left" style="border-bottom:1px solid #eee;">Budget</th><td>${escapeHtml(data.budget)}</td></tr>` : ""}
      <tr><th align="left" style="border-bottom:1px solid #eee;">Message</th><td style="white-space:pre-wrap;">${escapeHtml(data.message)}</td></tr>
    </table>
    <p style="margin-top:24px;color:#666;font-size:12px;">Submitted via techagenz.com</p>
  `.trim();

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [NOTIFICATION_TO],
      reply_to: data.email,
      subject: `New Enquiry from ${data.name}${data.company ? ` — ${data.company}` : ""}`,
      html,
    }),
  });

  if (!response.ok) {
    console.error(`[Resend] Notification request failed with HTTP ${response.status}`);
    return "failed";
  }

  return "accepted";
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
