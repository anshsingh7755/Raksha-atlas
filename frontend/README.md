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

The Next.js rewrite forwards `/api/*` requests to the existing Node API by default (`RAKSHA_API_PROXY_TARGET`, default `http://127.0.0.1:8787`). Spring routing is opt-in: set `RAKSHA_SPRING_API_ENABLED=true` and `RAKSHA_SPRING_API_PROXY_TARGET=http://127.0.0.1:8081` to route only inventory, sources, programmes, procurement-2026 and chat to Spring; every other API route remains on Node. These rewrite values are evaluated during the Next.js build, so rebuild after changing them. Spring endpoints require a valid bearer token supplied through `setApiAccessTokenProvider()` by an approved OIDC client; no production identity provider is wired yet, so keep Spring routing disabled. Never expose credentials through `NEXT_PUBLIC_*` variables.

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

## Phase 7 integration

See [Phase 7 frontend integration runbook](../docs/roadmap/PHASE-7-FRONTEND-INTEGRATION.md) for endpoint coverage, authentication handoff, validation and cutover gates.
