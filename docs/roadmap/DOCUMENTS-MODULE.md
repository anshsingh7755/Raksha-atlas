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
| extractedText / pages | Optional bounded text and page-level references |
| evidenceStatus | unreviewed, official, verified, reported, disputed or withdrawn |
| summary / notes | Editorial context, not a substitute for the source |

## API

### `GET /api/documents`

Query parameters: `q`, `service`, `type`, `extractionStatus`, `evidenceStatus`, `limit`, `offset`.

Returns `items`, `count`, `total`, `filters`, `availableFilters`, `policy` and pagination metadata. Results are sorted by publication date (newest first), then title.

### `POST /api/documents`

Registers metadata and optional already-extracted public text. In production, write access requires `RAKSHA_ADMIN_TOKEN` as a bearer token. URL validation is syntactic at registration time; the API does not fetch the submitted URL or download a file. Duplicate canonical URLs are rejected.

## Extraction boundary

The current Node.js phase establishes the metadata contract and page-aware storage shape. It does not pretend to parse arbitrary PDF binaries. The production extraction worker belongs in the planned FastAPI/Python service: fetch only permitted public files, validate content type and size, calculate SHA-256, extract text while preserving page boundaries, and mark scanned/unsupported files explicitly. OCR is a later opt-in capability with provenance and confidence metadata.

## Search and UI

Documents appear in Global Search under the Documents section and open the Documents register with the search query preserved. The register exposes publisher, publication date, document type, service, evidence status, extraction state and the original public source link.

## Tests and acceptance

- URL canonicalization strips tracking parameters and fragments.
- Non-HTTPS and credential-bearing URLs are rejected.
- Duplicate canonical URLs are rejected.
- Missing extraction is labelled metadata-only; page-level references are retained when provided.
- No extraction status is upgraded merely because a publisher is official.
- Build, API and browser smoke tests remain part of Phase 0.10.
