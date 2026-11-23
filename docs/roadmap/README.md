# Raksha Atlas — Delivery Roadmap

**Branch:** `work/step-1-foundation`  
**Purpose:** Complete the user-facing website first, then move once to the target architecture without rebuilding features twice.

## 1. Product and engineering principles

1. Finish and validate the website's required features before starting the major stack migration.
2. Keep the currently working Vite + React + TypeScript + Node.js application running during website completion.
3. Do not create duplicate full implementations in Vite and Next.js, or Node.js and Spring Boot.
4. When the migration starts, make a controlled, one-time cutover to the target stack. The Next.js shell already in the repository is a migration scaffold, not a second product.
5. Preserve existing features and data. Replace a component only after feature parity, data integrity and tests are demonstrated.
6. PostgreSQL becomes the single source of truth for structured application data. JSON files remain migration/reference inputs only until each dataset is imported and reconciled.
7. Public defence information must retain provenance, publication dates, confidence and status distinctions. Do not turn proposals, estimates or unofficial reporting into confirmed facts.
8. Keep operationally sensitive information out of public maps and records.

## 2. Target architecture

```text
Users / Browser
      |
      v
Next.js + React + TypeScript
(UI, routing, server rendering, search experience)
      |
      | HTTPS REST APIs / WebSockets
      v
Spring Boot 4 / Java 21  <------>  FastAPI / Python
(Core business API, auth,              (AI, RAG, document
inventory, programmes, users,          extraction, model workflows)
procurement, audit)
      |                                  |
      +---------------+------------------+
                      |
                      v
             PostgreSQL + pgvector
             Redis (cache / transient state)
             S3 (original documents / media)
                      ^
                      |
       Python data-engineering pipelines
       Collect -> extract -> normalize -> deduplicate
       -> classify -> validate -> persist / emit events
                      |
       Polars, Parquet, Kafka, Airflow, dbt,
       PySpark, Iceberg and data-quality checks

Runtime / delivery:
Docker + Docker Compose (local)
AWS: IAM, VPC, S3, RDS, ECS
Terraform (infrastructure as code)
GitHub Actions (CI/CD)
Kubernetes/EKS, Helm, OpenTelemetry,
Prometheus and Grafana (production scale)
```

### Service responsibilities

| Part | Target technology | Responsibility |
|---|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind | Pages, navigation, forms, search, maps, charts |
| Backend | Java 21, Spring Boot 4, Spring Security, Spring Data JPA | Business rules, REST APIs, authentication, permissions, audit |
| Database | PostgreSQL, pgvector | Structured records and vector retrieval |
| Cache | Redis | Caching, rate limits and transient state |
| File storage | S3 | Original PDFs, documents, images and generated artifacts |
| AI | Python, FastAPI, LangGraph, LiteLLM, model APIs/Ollama | RAG, document intelligence, model routing and AI workflows |
| Data engineering | Python, Polars, Kafka, Airflow, dbt, Spark, Parquet, Iceberg | Collection, transformation, orchestration and analytics |
| Infrastructure | Docker, AWS, Terraform, GitHub Actions | Local runtime, cloud infrastructure and delivery |
| Observability | OpenTelemetry, Prometheus, Grafana | Traces, metrics, dashboards and operational diagnosis |

### Main request and data flows

**Website read flow**
1. Browser requests a page from Next.js.
2. Next.js calls Spring Boot REST APIs.
3. Spring Boot validates identity/permissions and applies business rules.
4. Spring Boot reads/writes PostgreSQL and uses Redis where useful.
5. API response is rendered by the frontend.

**AI question flow**
1. User submits a question through the website.
2. Frontend sends it to the backend.
3. Backend checks access and calls FastAPI.
4. FastAPI retrieves relevant chunks/records from pgvector and approved document storage.
5. The selected LLM generates an answer grounded in retrieved sources.
6. The response, citations and confidence caveats return through the backend to the frontend.

**News and intelligence ingestion flow**
1. Collectors read approved public RSS feeds, APIs, public pages and documents.
2. Extractors parse article/document content and metadata.
3. Polars/Python processors normalize, deduplicate and classify records.
4. Quality checks validate required fields, source attribution and timestamps.
5. Structured records are persisted in PostgreSQL; original files are stored in S3.
6. Events can be published to Kafka for downstream AI and analytics workflows.
7. Airflow schedules and monitors recurring jobs; dbt/Spark support transformations and historical analytics when scale requires them.

**Important:** Kafka, Spark, Airflow and Kubernetes are target capabilities, not prerequisites for the first working release. Introduce each when the workload justifies it.

## 3. Current repository and runtime

| Area | Current implementation | Status |
|---|---|---|
| Active frontend | Root `src/`, React + TypeScript + Vite | Working application |
| Active API | `server/index.mjs`, Node.js | Working application API |
| Current data | `server/*.json`, optional PostgreSQL adapter | JSON remains active for some datasets |
| News/RAG | Node collectors, processors, scheduler and `server/rag.mjs` | Existing implementation |
| Next.js | `frontend/` Next.js 15 shell, reuses current UI and proxies API | Migration scaffold |
| Java backend | `backend/` Spring Boot 4 / Java 21 | Scaffold; inventory runtime parity pending |
| AI service | `ai/` FastAPI health service | Scaffold; does not replace Node RAG |
| Data engineering | `data-engineering/` Python pipeline boundary and CLI check | Early implementation |
| Database | PostgreSQL 17 Compose service and initial inventory migration | Partial; full runtime/data migration pending |
| Infrastructure | Root Dockerfile/Compose and infrastructure documentation | Local stack exists; AWS not deployed |
| CI/CD | No GitHub Actions workflow confirmed | Not implemented |

### Current local development

The existing website remains the working version while feature completion continues:

```powershell
npm install
npm run build
npm run dev:full
```

Typical local endpoints:
- Vite frontend: `http://localhost:5173`
- Node API: `http://localhost:8787`
- Next.js scaffold (when run separately): `http://localhost:3000`
- Spring Boot health: `http://localhost:8081/api/health`
- FastAPI health: `http://localhost:8001/health`

The current Compose stack contains the Node API, web container and PostgreSQL. Do not assume Spring Boot or FastAPI are already part of the active Compose request path.

## 4. Phase 0 — complete the website first

This phase is the immediate priority. Complete and verify the product before the main migration.

| Order | Workstream | Acceptance criteria |
|---|---|---|
| 0.1 | Inventory | Shared service-independent catalogue, neutral All services default, no service-specific duplicate API, data-driven service/domain/category/lifecycle filters and source attribution. Local build/API validation remains pending. See [Inventory module specification](INVENTORY-MODULE.md). |
| 0.2 | Commands | Established service commands and tri-service structures are correctly distinguished; proposals are labelled separately |
| 0.3 | Programmes | Programme histories, acquisition stage, milestones, dates, quantities and evidence are source-linked |
| 0.4 | News | Three defence-news sources plus official sources; publication date, publisher, canonical URL, deduplication and attribution visible |
| 0.5 | Theatre Atlas | Geographic basemap, usable layers, public regional locations, clear established/proposed status and source profiles |
| 0.6 | Search | One global search across inventory, programmes, news/articles, sources and pipeline records; results show the correct module and destination |
| 0.7 | Documents | Public document ingestion, extraction, metadata, source traceability and usable document view |
| 0.8 | AI assistant | Answers grounded in indexed public sources with citations and clear uncertainty |
| 0.9 | UX | Navigation, responsive layouts, theme, loading/error/empty states and accessibility |
| 0.10 | Quality gate | Production build, API checks, data validation and end-to-end smoke tests pass |

**Phase 0 exit gate:** all agreed pages and interactions work; displayed claims have provenance; search returns relevant cross-module results; no known feature is silently removed; build and smoke tests pass.

## 5. Phase 1 — one-time frontend migration

**Target:** Next.js + React + TypeScript.

1. Audit the completed Vite UI, routes, components, styles, assets and API contracts.
2. Move/restructure the existing UI into Next.js App Router; do not redesign/rewrite the product from scratch.
3. Extract shared UI components and typed API clients.
4. Move configuration and secrets to environment variables.
5. Implement server/client rendering boundaries and loading/error states.
6. Verify every route and interaction against the existing website.
7. Switch the primary local development command to Next.js after parity.
8. Retire Vite only after the Next.js version passes acceptance checks.

## 6. Phase 2 — Spring Boot backend and PostgreSQL

**Target:** Java 21, Spring Boot 4, Spring Security, Spring Data JPA, PostgreSQL.

1. Finalize domain model and API contracts.
2. Configure PostgreSQL connection and migration runner.
3. Create entities, repositories, services and controllers.
4. Migrate inventory and source records with reconciliation reports.
5. Add programmes, procurement milestones, articles, users and audit entities.
6. Implement authentication, JWT/session strategy and role-based access.
7. Add validation, pagination, filtering, sorting and error contracts.
8. Add Redis only for identified cache/rate-limit/session use cases.
9. Add JUnit tests and Testcontainers integration tests.
10. Compare Spring API outputs with existing Node API; switch frontend API calls module by module.
11. Retire Node business endpoints only after all consumers have moved.

## 7. Phase 3 — AI service

**Target:** Python 3.11+, FastAPI, Pydantic, LangGraph, LiteLLM, pgvector and model providers.

1. Define AI service API contracts and access boundaries.
2. Move document extraction and chunking into Python.
3. Build embedding generation and vector indexing.
4. Implement retrieval with source metadata and citation references.
5. Add LLM model routing and provider configuration.
6. Build LangGraph workflows for research, summarization and question answering.
7. Add evaluation datasets, RAGAS metrics, regression tests and cost/latency tracking.
8. Route user requests through Spring Boot; do not expose privileged AI/data operations directly to the browser.
9. Retire Node RAG only after answer quality, citations and API parity are verified.

## 8. Phase 4 — data engineering

**Target:** Python, Polars, Parquet, Kafka, Airflow, dbt, PySpark, Iceberg and Great Expectations.

1. Inventory existing Node collectors and scheduled jobs.
2. Define canonical article, source, programme and equipment schemas.
3. Port one collector at a time to Python.
4. Normalize, deduplicate, classify and validate incoming records.
5. Persist operational records in PostgreSQL and raw documents in S3.
6. Use Parquet for analytical snapshots and historical datasets.
7. Introduce Kafka for asynchronous event workloads when needed.
8. Introduce Airflow for dependable scheduled workflows and retries.
9. Use dbt for SQL transformations and tests.
10. Add Spark/Iceberg for larger historical and analytical workloads.
11. Monitor freshness, duplicate rate, validation failures and source coverage.

## 9. Phase 5 — infrastructure and production

**Target:** Docker, AWS, Terraform, GitHub Actions; Kubernetes/EKS when justified.

1. Create reproducible local Compose services.
2. Add service-specific Dockerfiles and health checks.
3. Add automated format, typecheck, unit and integration tests.
4. Build GitHub Actions CI for pull requests and branch updates.
5. Provision AWS networking, IAM, S3, RDS and ECS with Terraform.
6. Configure secrets, backups, encryption and access policies.
7. Add deployment and rollback workflows.
8. Add OpenTelemetry instrumentation, Prometheus metrics and Grafana dashboards.
9. Perform security review, load testing and recovery exercises.
10. Adopt Kubernetes/EKS and Helm only when operational scale/complexity justifies it; ECS is sufficient for the initial AWS deployment.

## 10. Six-month learning plan

The original 24-week learning plan remains the technology-learning framework. The website-completion phase is a product milestone before the main migration; it should not cause duplicate implementations.

| Weeks | Focus | Learn and build |
|---|---|---|
| 1–4 | Foundation | Next.js, Java/Spring Boot, PostgreSQL, FastAPI and service contracts |
| 5–8 | Backend | Spring Security, users, inventory, procurement, audit logs, JUnit and Testcontainers |
| 9–12 | Cloud | Docker, AWS IAM/VPC, S3, RDS, ECS and Terraform |
| 13–16 | AI | LLMs, embeddings, RAG, pgvector, LangGraph, LiteLLM and evaluation |
| 17–20 | Data engineering | Polars, Parquet, Kafka, Airflow, dbt, Spark and quality checks |
| 21–24 | Production | CI/CD, observability, optimization, backups, load tests and Kubernetes fundamentals |

For each technology, use the same learning loop:
1. Learn core concepts.
2. Implement one Raksha Atlas feature.
3. Write tests and documentation.
4. Explain the design and trade-offs.
5. Demonstrate it working locally.

## 11. Migration rules — prevent duplicate work and data loss

- One canonical owner per domain: Spring Boot owns business records; FastAPI owns AI workflows; Python pipelines own ingestion/transformation; Next.js owns presentation.
- Frontend never reads local server JSON files directly.
- API contracts are documented and versioned.
- Database changes are additive migrations; do not manually edit production tables.
- Every imported record retains its original ID where possible, source ID/URL, timestamps, confidence and verification status.
- Reconciliation reports must compare record counts, missing fields, duplicate IDs and important values before cutover.
- Keep old endpoints available during a short compatibility window; remove them only after all clients have switched.
- Do not introduce Kafka, Spark, Kubernetes or other infrastructure solely for technology practice; integrate them when there is a real workload and measurable learning objective.
- Never commit API keys, passwords, tokens or production credentials.

## 12. Current next action

**Current task: finish Phase 0.1 — Inventory.** The current code now defaults the inventory experience to All services, removes the unused Navy-only frigate API reader/route, and loads service/domain/category/lifecycle options from the full inventory dataset. Follow [Inventory module specification](INVENTORY-MODULE.md), run its local build/API acceptance checks, then add explicit class/family handling and record details. Do not start the main Next.js/Spring Boot cutover until the Phase 0 acceptance criteria are closed.
