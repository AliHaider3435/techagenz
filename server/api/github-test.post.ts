import { defineEventHandler, setResponseStatus } from "h3";

/**
 * Phase 1 Security Hardening:
 * Client-side token testing against GitHub has been disabled.
 */
export default defineEventHandler((event) => {
  setResponseStatus(event, 403);
  return {
    success: false,
    error: "GitHub token testing endpoint has been permanently disabled for security.",
  };
});
