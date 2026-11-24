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
| CI/CD | GitHub Actions workflow validates Node tests, production build, Compose configuration, document-worker image build and Python tests | Automated CI active; coverage details in [Quality Gate](QUALITY-GATE.md) |

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
| 0.2 | Commands | API-backed directory distinguishes service operational/training/maintenance commands, joint operational commands, headquarters/agencies and under-study theatre-command proposals. See [Commands module specification](COMMANDS-MODULE.md). |
| 0.3 | Programmes | Programme histories, acquisition stage, milestones, dates, quantities and evidence are source-linked. **In progress:** API and UI now expose stage classification, evidence quality, record status and explicit caveats for text-derived stage guesses. Existing timeline records are linked to matching programme entries where identity is explicit. See [Programmes module specification](PROGRAMMES-MODULE.md).
| 0.4 | News | Three defence-news sources plus official sources; publication date, publisher, canonical URL, deduplication and attribution visible. **In progress:** publisher filters now derive from the source registry; official publisher provenance is visually separate from claim verification; RSS/Atom link selection and canonical URL deduplication hardened; parser/dedup tests added. See [News pipeline](../../NEWS-PIPELINE.md).
| 0.5 | Theatre Atlas | **Implemented; validation pending.** Interactive Leaflet basemap, searchable layers, source-linked location profiles, regional-only coordinates, classification/evidence metadata and a filtered `/api/theatre-atlas` register. Static fallback remains available if the API is unavailable. See [Theatre Atlas source register](../intelligence/THEATRE-ATLAS-SOURCE-REGISTER.md).
| 0.6 | Search | **Implemented; validation pending.** Weighted relevance ranking, curated acronym expansion, multi-term matching, section filters, debounced requests, explicit loading/error/empty states and destination-page query handoff. Covers inventory, programmes, news, briefs, procurement, timelines, reference catalogues, sources, commands and Theatre Atlas. See [Search module specification](SEARCH-MODULE.md).
| 0.7 | Documents | **Implementation complete; full validation pending.** Public HTTPS document register, FastAPI PDF and HTML retrieval/extraction, PyMuPDF page-level text, HTML readable-text extraction, SHA-256/file metadata and duplicate-binary detection, robots and host allowlist checks, size/page limits, optional Tesseract OCR retry, worker-token protection, Node API integration, extraction UI and page-referenced text viewer. Focused Node/Python tests are added. Full repository build, worker test run, Compose validation and end-to-end extraction smoke test remain pending. See [Documents module specification](DOCUMENTS-MODULE.md).
| 0.8 | AI assistant | **Implementation and CI validation complete.** Expanded lexical RAG across news, inventory, procurement, timelines, programme dossiers, commands, public regional Theatre Atlas records and completed document extractions (PDF page-aware); added domain intent boosts, evidence-stage caveats, source citation metadata, prompt-injection handling instructions and a bounded operational-safety refusal. OpenAI Responses API remains optional; retrieval-only mode works without a key. Embeddings/vector search, claim-level citation entailment and persistent conversation history remain future work. See [AI Assistant module specification](AI-ASSISTANT-MODULE.md).
| 0.9 | UX and accessibility | **Accessibility implementation complete; manual assistive-technology validation pending.** Added a shared keyboard-accessible dialog wrapper (initial focus, focus containment, Escape, focus restoration), skip-to-content navigation, active-page semantics, mobile menu relationships, live announcements for assistant/search, and forced-colors focus support. Existing responsive layouts, theme, loading/error/empty states and reduced-motion behavior retained. See [UX and accessibility module](ACCESSIBILITY-MODULE.md). |
| 0.10 | Quality gate | **Automated gate passed:** added a read-only API integration smoke test for health, categories, inventory, programmes, documents, sources, search, Theatre Atlas and 404 contracts. GitHub Actions run [#159](https://github.com/anshsingh7755/Raksha-atlas/actions/runs/45169665834) passed Node tests (including API smoke), production build, Compose validation, document-worker image build and Python worker tests on commit `ff1a75c`. Browser E2E, PostgreSQL integration, external extraction and model-evaluation checks remain environment-dependent. See [Quality Gate](QUALITY-GATE.md). |

**Phase 0 exit gate:** all agreed pages and interactions work; displayed claims have provenance; search returns relevant cross-module results; no known feature is silently removed; build and smoke tests pass.

## 5. Phase 1 — one-time frontend migration

**Target:** Next.js + React + TypeScript. **Status: Phase 1.5 feature extraction implemented; Phase 1.6 shared typed API migration implemented; Phase 1.7 App Router loading/error/404 boundaries implemented; Phase 1.8 responsive/accessibility foundations retained with manual device checks pending; Phase 1.9 automated API/route/production-server smoke gates added; Phase 1.10 cutover and rollback runbook prepared, with public activation gated by manual browser parity and explicit approval.** See [Phase 1 frontend migration plan](PHASE-1-FRONTEND-MIGRATION.md) and [controlled cutover runbook](PHASE-1-CUTOVER-RUNBOOK.md).

| Sub-phase | Workstream |
|---|---|
| 1.1 | Audit and baseline |
| 1.2 | Next.js foundation: configurable API proxy and CI |
| 1.3 | Route integration and deep-link support |
| 1.4 | Shared shell extraction |
| 1.5 | Feature boundary extraction |
| 1.6 | Typed API layer |
| 1.7 | Rendering boundaries and loading/error states |
| 1.8 | Responsive, accessibility and UX parity |
| 1.9 | Automated route, interaction and API parity gate |
| 1.10 | Controlled cutover, rollback and Vite retirement |

The Vite app remains the reference and must not be retired before feature parity and explicit approval.

## 6. Phase 2 — Spring Boot backend and PostgreSQL

**Target:** Java 21, Spring Boot 4, Spring Data JPA, Flyway and PostgreSQL. **Current status:** Phase 2.1 domain contracts, 2.2 Flyway/database configuration, inventory service boundary for 2.3, dry-run-first idempotent import utility for 2.4, and programme/procurement schemas for 2.5 are implemented. Maven/DB runtime validation and row-level reconciliation remain pending. See [Phase 2 backend migration plan](PHASE-2-BACKEND-MIGRATION.md).

| Sub-phase | Workstream | Status |
|---|---|---|
| 2.1 | Domain model and API contracts | Contract baseline documented |
| 2.2 | PostgreSQL connection and migrations | Flyway and environment configuration implemented; local DB validation pending |
| 2.3 | Entities, repositories, services and controllers | Inventory vertical slice implemented; other domain layers pending |
| 2.4 | Inventory and source migration | Dry-run-first idempotent importer implemented; apply/reconciliation pending |
| 2.5 | Programmes and procurement persistence | PostgreSQL schemas implemented; API layers and validation pending |

Remaining Phase 2 work: authentication, authorization, expanded API validation/pagination, Redis only where justified, JUnit/Testcontainers coverage, API parity and gradual frontend consumer migration. Node endpoints are not retired until every consumer has moved.
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

**Current task: perform manual browser/device and feature-interaction parity checks after the passing [Phase 1 CI run #276](https://github.com/anshsingh7755/Raksha-atlas/actions/runs/45337574653), then seek explicit approval before public Next.js promotion.** The Next.js bridge must be validated before route migration or cutover. Do not retire Vite until feature parity, tests and rollback are demonstrated. See [Phase 1 frontend migration plan](PHASE-1-FRONTEND-MIGRATION.md).  The Phase 0.10 automated API smoke test and CI gate have passed; see [Quality Gate](QUALITY-GATE.md) for exact coverage and environment-dependent checks. Live document extraction requires a deliberately configured trusted-host allowlist and worker token. Model-backed answer quality and live web citations require separately configured credentials and an evaluation dataset. Do not start the main Next.js/Spring Boot cutover until the Phase 0 exit criteria are closed.
