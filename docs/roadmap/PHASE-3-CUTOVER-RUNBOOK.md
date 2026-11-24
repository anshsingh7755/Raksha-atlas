# Phase 3 — AI service rollout and rollback runbook

## Current migration stance

FastAPI is a private candidate service. Node `server/rag.mjs` remains the production/reference RAG path until all gates below pass. Do not route browser traffic directly to FastAPI. Spring Boot is the only intended user-facing gateway.

## Required environment

AI service:
- `DOCUMENT_WORKER_TOKEN`: dedicated internal service token; never reuse a user JWT.
- `DATABASE_URL`: PostgreSQL DSN for the AI vector store.
- `EMBEDDING_API_KEY` or `OPENAI_API_KEY`.
- `EMBEDDING_MODEL=text-embedding-3-small` (the current schema expects 1536 dimensions).
- `AI_ALLOWED_MODELS`: exact comma-separated LiteLLM model allow-list.
- `AI_DEFAULT_MODEL`: optional default which must appear in the allow-list.
- Provider-specific credentials required by LiteLLM.

Spring Boot:
- `RAKSHA_AI_ENABLED=true`
- `RAKSHA_AI_BASE_URL`: private FastAPI service URL.
- `RAKSHA_AI_SERVICE_TOKEN`: same dedicated service token configured for FastAPI.

The PostgreSQL server must have pgvector installed before applying `ai/sql/001_ai_document_chunks.sql`. The SQL creates the vector extension/table/index separately from the existing Phase 2 Flyway migrations. Keep this additive and review it before applying to any shared database.

## Rollout sequence

1. Deploy FastAPI privately with network access restricted to Spring Boot and approved worker callers.
2. Apply the AI chunk schema only after verifying pgvector availability and backup/recovery.
3. Index a small, reviewed corpus of openly published documents; preserve source IDs, URLs, publication dates, page numbers and verification status.
4. Verify chunk count, vector dimensions, duplicate upserts and source filters.
5. Test `/v1/retrieval/search` and `/v1/assistant/answer` with a reviewed question set.
6. Configure Spring Boot gateway and verify JWT role checks and service-token forwarding.
7. Compare candidate answers with the existing Node RAG on identical questions and source snapshots.
8. Review citations, evidence sufficiency, unsupported-claim rate, latency, token usage and estimated cost.
9. Enable AI gateway for a limited authorized cohort only after approval. Retain the Node RAG path and rollback switch.

## Rollback

- Set `RAKSHA_AI_ENABLED=false` in Spring Boot and restore the existing Node RAG consumer path.
- Keep indexed chunks and original documents intact for investigation; do not delete data as part of rollback.
- Revoke/rotate the AI service token if exposure is suspected.
- Record the failing evaluation cases, trace IDs, model, cost and service version without logging prompts or sensitive document text.
- Do not remove Node RAG until release owner approves after a sustained parity window.

## Acceptance checklist

- [ ] pgvector extension and schema applied on target database
- [ ] Index upsert is idempotent and vector dimensions match configured model
- [ ] Retrieval returns source/page-linked evidence and respects source filters
- [ ] Evaluation dataset reviewed and expanded; regression suite passes
- [ ] Spring Boot gateway auth, role checks and service identity verified
- [ ] Node-vs-FastAPI comparative evaluation approved
- [ ] Citation accuracy, answer quality, latency and cost thresholds approved
- [ ] Monitoring/alerts and rollback rehearsal completed
- [ ] Explicit release approval for traffic change

Completing Phase 3 implementation does not itself authorize production traffic migration or retirement of Node RAG.
