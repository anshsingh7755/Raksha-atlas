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
| `frontend/` | Next.js 15 shell, standalone output and candidate Dockerfile | Full App Router migration, runtime proxy configuration and feature parity |
| `backend/` | Spring Boot 4 / Java 21 scaffold, initial inventory slice and multi-stage Dockerfile | Populated-data parity, identity-provider integration and cutover |
| `ai/` | FastAPI extraction worker plus Phase 3.1–3.5 contracts, chunking, embedding client, retrieval boundary and LiteLLM routing adapter | pgvector persistence/search, gateway integration, workflows, evaluation and Node RAG replacement |
| `data-engineering/` | Python pipeline boundary, deduplication and CLI check | Ported production collectors, orchestration and quality monitoring |
| `database/` | PostgreSQL migration(s), initial inventory schema | Full domain schema and verified import |
| `infrastructure/` | Docker service images, Compose profiles and AWS Terraform foundation | AWS plan/apply approval, ECS service/deployment, secrets, observability and production operations |

The Next.js shell currently reuses the existing UI and proxies API requests to Node. This is a transition aid, not a second permanent frontend. Its standalone Docker image is opt-in and does not replace the root Vite/Node image.

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

The unused Navy-specific frigate reader and `GET /api/inventory/frigates` route have been removed from the active API because the common inventory catalogue is the canonical UI data path. The legacy JSON file is temporarily retained as a rollback/reference artifact and is not loaded by the API. The inventory endpoint also returns service/domain/category/lifecycle/origin filter options derived from the complete dataset and the latest record as-of date; the frontend consumes these options rather than maintaining duplicate hardcoded lists. The current `service` field includes operating-service values plus Joint and separately labelled public domains; follow the inventory classification policy before changing these labels. Detailed field definitions and acceptance checks are in [Inventory module specification](../roadmap/INVENTORY-MODULE.md).

## 10. Commands module boundary

The active `GET /api/commands` endpoint reads the structured public register in `server/commands.json`. It supports exact-match filtering by service, group, structure type and status, and returns available filter values. The React overview and Forces pages consume this API; the browser does not read the JSON file directly.

The register separates:
- service operational, training and maintenance commands;
- joint operational commands;
- joint headquarters and tri-service agencies; and
- proposed / under-study theatre-command structures.

A command's headquarters is populated only when the linked source supports it; otherwise it remains null. This is a public organisational directory, not an operational order of battle. Do not add deployment, readiness or sensitive unit-location information.

## 11. Programmes module boundary

The active `GET /api/programmes` endpoint reads the curated `server/programmes.json` register generated from the public Future Programmes & Acquisition Intelligence dossier. It returns source records, quantities only when structured, milestone arrays, record status, evidence quality and stage-classification provenance. Filters cover service/domain, record status, stage-classification method and evidence quality.

A text-derived stage guess is not an acquisition milestone. Records whose `stageClassification` is `heuristic_from_dossier_text` are exposed to the UI as **Needs verification**, while the original dossier wording remains separately visible as an unverified reported label. AoN, RFP, development, trials, contract, construction, delivery and in-service are distinct states; do not infer one from keywords in a narrative.

The Programmes page is a research/discovery register, not a contract ledger or official programme status dashboard. Programme milestones must retain their own dates and source URLs. Quantity fields remain null unless explicitly structured and supported; do not infer quantities from narrative estimates.

## 12. Where to find implementation details

- [Delivery roadmap](../roadmap/README.md) — phases, sequence, acceptance criteria and learning plan.
- [Inventory module specification](../roadmap/INVENTORY-MODULE.md) — canonical model, API contract, current implementation and acceptance checklist.\n- [Commands module specification](../roadmap/COMMANDS-MODULE.md) — command classification, API contract, source policy and acceptance checklist.
- [Programmes module specification](../roadmap/PROGRAMMES-MODULE.md) — programme register API, stage classification, evidence policy and acceptance checklist.
- [Inventory classification policy](../data/INVENTORY-CLASSIFICATION-AND-RECONCILIATION.md) — operator attribution, domain classification and quantity reconciliation rules.
- [Inventory data notes](../../INVENTORY-DATA.md) — inventory provenance and data handling.
- [News pipeline](../../NEWS-PIPELINE.md) — current ingestion implementation.
- [RAG chatbot](../../RAG-CHATBOT.md) — current retrieval/chat design.
- [Theatre Atlas source register](../intelligence/THEATRE-ATLAS-SOURCE-REGISTER.md) — geography records and classification policy.
- [Future programmes dossier](../intelligence/FUTURE-PROGRAMMES-ACQUISITION-DOSSIER.md) — public programme research.

## 13. Phase 5 infrastructure boundary

The default Compose stack preserves the current Vite/Node application. The `migration` profile adds the Spring Boot candidate API and the `cache` profile adds Redis; neither changes the default browser/API path. Service images live in `backend/Dockerfile`, `frontend/Dockerfile` and `ai/Dockerfile`. The AWS Terraform foundation is in `infrastructure/aws/terraform`; it defines a private encrypted RDS database, encrypted/versioned private S3 bucket, VPC network boundary, ECS cluster and scoped task IAM. No AWS resources have been applied and no production application service or ingress is created. See [Phase 5 runbook](../roadmap/PHASE-5-CUTOVER-RUNBOOK.md).

## 14. Phase 5 production foundations

The default Compose runtime remains the Vite/Node application. Optional `migration`, `cache` and `monitoring` profiles add the Spring Boot candidate, Redis, and Prometheus/Grafana without changing the default browser path. FastAPI exports low-cardinality Prometheus request metrics and optional OTLP traces; prompts, document content, tokens and raw query strings must never be recorded.

AWS Terraform defines a private encrypted RDS database with Secrets Manager-managed master credentials, encrypted/versioned S3, KMS key rotation, VPC/security groups, ECS cluster and least-privilege IAM. The application secret is a placeholder until an approved rotation workflow populates it. Terraform does not create an application ECS service or public ingress. ECS/Fargate is the initial orchestration decision; EKS is deferred until measured operational needs justify it. See [Phase 5 runbook](../roadmap/PHASE-5-CUTOVER-RUNBOOK.md), [security review](../../infrastructure/security/SECURITY-REVIEW.md) and [ECS decision](PHASE-5-ECS-DECISION.md).

## 15. Phase 6 security and identity boundary

Spring Boot is the authorization enforcement point. The candidate API uses stateless bearer-token authentication, validates issuer/audience/time and signature, and accepts only the signed `VIEWER`, `ANALYST` and `ADMIN` role values. `GET /api/admin/audit` is ADMIN-only and bounded to 1–100 records. The audit filter records mutation attempts and rejected API requests without request bodies, query strings, bearer tokens, source text or client IP. CORS is an exact-origin allowlist configured by `RAKSHA_ALLOWED_ORIGINS`; security headers are set by the backend.

The backend supports an explicit OIDC issuer-discovery/JWKS decoder mode with audience validation; HS256 remains the local compatibility mode. OIDC code support is not provider verification: production still requires approved issuer metadata, MFA and lifecycle controls. Audit table permissions, retention, export and tamper evidence must be configured and tested before release. No production identity provider or route cutover is enabled. See [Phase 6 security design](PHASE-6-SECURITY-IDENTITY.md), [threat model](../../infrastructure/security/PHASE-6-THREAT-MODEL.md) and [runbook](../roadmap/PHASE-6-CUTOVER-RUNBOOK.md).


## 8. Phase 7 frontend/backend integration status

The shared UI now has typed Spring API clients and an in-memory bearer-token provider. Next.js can route the inventory, sources, programmes, procurement-2026 and assistant chat paths to Spring when `RAKSHA_SPRING_API_ENABLED=true`; all other API paths retain the Node fallback. The assistant compatibility endpoint is `POST /api/chat`, which forwards through the authenticated Spring AI gateway to FastAPI.

This is a candidate integration path, not the active production path. Spring routing is disabled by default because the browser OIDC client is not yet wired and PostgreSQL/AI runtime parity is not yet accepted. Documents, news/review, commands, timelines, briefs, watch, PIB and other endpoints without Spring contracts remain on Node. See [Phase 7 integration runbook](../roadmap/PHASE-7-FRONTEND-INTEGRATION.md).


## 9. Phase 8 intelligence operations

The active Node API now exposes `GET /api/operations/summary`, a read-only operational view of source-check freshness, RSS feed configuration, editorial review counts and recent pipeline outcomes. The existing source/RAG status panel consumes the summary through `src/services/operations.ts`.

The article API also supports optional bounded pagination while preserving its original unpaginated response behavior for existing clients. These changes are operational visibility aids only: source freshness is not proof of source availability or claim verification, active feeds are not proof of a successful fetch, and review status is separate from verification status.

See [Phase 8 intelligence operations runbook](../roadmap/PHASE-8-INTELLIGENCE-OPERATIONS.md). Node ingestion and storage remain active; no new schedule, automated source promotion, production alert or stack cutover is activated.
