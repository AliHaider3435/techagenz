import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(410).json({
    success: false,
    error:
      "This enquiry endpoint has been retired. Submit enquiries through the Cloudflare Worker.",
  });
}
