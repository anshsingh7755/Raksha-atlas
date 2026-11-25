CREATE TABLE IF NOT EXISTS inventory_items (
    id TEXT PRIMARY KEY,
    service TEXT NOT NULL,
    category TEXT NOT NULL,
    platform TEXT NOT NULL,
    quantity INTEGER CHECK (quantity IS NULL OR quantity >= 0),
    quantity_status TEXT NOT NULL,
    origin_country TEXT,
    procurement_year INTEGER,
    inducted_year INTEGER,
    role TEXT NOT NULL,
    as_of_date DATE,
    definition TEXT NOT NULL,
    confidence TEXT NOT NULL,
    verification_status TEXT NOT NULL,
    source_id TEXT NOT NULL,
    source_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS inventory_items_service_category_idx
    ON inventory_items (service, category);

CREATE INDEX IF NOT EXISTS inventory_items_status_idx
    ON inventory_items (quantity_status, verification_status);
