# Defence — Living Project Handoff

## Purpose
Raksha Atlas is a public-source defence intelligence platform covering inventory, programmes, procurement, articles, sources, documents, timelines and history. Use public, attributable information; preserve provenance and distinguish reported plans from confirmed contracts or deliveries.

## Start after laptop shutdown
1. Start Docker Desktop.
2. Open the repository root in PowerShell.
3. Run `docker compose up -d --build`.
4. Open http://localhost:8080.
5. Check with `docker compose ps`.
6. Stop safely with `docker compose down`; never use `down -v` for routine shutdown.

## Intended project structure
- `frontend/` — React, TypeScript and Vite website.
- `server/` — Node.js API, data services and compatibility datasets.
- `api/` — Vercel API adapter.
- `ai/` — FastAPI document extraction and AI support.
- `database/defence/` — defence schema, imports and migrations.
- `database/application/` — application schema, migrations and metadata.
- `infrastructure/` — Docker, deployment, monitoring and security.
- `scripts/` — database, ingestion and maintenance operations.
- `data-engineering/` — optional data pipelines.
- `docs/` — architecture, development and operational documentation.
- `archive/` — preserved inactive implementations.
- `backup-db-migration/` — migration backup material.

Root configuration includes `.env`, `.env.example`, `.gitignore`, `package.json`, `Dockerfile`, `docker-compose.yml`, `vite.config.ts`, `vercel.json` and TypeScript configuration.

**Compatibility caution:** the GitHub branch's previously committed code still documented the original root `src/` Vite layout. The local workspace was subsequently reorganized to `frontend/`. Confirm the actual checked-out tree and Vercel build settings before treating that move as synchronized or changing deployment paths.

## Architecture and request flow
Browser → React/Vite frontend → Node.js API → PostgreSQL.

The API uses:
- `defence_db` for defence-domain records.
- `application_db` for application documents and component metadata.

FastAPI is a supporting service for AI/document extraction, not a required dependency for ordinary website requests. Vercel uses the root deployment adapter/configuration; preserve its compatibility.

## Development history: Phase 0–10
The project roadmap evolved through these broad stages:
- Phase 0 — repository foundation and development environment.
- Phase 1 — initial website and core application foundation.
- Phases 2–5 — domain/backend contracts, data services, AI/document extraction, ingestion and RAG capabilities.
- Phases 6–9 — security/identity, data engineering, search, infrastructure and delivery work.
- Phase 10 — deployment architecture and controlled migration planning.

This is a compact historical map, not proof that every planned feature in every phase is complete. Consult the retained phase plans and historical notes in `docs/` and `docs/miscellaneous/` for exact scope and acceptance status. Mark work complete only when its implementation and checks are evidenced.

## PostgreSQL migration — reconciled baseline (25 Nov 2026)
Canonical databases:
- `defence_db`
- `application_db`

Legacy `raksha_atlas` is retained.

| Defence dataset | Rows |
|---|---:|
| Sources | 184 |
| Inventory | 363 |
| Programmes | 103 |
| Procurement | 28 |
| Articles | 1,176 |
| Timelines | 22 |
| History | 20 |
| Reference data | 758 |
| **Total** | **2,654** |

Application database baseline: 6 documents and 4 components.

The importer `scripts/import-defence-database.mjs` was updated for duplicate IDs in the source article data. The import/reconciliation work completed and exact duplicate rows were reconciled. Do not rerun imports or delete source JSON, backups or PostgreSQL volumes without a specific reason.

## Significant implementation changes recorded in the local project work
- `server/db/store.mjs`: separate Defence and Application PostgreSQL pools; application schema loading and status support.
- `scripts/import-defence-database.mjs`: deterministic handling of duplicate article IDs.
- `docker-compose.yml`: PostgreSQL, API, AI and web services; optional migration/monitoring/cache profiles; canonical database connection configuration.
- `Dockerfile`: API and Vite web build stages.
- `package.json`: development, build, database and ingestion commands.
- `database/`: defence/application schemas, imports, migrations and initialization resources organized separately.
- `infrastructure/deployment/`: consolidated deployment/Nginx configuration.
- `archive/`: Next.js and Spring Boot migration implementations preserved rather than deleted.
- Root documentation consolidated into exactly two root handbooks: `README.md` (quick start) and `README-HANDOFF.md` (living project state). The former docs index is preserved as `docs/miscellaneous/documentation-index.md`.

These notes summarize work performed in the local workspace/conversation. They do not assert that every listed local modification has already been pushed to this GitHub branch.

## Last confirmed runtime state
On 25 Nov 2026, local Docker output showed:
- PostgreSQL healthy.
- FastAPI AI healthy.
- Node API started and listening on port 8787.
- Web container started on port 8080.
- `http://localhost:8080` returned HTTP 200.
- `defence_db`, `application_db` and legacy `raksha_atlas` existed.

That successful check preceded the latest frontend and documentation restructuring. Reconfirm runtime after path changes before declaring the new layout fully validated.

## Current position and next work
**Current focus:** finish repository restructuring and synchronize the verified local structure with GitHub without breaking Vercel.

Next:
1. Confirm local root contains exactly the intended folders and two root handbooks.
2. Confirm Vite frontend entry/build paths after moving source to `frontend/`.
3. Update and confirm Docker build contexts and Nginx paths.
4. Confirm Node schema paths and database/ingestion script paths.
5. Confirm Vercel configuration and deployment still work.
6. Commit and push the complete verified local restructure.
7. Then continue feature development; do not reopen the completed database migration.

## Git handoff
- Repository: `anshsingh7755/Raksha-atlas`
- Branch updated by this documentation change: `work/vercel-api-adaptation`
- Previous code baseline before these handbook commits: `1499cdd7f7c6a6b7add460836dc9b91580e4776d`
- Latest synchronized documentation commit before this handoff update: `7f8066022862b255e580bd462cf65397e82b110c` (removed the extra `docs/README.md`; preserved its index as `docs/miscellaneous/documentation-index.md`).
- The intended two root handbooks are `README.md` (quick start) and `README-HANDOFF.md` (living project state).

## Rules for the next ChatGPT session
1. Read this file first.
2. Treat the checked-out repository and Git status as the source of truth.
3. Continue from **Current position and next work**.
4. Do not repeat completed migration/import work.
5. Preserve `.env`, source JSON, backups and PostgreSQL volumes.
6. Whenever code, configuration or structure changes, add one concise dated line here and commit the updated handoff.
7. Record only tests actually run and their real results.
