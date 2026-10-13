import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { z } from "zod";

const enquirySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address"),
  company: z.string().trim().max(100).optional().default(""),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(3000),
  _gotcha: z.string().optional().default(""),
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
    return res.status(429).json({ error: "Too many enquiries. Please try again in a few minutes or email info@techagenz.com directly." });
  }

  const parseResult = enquirySchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || "Invalid input data";
    return res.status(400).json({ error: errorMsg });
  }

  const { name, email, company, message, _gotcha } = parseResult.data;

  // Bot honeypot: silently drop if filled
  if (_gotcha && _gotcha.trim().length > 0) {
    return res.status(200).json({ success: true });
  }

  const cleanName = escapeHtml(name);
  const cleanEmail = escapeHtml(email);
  const cleanCompany = escapeHtml(company);
  const cleanMessage = escapeHtml(message);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.includes("your_actual_key")) {
    console.error("[send-enquiry] RESEND_API_KEY is not configured in Vercel environment variables.");
    return res.status(503).json({
      error: "RESEND_API_KEY is not yet configured in Vercel. Please add RESEND_API_KEY to your Vercel project environment variables, or email info@techagenz.com directly.",
    });
  }

  const resend = new Resend(apiKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Tech Agenz Website <noreply@techagenz.com>";

  try {
    // 1. Send enquiry notification to info@techagenz.com
    // Notice: replyTo is set to the client's email so replying goes directly to them.
    try {
      await resend.emails.send({
        from: fromEmail,
        to: "info@techagenz.com",
        replyTo: email,
        subject: `New enquiry from ${cleanName} (${cleanCompany || "Individual"})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
            <h2 style="color: #0284c7; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">New Client Enquiry</h2>
            <p><strong>Sender Name:</strong> ${cleanName}</p>
            <p><strong>Sender Email:</strong> <a href="mailto:${cleanEmail}">${cleanEmail}</a></p>
            <p><strong>Company:</strong> ${cleanCompany || "Not specified"}</p>
            <p><strong>Project Details:</strong></p>
            <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 4px;">
              ${cleanMessage.replace(/\n/g, "<br />")}
            </div>
            <p style="margin-top: 16px; font-size: 13px; color: #64748b;">
              💡 <em>You can reply directly to this email to respond to ${cleanName} (${cleanEmail}).</em>
            </p>
          </div>
        `,
      });
    } catch (primarySendErr: any) {
      // Fallback: If techagenz.com domain is not verified yet in Resend, retry using onboarding@resend.dev
      if (primarySendErr?.message?.includes("domain") || primarySendErr?.statusCode === 403) {
        console.warn("[send-enquiry] Domain not verified in Resend. Retrying with onboarding@resend.dev test sender...");
        await resend.emails.send({
          from: "Tech Agenz <onboarding@resend.dev>",
          to: "info@techagenz.com",
          replyTo: email,
          subject: `New enquiry from ${cleanName} (${cleanCompany || "Individual"})`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
              <h2 style="color: #0284c7;">New Client Enquiry</h2>
              <p><strong>Sender Name:</strong> ${cleanName}</p>
              <p><strong>Sender Email:</strong> <a href="mailto:${cleanEmail}">${cleanEmail}</a></p>
              <p><strong>Company:</strong> ${cleanCompany || "Not specified"}</p>
              <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; margin: 12px 0;">
                ${cleanMessage.replace(/\n/g, "<br />")}
              </div>
            </div>
          `,
        });
      } else {
        throw primarySendErr;
      }
    }

    // 2. Send confirmation copy to the sender so they have a full record of what they submitted
    try {
      await resend.emails.send({
        from: fromEmail,
        to: email,
        replyTo: "info@techagenz.com",
        subject: "Confirmation: We received your enquiry — Tech Agenz",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
            <h2 style="color: #0284c7;">Thank you for contacting Tech Agenz</h2>
            <p>Hi ${cleanName},</p>
            <p>We've received your enquiry and our engineering team will get back to you shortly within 24 hours.</p>
            <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
              <p style="margin: 0;"><strong>Summary of your enquiry:</strong></p>
              <p style="margin-top: 6px;">${cleanMessage.replace(/\n/g, "<br />")}</p>
            </div>
            <p>Warm regards,<br /><strong>Tech Agenz Team</strong><br /><a href="https://www.techagenz.com">www.techagenz.com</a></p>
          </div>
        `,
      });
    } catch (autoReplyErr) {
      console.warn("[send-enquiry] Auto-reply receipt skipped:", autoReplyErr);
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("[send-enquiry] Resend error:", err);
    return res.status(500).json({
      error: err?.message || "Failed to deliver email through Resend. Please check your Resend domain verification or contact info@techagenz.com directly.",
    });
  }
}
