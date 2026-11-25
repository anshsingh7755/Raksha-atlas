# Backend and data pipeline

This folder contains documentation for the active Node.js backend and its public-source ingestion pipeline.

- [News pipeline](NEWS-PIPELINE.md) — collectors, processing, scheduling, storage, review and operational boundaries.
- [Active Node backend guide](../../server/README.md) — code layout and request flow.
- [Spring Boot migration guide](../../backend/README.md) — separate Java service scaffold.

**Current runtime:** `server/` is the active backend. `backend/` is the Spring Boot migration candidate. Do not treat the migration folder as a live replacement until parity and cutover checks pass.
