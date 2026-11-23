# Raksha Atlas — Project Structure (Quick Reference)

The detailed architecture, service boundaries and request/data flows are documented in [docs/architecture/README.md](docs/architecture/README.md). The feature completion and technology migration sequence is in [docs/roadmap/README.md](docs/roadmap/README.md).

## Current working application

```text
Browser
  |
  v
src/ (React + TypeScript + Vite)
  |
  | fetch /api/*
  v
server/index.mjs (Node.js API)
  |-- server/*.json
  |-- collectors / extractors / processors
  |-- scheduler / workers
  |-- server/rag.mjs
  |-- optional PostgreSQL adapter

Docker Compose: web + Node API + PostgreSQL 17
```

## Target architecture

```text
Next.js + React + TypeScript
          |
          | REST / WebSockets
          v
Spring Boot 4 + Java 21  <----->  FastAPI + Python
          |                       AI / RAG / documents
          |
          v
PostgreSQL + pgvector
Redis (cache) | S3 (documents/media)

Python data pipelines:
public sources -> collect -> extract -> normalize -> deduplicate
-> classify -> validate -> PostgreSQL / S3 -> AI indexing / events

Docker + AWS + Terraform + GitHub Actions
OpenTelemetry + Prometheus + Grafana
Kafka / Airflow / dbt / Spark / Iceberg / Kubernetes as justified
```

## Repository map

```text
src/                 Active Vite frontend
server/              Active Node API, news ingestion, processors, scheduler and RAG
frontend/            Next.js migration scaffold
backend/             Spring Boot / Java migration scaffold
ai/                  FastAPI service scaffold
data-engineering/    Python pipeline boundary
database/            PostgreSQL migrations
infrastructure/      Docker and AWS migration notes
docs/architecture/   Current and target architecture details
docs/roadmap/        Website completion and technology migration plan
  INVENTORY-MODULE.md Shared inventory model and module implementation checklist
docs/intelligence/   Public-source defence research dossiers
scripts/              Ingestion, sync and database utilities
```

## What is active vs planned

- Active website/API: root `src/` + `server/` (Vite + Node.js).
- Next.js, Spring Boot and FastAPI folders are migration scaffolds; do not assume they have replaced the active application.
- PostgreSQL Compose service and initial inventory schema exist; complete domain migration and runtime parity remain.
- Python data engineering is an early migration boundary; existing Node collectors remain active.
- AWS, Terraform, CI/CD and production Kubernetes/observability are future implementation work.

## Local development

```powershell
npm install
npm run build
npm run dev:full
```

Open `http://localhost:5173`.

## Migration rule

Inventory is one cross-service module. The service, equipment domain/category, class, platform and variant are separate dimensions. The current inventory API reads server/inventory.json and filters by exact service/category/lifecycle/origin values. The UI defaults to All services unless a user enters from a selected service card. The legacy Navy-only frigate reader/route has been removed from the active API; its JSON file is retained temporarily as a reference artifact. See docs/roadmap/INVENTORY-MODULE.md for fields and acceptance checks.

Complete the agreed website features first. Then migrate the finished UI once to Next.js, move business APIs domain-by-domain to Spring Boot, migrate structured data to PostgreSQL, move AI/RAG to FastAPI and port ingestion to Python. Keep old implementations until feature parity, data reconciliation and tests pass. Do not build the same feature twice or remove working functionality prematurely.
