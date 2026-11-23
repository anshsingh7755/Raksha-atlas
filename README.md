# Raksha Atlas

Raksha Atlas is an open-source, source-led public-information platform for exploring India's armed forces, defence inventory, procurement programmes, defence news, public documents and strategic geography.

It is designed to distinguish official records from reported claims, proposals, estimates and unverified information. It is not an operational military tracking system.

## Start locally

Requirements: Node.js (current supported LTS), npm. Docker Desktop is required for the containerized PostgreSQL stack.

```powershell
npm install
npm run build
npm run dev:full
```

Open `http://localhost:5173`.

## Project status

The active website currently uses React, TypeScript, Vite and a Node.js API. The repository also contains migration scaffolds for Next.js, Spring Boot, FastAPI, Python data engineering and PostgreSQL. These scaffolds are not all production replacements yet.

**Immediate priority:** complete and validate the website features first. Then migrate once to the target architecture without building the same feature twice.

## Main documentation

| Document | Purpose |
|---|---|
| [Architecture overview](docs/architecture/README.md) | Current runtime, target architecture, service boundaries and data flows |
| [Implementation roadmap](docs/roadmap/README.md) | Website completion phase, six-month learning plan, migration order and acceptance criteria |
| [Project architecture summary](ARCHITECTURE.md) | Concise current project structure and development commands |
| [Inventory data notes](INVENTORY-DATA.md) | Inventory data conventions and provenance |
| [Inventory classification policy](docs/data/INVENTORY-CLASSIFICATION-AND-RECONCILIATION.md) | Operator attribution, domain classification and quantity reconciliation |

| [Inventory module specification](docs/roadmap/INVENTORY-MODULE.md) | Shared inventory model, API contract, implementation record and acceptance checks |
| [Programmes module specification](docs/roadmap/PROGRAMMES-MODULE.md) | Programme register API, stage classification, evidence rules and acceptance checks |
| [News pipeline](NEWS-PIPELINE.md) | Existing news collection and processing |
| [RAG chatbot](RAG-CHATBOT.md) | Existing retrieval and assistant implementation |
| [Theatre Atlas source register](docs/intelligence/THEATRE-ATLAS-SOURCE-REGISTER.md) | Public geography records and classification rules |
| [Global Search module](docs/roadmap/SEARCH-MODULE.md) | Search API, relevance ranking, acronym expansion and frontend behavior |\n| [Documents module](docs/roadmap/DOCUMENTS-MODULE.md) | Public document register, metadata model, extraction states and source provenance |
| [Future programmes dossier](docs/intelligence/FUTURE-PROGRAMMES-ACQUISITION-DOSSIER.md) | Programme and acquisition research |

## Repository map

```text
src/                 Active React + TypeScript + Vite frontend
server/              Active Node API, collectors, processors, scheduler and RAG
frontend/            Next.js migration scaffold
backend/             Spring Boot / Java migration scaffold
ai/                  FastAPI AI-service scaffold
data-engineering/    Python pipeline boundary
database/            PostgreSQL schema and migrations
infrastructure/      Docker/AWS/operations migration notes
docs/                Architecture, roadmap and intelligence documentation
scripts/              Data ingestion, synchronization and database utilities
```

## Development rules

- Read [the architecture overview](docs/architecture/README.md) before changing service boundaries.
- Read [the roadmap](docs/roadmap/README.md) before choosing the next migration task.
- Keep the active Vite/Node website working while completing its features.
- Do not create parallel duplicate implementations. Migrate completed functionality into the target stack once, with parity checks.
- PostgreSQL becomes the structured source of truth as each domain is migrated; preserve source IDs, URLs, dates, confidence and verification status.
- Do not delete legacy code until replacement behavior, data integrity and tests are verified.
- Never commit secrets or credentials.
- Keep public claims traceable to sources and distinguish official status from reporting and proposals.

## Branch workflow

Current working branch: `work/step-1-foundation`.

```powershell
git pull origin work/step-1-foundation
npm run build
npm run dev:full
```

Do not merge to `main` unless explicitly agreed.
