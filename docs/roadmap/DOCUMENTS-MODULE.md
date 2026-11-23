# Documents Module — Phase 0.7

## Purpose

Provide a source-led register for publicly accessible defence and government documents. This module records document provenance and extraction state; it does not imply that a publisher's document or its claims have been independently verified.

## Scope and safety

- Accept public HTTPS URLs only; reject credentials and non-HTTPS links.
- Register only openly accessible public documents from official or otherwise attributable publishers.
- Never upload, ingest, summarize or index classified, leaked, restricted or operationally sensitive material.
- Keep publisher provenance separate from evidence/claim verification.
- Preserve the original URL, canonical URL, publication date, retrieval time and optional registered source ID.
- Do not bypass publisher access controls or robots restrictions.
- Scanned PDFs must be marked `needs_ocr`; do not represent absent text as extracted content.

## Document record

| Field | Meaning |
|---|---|
| id | Stable generated or supplied record identifier |
| title / publisher | Display metadata |
| publishedAt | Publication timestamp, nullable |
| documentType | Annual report, policy, doctrine, parliamentary report, press release, tender, technical publication or other |
| service | Service/domain label |
| sourceId | Optional source registry identifier |
| originalUrl / canonicalUrl | Submitted and normalized public URL |
| fileFormat / fileSizeBytes | Declared or detected file metadata |
| checksumSha256 | Optional content checksum when the file is actually retrieved |
| retrievedAt | Metadata registration/retrieval timestamp |
| extractionStatus | not_extracted, metadata_only, text_extracted, needs_ocr, failed |
| extractedText / pages | Optional bounded text and page-level PDF references; HTML text has no invented page references |
| evidenceStatus | unreviewed, official, verified, reported, disputed or withdrawn |
| pageCount / ocrPages / extractionEngine / extractionWarnings | Extraction provenance and diagnostics |
| extractedTitle | Title parsed from the HTML document, when available |
| summary / notes | Editorial context, not a substitute for the source |

## API

### `GET /api/documents`

Query parameters: `q`, `service`, `type`, `extractionStatus`, `evidenceStatus`, `limit`, `offset`.

Returns `items`, `count`, `total`, `filters`, `availableFilters`, `policy` and pagination metadata. Results are sorted by publication date (newest first), then title.

### `POST /api/documents`

Registers metadata and optional already-extracted public text. In production, write access requires `RAKSHA_ADMIN_TOKEN` as a bearer token. URL validation is syntactic at registration time; the API does not fetch the submitted URL or download a file. Duplicate canonical URLs are rejected. After retrieval, SHA-256 is compared against previously extracted files; identical binaries are rejected with a reference to the existing document.

### `POST /api/documents/:id/extract`

Starts extraction for a registered public document. The Node API calls the private FastAPI worker using `DOCUMENT_WORKER_TOKEN`, which detects PDF or HTML/XHTML from the response content type and signature. It persists page text, SHA-256, file size, final URL, page count (PDF only), extracted HTML title, engine version, OCR page numbers, warnings and extraction status. The request body accepts `{ "ocr": true }` for an explicit PDF OCR retry. The endpoint returns 503 if the worker is not configured and 415 for unsupported content types.

## PDF extraction worker

The FastAPI service in `ai/` implements the extraction path using HTTPX, PyMuPDF and Python's HTML parser. It accepts public PDF and HTML/XHTML documents:

1. Require an explicit hostname allowlist in `DOCUMENT_ALLOWED_HOSTS`; the default empty value denies all downloads.
2. Accept HTTPS only, reject URL credentials and unapproved hosts, resolve DNS and reject any non-global IP address; custom ports are blocked.
3. Revalidate each redirect, check publisher `robots.txt` (bounded to 512 KiB), ignore ambient proxy variables and enforce download size limits.
4. Require a PDF content type and `%PDF-` signature; reject encrypted, corrupt, oversized or excessive-page files.
5. Extract PDF text page-by-page and preserve page numbers; extract readable HTML text while excluding script, style, navigation and form content. HTML text has no invented page references. Store the original URL separately from the final redirected URL.
6. Calculate SHA-256 and persist byte size, retrieval timestamp, engine version, page count and extraction warnings.
7. If PDF pages contain no usable text, mark the record `needs_ocr`. The UI then offers an explicit OCR retry using English Tesseract; OCR is capped by `DOCUMENT_MAX_OCR_PAGES`.

Default limits: 25 MiB per PDF, 300 pages, 200,000 extracted characters, 20 OCR pages. These can be configured through environment variables. The worker never crawls pages or links from a document.

### Local configuration

Set these values in `.env` for Compose, or in both the Node and Python process environments for local development:

- `DOCUMENT_WORKER_TOKEN`: shared long random secret between Node and FastAPI.
- `DOCUMENT_ALLOWED_HOSTS`: comma-separated approved public publisher hostnames, for example `mod.gov.in,pib.gov.in,drdo.gov.in`. Add only domains you have reviewed.
- `DOCUMENT_EXTRACTION_URL`: worker base URL; Compose uses `http://ai:8001`, local Node uses `http://127.0.0.1:8001`.
- `DOCUMENT_MAX_FILE_BYTES`, `DOCUMENT_MAX_PAGES`, `DOCUMENT_MAX_TEXT_CHARS`, `DOCUMENT_MAX_OCR_PAGES`: optional resource limits.

The `ai` service is included in Docker Compose and is private to the Compose network. It is not exposed through the public web service. The Node API remains the only browser-facing entry point.

### Operational limitations

The worker validates DNS before each request and restricts hosts to an operator allowlist. As with ordinary application-level URL fetchers, DNS can theoretically change between validation and connection; production hardening should pin the resolved IP at the transport layer or enforce equivalent outbound network policy. Publisher robots rules and allowlist policy are required but do not replace legal or editorial review.

## Search and UI

Documents appear in Global Search under the Documents section and open the Documents register with the search query preserved. The register exposes publisher, publication date, document type, service, evidence status, extraction state and the original public source link.

## Tests and acceptance

- URL canonicalization strips tracking parameters and fragments.
- Non-HTTPS and credential-bearing URLs are rejected.
- Duplicate canonical URLs are rejected.
- Missing extraction is labelled metadata-only; page-level references are retained when provided.
- No extraction status is upgraded merely because a publisher is official.
- Build, API and browser smoke tests remain part of Phase 0.10.
