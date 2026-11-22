CREATE TABLE IF NOT EXISTS news_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'unknown',
  official BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  record JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS monitor_feeds (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  record JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS news_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES news_categories(id),
  keywords TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  record JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS news_articles (
  id TEXT PRIMARY KEY,
  canonical_url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  content_excerpt TEXT NOT NULL DEFAULT '',
  category_id TEXT REFERENCES news_categories(id),
  country TEXT,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  published_at TIMESTAMPTZ,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verification_status TEXT NOT NULL DEFAULT 'unverified',
  review_state TEXT NOT NULL DEFAULT 'unreviewed',
  record JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS news_articles_published_idx ON news_articles (published_at DESC NULLS LAST, ingested_at DESC);
CREATE INDEX IF NOT EXISTS news_articles_category_idx ON news_articles (category_id, review_state, published_at DESC);
CREATE INDEX IF NOT EXISTS news_articles_search_idx ON news_articles USING GIN (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(summary,'') || ' ' || coalesce(content_excerpt,'')));
CREATE TABLE IF NOT EXISTS article_sources (
  article_id TEXT NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES news_sources(id),
  source_url TEXT NOT NULL,
  source_title TEXT,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (article_id, source_id, source_url)
);
CREATE TABLE IF NOT EXISTS article_images (
  id BIGSERIAL PRIMARY KEY,
  article_id TEXT NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  attribution TEXT,
  license TEXT NOT NULL DEFAULT 'unknown',
  reuse_permitted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (article_id, image_url)
);
CREATE TABLE IF NOT EXISTS article_revisions (
  id BIGSERIAL PRIMARY KEY,
  article_id TEXT NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  revision_type TEXT NOT NULL,
  previous_record JSONB NOT NULL,
  updated_record JSONB NOT NULL,
  reviewer_note TEXT,
  actor TEXT NOT NULL DEFAULT 'editor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS article_revisions_article_idx ON article_revisions (article_id, created_at DESC);
CREATE TABLE IF NOT EXISTS pipeline_logs (
  id BIGSERIAL PRIMARY KEY,
  job_id TEXT NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  metrics JSONB NOT NULL DEFAULT '{}',
  error TEXT
);
CREATE INDEX IF NOT EXISTS pipeline_logs_started_idx ON pipeline_logs (started_at DESC);
CREATE TABLE IF NOT EXISTS failed_jobs (
  id BIGSERIAL PRIMARY KEY,
  job_id TEXT NOT NULL,
  source_id TEXT,
  job_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  error TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
