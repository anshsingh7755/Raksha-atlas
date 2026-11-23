# Phase 0.10 — Quality Gate

## Purpose

Prove that the current Vite/React frontend, Node API, document worker and local container configuration remain buildable and that the core public read APIs return usable response contracts. This phase does not authorize the Next.js/Spring Boot migration.

## Automated checks

The GitHub Actions workflow `.github/workflows/validate.yml` runs:

1. `npm ci` — reproducible dependency installation.
2. `npm test` — Node.js unit and integration tests, including a spawned API smoke test.
3. `npm run build` — TypeScript project checks and production Vite build.
4. `docker compose config --quiet` — Compose configuration validation with test-only required secrets.
5. `docker build -t raksha-atlas-ai-test -f ai/Dockerfile ai` — document-worker image build.
6. `pip install -r ai/requirements-dev.txt` and `pytest -q -c ai/pytest.ini ai/tests` — Python worker tests.

### API smoke coverage

`server/api-smoke.test.mjs` starts the real Node API on an ephemeral loopback port with PostgreSQL disabled, then checks:

- `GET /api/health` returns a healthy service response and a recognized storage mode.
- `GET /api/categories`, `/api/inventory`, `/api/programmes`, `/api/documents`, `/api/sources`, `/api/search?q=aircraft` and `/api/theatre-atlas` return HTTP 200 and their expected top-level response shapes.
- Collection counts are internally consistent for inventory, programmes, documents and Theatre Atlas.
- An unknown API path returns the stable JSON 404 contract.

The test is read-only, uses the repository's committed fixture/register files, does not call public websites or model providers, does not require secrets, and terminates the spawned API process after assertions.

## Manual and environment-dependent checks

These are deliberately not represented as automated passes:

- Browser end-to-end interaction across all pages and responsive breakpoints.
- Keyboard-only, NVDA/VoiceOver, zoom/reflow, contrast and axe/Lighthouse accessibility checks from Phase 0.9.
- Live public-document extraction. The extraction worker requires an explicit trusted-host allowlist and worker token; do not weaken the allowlist or enable arbitrary hosts merely to make a smoke test pass.
- Model-backed RAG answer quality and live web-search citations. These require provider credentials and a separately maintained evaluation dataset.
- PostgreSQL-backed integration and migration/reconciliation checks. CI currently exercises JSON development storage and Compose syntax; it does not start a populated PostgreSQL integration environment.
- Production deployment, backup/restore, load and security testing.

## Acceptance interpretation

A green CI run establishes that the automated checks listed above passed for that exact commit. It does not establish WCAG 2.2 AA conformance, production readiness, external-source availability, model answer quality, PostgreSQL migration parity or full browser end-to-end coverage.

Do not close the overall Phase 0 exit gate while earlier module-specific validation or manual checks remain open. Record the exact CI run and commit in the roadmap when available.


## Recorded CI result

- **Status:** Passed
- **Workflow run:** [#159 — validation](https://github.com/anshsingh7755/Raksha-atlas/actions/runs/45169665834)
- **Validated commit:** `ff1a75c479a24473cfc8d755ecccf3d260fb0f10`
- **Result:** Node automated test suite (including the API smoke test), production build, Docker Compose validation, document-worker image build and Python document-worker tests all completed successfully.

The README documentation link was committed afterward; it does not change application code or the validated quality-gate implementation. Follow the branch's latest workflow for that documentation-only commit separately.
