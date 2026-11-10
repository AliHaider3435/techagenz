import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Phase 1 Security Hardening:
 * Direct client-driven GitHub write and sync operations have been permanently disabled
 * to eliminate exposure of GitHub Personal Access Tokens and unauthenticated repository writes.
 *
 * Content persistence will be handled via Cloudflare D1 in Phase 2.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(403).json({
    success: false,
    error:
      "Direct GitHub repository write operations have been permanently disabled for security. Content management is migrating to Cloudflare D1 in Phase 2.",
  });
}
