# Raksha Atlas

Source-led public-information platform for exploring India's armed forces, defence inventory, procurement programmes, public documents, defence news and strategic geography.

**Live website:** https://raksha-atlas.vercel.app

Raksha Atlas is a public-information and research platform, not an operational military tracking system. Records should retain source attribution and distinguish official information, reporting, proposals and unverified claims.

## Current status

- The initial website and its existing features are deployed and working, as confirmed by the project owner.
- Current active application: root `src/` (React, TypeScript, Vite) and `server/` (Node.js API).
- Other technology folders contain migration scaffolds or supporting components; they are not automatically replacements for the active application.
- Current work: documentation and repository organization only. New feature work starts after this cleanup.

## Run locally

Requirements: supported Node.js LTS and npm.

```powershell
npm install
npm run build
npm test
npm run dev:full
```

Open http://localhost:5173.

Optional services and migration commands are documented in the relevant folder README files. Never commit `.env`, credentials or tokens.

## Repository map

| Path | Purpose | Status |
|---|---|---|
| `src/` | React + TypeScript + Vite website | Active |
| `server/` | Node.js API, data access, collectors, processors, scheduler and RAG | Active |
| `api/` | Vercel API entry point | Deployment adapter |
| `frontend/` | Next.js application | Migration scaffold |
| `backend/` | Spring Boot / Java service | Migration scaffold |
| `ai/` | FastAPI AI and document service | Supporting service / migration path |
| `database/` | Database notes and historical schema references | Supporting |
| `data-engineering/` | Python ingestion and analytics pipeline | Migration path |
| `infrastructure/`, `deploy/` | Docker, cloud and operations configuration | Supporting |
| `scripts/` | Import, migration, reconciliation and maintenance scripts | Supporting |
| `docs/` | Architecture, roadmap, data policy and intelligence references | Documentation |

Do not move active code or change deployment paths as part of documentation cleanup.

## Documentation

Start with the [documentation index](docs/README.md).

- [Architecture quick reference](ARCHITECTURE.md) — active runtime and repository map.
- [Architecture and service boundaries](docs/architecture/README.md) — current system, target system and migration rules.
- [Delivery roadmap](docs/roadmap/README.md) — phases, sub-phases, acceptance criteria and implementation records.
- [Database guide](database/README.md) — schemas, migrations and safe import/reconciliation.
- [News pipeline](NEWS-PIPELINE.md) — current collection and processing.
- [RAG chatbot](RAG-CHATBOT.md) — current retrieval and assistant implementation.
- [Inventory data notes](INVENTORY-DATA.md) — inventory conventions and provenance.

## Delivery stages

| Stage | Scope | Status |
|---|---|---|
| 1. Initial website | Build, deploy and validate the existing website and functionality | Completed (owner-confirmed) |
| 2A. Documentation and organization | Accurate README, architecture index, phase history and safe repository cleanup | Current |
| 2B. New features | Maps, command-area information, configurable public-source monitoring and scheduled refresh | Not started |
| 3. Project learning | Learn the architecture, code, data flow and technologies from the ground up | Later |

Detailed technical phase records remain in the [delivery roadmap](docs/roadmap/README.md). Keep those records as the implementation history; this table is the high-level project sequence.

## Development rules

1. Reuse existing code and services; do not create duplicate implementations.
2. Keep changes small and focused. Avoid unnecessary dependencies and long files.
3. Preserve working website behavior, data and deployment configuration.
4. Do not delete or replace legacy files until references, runtime usage and migration history are checked.
5. Keep active implementation separate from planned migration scaffolds in documentation.
6. Preserve source URLs, dates, provenance and verification status for public information.
7. Record meaningful phase changes, validation results and fixes in the relevant roadmap document.
