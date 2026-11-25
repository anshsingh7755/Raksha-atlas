# Backend — the part that works behind the website

The backend receives requests from the website, finds or updates information, and sends a response.

## How it is made

The active backend uses Node.js. Its main entry file is `index.mjs`.

## What is inside this folder?

| Path | Simple meaning |
|---|---|
| `index.mjs` | Starts the API and connects the main parts. |
| `collectors/` | Collects information from configured public sources. |
| `extractors/` | Reads useful details from source pages and documents. |
| `processors/` | Cleans, checks and prepares collected information. |
| `workers/` | Runs background collection work. |
| `scheduler/` | Starts scheduled refresh work. |
| `search/` | Finds matching records. |
| `documents/` | Handles document records and extraction flow. |
| `db/` | Database connection and storage code. |
| `rag.mjs` | Finds information to help answer assistant questions. |
| `*.json` | Existing data and configuration files used by the API. |

## How does it work?

1. The website sends a request to `/api/...`.
2. The Node API receives it.
3. The API reads data or calls the required collector, processor or service.
4. It sends the result back to the website.

## Run locally

From the repository root:

```powershell
npm run dev:full
```

This starts the active backend and frontend together. The API normally listens on port 8787.

**Important:** keep existing backend behaviour working. The separate `backend/` folder is the Spring Boot migration service; it has not replaced this active Node API.
