import type { IncomingMessage, ServerResponse } from "node:http";

interface VercelResponseLike extends ServerResponse {
  status(code: number): this;
  json(body: unknown): this;
}

export default function handler(_req: IncomingMessage, res: VercelResponseLike) {
  return res.status(410).json({
    success: false,
    error:
      "This enquiry endpoint has been retired. Submit enquiries through the Cloudflare Worker.",
  });
}
