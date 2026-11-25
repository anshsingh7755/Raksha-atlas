## How to use this roadmap

This is the project's long-term delivery record. It is intentionally more detailed than the root README because it keeps the phase-by-phase work, decisions, dependencies and acceptance checks.

A phase can have code committed while still having runtime validation or production activation pending. Read each status carefully. **Implemented**, **tested**, **deployed** and **approved for cutover** are different states.

For every phase, use the runbook as a checklist, record the exact commands and results, and do not mark a gate complete until evidence exists. The current active application remains the Vite/React frontend and Node.js API unless a later cutover is explicitly approved.

# Raksha Atlas — Delivery Roadmap

**Purpose:** Record delivery phases, implementation status, acceptance criteria and migration decisions.

> **Project stage update — 25 November 2026:** The project owner confirms that the initial website is deployed and its existing functionality is working. The current task is documentation and repository organization only; new feature development follows after that cleanup. Phase tables below preserve the technical implementation history and acceptance notes recorded during earlier work. Treat environment-dependent checks as pending until they are rerun, not as proof that the live deployment is broken.

## Roadmap terms in simple language

| Term | Meaning |
|---|---|
| Phase | A large stage of project work. |
| Sub-phase | A smaller group of tasks inside a phase. |
| Deliverable | The code, document or capability the work should produce. |
| Acceptance criteria | The checks that must pass before the work is accepted. |
| Parity | The new version behaves like the old version for the same feature. |
| Cutover | Switching real application traffic to the replacement service. |
| Rollback | Returning to the previous working version if the new one fails. |
| Pending validation | The work exists, but the required test has not yet been completed. |

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

**Target:** Java 21, Spring Boot 4, Spring Data JPA, Flyway and PostgreSQL. **Current status:** Phase 2.1–2.10 implementation and CI are committed; latest validation run [#340](https://github.com/anshsingh7755/Raksha-atlas/actions/runs/45350043252) passed. Local PostgreSQL migration/import, row-level reconciliation, external identity-provider verification, populated-data API parity and rollback rehearsal are deliberately deferred to the Phase 10 final acceptance window. Keep Node API active until then. See [Phase 2 backend migration plan](PHASE-2-BACKEND-MIGRATION.md).

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

**Target:** Python 3.11+, FastAPI, Pydantic, LangGraph, LiteLLM, PostgreSQL/pgvector and approved model providers. **Implementation status:** 3.1–3.10 code foundations committed; full repository CI passed in [run #393](https://github.com/anshsingh7755/Raksha-atlas/actions/runs/45354246193) on commit `c1986ff`. Final database/provider/gateway/quality acceptance is deferred to the Phase 10 final validation window. Existing Node RAG remains the production fallback.

| Sub-phase | Workstream | Implementation status |
|---|---|---|
| 3.1 | Versioned contracts and access boundaries | Pydantic schemas, bounded payloads, dedicated AI service token and separate document worker token |
| 3.2 | Extraction and chunking | Deterministic page-aware chunks with stable IDs and source provenance |
| 3.3 | Embeddings and vector indexing | Configurable embedding client, idempotent pgvector upsert and fixed 1536-dimension schema |
| 3.4 | Retrieval and citations | Cosine-similarity retrieval, source filters, page/source metadata and evidence-linked citations |
| 3.5 | Model routing | LiteLLM adapter, explicit model allow-list, bounded generation and token/cost/latency telemetry |
| 3.6 | AI workflows | LangGraph retrieval-to-answer workflow with deterministic fallback and evidence-only prompt policy |
| 3.7 | Evaluation | Golden regression dataset, required/forbidden concept evaluator and comparative Node-vs-FastAPI review protocol |
| 3.8 | Spring Boot gateway | Authenticated `/api/ai/answer` gateway; browser does not call FastAPI directly; service token is server-side only |
| 3.9 | Legacy RAG migration | Candidate workflow and cutover/rollback runbook; Node RAG retained until parity and release approval |
| 3.10 | Operational readiness | Request latency headers/logs, model usage/cost telemetry, tests, configuration and rollout checklist |

**Phase 3 final acceptance (deferred):** install pgvector on the target PostgreSQL instance and apply `ai/sql/001_ai_document_chunks.sql`; configure real embedding/model credentials and private service networking; index a reviewed public corpus; verify retrieval and citations; validate Spring Boot gateway with the approved identity provider; compare against Node RAG; review quality, latency and cost; rehearse rollback. See [Phase 3 cutover runbook](PHASE-3-CUTOVER-RUNBOOK.md). Do not retire Node RAG or enable the gateway by default before those checks.

## 8. Phase 4 — data engineering

**Target:** Python, Polars, Parquet, Kafka, Airflow, dbt, PySpark, Iceberg and data-quality checks. **Status:** Implementation for 4.1–4.10 committed; automated CI covers the offline Python tests. This is a parallel migration path, not a production cutover. Runtime, database, broker, orchestration and data-parity acceptance is deferred to Phase 10. See [Phase 4 ingestion inventory](../architecture/PHASE-4-INGESTION-INVENTORY.md) and [Phase 4 cutover runbook](PHASE-4-CUTOVER-RUNBOOK.md).

| Sub-phase | Workstream | Status |
|---|---|---|
| 4.1 | Inventory existing Node collectors, processors, persistence and scheduling contracts | Implemented |
| 4.2 | Define canonical article, source, programme and equipment schemas | Implemented |
| 4.3 | Port the first RSS/Atom collector to Python | Implemented; parallel only |
| 4.4 | Normalize, deduplicate, classify and validate incoming records | Implemented; canonical URL deduplication |
| 4.5 | Add PostgreSQL landing persistence and raw-document storage boundary | PostgreSQL sink implemented; S3 integration deferred |
| 4.6 | Add Polars batch transformations | Implemented; optional dependency |
| 4.7 | Add Parquet analytical snapshots | Implemented; optional dependency |
| 4.8 | Add Kafka event publishing for asynchronous workloads | Implemented; broker configuration required |
| 4.9 | Add Airflow orchestration and dbt transformations/tests | Implemented; environment deployment/configuration pending |
| 4.10 | Add quality metrics and Spark/Iceberg scale path | Implemented; production thresholds and scale validation deferred |

**Cutover rule:** Node ingestion remains active. Do not schedule Python in production, switch article writers or activate downstream consumers until Phase 10 validates row-level parity, source coverage, freshness, idempotency, recovery and rollback.

## 9. Phase 5 — infrastructure and production

**Target:** Docker, AWS, Terraform, GitHub Actions, observability and secure operations. **Implementation status:** 5.1–5.10 foundations implemented; CI/runtime/cloud acceptance is pending. No AWS resources have been applied and no production deployment has occurred.

| Sub-phase | Workstream | Status |
|---|---|---|
| 5.1 | Create reproducible local Compose services | Default Vite/Node stack retained; opt-in migration, cache and monitoring profiles added |
| 5.2 | Add service-specific Dockerfiles and health checks | Spring Boot and Next.js images added; FastAPI image retained; health checks configured |
| 5.3 | Add automated format, typecheck, unit and integration tests | Existing tests retained; CI expanded for image builds, Terraform and metrics |
| 5.4 | Build GitHub Actions CI for pull requests and branch updates | CI expanded with permissions, concurrency and validation gates |
| 5.5 | Provision AWS networking, IAM, S3, RDS and ECS with Terraform | VPC, private RDS, S3, ECS, KMS and IAM foundation defined; not applied |
| 5.6 | Configure secrets, backups, encryption and access policies | RDS managed credentials, Secrets Manager placeholder, KMS encryption/rotation, S3 TLS/versioning, backup policy and restore helpers |
| 5.7 | Add deployment and rollback workflows | Protected manual ECS task-definition deploy/rollback workflow; requires environment approval and service configuration |
| 5.8 | Add OpenTelemetry instrumentation, Prometheus metrics and Grafana dashboards | FastAPI metrics, optional OTLP traces, local Prometheus/Grafana and dashboard provisioning |
| 5.9 | Perform security review, load testing and recovery exercises | Security checklist, k6 profile, backup/restore helpers and recovery plan added; execution deferred to Phase 10 |
| 5.10 | Adopt Kubernetes/EKS and Helm only when operational scale/complexity justifies it | Decision recorded: ECS/Fargate first; EKS/Helm deferred pending measurable need |

**Safety boundary:** Terraform is plan-only until explicit approval. The default Vite/Node request path remains active. The ECS deploy/rollback workflow is manual and requires protected GitHub environments, OIDC role configuration, an existing ECS service, an exact task-definition ARN and explicit confirmation. Runtime, AWS, load, security, backup-restore and rollback validation remain Phase 10 acceptance gates. See [Phase 5 runbook](PHASE-5-CUTOVER-RUNBOOK.md) and [ECS decision](../architecture/PHASE-5-ECS-DECISION.md).

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

**Current execution point:** Phase 10 is now documented as a Vercel-first personal deployment using Vercel Hobby + Neon Postgres Free, with the existing AWS Terraform/ECS/RDS/S3 path retained for a future migration. The initial operating model remains one owner ADMIN account with MFA and no public sign-up or team-management features. Important implementation blockers are recorded: the current native Node HTTP server, runtime JSON file writes, in-process scheduler/child-process ingestion, incomplete PostgreSQL parity and missing real owner login must be adapted before production. No Vercel/Neon services have been provisioned, no data has been migrated and no deployment has occurred. Complete the V-01–V-10 adaptation backlog and Phase 10 release gates in [the Vercel-first Phase 10 plan](PHASE-10-DEPLOYMENT-AND-SINGLE-USER-ACTIVATION.md). Phase 9 local/environment-dependent validation and all critical security, data-integrity and recovery gates must have evidence before production.

## 12. Phase 6 — security, identity, authorization and audit

**Target:** Spring Security, trusted OIDC/JWKS identity, role-based access, audit events, API hardening and security verification. **Implementation status:** 6.1–6.10 implementation foundations committed; latest full CI result pending after the container-context correction. OIDC/JWKS decoder support is implemented but has not been connected to a real provider. Production MFA, identity lifecycle, audit retention, edge protection and penetration testing remain Phase 10 acceptance gates. See [Phase 6 security architecture](../architecture/PHASE-6-SECURITY-IDENTITY.md), [threat model](../../infrastructure/security/PHASE-6-THREAT-MODEL.md) and [runbook](PHASE-6-CUTOVER-RUNBOOK.md).

| Sub-phase | Workstream | Status |
|---|---|---|
| 6.1 | Threat model, assets, trust boundaries and security requirements | Threat model baseline documented |
| 6.2 | Identity and role policy foundation | Stateless JWT validation; trusted roles restricted to VIEWER, ANALYST and ADMIN |
| 6.3 | Security audit trail | Flyway audit table, mutation/rejection capture and ADMIN-only bounded read endpoint |
| 6.4 | API hardening | Exact-origin CORS, security response headers and bounded audit query contract |
| 6.5 | Security regression tests and CI gate | Role isolation, headers and audit endpoint tests added; workflow result pending |
| 6.6 | OIDC/JWKS identity-provider integration | HTTPS issuer discovery/JWKS decoder and audience validation implemented; real provider verification deferred |
| 6.7 | User lifecycle, MFA and privileged access governance | Least-privilege role matrix documented; lifecycle/MFA remain IdP-owned and unconfigured |
| 6.8 | Secrets/key rotation and service identity hardening | Separate service-token boundaries documented; KMS rotation enabled in Phase 5; rotation rehearsal pending |
| 6.9 | Abuse protection, dependency scanning and security monitoring | Scheduled CodeQL workflow added; WAF/rate limits deferred to approved ingress |
| 6.10 | Penetration test, incident exercise and security release sign-off | Security release checklist added; actual exercises and sign-off deferred to Phase 10 |

**Security boundary:** No production IdP, credentials, user provisioning or public route changes are activated. OIDC mode is code support only; do not configure it for production until issuer/JWKS and claims are verified against the approved provider. The Vite/Node application remains active. Audit records intentionally exclude request bodies, query strings, tokens, source text and client IP. Database-level immutability, retention, export and outage behavior require Phase 10 validation.


## 13. Phase 7 — frontend integration and backend connectivity

**Target:** shared React UI, Next.js routing, typed API clients, Spring Boot read APIs and the protected FastAPI gateway. **Implementation status:** 7.1–7.10 foundations implemented; CI verification pending. Spring routing remains disabled by default and Node remains the fallback. See [Phase 7 integration runbook](PHASE-7-FRONTEND-INTEGRATION.md).

| Sub-phase | Workstream | Status |
|---|---|---|
| 7.1 | Inventory frontend/backend contracts | Mapped supported Spring contracts and legacy-only endpoints |
| 7.2 | Secure identity handoff | In-memory bearer-token provider; real OIDC client wiring deferred |
| 7.3 | Typed backend API client | Inventory, sources, programmes, procurement and assistant clients added |
| 7.4 | API proxy and routing strategy | Opt-in Spring route allowlist; Node fallback retained |
| 7.5 | Inventory and source integration | Existing UI paths compatible with Spring read contracts |
| 7.6 | Programme and procurement integration | Spring read contracts exposed; unsupported modules remain on Node |
| 7.7 | AI assistant integration | Existing chat UI uses typed client; Spring compatibility adapter calls FastAPI gateway |
| 7.8 | Loading, error and empty states | Inventory failures are surfaced accessibly; chat states retained |
| 7.9 | Integration tests and parity gates | Frontend contract tests and Spring gateway tests added |
| 7.10 | Controlled routing, rollback and documentation | Opt-in configuration and rollback boundary documented; no cutover |

**Phase 7 release boundary:** Spring endpoints require valid JWT access tokens and populated PostgreSQL data. The AI gateway additionally requires private FastAPI connectivity, pgvector, model credentials and a separate service token. No real OIDC provider is configured. Keep `RAKSHA_SPRING_API_ENABLED=false` until Phase 10 identity, data, AI, browser and rollback checks pass. The current Node API remains active for all other features.


## 14. Phase 8 — intelligence operations and data quality

**Target:** operational visibility across source freshness, RSS feed configuration, article review queues and ingestion refresh outcomes. **Implementation status:** 8.1–8.10 foundations implemented; CI verification pending. Existing Node ingestion remains active and no automated verification or source promotion is introduced. See [Phase 8 runbook](PHASE-8-INTELLIGENCE-OPERATIONS.md).

| Sub-phase | Workstream | Status |
|---|---|---|
| 8.1 | Operational summary API | Read-only source/feed/article/pipeline summary endpoint added |
| 8.2 | Source freshness metrics | Recorded check timestamps grouped into four freshness buckets |
| 8.3 | Feed configuration visibility | Active/inactive/configured feed counts added |
| 8.4 | Editorial review queue metrics | Review-state and verification-state counts added |
| 8.5 | Article API pagination | Optional bounded limit/offset with total/hasMore; old unpaginated contract preserved |
| 8.6 | Typed operations client | `src/services/operations.ts` added |
| 8.7 | Operations dashboard | Existing source/RAG status panel displays operations summary |
| 8.8 | Evidence interpretation | Explicit caveat that freshness and publisher provenance are not claim verification |
| 8.9 | Regression coverage | API smoke and frontend contract tests extended |
| 8.10 | Documentation and acceptance | Phase 8 runbook and Phase 10 operational gates recorded |

**Release boundary:** Source freshness is a timestamp indicator, not an availability guarantee or evidence score. Active feed configuration is not proof of a successful fetch. No alerts, new schedules, automatic review decisions or production cutover are enabled. Runtime checks against actual source systems, data reconciliation, outage recovery and dashboard responsive testing remain Phase 10 acceptance items.
