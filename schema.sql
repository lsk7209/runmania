CREATE TABLE IF NOT EXISTS blog_posts (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  excerpt       TEXT,
  content       TEXT NOT NULL DEFAULT '[]',
  tags          TEXT NOT NULL DEFAULT '[]',
  read_time     TEXT,
  hero_image    TEXT,
  related_slugs TEXT NOT NULL DEFAULT '[]',
  faq           TEXT NOT NULL DEFAULT '[]',
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  scheduled_at  TEXT,
  published_at  TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS blog_views (
  slug        TEXT PRIMARY KEY,
  view_count  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS app_settings (
  id                     INTEGER PRIMARY KEY DEFAULT 1,
  publish_interval_hours INTEGER NOT NULL DEFAULT 24,
  auto_publish_enabled   INTEGER NOT NULL DEFAULT 1,
  updated_at             TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO app_settings (id) VALUES (1);
