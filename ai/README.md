# Raksha Atlas AI and document extraction service

This service remains separate from the current Node.js RAG implementation. Phase 0.7 uses it as a bounded public PDF and HTML extraction worker.

## Run locally

```powershell
cd ai
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
$env:DOCUMENT_WORKER_TOKEN = "replace-with-a-long-random-secret"
$env:DOCUMENT_ALLOWED_HOSTS = "mod.gov.in,pib.gov.in,drdo.gov.in"
python -m uvicorn app.main:app --reload --port 8001
```

The Node API uses `DOCUMENT_WORKER_TOKEN` for extraction. Internal Phase 3 APIs use a separate `AI_SERVICE_TOKEN`; Spring Boot forwards authorized requests using `RAKSHA_AI_SERVICE_TOKEN`. Configure the same random secret on both services, but never reuse the end-user JWT signing secret.

## Extraction endpoint

`POST /documents/extract` with a bearer worker token and JSON body:

```json
{"url":"https://approved-public-host.example/report.pdf","ocr":false}
```

The response contains SHA-256, byte size, final URL, extraction status, engine and warnings. PDF output includes page count and page-numbered text; HTML output includes readable text and the source title without invented page references. If a PDF is image-only, it is marked `needs_ocr`. Retry with `ocr: true` to use English Tesseract OCR (installed in the container image). OCR is capped by `DOCUMENT_MAX_OCR_PAGES`. For local runs outside Docker, install the Tesseract binary and English language data separately to enable OCR.

## Safety and limits

- Only HTTPS URLs on explicitly configured `DOCUMENT_ALLOWED_HOSTS` are accepted.
- Every redirect target is revalidated; DNS results must be globally routable.
- Publisher `robots.txt` is checked before retrieval.
- Proxy environment variables are ignored; credentials, non-public addresses and unapproved hosts are rejected.
- PDF MIME type and signature are checked; encrypted/corrupt PDFs are rejected.
- Default download limit is 25 MiB, page limit 300, extracted text limit 200,000 characters and OCR page limit 20.
- The worker does not crawl websites, follow links in PDFs or bypass access controls.
- Only openly published material is permitted. Never submit classified, leaked, restricted or operationally sensitive documents.

## Tests

```powershell
pip install -r requirements-dev.txt
pytest -q -c pytest.ini tests
```

Phase 3.1–3.5 also add versioned internal contracts, page-aware chunking, an explicitly configured embedding client, a fail-closed pgvector retrieval boundary and optional LiteLLM model routing. See [Phase 3 AI service architecture](../docs/architecture/PHASE-3-AI-SERVICE.md). The current vector retrieval endpoint deliberately returns 503 until the pgvector adapter and populated index are provisioned; it does not return fabricated evidence. This service does not replace `server/rag.mjs` yet.


## Phase 3 AI/RAG APIs

The internal v1 endpoints are service-to-service only and require AI_SERVICE_TOKEN:

- GET /v1/ai/capabilities
- POST /v1/documents/chunk
- POST /v1/embeddings
- POST /v1/index/upsert
- POST /v1/retrieval/search
- POST /v1/assistant/answer
- POST /v1/models/completions

The document extraction endpoint remains protected by the separate DOCUMENT_WORKER_TOKEN. Do not reuse user JWT signing keys for either internal token.

The vector store schema is in sql/001_ai_document_chunks.sql and requires PostgreSQL with pgvector installed. The current schema is fixed at 1536 dimensions to match the default text-embedding-3-small model. Use a matching model or create a separately reviewed migration before changing dimensions.

Install the full AI runtime with:

```powershell
pip install -r requirements.txt -r requirements-ai.txt
```

The Docker image installs both runtime files. Optional semantic evaluation dependencies are in requirements-evaluation.txt. The starter deterministic evaluation and Node-vs-FastAPI comparison harness live under evaluation/.

## Spring Boot gateway

Spring Boot exposes authenticated POST /api/ai/answer. It is disabled by default. Configure RAKSHA_AI_ENABLED=true, RAKSHA_AI_BASE_URL, and RAKSHA_AI_SERVICE_TOKEN only after the private FastAPI service is deployed and its AI_SERVICE_TOKEN is set to the same random value. The browser never receives this token and must not call the AI service directly.

See docs/roadmap/PHASE-3-CUTOVER-RUNBOOK.md. Node RAG remains active until final parity and release approval.
