import { defineEventHandler, readBody, setResponseStatus } from "h3";
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

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parseResult = enquirySchema.safeParse(body);
  if (!parseResult.success) {
    setResponseStatus(event, 400);
    return { error: parseResult.error.errors[0]?.message || "Invalid input data" };
  }

  const { name, email, company, message, _gotcha } = parseResult.data;
  if (_gotcha && _gotcha.trim().length > 0) {
    return { success: true };
  }

  const cleanName = escapeHtml(name);
  const cleanEmail = escapeHtml(email);
  const cleanCompany = escapeHtml(company);
  const cleanMessage = escapeHtml(message);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[send-enquiry] RESEND_API_KEY is not set.");
    return { success: true, notice: "Enquiry received" };
  }

  const resend = new Resend(apiKey);
  try {
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
    } catch {
      // ignore auto-reply failure
    }

    return { success: true };
  } catch (err) {
    console.error("[send-enquiry] Resend error:", err);
    setResponseStatus(event, 500);
    return { error: "Failed to send email. Please contact info@techagenz.com directly." };
  }
});
