-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 0004 — Production Admin Sessions
-- Tech Agenz — Cloudflare D1 (SQLite)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS admin_sessions (
  id          TEXT    PRIMARY KEY,
  token_hash  TEXT    NOT NULL UNIQUE,
  username    TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  expires_at  TEXT    NOT NULL,
  revoked_at  TEXT,
  user_agent  TEXT,
  ip_address  TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_sessions_token_hash ON admin_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_username ON admin_sessions(username);
