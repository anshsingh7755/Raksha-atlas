# AI and document service — FastAPI

## 1. What is this service?

This folder contains a Python FastAPI service for safely extracting text and metadata from approved public documents and for building future AI/RAG capabilities.

**It is not currently the website's main assistant backend.** The active assistant retrieval path is still in `server/rag.mjs` in the Node.js backend. This FastAPI service is a separate supporting service and migration path.

## 2. What problem does it solve?

A public PDF may contain many pages. A normal web page or the browser cannot safely and reliably turn every PDF into clean, searchable text. This service provides a controlled worker that can:

- Receive an approved public document URL.
- Check that the URL and host are allowed.
- Download within configured size limits.
- Extract text from PDF pages or HTML.
- Optionally use OCR for image-only PDF pages.
- Return page-aware text and metadata to the calling service.

The later AI modules add chunking, embeddings, retrieval boundaries and model routing. Those foundations do not mean a production vector database or complete assistant cutover is already active.

## 3. Main parts

| Path | Purpose |
|---|---|
| `app/main.py` | FastAPI application and HTTP endpoints. |
| `app/documents.py` | Public document retrieval and extraction controls. |
| `app/contracts.py` | Request/response data contracts. |
| `app/chunking.py` | Splits extracted text into smaller searchable pieces. |
| `app/embeddings.py` | Embedding client boundary. |
| `app/vector_store.py` | Vector-store integration boundary. |
| `app/retrieval.py` | Retrieval service boundary. |
| `app/model_router.py` | Optional model/provider routing. |
| `app/workflows.py` | AI workflow coordination. |
| `app/observability.py`, `app/telemetry.py` | Metrics and tracing support. |
| `sql/` | AI document/vector table schema. |
| `tests/` | Automated service tests. |
| `evaluation/` | Deterministic and comparative answer evaluation tools. |

## 4. How a document extraction request works

```text
Node API or trusted service
        |
        | POST /documents/extract
        | bearer DOCUMENT_WORKER_TOKEN
        v
FastAPI validates token and request
        |
        v
Checks HTTPS host, DNS, redirects and robots rules
        |
        v
Downloads within configured limits
        |
        v
Extracts PDF pages or HTML text
        |
        v
Returns text, hashes, status and warnings
```

PDF output is page-aware. An image-only PDF can be marked as needing OCR. OCR is optional and bounded by a page limit.

## 5. Run locally on Windows

From the repository root:

```powershell
cd ai
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
$env:DOCUMENT_WORKER_TOKEN = "use-a-long-random-local-secret"
$env:DOCUMENT_ALLOWED_HOSTS = "mod.gov.in,pib.gov.in,drdo.gov.in"
python -m uvicorn app.main:app --reload --port 8001
```

The service should be available at http://localhost:8001. Check the health endpoint implemented by the app if you need to confirm startup.

For the full AI runtime, the repository also provides `requirements-ai.txt`. Install optional dependencies only when the feature being tested needs them.

## 6. Two separate service tokens

Do not confuse these credentials:

- `DOCUMENT_WORKER_TOKEN` protects the document extraction endpoint.
- `AI_SERVICE_TOKEN` protects internal Phase 3 AI service endpoints.
- `RAKSHA_AI_SERVICE_TOKEN` is the Spring Boot-side value used when it forwards to the AI service.

Use long random local values. Never reuse a user JWT signing secret or commit token values.

## 7. Main extraction endpoint

`POST /documents/extract` accepts a bearer worker token and a JSON request such as:

```json
{"url":"https://approved-public-host.example/report.pdf","ocr":false}
```

The response includes information such as the SHA-256 hash, byte size, final URL, extraction status, engine and warnings. PDF text includes page numbers. HTML output includes readable text and source title; it does not invent page numbers.

## 8. Safety controls

The worker is deliberately limited:

- Only HTTPS URLs on configured `DOCUMENT_ALLOWED_HOSTS` are accepted.
- Redirect targets are checked again.
- DNS results must be globally routable.
- Publisher robots rules are checked.
- Proxy environment variables are ignored.
- Private/local addresses and unapproved hosts are rejected.
- PDF type and signature are checked.
- Download, page, text and OCR limits are enforced.
- It does not crawl whole websites or bypass logins, paywalls or access controls.
- Never submit classified, leaked, restricted or operationally sensitive documents.

## 9. Tests

From the `ai/` folder:

```powershell
pip install -r requirements-dev.txt
pytest -q -c pytest.ini tests
```

Evaluation tools are regression aids. They are not proof that an answer is factually correct. Human review of evidence and citations is still required.

## 10. Current status and migration boundary

The extraction worker and several AI/RAG foundations are implemented in this folder. The vector retrieval endpoint deliberately fails closed until its required database adapter and populated index are provisioned. Do not treat a placeholder endpoint or schema as a working production vector search.

Node RAG remains active until feature parity, evidence quality, security, integration tests and release approval are complete.

---

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
