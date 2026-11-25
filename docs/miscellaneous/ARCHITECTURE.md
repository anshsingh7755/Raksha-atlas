# Raksha Atlas — architecture quick reference

This page gives a short explanation of how the project is arranged. For the complete design and migration plan, read [the detailed architecture guide](docs/architecture/README.md). For work status and acceptance checks, read [the roadmap](docs/roadmap/README.md).

## 1. The application that runs today

The current website uses React + TypeScript + Vite. Its API uses Node.js.

```text
Visitor's browser
      |
      v
src/ — React website
      |
      | HTTP request to /api/...
      v
Vercel adapter (api/[...path].mjs)
      |
      v
server/ — Node.js API
      |
      +--> current JSON data/configuration
      +--> collectors and extractors
      +--> processors and background workers
      +--> search and RAG assistant
      +--> optional PostgreSQL storage paths
      |
      v
JSON response to the website
```

During local development, `npm run dev:full` starts the Vite website and Node API together. Vite sends API requests to the local API. In the Vercel deployment, the adapter in `api/` forwards requests to the same Node handler.

## 2. What each important folder does

| Folder | Simple meaning | Status |
|---|---|---|
| `src/` | The website screens visitors see | Active frontend |
| `server/` | The API and existing backend services | Active backend |
| `api/` | Hosting adapter that forwards API requests | Vercel entry point |
| `frontend/` | Next.js version of the website | Migration scaffold |
| `backend/` | Spring Boot Java API | Migration scaffold |
| `ai/` | FastAPI document/AI service | Supporting service and migration path |
| `data-engineering/` | Python data ingestion and processing | Migration path |
| `database/` | SQL schema and migration references | Supporting |
| `scripts/` | Data refresh, import and maintenance tools | Supporting |
| `infrastructure/` | Docker, AWS, monitoring and operations | Supporting |
| `docs/` | Architecture, data rules, roadmap and history | Documentation |

## 3. What is the future target?

The roadmap describes a possible longer-term system using:

- Next.js for the website.
- Spring Boot for the main business API.
- FastAPI for AI and document workflows.
- PostgreSQL and pgvector for structured records and vector search.
- Python pipelines for data collection and transformation.
- Docker and cloud infrastructure for deployment.

This is a target direction, not a statement that every part is already live. The current Node/Vite application remains active until each replacement is complete and accepted.

## 4. Why are there multiple versions?

The project is being migrated gradually. The folders `frontend/`, `backend/`, `ai/` and `data-engineering/` contain code for future or supporting services.

A migration folder is not automatically the new production service. Before switching a feature, the replacement must:
1. Do the same job as the current feature.
2. Read and write the correct data.
3. Pass automated and manual tests.
4. Preserve access control and source provenance.
5. Have a rollback plan.

## 5. Local development

From the repository root:

```powershell
npm install
npm run build
npm test
npm run dev:full
```

Open http://localhost:5173. See [Run and Deploy](docs/RUN-AND-DEPLOY.md) for environment and Docker instructions.

## 6. Safe architecture rules

- Keep frontend code in `src/` and API logic in `server/` until an approved migration changes that.
- Keep the Vercel adapter thin; do not put business rules in `api/`.
- Do not rename folders used by imports, Docker, Vercel or CI without checking every reference.
- Do not remove JSON data until database parity and recovery are proven.
- Do not run two services as competing owners of the same data.
- Keep official publisher identity separate from verification of a claim.
- Keep the roadmap and phase runbooks as the detailed project history.