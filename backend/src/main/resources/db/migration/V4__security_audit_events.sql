CREATE TABLE IF NOT EXISTS security_audit_events (
 id BIGSERIAL PRIMARY KEY,
 occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 actor_subject TEXT NOT NULL,
 actor_roles JSONB NOT NULL DEFAULT '[]'::jsonb,
 event_type TEXT NOT NULL,
 http_method TEXT NOT NULL,
 route_template TEXT NOT NULL,
 response_status INTEGER NOT NULL,
 correlation_id TEXT
);
CREATE INDEX IF NOT EXISTS security_audit_events_occurred_at_idx ON security_audit_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS security_audit_events_actor_idx ON security_audit_events (actor_subject, occurred_at DESC);
CREATE INDEX IF NOT EXISTS security_audit_events_type_idx ON security_audit_events (event_type, occurred_at DESC);
