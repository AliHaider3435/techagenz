import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Phase 1 Security Hardening:
 * Client-side token testing against GitHub has been disabled.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(403).json({
    success: false,
    error: "GitHub token testing endpoint has been permanently disabled for security.",
  });
}
