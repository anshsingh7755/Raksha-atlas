## Simple explanation

This document explains the design of the separate Python AI service.

The browser must not send privileged requests straight to this service. The intended design is for an authenticated backend gateway to check the user and then call the private AI service. This keeps service tokens away from the browser.

The document describes service boundaries, tokens, evidence handling, AI components and the steps still needed before the current Node assistant can be replaced.

# Phase 3 — AI service architecture

**Target:** Python 3.11+, FastAPI, Pydantic v2, LangGraph, LiteLLM, PostgreSQL/pgvector and approved model providers.  
**Branch:** work/step-1-foundation  
**Implementation:** Sub-phases 3.1–3.10 are implemented in the repository. Full repository CI passed in [run #393](https://github.com/anshsingh7755/Raksha-atlas/actions/runs/45354246193) on commit `c1986ff`. Runtime/provider/database acceptance and traffic migration are deferred to the Phase 10 final acceptance window.

## Service boundary and security

The browser must never call FastAPI for privileged AI/data operations. Spring Boot is the authenticated user-facing gateway and forwards bounded requests to the private AI service. The Spring gateway is disabled by default. Node API/RAG remains the active production/reference path until parity and release approval.

Credentials are separate:
- AI_SERVICE_TOKEN protects internal v1 AI endpoints.
- DOCUMENT_WORKER_TOKEN protects the public-document extraction worker endpoint.
- RAKSHA_AI_SERVICE_TOKEN is configured in Spring Boot with the same random value as AI_SERVICE_TOKEN.
- User JWT signing secrets and model-provider API keys must never be reused as service tokens.

All public-source content is untrusted input. Preserve source IDs, canonical URLs, publisher, publication/collection dates, page references and verification status. Official publisher provenance does not independently verify every claim. Never ingest classified, leaked, restricted or operationally sensitive material.

## Sub-phases 3.1–3.10

| Sub-phase | Scope | Implementation |
|---|---|---|
| 3.1 | Versioned API contracts and access boundaries | Pydantic v2 request/response models, bounded payloads, dedicated internal AI token and separate document worker token |
| 3.2 | Extraction and chunking | Deterministic page-aware chunking, overlap, stable IDs and source metadata |
| 3.3 | Embeddings and vector indexing | Configurable OpenAI-compatible embeddings, validated 1536-dimensional vectors and idempotent pgvector upserts |
| 3.4 | Evidence retrieval and citations | pgvector cosine similarity, source-ID filters and source/page-linked evidence responses |
| 3.5 | LLM provider/model routing | LiteLLM adapter, exact model allow-list, bounded generation and token/cost/latency logging |
| 3.6 | AI workflows | LangGraph retrieval-to-answer workflow with deterministic fallback and evidence-only answer instructions |
| 3.7 | Evaluation | Starter golden dataset, required/forbidden concept regression evaluator and Node-vs-FastAPI comparison harness |
| 3.8 | Spring Boot gateway | Authenticated POST /api/ai/answer; role-protected gateway; private service token remains server-side |
| 3.9 | Legacy RAG migration | Candidate workflow, comparative metrics and explicit cutover/rollback runbook; Node RAG retained |
| 3.10 | Operational readiness | Request latency header/logs, model token/cost/latency telemetry, tests, configuration and rollout checklist |

## API surface

AI service internal APIs (AI_SERVICE_TOKEN required):
- GET /v1/ai/capabilities
- POST /v1/documents/chunk
- POST /v1/embeddings
- POST /v1/index/upsert
- POST /v1/retrieval/search
- POST /v1/assistant/answer
- POST /v1/models/completions

Document extraction remains at POST /documents/extract and requires DOCUMENT_WORKER_TOKEN.

Spring Boot exposes POST /api/ai/answer to authenticated ADMIN, ANALYST or VIEWER roles. It forwards only to the configured private FastAPI URL and returns 503 when the gateway is disabled or missing its service token. FastAPI is not a browser API.

## Configuration and database schema

- EMBEDDING_API_BASE_URL defaults to the OpenAI-compatible /v1 API base.
- EMBEDDING_API_KEY or OPENAI_API_KEY is required for embeddings.
- EMBEDDING_MODEL defaults to text-embedding-3-small.
- AI_ALLOWED_MODELS is a comma-separated exact LiteLLM model allow-list.
- AI_DEFAULT_MODEL must appear in AI_ALLOWED_MODELS.
- DATABASE_URL points to PostgreSQL with pgvector installed.
- AI_SERVICE_TOKEN and DOCUMENT_WORKER_TOKEN are separate random secrets.
- Spring Boot uses RAKSHA_AI_ENABLED (default false), RAKSHA_AI_BASE_URL and RAKSHA_AI_SERVICE_TOKEN.

The additive schema is ai/sql/001_ai_document_chunks.sql. It enables pgvector and creates the page/source-aware chunk table with a cosine HNSW index. The current vector column is fixed at 1536 dimensions to match text-embedding-3-small. Changing embedding dimensions requires a reviewed schema migration and reindex, not just a model environment change.

The Docker image installs requirements.txt and requirements-ai.txt. Optional semantic evaluation tooling is isolated in requirements-evaluation.txt.

## Evaluation and migration controls

The starter golden dataset is intentionally small and must be expanded with reviewed question/evidence/citation examples. The deterministic evaluator is a regression guard, not a semantic truth judge. The comparison harness reports matched questions, citation counts, evidence counts and latency deltas; it does not claim semantic equivalence. Human review must assess citation correctness, unsupported claims, abstention quality and evidence sufficiency.

See [Phase 3 rollout and rollback runbook](../roadmap/PHASE-3-CUTOVER-RUNBOOK.md).

## Deferred final acceptance

Implementation is committed, but production acceptance remains deferred:
- Install pgvector and apply the AI schema on the target database.
- Configure approved embedding/model credentials and private service networking.
- Index a reviewed corpus of openly published sources.
- Verify idempotent indexing, source filters, retrieval relevance and page citations.
- Validate Spring Boot JWT role checks and service identity against the approved identity provider.
- Compare Node and FastAPI on the same questions and source snapshot.
- Approve answer quality, citation accuracy, latency and cost thresholds.
- Complete monitoring/alert review and rollback rehearsal.

Do not enable the Spring gateway by default, switch user traffic or retire Node RAG before these gates pass and the release owner explicitly approves.
