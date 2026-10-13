import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { z } from "zod";

const enquirySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address"),
  company: z.string().trim().max(100).optional().default(""),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(3000),
  _gotcha: z.string().optional().default(""), // Honeypot field for bot detection
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// In-memory rate limiting: max 5 requests per 10 minutes per IP
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const history = rateLimitMap.get(ip) ?? [];
  const recent = history.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    return true;
  }
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: "Too many enquiries. Please try again in a few minutes." });
  }

  const parseResult = enquirySchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || "Invalid input data";
    return res.status(400).json({ error: errorMsg });
  }

  const { name, email, company, message, _gotcha } = parseResult.data;

  // Bot honeypot check: If filled, silently acknowledge without sending email
  if (_gotcha && _gotcha.trim().length > 0) {
    return res.status(200).json({ success: true });
  }

  const cleanName = escapeHtml(name);
  const cleanEmail = escapeHtml(email);
  const cleanCompany = escapeHtml(company);
  const cleanMessage = escapeHtml(message);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[send-enquiry] RESEND_API_KEY environment variable is not configured.");
    return res.status(200).json({
      success: true,
      notice: "Enquiry received (Resend API key pending configuration in Vercel)",
    });
  }

  const resend = new Resend(apiKey);

  try {
    // 1. Send notification to Tech Agenz team
    await resend.emails.send({
      from: "Tech Agenz Website <noreply@techagenz.com>",
      to: "info@techagenz.com",
      replyTo: email,
      subject: `New enquiry from ${name} (${company || "Individual"})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
          <h2 style="color: #0284c7; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">New Client Enquiry</h2>
          <p><strong>Name:</strong> ${cleanName}</p>
          <p><strong>Email:</strong> <a href="mailto:${cleanEmail}">${cleanEmail}</a></p>
          <p><strong>Company:</strong> ${cleanCompany || "Not specified"}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 4px;">
            ${cleanMessage.replace(/\n/g, "<br />")}
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">Submitted via Tech Agenz Website Contact Form.</p>
        </div>
      `,
    });

    // 2. Auto-reply to sender
    try {
      await resend.emails.send({
        from: "Tech Agenz <noreply@techagenz.com>",
        to: email,
        subject: "We received your enquiry — Tech Agenz",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
            <h2 style="color: #0284c7;">Thank you for contacting Tech Agenz</h2>
            <p>Hi ${cleanName},</p>
            <p>We've received your enquiry and our engineering team will get back to you shortly within 24 hours.</p>
            <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
              <p style="margin: 0;"><strong>Your message:</strong></p>
              <p style="margin-top: 6px;">${cleanMessage.replace(/\n/g, "<br />")}</p>
            </div>
            <p>In the meantime, feel free to explore our work at <a href="https://www.techagenz.com/work">techagenz.com/work</a> or chat directly with us on WhatsApp.</p>
            <p style="margin-top: 24px; color: #64748b; font-size: 13px;">Warm regards,<br /><strong>Tech Agenz Team</strong><br /><a href="https://www.techagenz.com">www.techagenz.com</a></p>
          </div>
        `,
      });
    } catch (autoReplyErr) {
      console.warn("[send-enquiry] Auto-reply warning:", autoReplyErr);
    }

    return res.status(200).json({ success: true });
  } catch (err: unknown) {
    console.error("[send-enquiry] Resend error:", err);
    return res.status(500).json({ error: "Failed to send email. Please reach out to info@techagenz.com directly." });
  }
}
