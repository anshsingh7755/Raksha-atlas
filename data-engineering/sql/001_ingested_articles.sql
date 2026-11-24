-- Additive Python-ingestion landing table; Node remains the active writer.
CREATE TABLE IF NOT EXISTS ingested_articles (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, canonical_url TEXT NOT NULL,
  source_id TEXT NOT NULL, publisher TEXT, summary TEXT NOT NULL DEFAULT '',
  published_at TIMESTAMPTZ, ingested_at TIMESTAMPTZ NOT NULL,
  publisher_official BOOLEAN NOT NULL DEFAULT FALSE,
  verification_status TEXT NOT NULL DEFAULT 'unverified',
  review_state TEXT NOT NULL DEFAULT 'unreviewed',
  confidence TEXT NOT NULL DEFAULT 'unreviewed discovery lead',
  language TEXT NOT NULL DEFAULT 'en', media_type TEXT NOT NULL DEFAULT 'rss',
  raw_metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ingested_articles_canonical_url ON ingested_articles(canonical_url);
CREATE INDEX IF NOT EXISTS idx_ingested_articles_published_at ON ingested_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_ingested_articles_source_id ON ingested_articles(source_id);
