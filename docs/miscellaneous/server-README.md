# Backend — the Node.js service behind the website

## 1. What is the backend?

The backend is the part of Raksha Atlas that works behind the website. The frontend sends it a request; the backend decides what data or operation is needed and sends a response.

The active backend is in this `server/` folder and uses Node.js. Its main entry point is `index.mjs`.

The separate `backend/` folder contains a Spring Boot migration service. It has not replaced this Node.js API.

## 2. Main responsibilities

The Node backend currently brings together several jobs:

- Receive website API requests.
- Read the existing project data and configuration.
- Return inventory, programme, command, news, document and other records.
- Collect information from configured public sources.
- Clean and classify collected records.
- Schedule background refresh jobs while the process is running.
- Search records and prepare evidence for assistant answers.
- Use PostgreSQL when the relevant database configuration and code path are enabled.

The backend must not expose secrets to the browser. Credentials stay on the server.

## 3. Important files and folders

| Path | What it does |
|---|---|
| `index.mjs` | Main API entry point. Receives requests and connects the route handlers and services. |
| `collectors/` | Code that reads configured public feeds or source endpoints. |
| `extractors/` | Code that reads selected metadata or text from permitted pages and documents. |
| `processors/` | Code that cleans, normalizes, deduplicates or enriches collected records. |
| `workers/` | Background tasks that perform ingestion or other work outside the immediate browser request. |
| `scheduler/` | Starts time-based jobs while the API process is alive. |
| `search/` | Finds records that match a search request. |
| `documents/` | Document-related routes and processing helpers. |
| `db/` | PostgreSQL schema and storage adapter code. |
| `rag.mjs` | Retrieval-augmented generation logic: finds useful project evidence and prepares context for assistant answers. |
| `*.json` | Existing data and configuration inputs used by current API features. |

Some folders contain tests beside the code. A file ending in `.test.mjs` is test code, not a separate runtime service.

## 4. A normal website request

```text
Browser
  |
  | GET /api/...
  v
Vercel adapter or local API server
  |
  v
server/index.mjs
  |
  v
Relevant route / service
  |
  +----> JSON data or configured database
  |
  +----> collector / processor / search / RAG service
  |
  v
JSON response
  |
  v
Browser displays the result
```

The browser should call the API. It should not read the server's local JSON files directly.

## 5. How the news collection flow works

At a high level:

1. The scheduler or a manual command starts a collection run.
2. A collector reads a configured public RSS/Atom feed or supported public API.
3. The extractor may request limited public-page metadata when configured.
4. A processor normalizes URLs and checks for duplicate or similar records.
5. Enrichment can add a short summary or category, subject to configuration.
6. The result is stored through the configured JSON or PostgreSQL path.
7. The website can display the record with its source, date and review/verification labels.

A scheduled job runs only while the Node process is alive. A static website by itself cannot run the scheduler.

See [the news pipeline guide](../docs/backend/NEWS-PIPELINE.md) for the detailed flow and operating limits.

## 6. JSON files and PostgreSQL

The repository contains JSON data and configuration files. They are still part of the current application for some domains and local fallback paths.

PostgreSQL support exists, but do not assume every domain has been migrated or reconciled. A database migration is complete only when the schema, imported records, API behaviour and recovery path have been checked.

Never manually overwrite project data to make a test pass. Use a backup and a development database for migration experiments.

## 7. Run the backend

From the repository root:

```powershell
npm run api
```

This starts the Node API only. For the normal local website and API together:

```powershell
npm run dev:full
```

The API normally listens on port 8787 in local development. Check the terminal output and environment configuration if a different port is used.

## 8. Tests and validation

Run the repository test suite from the root:

```powershell
npm test
```

Build the frontend and type-check the application with:

```powershell
npm run build
```

For a backend change, run the relevant focused test file as well as the full suite. Then check the affected API endpoint locally with a normal request.

## 9. Safe backend change checklist

1. Find the existing route or service before adding a new one.
2. Check who calls it in `src/services/`.
3. Keep the existing response contract unless a coordinated change is intended.
4. Validate input and return clear error responses.
5. Keep credentials and internal service tokens on the server.
6. Preserve source attribution and review status when changing collected records.
7. Add tests for success, invalid input and failure cases.
8. Run tests and build; record exactly what was checked.

## 10. Important boundaries

- Do not put business logic into the thin Vercel adapter in `api/`.
- Do not create duplicate Node and Spring Boot routes without a migration plan.
- Do not treat an RSS result or AI-generated summary as verified fact.
- Do not collect private, restricted or classified material.
- Do not remove JSON files or switch API consumers to PostgreSQL until data parity and rollback have been demonstrated.
- Do not claim the FastAPI service replaces `server/rag.mjs`; the Node RAG implementation remains the active path until a documented cutover is approved.