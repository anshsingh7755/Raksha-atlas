# DEFENCE — PROJECT HANDOFF

## PURPOSE
Raksha Atlas is a defence intelligence platform covering inventory,
programmes, procurement, articles, sources, timelines, history and documents.

## HOW TO START
1. Start Docker Desktop.
2. Open the Defence root in PowerShell.
3. Run `docker compose up -d --build`.
4. Open http://localhost:8080.
5. Run `docker compose ps` to check services.

Stop with `docker compose down`. Never delete volumes for a normal restart.

## PROJECT STRUCTURE
- `frontend/` — React, TypeScript and Vite frontend.
- `server/` — Node.js API and data services.
- `api/` — Vercel API adapter.
- `ai/` — FastAPI AI/document service.
- `database/defence/` — defence schemas, imports and migrations.
- `database/application/` — application schemas and migrations.
- `infrastructure/` — Docker, deployment, monitoring and security.
- `scripts/` — database, ingestion and maintenance scripts.
- `data-engineering/` — optional data pipelines.
- `docs/` — supporting project documentation.
- `archive/` — preserved inactive implementations.
- `backup-db-migration/` — migration backups.

Root configuration includes `.env`, `.env.example`, `package.json`,
`Dockerfile`, `docker-compose.yml`, `vite.config.ts`, `vercel.json`
and TypeScript configuration.

## DEVELOPMENT HISTORY — PHASE 0 TO 10
The project evolved through the following broad milestones.
This is a historical roadmap summary, not a claim that every proposed
feature in every phase is complete.

- Phase 0: project foundation and development environment.
- Phase 1: core website and application foundation.
- Phases 2–5: backend capabilities, data handling, intelligence features,
  AI/document processing and RAG development.
- Phases 6–9: data engineering, search, DevOps and infrastructure work.
- Phase 10: deployment and architecture preparation.

Use the existing phase plans and historical notes in `docs/miscellaneous/`
for the original detailed scope. Do not invent completion status for
individual phase tasks.

## DATABASE MIGRATION
PostgreSQL is the persistent database layer.

- `defence_db`: defence-domain data.
- `application_db`: application documents and component metadata.
- `raksha_atlas`: preserved legacy database.

Reconciled defence migration baseline, 25 November 2026:

| Dataset | Records |
|---|---:|
| Sources | 184 |
| Inventory | 363 |
| Programmes | 103 |
| Procurement | 28 |
| Articles | 1,176 |
| Timelines | 22 |
| History | 20 |
| Reference data | 758 |
| Total | 2,654 |

Application database baseline: 6 documents and 4 components.

The original JSON datasets and migration backups are preserved.
Do not rerun the completed import without a specific reason.
Do not delete PostgreSQL volumes.

## APPLICATION FLOW
Browser → React/Vite frontend → Node.js API → PostgreSQL.

The API accesses `defence_db` and `application_db`.
FastAPI provides optional AI and document-extraction functionality.
Ordinary website requests should not depend on AI being available.

Vercel deployment uses root configuration and adapters. Preserve the
Vercel entry points when changing the folder structure.

## IMPORTANT IMPLEMENTATION CHANGES
Changes made during the migration and restructuring work include:

- `docker-compose.yml`: core Docker services, database connections,
  optional service profiles and database initialization configuration.
- `Dockerfile`: frontend and API container build configuration.
- `package.json`: application and operational scripts.
- `server/db/store.mjs`: separate Defence and Application PostgreSQL pools.
- `scripts/import-defence-database.mjs`: duplicate-ID handling during import.
- `server/data.json` and `server/sources.json`: retained source datasets
  with migration-related working changes.
- `database/`: schemas, imports, migrations and initialization resources
  reorganized into separate database areas.
- `frontend/`: frontend source organized separately from the root.
- `archive/`: inactive Next.js and Spring Boot migration implementations
  preserved rather than deleted.
- `infrastructure/`: deployment configuration consolidated.
- `docs/`: supporting documentation centralized.

The working tree may contain additional uncommitted changes.
Use Git history and the current repository files as the exact source
of truth for individual file revisions.

## CURRENT POSITION — 25 NOVEMBER 2026
- PostgreSQL migration reconciliation completed.
- Canonical Defence and Application databases exist.
- Core Docker services previously started successfully.
- The website previously returned HTTP 200 on port 8080.
- Next.js and Spring Boot migration implementations are preserved.
- Frontend, database, scripts and documentation folders have been
  reorganized.
- Two root-level handbooks are being established.

IMPORTANT: The last successful Docker/HTTP verification happened before
the latest frontend and directory changes. Recheck the application after
those changes before treating the new structure as fully validated.

## NEXT WORK
1. Finish path compatibility after restructuring.
2. Confirm frontend Docker build and Vercel build.
3. Confirm Node API schema and script paths.
4. Confirm both database connections.
5. Continue application development from the existing roadmap.

Do not repeat completed migration work. Preserve JSON sources, backups,
legacy database and PostgreSQL volumes.

## LATEST GIT COMMIT
5a0d2b8

## CHANGE LOG
- 2026-11-25: PostgreSQL migration reconciliation and database separation.
- 2026-11-25: Docker core stack rebuilt and website HTTP 200 confirmed.
- 2026-11-25: Next.js and Spring Boot migration implementations preserved.
- 2026-11-25: Frontend, database, infrastructure and scripts reorganized.
- 2026-11-25: Root handbooks consolidated for quick startup and chat handoff.
- Add one short dated line whenever code, configuration or architecture changes.

## NEW CHAT INSTRUCTIONS
Read this file before making changes.
Use the latest commit and current repository state as the starting point.
Continue from NEXT WORK and update this handbook after every change.
Do not repeat completed work or remove preserved data.

