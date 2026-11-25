# Phase 9 — end-to-end validation, integration, defects and performance

**Branch:** `work/phase-9-quality-validation`  
**Base branch:** `work/step-1-foundation`  
**Purpose:** validate the existing application and migration candidates as an integrated system before Phase 10 deployment and production cutover.

## Safety and execution rules

- Keep the root Vite + React + TypeScript frontend and Node API as the active reference runtime.
- Keep Next.js, Spring Boot, FastAPI and Python data engineering as candidate/migration services; do not enable Spring routing or replace Node RAG by default.
- Do not run import scripts with `--apply`, destructive SQL, Terraform apply, production deployment, or data deletion as part of Phase 9.
- Use local/test data and isolated containers. Never paste `.env`, API keys, JWTs, database passwords or service tokens into chat or commit them.
- Do not pop either existing Git stash until local validation is complete and the contents have been reviewed.
- A command passing locally proves only that command on that machine and data snapshot. Record commit SHA, command, result and any environment limitation.
- Fix reproducible defects in the smallest relevant area; rerun the failing test and the full affected suite.

## 9.1 — Baseline and regression suite

**Objective:** establish a repeatable baseline before changing code.

Run:
```powershell
npm ci
npm test
```

Coverage already present:
- Node built-in test runner and API smoke test.
- Real Node API process started on an ephemeral loopback port.
- Health, categories, inventory, programmes, documents, sources, operations summary, search, Theatre Atlas, article pagination and JSON 404 contracts.
- API response parsing tests and Next.js route registry tests are part of the repository test inventory.

**Pass evidence:** dependency installation and every discovered Node test pass; no test process remains running.

## 9.2 — Static analysis, type checks and production builds

Run:
```powershell
npm run build
npm run typecheck --prefix frontend
npm run build --prefix frontend
```

**Pass evidence:** root TypeScript/Vite production build, Next.js TypeScript check and Next.js production build all exit with code 0. Capture build warnings separately; do not treat warnings as test failures unless they indicate a real defect.

## 9.3 — Service-level and container validation

Run:
```powershell
mvn -B -f backend/pom.xml test
python -m pip install -r ai/requirements-dev.txt
python -m pytest -q -c ai/pytest.ini ai/tests
python -m unittest discover -s data-engineering/tests -v
python -m pipeline.main --check
docker compose config --quiet
```

Build images only after the preceding checks:
```powershell
docker build -t raksha-atlas-ai-test -f ai/Dockerfile ai
docker build -t raksha-atlas-backend-test -f backend/Dockerfile backend
docker build -t raksha-atlas-next-test -f frontend/Dockerfile .
```

**Pass evidence:** Spring tests, AI worker tests, Python pipeline tests/check, Compose validation and all three image builds pass. A container image build does not prove runtime health or inter-service connectivity.

## 9.4 — API and cross-service integration

Validate the active Node API first, then candidate services independently. Confirm:
- Node API health and existing public read contracts.
- Next.js proxy reaches the intended Node API target.
- Spring Boot candidate health, security behavior and database connectivity in the migration profile.
- FastAPI health and protected document-worker boundary.
- Service-to-service AI calls fail closed when the AI service token, vector store or provider configuration is absent.
- No browser-facing response contains internal service tokens or secrets.

**Pass evidence:** HTTP status, response shape, expected authentication behavior and service logs recorded for each tested path. Do not enable Spring routing merely to make a test pass.

## 9.5 — Browser end-to-end and route behavior

The existing CI performs a production Next.js server smoke test for known direct routes and an unknown-route 404. This is route availability testing, not full browser interaction coverage.

Manually verify in a real browser:
- Load the root route and refresh every supported deep link.
- Primary navigation, mobile navigation, global search and search-result handoff.
- Inventory filters/details, programme dossiers, article/news review, documents and extraction status, source registry, timelines, briefs, procurement watch and Theatre Atlas.
- Assistant loading, success, no-evidence/error behavior and citations when configured.
- Form validation, empty states, API failures, retry behavior and not-found route.
- Browser console and network panel contain no uncaught errors, unexpected 4xx/5xx responses or leaked secrets.

**Pass evidence:** record browser/version, routes exercised, expected/actual result and screenshots or issue references. A full automated Playwright suite is not currently established by the reviewed package scripts; do not claim it exists until added and executed.

## 9.6 — Responsive layout and accessibility

Use desktop, tablet and mobile viewport sizes. Check:
- No horizontal overflow, clipped navigation, overlapping dialogs or unreadable tables/cards.
- Keyboard-only navigation, skip link, visible focus, Escape handling, focus trap and focus restoration.
- Screen-reader announcements for search and assistant status.
- Browser zoom/reflow, forced-colors/high-contrast and reduced-motion behavior.
- Form labels, validation messages, dialog names and table semantics.

**Pass evidence:** complete the manual checklist in `docs/roadmap/ACCESSIBILITY-MODULE.md` and record unresolved accessibility defects. Existing accessibility foundations are not a WCAG 2.2 AA certification.

## 9.7 — Database migration and data-integrity rehearsal

First run the importer in its default dry-run mode. Do not add `--apply`.

```powershell
npm run db:import
```

Only when an isolated local PostgreSQL instance is deliberately started and its connection has been verified:
- Apply migrations to the isolated database using the documented migration command.
- Review the dry-run report and backup the disposable test database.
- Run the import with `--apply` only after explicit local confirmation.
- Run reconciliation and inspect missing, changed, extra and duplicate records.
- Repeat the importer/reconciliation to verify idempotency.

**Pass evidence:** source and database counts reconcile, no unexplained missing/changed/extra IDs, provenance fields remain intact and repeat import does not create duplicates. Never point these commands at production or a shared database in Phase 9.

## 9.8 — Security and configuration checks

Review:
- Required environment variables and safe defaults; no committed secrets.
- CORS origin restrictions, security headers, admin-token handling and JWT fail-closed behavior.
- Document extraction HTTPS allowlist, redirect/DNS validation, size/page limits and separate worker token.
- AI service token separation from user JWT and document-worker token.
- No sensitive request bodies, prompts, tokens or private document text in logs.
- Dependency and container vulnerability reports where available.

**Pass evidence:** record findings and severity. Security review is not a penetration test, and missing production identity-provider configuration remains a Phase 10 gate.

## 9.9 — Performance, reliability and recovery checks

Run only against local or isolated non-production services with synthetic/approved public data. The existing k6 profile is a staged health-endpoint smoke test (1, 5 and 20 virtual users); it is not a representative workload benchmark.

Before using k6, verify the target URL and confirm the target is not production:
```powershell
k6 run -e BASE_URL=http://127.0.0.1:8080 infrastructure/operations/k6-health-smoke.js
```

Capture p50/p95/p99 latency, throughput, error ratio, CPU, memory, database connections and logs. Exercise controlled service restart and local backup/restore only after a verified backup exists. Follow `infrastructure/operations/LOAD-AND-RECOVERY-PLAN.md`.

**Pass evidence:** measured results, test duration, load profile, resource utilization, recovery duration and defects recorded. Candidate thresholds in the load plan are not approved production SLOs.

## 9.10 — Defect closure, full retest and Phase 10 handoff

For every defect record:
- Unique issue/reference, severity, affected service/route and reproduction steps.
- Expected versus actual behavior, relevant log/error and root cause.
- Smallest safe code change and regression test.
- Retest result and commit SHA.

Then rerun all applicable gates 9.1–9.9 and confirm:
- Active Vite/Node path remains functional.
- Migration candidates remain opt-in and fail safely.
- No secrets or test data were committed.
- Stashes remain preserved until local changes are deliberately restored/reconciled.
- Open manual, database, identity, AI, security, browser and recovery checks are explicitly listed for Phase 10.

**Exit rule:** Phase 9 is complete only when all applicable automated tests pass, manual checks are recorded, defects are fixed or formally accepted, and environment-dependent limitations are visible. Phase 9 does not authorize production deployment, Terraform apply, default routing changes or legacy-service retirement.

## Phase 9 execution record

| Gate | Status | Evidence |
|---|---|---|
| 9.1 Regression suite | Pending local execution | Record command output and commit |
| 9.2 Type checks/builds | Pending local execution | Record three build/check results |
| 9.3 Service/container validation | Pending local execution | Record service tests and image builds |
| 9.4 API/service integration | Pending local execution | Record endpoint and auth checks |
| 9.5 Browser end-to-end | Pending manual execution | Record browser, route and interaction results |
| 9.6 Responsive/accessibility | Pending manual execution | Complete accessibility checklist |
| 9.7 Database parity | Pending isolated PostgreSQL rehearsal | Dry-run, import and reconciliation reports |
| 9.8 Security/configuration | Pending review | Record findings and severity |
| 9.9 Performance/recovery | Pending isolated execution | k6 and recovery evidence |
| 9.10 Closure/handoff | Pending | Full retest and Phase 10 handoff |

**Current result:** repository-side review only. No local tests, browser sessions, database imports, load tests or recovery exercises have been executed by this document update.
