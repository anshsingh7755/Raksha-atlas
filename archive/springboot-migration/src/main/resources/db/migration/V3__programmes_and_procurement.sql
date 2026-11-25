CREATE TABLE IF NOT EXISTS programmes (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, service_domain TEXT, category TEXT, variant TEXT,
    developer TEXT, manufacturers JSONB NOT NULL DEFAULT '[]'::jsonb, status TEXT,
    stage_label TEXT, stage_classification TEXT, quantity INTEGER CHECK (quantity IS NULL OR quantity >= 0),
    quantity_type TEXT, quantity_confidence TEXT, announced_date DATE,
    milestones JSONB NOT NULL DEFAULT '[]'::jsonb, sources JSONB NOT NULL DEFAULT '[]'::jsonb,
    evidence_quality TEXT, summary TEXT, dossier_text TEXT, last_verified_at DATE, review_notes TEXT,
    raw_record JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS programmes_service_status_idx ON programmes (service_domain, status);
CREATE INDEX IF NOT EXISTS programmes_stage_classification_idx ON programmes (stage_classification);
CREATE INDEX IF NOT EXISTS programmes_evidence_quality_idx ON programmes (evidence_quality);

CREATE TABLE IF NOT EXISTS procurement_records (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, reference TEXT, service TEXT, system_name TEXT,
    source_id TEXT, source_url TEXT, published_at TIMESTAMPTZ, closing_at TIMESTAMPTZ,
    status TEXT, scope TEXT, verification_status TEXT, quantity INTEGER CHECK (quantity IS NULL OR quantity >= 0),
    quantity_text TEXT, stage TEXT, stage_date DATE, delivery_window TEXT, notes TEXT,
    dataset TEXT NOT NULL DEFAULT 'procurement-2026', raw_record JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS procurement_status_closing_idx ON procurement_records (status, closing_at);
CREATE INDEX IF NOT EXISTS procurement_source_idx ON procurement_records (source_id);
