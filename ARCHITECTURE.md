# Raksha Atlas — Architecture Quick Reference

For full service boundaries, request flows and migration rules, see [docs/architecture/README.md](docs/architecture/README.md). For delivery phases and implementation records, see [docs/roadmap/README.md](docs/roadmap/README.md).

## Active application

```text
Browser
  |
  v
src/ — React + TypeScript + Vite
  |
  | /api/*
  v
api/ — Vercel API entry point
  |
  v
server/ — Node.js API
  |-- existing data and domain endpoints
  |-- collectors, extractors and processors
  |-- scheduler and workers
  |-- RAG / assistant
  |-- optional PostgreSQL adapter
```

The project owner confirms that the initial website is deployed and existing functionality is working. The active source paths are `src/` and `server/`; preserve them and their deployment/build references during repository cleanup.

## Repository areas

| Path | Role | Status |
|---|---|---|
| `src/` | Website UI | Active |
| `server/` | API and existing processing services | Active |
| `api/` | Serverless API adapter | Deployment entry |
| `frontend/` | Next.js | Migration scaffold |
| `backend/` | Spring Boot / Java | Migration scaffold |
| `ai/` | FastAPI | Supporting AI/document service |
| `database/` | Schema and migration guidance | Supporting |
| `data-engineering/` | Python pipelines | Migration path |
| `infrastructure/`, `deploy/` | Runtime and cloud configuration | Supporting |
| `scripts/` | Data and maintenance utilities | Supporting |
| `docs/` | Architecture, roadmap and research references | Documentation |

## Target direction

The documented target direction is a Next.js frontend, Spring Boot business API, FastAPI AI service, PostgreSQL/pgvector, Python data pipelines and containerized infrastructure. These components must be migrated incrementally; a folder or scaffold does not mean that it has replaced the active application.

## Local development

```powershell
npm install
npm run build
npm test
npm run dev:full
```

Open http://localhost:5173.

## Migration rule

Reuse the working implementation. Migrate one domain at a time only when its replacement has feature parity, data reconciliation, tests and a rollback path. Do not duplicate features or remove legacy code prematurely.
