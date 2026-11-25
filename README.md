# Defence — Project Handbook

## Start
1. Start Docker Desktop.
2. Open this folder in PowerShell.
3. Run `docker compose up -d --build`.
4. Open http://localhost:8080.
5. Check services with `docker compose ps`.

Stop safely: `docker compose down`. Never use `down -v` for routine shutdown.

## Structure
- `frontend/` — React, TypeScript, Vite.
- `server/` — Node.js API and data services.
- `api/` — Vercel adapter.
- `ai/` — FastAPI service.
- `database/defence/` — defence data and schema.
- `database/application/` — application metadata and schema.
- `infrastructure/` — Docker, deployment and monitoring.
- `scripts/` — database, ingestion and maintenance.
- `data-engineering/` — data pipelines.
- `docs/` — documentation.
- `archive/` — preserved migration implementations.

## Application flow
Browser → React frontend → Node API → PostgreSQL.
The API uses `defence_db` and `application_db`; FastAPI provides optional AI/document processing.

Root Vite and Vercel configuration remains at the project root.

## Current position
- Codebase restructuring in progress.
- Docker core services previously started successfully.
- Website previously returned HTTP 200 at localhost:8080.
- Defence and application databases preserved.
- Original JSON datasets and migration backups retained.
- Do not repeat the completed database import without a specific reason.

## Latest commit
`fb68233`

## Change notes
- 2026-11-25 — Consolidated project structure and centralized documentation.
- Add one short dated line for each future code, configuration or architecture change.

## Next chat
Read this file first. Continue from the current project position. Avoid repeating completed work or deleting preserved data.

