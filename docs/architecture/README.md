# Raksha Atlas — Architecture and Service Boundaries

This document describes the current running system, the target system and the controlled migration path. The detailed delivery plan and acceptance criteria live in [the implementation roadmap](../roadmap/README.md).

## 1. Architecture at a glance

```text
Browser
  |
  v
Next.js + React + TypeScript                 [target frontend]
  | REST / WebSockets
  v
Spring Boot 4 / Java 21                     [target business API]
  |                    \
  |                     \ internal API
  v                      v
PostgreSQL             FastAPI / Python
pgvector               AI / RAG / document workflows
Redis                  |
  ^                    |
  |                    v
  +-------------- S3 document storage

Python data pipelines
  public sources -> collect -> extract -> normalize -> deduplicate
  -> classify -> validate -> PostgreSQL / S3 -> events / AI indexing

Runtime: Docker / Compose locally
Cloud: AWS (S3, RDS, ECS, IAM/VPC) + Terraform
Delivery: GitHub Actions
Observability: OpenTelemetry, Prometheus, Grafana
Scale options: Kafka, Airflow, dbt, Spark, Iceberg, Kubernetes/EKS
```

## 2. Responsibility by layer

| Layer | Technology | Owns |
|---|---|---|
| UI | Next.js, React, TypeScript | Routes, components, forms, maps, charts, user interaction |
| Business backend | Spring Boot, Java 21 | Authentication, authorization, domain rules, APIs, audit |
| Operational database | PostgreSQL | Users, inventory, programmes, procurement, articles, sources |
| Semantic retrieval | pgvector | Embedding vectors and retrieval metadata |
| Cache | Redis | Cache, rate limits and short-lived state |
| AI service | FastAPI, Python, LangGraph, LiteLLM | Retrieval, model calls, summarization and document intelligence |
| File storage | S3 | Original public documents, PDFs, images and generated files |
| Data pipelines | Python, Polars | Source collection, extraction, normalization and quality |
| Event/workflow layer | Kafka, Airflow | Asynchronous events and scheduled/retried jobs |
| Analytics | Parquet, dbt, Spark, Iceberg | Historical datasets and analytical transformations |
| Runtime/cloud | Docker, AWS, Terraform | Packaging, hosting, networking and infrastructure provisioning |
| Operations | GitHub Actions, OpenTelemetry, Prometheus, Grafana | CI/CD, telemetry and dashboards |

## 3. Current system (what actually runs today)

```text
Browser
  |
  v
React + TypeScript + Vite (root src/)
  |
  | /api/*
  v
Node.js API (server/index.mjs, port 8787)
  |-- server/*.json
  |-- collectors / extractors / processors / scheduler / workers
  |-- server/rag.mjs
  |-- optional PostgreSQL adapter when DATABASE_URL is configured

Docker Compose:
  web container -> Node API -> PostgreSQL 17
```

The root Vite/Node application remains the active website and API. The current local development command is `npm run dev:full`. The root build command `npm run build` runs TypeScript project build and Vite production build.

## 4. Migration scaffolds already present

| Path | Current contents | Not yet complete |
|---|---|---|
| `frontend/` | Next.js 15 shell and package | Full App Router migration and feature parity |
| `backend/` | Spring Boot 4 / Java 21 scaffold, health and initial inventory slice | PostgreSQL runtime, full domain APIs, auth, tests and cutover |
| `ai/` | FastAPI app and health endpoint | RAG, embeddings, workflows, evaluation and Node RAG replacement |
| `data-engineering/` | Python pipeline boundary, deduplication and CLI check | Ported production collectors, orchestration and quality monitoring |
| `database/` | PostgreSQL migration(s), initial inventory schema | Full domain schema and verified import |
| `infrastructure/` | Docker/AWS migration notes and directories | Terraform, cloud resources, CI/CD and production observability |

The Next.js shell currently reuses the existing UI and proxies API requests to Node. This is a transition aid, not a second permanent frontend.

## 5. Request flows

### Standard website request
1. Browser loads a Next.js route.
2. Frontend calls Spring Boot REST API.
3. Spring Boot applies validation, authentication and domain rules.
4. Spring Boot reads/writes PostgreSQL; Redis is used only where caching is useful.
5. Typed API response is rendered in the UI.

### AI assistant request
1. Frontend submits a question to Spring Boot.
2. Spring Boot checks access and forwards an authorized request to FastAPI.
3. FastAPI retrieves source chunks/metadata using pgvector and approved document storage.
4. LLM generates a grounded response with citations.
5. Result returns through Spring Boot to the frontend.

### Public-source ingestion
1. Python collectors read permitted public RSS feeds, APIs, pages and documents.
2. Extractors parse text and metadata.
3. Polars/Python processors normalize, deduplicate and classify.
4. Data-quality checks validate provenance, dates and required fields.
5. Structured records go to PostgreSQL; original files go to S3.
6. Kafka may publish events to downstream consumers.
7. Airflow schedules and retries workflows.
8. AI indexing makes approved content available for retrieval.

## 6. Data ownership and source of truth

- PostgreSQL is the canonical store for structured application records after each domain migration.
- S3 stores original documents and media; PostgreSQL stores their metadata and provenance.
- pgvector stores embeddings linked to source/document identifiers; it is not the canonical record store.
- Redis is disposable cache/transient state, not the system of record.
- JSON files under `server/` are current inputs/reference data while migration is in progress. They must not become a second permanent source of truth.
- Every intelligence record should preserve source URL/ID, publisher, publication date, collection/update timestamps, confidence, verification status and the original claim context.

## 7. Migration and cutover policy

1. Complete the agreed website features in the current running application.
2. Migrate the completed UI once into Next.js; do not rewrite features in parallel.
3. Move business APIs from Node to Spring Boot domain by domain.
4. Migrate structured data into PostgreSQL with repeatable migrations and reconciliation reports.
5. Move RAG/document workflows into FastAPI.
6. Port collectors and processors into Python one pipeline at a time.
7. Verify feature parity, API contract, data integrity, tests and runtime before switching each consumer.
8. Remove legacy code only after all consumers have moved and rollback is no longer needed.

Do not introduce Kafka, Spark, Kubernetes or other infrastructure until a real workload justifies it. ECS is the initial AWS container target; EKS is a later option.

## 8. Local service endpoints

| Service | Local endpoint | Current role |
|---|---|---|
| Vite frontend | `http://localhost:5173` | Active website |
| Node API | `http://localhost:8787` | Active API |
| Next.js | `http://localhost:3000` | Migration scaffold |
| Spring Boot | `http://localhost:8081/api/health` | Scaffold health endpoint |
| FastAPI | `http://localhost:8001/health` | Scaffold health endpoint |
| PostgreSQL | Compose private network, port 5432 internally | Local database service |

## 9. Inventory implementation boundary

Inventory is a shared service-independent module. The active `GET /api/inventory` endpoint filters `server/inventory.json` by exact service, category, lifecycle and origin values; the React `Inventory` component consumes this API for all listed domains. The UI defaults to All services when the user has not selected a service. Selecting a service from Commands preselects that service on the Inventory page.

The unused Navy-specific frigate reader and `GET /api/inventory/frigates` route have been removed from the active API because the common inventory catalogue is the canonical UI data path. The legacy JSON file is temporarily retained as a rollback/reference artifact and is not loaded by the API. The inventory endpoint also returns service/category/lifecycle/origin filter options derived from the complete dataset and the latest record as-of date; the frontend consumes these options rather than maintaining duplicate hardcoded lists. Detailed field definitions and acceptance checks are in [Inventory module specification](../roadmap/INVENTORY-MODULE.md).

## 10. Where to find implementation details

- [Delivery roadmap](../roadmap/README.md) — phases, sequence, acceptance criteria and learning plan.
- [Inventory module specification](../roadmap/INVENTORY-MODULE.md) — canonical model, API contract, current implementation and acceptance checklist.
- [Inventory data notes](../../INVENTORY-DATA.md) — inventory provenance and data handling.
- [News pipeline](../../NEWS-PIPELINE.md) — current ingestion implementation.
- [RAG chatbot](../../RAG-CHATBOT.md) — current retrieval/chat design.
- [Theatre Atlas source register](../intelligence/THEATRE-ATLAS-SOURCE-REGISTER.md) — geography records and classification policy.
- [Future programmes dossier](../intelligence/FUTURE-PROGRAMMES-ACQUISITION-DOSSIER.md) — public programme research.
