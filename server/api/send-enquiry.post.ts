import { defineEventHandler, readBody } from "h3";
import { Resend } from "resend";
import { z } from "zod";

const enquirySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address"),
  company: z.string().trim().max(100).optional().default(""),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(3000),
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

async function sendViaFormSubmit(data: { name: string; email: string; company?: string; message: string }) {
  const response = await fetch("https://formsubmit.co/ajax/info@techagenz.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Origin": "https://www.techagenz.com",
      "Referer": "https://www.techagenz.com/",
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      company: data.company || "Not specified",
      message: data.message,
      _subject: `New Enquiry from ${data.name} (${data.company || "Individual"})`,
      _replyto: data.email,
    }),
  });
  return response;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parseResult = enquirySchema.safeParse(body);
  if (!parseResult.success) {
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

  if (apiKey && !apiKey.includes("your_actual_key")) {
    try {
      const resend = new Resend(apiKey);
      const fromEmail = process.env.RESEND_FROM_EMAIL || "Tech Agenz <onboarding@resend.dev>";

      await resend.emails.send({
        from: fromEmail,
        to: "info@techagenz.com",
        replyTo: email,
        subject: `New Enquiry from ${cleanName} (${cleanCompany || "Individual"})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
            <h2 style="color: #0284c7; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">New Client Enquiry</h2>
            <p><strong>Sender Name:</strong> ${cleanName}</p>
            <p><strong>Sender Email:</strong> <a href="mailto:${cleanEmail}">${cleanEmail}</a></p>
            <p><strong>Company:</strong> ${cleanCompany || "Not specified"}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 4px;">
              ${cleanMessage.replace(/\n/g, "<br />")}
            </div>
            <p style="margin-top: 16px; font-size: 13px; color: #64748b;">
              💡 <em>Clicking Reply to this email will write directly to ${cleanEmail}.</em>
            </p>
          </div>
        `,
      });

      return { success: true };
    } catch (resendError) {
      console.warn("[send-enquiry] Resend failed, falling back to FormSubmit:", resendError);
    }
  }

  try {
    await sendViaFormSubmit({ name, email, company, message });
    return { success: true };
  } catch (err: any) {
    console.error("[send-enquiry] Delivery failed:", err);
    return { error: "Unable to deliver enquiry. Please contact info@techagenz.com directly." };
  }
});
