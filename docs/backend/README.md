# Backend documentation

## What is covered here?

This folder contains guides for the active Node.js backend and the public-source news pipeline.

The active API is in `server/`. The Java Spring Boot service in `backend/` is a migration candidate and has not replaced Node.

## Start with these documents

- [News pipeline](NEWS-PIPELINE.md) — collection, metadata extraction, deduplication, enrichment, storage, review and scheduled jobs.
- [Active Node backend](../../server/README.md) — server folder, request handling, JSON data and PostgreSQL boundary.
- [Spring Boot migration service](../../backend/README.md) — Java API scaffold and migration requirements.
- [Phase 4 ingestion inventory](../architecture/PHASE-4-INGESTION-INVENTORY.md) — current and target ingestion responsibilities.

## Main idea

The website asks the backend for data. The backend may read existing records, search, or run a configured public-source collection process. It returns a response to the website.

Do not confuse a collected news lead with a verified fact. Preserve publisher, source URL, publication date, review state and verification status.
