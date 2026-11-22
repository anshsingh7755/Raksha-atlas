# Raksha Atlas migration map

The implementation schedule is maintained in
[docs/roadmap/README.md](../roadmap/README.md).

The current website remains the working application:

```text
src/ + server/ + scripts/
```

The target structure is introduced gradually:

```text
frontend/          Next.js web application
backend/           Java Spring Boot business API
ai/                Python FastAPI and LangGraph services
data-engineering/  Python collection and processing pipelines
database/          Shared PostgreSQL schemas and migrations
infrastructure/    Docker, AWS and deployment configuration
```

## Migration order

1. Foundation folders and service boundaries
2. Frontend migration from Vite to Next.js
3. Java Spring Boot business backend
4. Python AI service
5. Python data-engineering services
6. Docker and AWS infrastructure

Do not delete `src/` or `server/` until the replacement service passes the same
checks and the website is verified.

## Current progress

Phase 2 has started. `frontend/` contains a Next.js shell that reuses the
existing `src/App.tsx` and `src/styles.css`. Its `/api/*` requests proxy to the
existing Node API on port `8787`.

Phase 3 has started. `backend/` contains a Spring Boot service scaffold with a
health endpoint on port `8081`. It does not replace the Node API yet.

Phase 4 has started. `ai/` contains a FastAPI service scaffold with a health
endpoint on port `8001`. It does not replace `server/rag.mjs` yet.

Phase 5 has started. `data-engineering/` contains a Python pipeline boundary
with collector types, deduplication, and a local CLI check. It does not replace
the JavaScript collectors yet.

Phase 6 has started. `infrastructure/` contains deployment notes for the
existing Docker stack and the future AWS structure. The root deployment files
remain the source of truth for now.

## Complete redesign status

### Completed foundation work

- Added target folders: `frontend/`, `backend/`, `ai/`,
  `data-engineering/`, `database/`, and `infrastructure/`.
- Added a Next.js shell that reuses the current React UI.
- Extracted the platform-register API request into
  `src/services/inventory.ts`.
- Added a Spring Boot 4 project targeting Java 21.
- Added a Spring health endpoint.
- Added the FastAPI AI service health endpoint.
- Added the Python pipeline boundary and deduplication check.
- Added the PostgreSQL inventory migration.
- Added Docker and AWS migration documentation.
- Added the 24-week implementation roadmap.

### Work in progress

The Spring inventory slice is **not complete**. The following code exists:

```text
database/migrations/001_inventory.sql
backend/.../inventory/InventoryItem.java
backend/.../inventory/InventoryRepository.java
backend/.../inventory/InventoryController.java
```

It still needs:

1. Start PostgreSQL.
2. Apply the inventory migration.
3. Compile the updated Java code with Maven. **Done**
4. Start Spring Boot with database configuration.
5. Call `GET /api/inventory`.
6. Compare its response with the existing Node endpoint.

The Node API remains the production development backend until these checks pass.

### Remaining redesign work

```text
Frontend
  Extract more API services, then migrate screens from Vite to Next.js.

Java backend
  Finish inventory, then add users, roles, procurement, approvals and audit logs.

PostgreSQL
  Add migrations for business entities and connect Spring Data repositories.

AI
  Move RAG responsibilities from server/rag.mjs into FastAPI incrementally.

Data engineering
  Move collectors and processors from server/ into Python one pipeline at a time.

Infrastructure
  Add service Dockerfiles, then AWS ECS/RDS/S3 and CI/CD.

Production
  Add security, tests, observability, Kubernetes and backup procedures.
```

No existing website feature has been removed. The current `src/`, `server/`,
root Docker files, and JSON data remain active during migration.

Run both applications during this transition:

```powershell
# Terminal 1
npm run dev:full

# Terminal 2
cd frontend
npm run dev
```

Open the Next.js version at `http://localhost:3000`. The existing Vite version
remains at `http://localhost:5173`.

The Java service will be run after Java 21 and Maven are installed:

```powershell
cd backend
mvn spring-boot:run
```

Health check: `http://localhost:8081/api/health`.

The Python AI service can be run with Python 3.11+:

```powershell
cd ai
python -m uvicorn app.main:app --reload --port 8001
```

Health check: `http://localhost:8001/health`.

Run the data-engineering wiring check:

```powershell
cd data-engineering
python -m pipeline.main --check
```

Run the current container stack:

```powershell
docker compose up --build
```
