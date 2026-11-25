# Raksha Atlas

Raksha Atlas is a public-information website about India's armed forces and defence sector. It brings together public inventory information, procurement programmes, news, documents, timelines and regional research in one place.

**Live website:** https://raksha-atlas.vercel.app

> **Important boundary:** This is a research and information product. It is not a military command system, a live operational tracking tool or a source of classified information. It should use only permitted public information and show where each important claim came from.

## 1. What the project does

A visitor can explore several kinds of public information:

- **Inventory:** equipment and platforms, with quantities and source notes where available.
- **Programmes and procurement:** projects, approvals, tenders, contracts and reported plans.
- **News and signals:** public news leads collected from configured sources.
- **Documents:** public documents and extracted text, with source and page references where available.
- **History and timelines:** dated events and programme milestones.
- **Theatre Atlas:** regional public-information records shown on a map.
- **Assistant/search:** finds relevant records and can prepare an answer using retrieved evidence.

A source being official means the publisher is an official organization. It does not automatically mean every statement is independently verified. The application must keep publisher identity, evidence quality and verification status separate.

## 2. What is running today?

The current website uses the original React + TypeScript + Vite frontend and Node.js API.

| Part | Folder/file | What it does | Status |
|---|---|---|---|
| Website screens | `src/` | Pages, navigation, tables, maps and components | Active |
| Node API | `server/` | Handles website requests and existing services | Active |
| Vercel adapter | `api/[...path].mjs` | Passes Vercel API requests to the Node handler | Active deployment adapter |
| Build and deployment | `package.json`, `vite.config.ts`, `vercel.json` | Builds and deploys the current application | Active configuration |
| PostgreSQL | Root Compose and server/database adapters | Supports database-backed parts where configured | Partial / environment-dependent |

The project owner has confirmed that the initial website is deployed and its existing features are working. This is an owner-reported status, not a replacement for running local tests after code changes.

## 3. What are the other folders?

Some folders contain supporting services or future migration work. A folder existing in the repository does not mean it has replaced the active website.

| Folder | Simple explanation | Current role |
|---|---|---|
| `frontend/` | A Next.js version of the website | Migration scaffold |
| `backend/` | A Java Spring Boot API | Migration scaffold |
| `ai/` | A Python FastAPI document and AI service | Supporting service / migration path |
| `data-engineering/` | Python data collection and processing | Migration path |
| `database/` | SQL schema and migration references | Database support |
| `infrastructure/` | Docker, AWS, monitoring and operations | Supporting configuration |
| `scripts/` | One-time and scheduled maintenance commands | Supporting tools |
| `docs/` | Architecture, learning guides, roadmap and history | Project documentation |
| `api/` | Vercel's thin API entry point | Deployment adapter |
| `deploy/` | Legacy Nginx configuration | Supporting deployment |

Read [the architecture guide](ARCHITECTURE.md) before changing a service boundary.

## 4. Run the active website

### Requirements

- Node.js LTS compatible with the project.
- npm.
- Git.
- Optional: Docker Desktop for the containerized stack.

### Install dependencies

Run these commands from the project root:

```powershell
npm install
```

### Build and test

```powershell
npm run build
npm test
```

### Start the website and API together

```powershell
npm run dev:full
```

Open http://localhost:5173. The Vite development server serves the website and the helper process starts the Node API, normally on port 8787.

For exact commands, environment settings and Docker instructions, see [Run and Deploy](docs/RUN-AND-DEPLOY.md).

## 5. Important commands

| Command | Meaning |
|---|---|
| `npm run dev` | Start only the Vite frontend |
| `npm run api` | Start only the Node API |
| `npm run dev:full` | Start frontend and API together |
| `npm run build` | Type-check and create the production frontend build |
| `npm test` | Run Node's built-in test suite |
| `npm run news:run` | Run the configured monitored-source ingestion command |
| `npm run sync:reference` | Refresh the configured public reference data |
| `npm run db:migrate` | Run the database migration script |

Check `package.json` for the current source of truth for scripts. Do not assume a command exists because it appears in an old note.

## 6. Documentation map

Start at [the documentation index](docs/README.md).

- [Architecture quick reference](ARCHITECTURE.md) — active request flow and folder responsibilities.
- [Detailed architecture](docs/architecture/README.md) — current system, target system and migration boundaries.
- [Roadmap](docs/roadmap/README.md) — phases, tasks, status and acceptance checks.
- [Frontend guide](src/README.md) — active website code.
- [Backend guide](server/README.md) — active Node API.
- [AI and RAG guide](docs/ai/README.md) — assistant and AI services.
- [Backend and news pipeline guide](docs/backend/README.md) — collectors and news processing.
- [Inventory guide](docs/inventory/README.md) — inventory and procurement data.
- [Docker guide](docs/docker/README.md) — container and deployment configuration.
- [Database guide](database/README.md) — schema and safe migration.
- [Development history](docs/development-history/README.md) — record of meaningful changes.

## 7. Rules for making changes

1. First identify whether a folder is active code, supporting code or a migration scaffold.
2. Reuse the current implementation before creating another one.
3. Keep a single clear owner for each feature or data flow.
4. Do not rename or move files used by imports, build scripts, Docker, Vercel or CI without updating and testing every reference.
5. Keep secrets in local ignored environment files or an approved secret store. Never commit `.env`, passwords or API tokens.
6. Keep data provenance: source URL, publisher, dates, evidence and verification status.
7. Do not convert proposals, approvals, tenders or reports into confirmed contracts or deliveries.
8. Make small changes and run the relevant build and tests.
9. Update the relevant guide when a folder, command, API or data contract changes.
10. Record what was actually tested. Do not write that a test passed unless it was run.

## 8. Delivery stages

| Stage | Goal | Status |
|---|---|---|
| 1 | Establish and deploy the initial website | Completed, owner-confirmed |
| 2A | Make documentation and repository structure understandable | Current documentation work |
| 2B | Add or refine product features | After documentation cleanup |
| 3 | Learn and migrate the system in controlled steps | Later roadmap work |

The detailed phase history remains in [the roadmap](docs/roadmap/README.md).