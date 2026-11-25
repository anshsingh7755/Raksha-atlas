CREATE TABLE IF NOT EXISTS application_documents (
  id TEXT PRIMARY KEY, section TEXT NOT NULL, title TEXT NOT NULL, summary TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS application_components (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, responsibility TEXT NOT NULL, code_location TEXT,
  connects_to JSONB NOT NULL DEFAULT '[]'::jsonb, status TEXT NOT NULL DEFAULT 'active',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
