CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, url TEXT NOT NULL, source_type TEXT NOT NULL,
    official BOOLEAN NOT NULL DEFAULT FALSE, default_status TEXT, language TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE, reliability_notes TEXT, terms_reviewed_at TIMESTAMPTZ,
    last_checked_at TIMESTAMPTZ, last_ingest_at TIMESTAMPTZ,
    raw_record JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS sources_active_type_idx ON sources (active, source_type);
CREATE INDEX IF NOT EXISTS sources_official_idx ON sources (official);
