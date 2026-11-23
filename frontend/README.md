# Raksha Atlas — Next.js frontend

This folder contains the Next.js 15 App Router migration application. It currently reuses the existing React UI from the repository root through a temporary compatibility bridge.

## Prerequisites

- Node.js 20 or later
- npm
- The existing Node API running at `http://127.0.0.1:8787`

## Run locally

Open a second PowerShell terminal while the current Vite + Node application is running:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

The Next.js rewrite forwards `/api/*` requests to the existing Node API. By default it uses `http://127.0.0.1:8787`. Copy `.env.example` to `.env.local` and set `RAKSHA_API_PROXY_TARGET` when using a different API origin. Do not expose secrets through `NEXT_PUBLIC_*` variables. Do not stop the existing API while testing the Next.js frontend.

## Validate

```powershell
npm run typecheck
npm run build
```

## Current limitations

- The root `src/App.tsx` is dynamically loaded as a client-only application (`ssr: false`). This is a migration bridge, not the final App Router design.
- The existing Node API remains the backend; Spring Boot is a later migration phase.
- The API rewrite currently uses a local development address. Environment-specific API routing must be added before deployment.
- Do not delete the root Vite application until Next.js feature parity and rollback checks pass.

See [Phase 1 frontend migration plan](../docs/roadmap/PHASE-1-FRONTEND-MIGRATION.md).
