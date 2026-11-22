# Raksha Atlas: simple project structure

This is a React + TypeScript website with a small Node.js API.

## Project tree

```text
Defence/
├── index.html              Browser entry HTML
├── package.json            Commands and dependencies
├── vite.config.ts          Frontend server and /api proxy
│
├── src/                    Frontend code
│   ├── main.tsx            Starts React
│   ├── App.tsx             Pages, navigation and API requests
│   └── styles.css          Website styling
│
├── server/                 Backend code
│   ├── index.mjs           HTTP API routes
│   ├── rag.mjs             Atlas Assist retrieval/chat
│   ├── *.json              Local website data
│   ├── collectors/         RSS, YouTube and X collection
│   ├── extractors/         Public article metadata extraction
│   ├── processors/         Deduplication and enrichment
│   ├── scheduler/          Hourly and daily jobs
│   ├── workers/            Background workers
│   └── db/                 Optional PostgreSQL storage
│
├── scripts/                Manual data and database commands
├── deploy/                 Nginx production configuration
├── Dockerfile              Production image instructions
└── docker-compose.yml      Web + API + PostgreSQL services
```

## Runtime diagram

```text
Browser
  ↓
index.html
  ↓
src/main.tsx
  ↓
src/App.tsx ─── src/styles.css
  │
  │ fetch("/api/...")
  ↓
Vite :5173 ── proxy ──> Node API :8787
                              │
                              ├── server/*.json
                              └── PostgreSQL when DATABASE_URL exists
```

## What to edit

| Goal                                        | Edit                                                       |
| ------------------------------------------- | ---------------------------------------------------------- |
| Change text, page layout or API request     | `src/App.tsx`                                              |
| Change colors, spacing or responsive design | `src/styles.css`                                           |
| Change local inventory/news data            | Relevant file in `server/`                                 |
| Add or change an API endpoint               | `server/index.mjs`                                         |
| Change ingestion behavior                   | `server/collectors/`, `extractors/`, or `processors/`      |
| Change scheduled jobs                       | `server/scheduler/`                                        |
| Change database structure                   | `server/db/schema.sql` and `server/db/store.mjs`           |
| Change deployment                           | `Dockerfile`, `docker-compose.yml`, or `deploy/nginx.conf` |

## Main request flow

```text
User opens a page
  → App.tsx selects the hash route
  → App.tsx requests /api/data
  → server/index.mjs handles the route
  → JSON file or PostgreSQL provides data
  → API returns JSON
  → React renders the page
```

## Local development

```powershell
cd "C:\Users\singh\OneDrive\Desktop\Defence"
npm install
npm run dev:full
```

Open:

```text
http://localhost:5173/#inventory
```

Useful commands:

```powershell
npm run format        # format source code
npm run format:check  # check formatting
npm run build         # type-check and production build
```

## Storage rule

Local development uses JSON files. Docker production uses PostgreSQL when
`DATABASE_URL` is configured. The frontend should communicate with data through
the API, not read server files directly.
