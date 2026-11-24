# Phase 3 — AI service foundation

**Target:** Python 3.11+, FastAPI, Pydantic, LangGraph, LiteLLM, PostgreSQL/pgvector and approved model providers.  
**Branch:** `work/step-1-foundation`

## Service boundary and security

The browser must never call FastAPI for privileged AI/data operations. Spring Boot is the intended authenticated gateway and forwards only authorized, bounded requests to the private AI service. The current Node API/RAG remains active during migration. The document-extraction worker token is a separate credential and must not be reused as a user JWT or model-provider key. Keep the AI service private; configure service-to-service authentication/network policy before deployment.

All public-source content is untrusted input. Preserve source IDs, canonical URLs, publisher, publication/collection dates, page references and verification status. Never ingest classified, leaked, restricted or operationally sensitive material.

## Sub-phases 3.1–3.5

| Sub-phase | Scope | Implementation |
|---|---|---|
| 3.1 | Versioned API contracts and access boundaries | Pydantic v2 request/response schemas; bounded payloads; private-service/gateway rule documented |
| 3.2 | Extraction-to-chunk pipeline | Deterministic page-aware chunker; stable chunk IDs; overlap; source provenance on every chunk |
| 3.3 | Embedding generation and vector-index boundary | OpenAI-compatible embedding client; provider/model configurable; no synthetic vectors; fail closed without credentials. pgvector persistence awaits DB extension/schema and acceptance |
| 3.4 | Evidence retrieval and citations | Typed retrieval request/response with evidence metadata and page/source citation shape; pgvector adapter remains disabled until provisioned |
| 3.5 | LLM provider/model routing | LiteLLM adapter, explicit model allow-list, configurable default and bounded generation; optional dependency installed only when model workflows are enabled |

## Configuration

- `EMBEDDING_API_BASE_URL` defaults to the OpenAI-compatible `/v1` API base.
- `EMBEDDING_API_KEY` (or `OPENAI_API_KEY`) is required for embeddings.
- `EMBEDDING_MODEL` defaults to `text-embedding-3-small`.
- `AI_ALLOWED_MODELS` is a comma-separated exact allow-list (for example `openai/gpt-4.1,ollama/llama3`).
- `AI_DEFAULT_MODEL` must be present in the allow-list.
- `DATABASE_URL` is required for future vector retrieval; retrieval currently returns 503 rather than pretending a search occurred.

## API surface introduced

- `GET /v1/ai/capabilities` — configured capabilities, never exposes secrets.
- `POST /v1/documents/chunk` — worker-token protected chunking of already-extracted page text.
- `POST /v1/embeddings` — worker-token protected embedding generation.
- `POST /v1/retrieval/search` — worker-token protected retrieval contract; returns 503 until pgvector adapter is implemented and validated.
- `POST /v1/models/completions` — worker-token protected allow-listed model completion.

These endpoints are internal service APIs, not browser-facing endpoints. Authentication at the existing document-worker boundary is transitional; before production, replace or augment it with dedicated service identity, network restrictions, request signing/mTLS and audit correlation.

## Acceptance and deferred work

3.1–3.5 code foundations do not constitute a production RAG system. Remaining gates: provision pgvector extension/schema, implement persistent chunk/vector upsert and similarity search, integrate service identity, add end-to-end Spring gateway forwarding, evaluate citations/answer quality, and measure latency/cost. Existing Node RAG is not removed or rerouted in this phase.
