import { defineEventHandler, setResponseStatus } from "h3";

/**
 * Phase 1 Security Hardening:
 * Direct client-driven GitHub write and sync operations have been permanently disabled
 * to eliminate exposure of GitHub Personal Access Tokens and unauthenticated repository writes.
 *
 * Content persistence will be handled via Cloudflare D1 in Phase 2.
 */
export default defineEventHandler((event) => {
  setResponseStatus(event, 403);
  return {
    success: false,
    error:
      "Direct GitHub repository write operations have been permanently disabled for security. Content management is migrating to Cloudflare D1 in Phase 2.",
  };
});
