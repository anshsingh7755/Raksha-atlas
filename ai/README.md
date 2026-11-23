# Raksha Atlas AI and document extraction service

This service remains separate from the current Node.js RAG implementation. Phase 0.7 uses it as a bounded public-PDF extraction worker.

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

The Node API must use the same `DOCUMENT_WORKER_TOKEN` and `DOCUMENT_EXTRACTION_URL=http://127.0.0.1:8001`.

## Extraction endpoint

`POST /documents/extract` with a bearer worker token and JSON body:

```json
{"url":"https://approved-public-host.example/report.pdf","ocr":false}
```

The response contains SHA-256, byte size, final URL, page count, page-numbered text, extraction status, engine and warnings. If a PDF is image-only, it is marked `needs_ocr`. Retry with `ocr: true` to use English Tesseract OCR (installed in the container image). OCR is capped by `DOCUMENT_MAX_OCR_PAGES`.

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

Future responsibilities include RAG retrieval, embeddings, model routing and evaluation; this worker does not replace `server/rag.mjs`.
