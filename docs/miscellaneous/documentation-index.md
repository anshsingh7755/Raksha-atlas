# Defence — Project Handoff

## 1. Project purpose

Raksha Atlas is a defence intelligence platform for organizing and exploring
defence inventory, programmes, procurement, articles, sources, timelines,
history and related documents.

## 2. Development history

The project evolved through these milestones:

- Phase 0 — Foundation: repository, development environment, application
  structure and core technology setup.
- Phase 1 — Core website and inventory: React/Vite interface, Node API,
  service categories, data-driven inventory and filtering.
- Phases 2–5 — Backend and intelligence capabilities: backend architecture,
  cloud readiness, AI/document processing and RAG.
- Phases 6–9 — Data engineering, search, DevOps and observability.
- Phase 10 — Deployment architecture: Vercel-compatible frontend/API,
  PostgreSQL migration planning and deployment portability.

The original broader architecture also explored Next.js, Spring Boot,
Redis, search infrastructure and cloud/data-engineering services.
These are not all part of the current active runtime.

Do not interpret the roadmap description as proof that every phase or
every proposed technology is fully implemented.

## 3. Database migration

The project moved defence-domain data from JSON-oriented storage towards
PostgreSQL.

Two canonical databases:
- `defence_db`: defence domain datasets.
- `application_db`: application documents and component metadata.

Legacy `raksha_atlas` is retained.

Reconciled migration baseline, 25 November 2026:

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

Application database baseline:
- Documents: 6
- Components: 4

Original JSON data and migration backups must be preserved.
Do not repeat the completed import without a specific reason.

## 4. Current architecture

- `frontend/` — React, TypeScript and Vite.
- `server/` — Node.js API and data services.
- `api/` — Vercel API adapter.
- `ai/` — Python/FastAPI document and AI service.
- `database/defence/` — defence database resources.
- `database/application/` — application database resources.
- `infrastructure/` — Docker, deployment, monitoring and security.
- `scripts/` — database, ingestion and maintenance operations.
- `data-engineering/` — optional data pipelines.
- `docs/` — project documentation.
- `archive/` — preserved migration implementations.
- `backup-db-migration/` — migration backups.

Root configuration remains important for deployment:
`package.json`, `vite.config.ts`, `vercel.json`, `Dockerfile`,
`docker-compose.yml`, `.env` and `.env.example`.

## 5. Request and data flow

Browser → React/Vite frontend → Node.js API → PostgreSQL.

The API uses:
- `defence_db` for defence information.
- `application_db` for application metadata and documents.

FastAPI provides supporting document extraction and AI capabilities.
It should not be required for ordinary website requests.

Vercel deployment configuration must remain compatible with the root
deployment entry points.

## 6. Docker and local runtime

Core services:
- PostgreSQL
- Node.js API
- React/Vite web
- FastAPI AI

Previously confirmed:
- Containers started successfully.
- PostgreSQL and AI reported healthy.
- API started successfully.
- Website returned HTTP 200 at `localhost:8080`.

The frontend was subsequently reorganized. Reconfirm its build and
Docker startup after structural changes before treating the latest
structure as fully validated.

Preserve Docker volumes during normal restarts.

## 7. Current project position

The current work is codebase restructuring and documentation consolidation.

Completed:
- Next.js migration preserved under `archive/`.
- Spring Boot migration preserved under `archive/`.
- Deployment configuration consolidated.
- Defence and application databases separated.
- Frontend source organized under `frontend/`.
- Database resources organized into two database directories.
- Documentation being consolidated into this handoff and miscellaneous archive.

Still to resolve:
- Verify all frontend, Vite, Docker and Vercel paths after restructuring.
- Confirm all database schema references.
- Confirm ingestion scripts use their intended paths.
- Reconcile any remaining duplicate or obsolete files.
- Update this handoff after each completed change.

## 8. Next action

Continue with the remaining codebase cleanup.
Do not restart the database migration or delete preserved source data.
Keep the active architecture minimal and avoid unnecessary services.

## 9. Latest Git commit

a9a7567

## 10. Change history

- 2026-11-25 — Initial foundation, application development, deployment
  preparation and Phase 0–10 roadmap milestones consolidated.
- 2026-11-25 — PostgreSQL migration reconciled and codebase restructuring
  documented.
- 2026-11-25 — Frontend and database directories reorganized; README
  documentation consolidated.
- Add one concise dated line after every future project change.

## Instructions for a new ChatGPT session

Read this file first. Use the current structure and latest commit as the
handoff point. Continue from the next unfinished action. Do not repeat
completed migrations or remove preserved backups.

