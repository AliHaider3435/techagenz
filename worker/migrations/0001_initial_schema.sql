-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 0001 — Initial Schema
-- Tech Agenz — Cloudflare D1 (SQLite)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Team Members ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id          TEXT    PRIMARY KEY,   -- e.g. "ali-haider"
  image       TEXT    NOT NULL,
  title       TEXT    NOT NULL,
  subtitle    TEXT    NOT NULL,
  border_color TEXT   NOT NULL DEFAULT '',
  gradient    TEXT    NOT NULL DEFAULT '',
  url         TEXT    NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─── Blog Posts ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id               TEXT    PRIMARY KEY,   -- e.g. "ai-software-house-pakistan"
  title            TEXT    NOT NULL,
  category         TEXT    NOT NULL DEFAULT '',
  read_time        TEXT    NOT NULL DEFAULT '',
  date             TEXT    NOT NULL DEFAULT '',
  publish_date_iso TEXT    NOT NULL DEFAULT '',
  author           TEXT    NOT NULL DEFAULT '',
  image            TEXT    NOT NULL DEFAULT '',
  excerpt          TEXT    NOT NULL DEFAULT '',
  featured         INTEGER NOT NULL DEFAULT 0,  -- 0 = false, 1 = true
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS blog_post_keywords (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id    TEXT    NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  keyword    TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS blog_post_key_takeaways (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id    TEXT    NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  takeaway   TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS blog_post_content (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id    TEXT    NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  paragraph  TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ─── Case Studies ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_studies (
  slug                 TEXT    PRIMARY KEY,
  title                TEXT    NOT NULL,
  short_title          TEXT    NOT NULL DEFAULT '',
  formula_summary      TEXT    NOT NULL DEFAULT '',
  client_type          TEXT    NOT NULL DEFAULT '',
  client_name          TEXT    NOT NULL DEFAULT '',
  category             TEXT    NOT NULL DEFAULT '',
  cover_image          TEXT    NOT NULL DEFAULT '',
  featured_on_home     INTEGER NOT NULL DEFAULT 0,
  sort_order           INTEGER NOT NULL DEFAULT 0,
  timeline             TEXT    NOT NULL DEFAULT '',
  status               TEXT    NOT NULL DEFAULT 'Live in Production',
  -- Problem section
  problem_heading      TEXT    NOT NULL DEFAULT '',
  problem_description  TEXT    NOT NULL DEFAULT '',
  -- Solution section
  solution_heading     TEXT    NOT NULL DEFAULT '',
  solution_description TEXT    NOT NULL DEFAULT '',
  -- Architecture
  architecture_overview TEXT   NOT NULL DEFAULT '',
  -- Testimonial (nullable)
  testimonial_quote    TEXT,
  testimonial_author   TEXT,
  testimonial_role     TEXT,
  testimonial_company  TEXT,
  created_at           TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at           TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS case_study_tags (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT    NOT NULL REFERENCES case_studies(slug) ON DELETE CASCADE,
  tag        TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS case_study_pain_points (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT    NOT NULL REFERENCES case_studies(slug) ON DELETE CASCADE,
  point      TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS case_study_deliverables (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT    NOT NULL REFERENCES case_studies(slug) ON DELETE CASCADE,
  deliverable TEXT    NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS case_study_stack (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT    NOT NULL REFERENCES case_studies(slug) ON DELETE CASCADE,
  tech       TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS case_study_flow_steps (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT    NOT NULL REFERENCES case_studies(slug) ON DELETE CASCADE,
  step       TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS case_study_stats (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT    NOT NULL REFERENCES case_studies(slug) ON DELETE CASCADE,
  label      TEXT    NOT NULL,
  value      TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS case_study_result_bullets (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT    NOT NULL REFERENCES case_studies(slug) ON DELETE CASCADE,
  bullet     TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS case_study_key_features (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT    NOT NULL REFERENCES case_studies(slug) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  tag         TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- ─── Enquiries ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enquiries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  phone      TEXT,
  company    TEXT,
  service    TEXT,
  budget     TEXT,
  message    TEXT    NOT NULL,
  status     TEXT    NOT NULL DEFAULT 'new',  -- new | read | replied | archived
  source     TEXT    NOT NULL DEFAULT 'website',
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─── Media Assets (R2 reference registry) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS media_assets (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  r2_path      TEXT    NOT NULL UNIQUE,  -- e.g. "blogs/ai-software-house.webp"
  file_name    TEXT    NOT NULL,
  content_type TEXT    NOT NULL DEFAULT 'image/webp',
  size_bytes   INTEGER,
  alt_text     TEXT,
  entity_type  TEXT,   -- 'blog' | 'team' | 'project' | 'general'
  entity_id    TEXT,
  uploaded_by  TEXT,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_blog_posts_category       ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured       ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_publish_date   ON blog_posts(publish_date_iso DESC);
CREATE INDEX IF NOT EXISTS idx_blog_keywords_post_id     ON blog_post_keywords(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_takeaways_post_id    ON blog_post_key_takeaways(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_content_post_id      ON blog_post_content(post_id);
CREATE INDEX IF NOT EXISTS idx_case_studies_featured     ON case_studies(featured_on_home);
CREATE INDEX IF NOT EXISTS idx_case_studies_category     ON case_studies(category);
CREATE INDEX IF NOT EXISTS idx_enquiries_status          ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at      ON enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_assets_entity       ON media_assets(entity_type, entity_id);
