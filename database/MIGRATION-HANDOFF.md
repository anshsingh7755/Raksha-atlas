# Database migration — session handoff

> Last updated: 25 November 2026. This is a short working checkpoint; the [delivery roadmap](../docs/roadmap/README.md) and [run/deploy guide](../docs/RUN-AND-DEPLOY.md) remain the detailed sources of truth.

## Project stages (quick context)

- **Phase 0:** Complete the website and its core modules on the existing React/Vite + Node stack.
- **Phase 1:** Migrate the frontend to Next.js (scaffold/controlled migration).
- **Phase 2:** Migrate the backend to Spring Boot and PostgreSQL.
- **Phase 3:** AI service (FastAPI).
- **Phase 4:** Python data-engineering pipelines.
- **Phase 5:** Infrastructure and production deployment (Docker/AWS/CI/CD).
- **Phase 6:** Security, identity, authorization and audit.
- **Phase 7:** Frontend integration and backend connectivity.
- **Phase 8:** Intelligence operations and data quality.
- The roadmap does **not** currently define Phase 9 or Phase 10; do not invent their scope. The six-month learning plan is a separate roadmap section.
- **Vercel:** The existing React/Vite + Node application is deployed at https://raksha-atlas.vercel.app using `vercel.json` and `api/[...path].mjs`. Deployment is separate from the later target-stack migration.

## Current runtime and environment

- Active website: `src/` (React + TypeScript + Vite).
- Active API: `server/` (Node.js); Vercel adapter: `api/[...path].mjs`.
- Supporting service: `ai/` (FastAPI).
- Local full-stack command: `npm run dev:full`.
- Docker Compose file: `docker-compose.yml`; PostgreSQL image: `postgres:17-alpine`.
- Local `.env` was created from `.env.example`. It is ignored/local-only; never commit it or paste secrets into chat.
- `DB_PASSWORD` already existed in local `.env`. It was exposed in chat during troubleshooting: rotate it after migration and update dependent services consistently.
- PostgreSQL container user: `raksha`; original database: `raksha_atlas`.
- A localhost-only PostgreSQL port mapping was added to the `db` service: `127.0.0.1:5432:5432`. This was intended to let Windows-hosted Node scripts connect. Verify with `docker compose port db 5432`.

## Two-database separation — current state

- `defence_db`: canonical public defence knowledge — inventory, programmes, procurement pipeline, articles/news, sources, timelines, history and reference data. Keep current inducted inventory separate from proposed/approved/tendered/contracted/future quantities.
- `application_db`: concise technical knowledge about the app — architecture documents and component responsibilities. Source code remains in Git, not copied into this DB.
- Created locally in Docker: `defence_db` and `application_db`; original `raksha_atlas` remains present.
- Applied schemas: `database/defence/schema.sql` (8 tables) and `database/application/schema.sql` (2 tables).
- Seeded `application_db` successfully using `node scripts/seed-application-knowledge.mjs`: 6 architecture documents + 4 components.
- Local `.env` now has `DEFENCE_DATABASE_URL` and `APPLICATION_DATABASE_URL`, built from the existing `DB_PASSWORD`. Do not print these values.
- No defence data import or live application cutover has happened yet. The old DB and JSON files must remain untouched until reconciliation and rollback are proven.

## Local data and backup

Latest local JSON counts inspected on 25 November 2026:
- `server/data.json`: 1,176 articles (must be imported; current importer skips this file).
- `server/sources.json`: 184 sources.
- `server/inventory.json`: 363 inventory records.
- `server/programmes.json`: 103 records.
- `server/future-procurement.json`: 25 records.
- `server/procurement-2026.json`: 3 records.
- `server/timelines.json`: 22 records.
- `server/history.json`: 20 records.

A local `backup-db-migration/` folder was created with copies of `server/data.json`, `server/sources.json` and `imp docs.txt`. Verify it exists before relying on it. Git working tree previously showed local changes to `server/data.json`, `server/sources.json` and untracked `imp docs.txt`; preserve them.

## Exact next actions

1. Inspect and fix `scripts/import-defence-database.mjs` **before running it**:
   - Import all 1,176 `server/data.json` articles into `defence_articles`, preserving IDs, canonical URLs, dates, source IDs, publisher official flag, verification status, review state, confidence, keywords and full raw JSON record.
   - Fix reference-data ID collisions by namespacing IDs with dataset/file name (for example `equipment-catalog.json:<id>`).
   - Check procurement IDs for collisions across source datasets; namespace if needed.
   - Check source registry merge behavior so legacy news sources do not unintentionally overwrite richer source records.
   - Confirm every JSON file's actual shape before mapping; do not silently drop unmatched records.
2. Run the importer only after the above fixes. Use local `.env`; never display secrets.
3. Reconcile source and target counts, IDs, duplicates and representative raw records for every dataset, including the 1,176 articles. Inspect legacy PostgreSQL news tables and import them if configured.
4. Only after parity, plan API cutover to `defence_db` and update application DB usage if needed. Keep `raksha_atlas`, JSON files and backups until cutover is tested and rollback is available.
5. Do not claim migration complete or switch production/Vercel until tests, reconciliation, deployment configuration, backups and rollback are verified.

## Commands already used locally

```powershell
# Check services
docker compose ps

# List databases
docker compose exec db psql -U raksha -d raksha_atlas -c "SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname;"

# Inspect tables
docker compose exec db psql -U raksha -d defence_db -c "\dt"
docker compose exec db psql -U raksha -d application_db -c "\dt"

# Seed application knowledge (already succeeded)
node scripts/seed-application-knowledge.mjs
```

**Safety rule:** never run destructive database commands, delete JSON, remove Docker volumes, or point production at the new databases until explicit verification and rollback are complete.
