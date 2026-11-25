CREATE TABLE IF NOT EXISTS defence_sources (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, url TEXT, source_type TEXT, official BOOLEAN NOT NULL DEFAULT FALSE,
  reliability_notes TEXT, record JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS defence_inventory (
  id TEXT PRIMARY KEY, service TEXT NOT NULL, category TEXT NOT NULL, platform TEXT NOT NULL, variant TEXT,
  quantity INTEGER, quantity_status TEXT, verification_status TEXT, as_of_date TEXT, source_id TEXT, source_url TEXT,
  record JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS defence_inventory_service_category_idx ON defence_inventory(service, category);
CREATE TABLE IF NOT EXISTS defence_programmes (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, service_domain TEXT, category TEXT, status TEXT, stage_label TEXT,
  stage_classification TEXT, quantity INTEGER, quantity_type TEXT, quantity_confidence TEXT,
  announced_date TEXT, evidence_quality TEXT, record JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS defence_programmes_service_stage_idx ON defence_programmes(service_domain, stage_classification);
CREATE TABLE IF NOT EXISTS defence_procurement (
  id TEXT PRIMARY KEY, dataset TEXT NOT NULL, title TEXT NOT NULL, service TEXT, system_name TEXT,
  quantity INTEGER, quantity_text TEXT, stage TEXT, status TEXT, verification_status TEXT,
  source_url TEXT, event_date TEXT, record JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS defence_procurement_service_status_idx ON defence_procurement(service, status, stage);
CREATE TABLE IF NOT EXISTS defence_articles (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, canonical_url TEXT, source_id TEXT, service TEXT, category TEXT,
  published_at TEXT, verification_status TEXT, review_state TEXT, record JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS defence_articles_published_idx ON defence_articles(published_at);
CREATE TABLE IF NOT EXISTS defence_timelines (
  id TEXT PRIMARY KEY, programme TEXT, service TEXT, verification_status TEXT, record JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS defence_history (
  id TEXT PRIMARY KEY, event_date TEXT, title TEXT NOT NULL, verification_status TEXT, record JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS defence_reference_data (
  id TEXT PRIMARY KEY, dataset TEXT NOT NULL, category TEXT, service TEXT, name TEXT, record JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
