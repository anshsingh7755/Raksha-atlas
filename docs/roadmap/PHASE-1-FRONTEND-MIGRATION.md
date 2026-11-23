# Phase 1 — Frontend Migration to Next.js

**Target:** Next.js 15 App Router + React 18 + TypeScript  
**Branch:** `work/step-1-foundation`  
**Status:** Started — architecture audit recorded; migration cutover not started.

## 1. Migration objective

Move the existing Raksha Atlas user interface from the root Vite application into the existing Next.js application without redesigning the product or creating a second implementation. The Vite application remains the known-good reference until Next.js route and interaction parity is demonstrated.

## 2. Current-state audit

| Concern | Current implementation | Migration implication |
|---|---|---|
| Active UI | Root `src/App.tsx`, React 18 and Vite | Preserve as the feature reference during migration |
| UI composition | Main application and feature components under root `src/` | Reuse and extract components; do not copy the UI into a second tree |
| Current entry point | Root `src/main.tsx` mounts `App` with React DOM | Vite-only bootstrap; Next.js uses App Router |
| Next.js entry point | `frontend/app/layout.tsx` imports root `src/styles.css` | Existing global styling can be reused initially |
| Next.js page | `frontend/app/page.tsx` dynamically imports root `src/App` with `ssr: false` | Transitional client-only bridge; not the final server-rendered architecture |
| API routing | `frontend/next.config.mjs` rewrites `/api/:path*` to `http://127.0.0.1:8787/api/:path*` | Works for local Node API; must become environment-configurable before deployment |
| Package boundary | Separate `frontend/package.json` with Next.js 15.5, React 18 and TypeScript | Next.js can be installed and run independently of root Vite |
| Existing backend | Node API remains the active API | Phase 1 must preserve current API contracts; Spring Boot migration belongs to Phase 2 |

## 3. Important findings and constraints

1. The current Next.js app is a compatibility shell around the existing Vite/React UI. It is not yet a completed frontend migration.
2. The current page disables server-side rendering for the entire application. This is a safe initial bridge for browser-dependent UI, but it does not yet deliver the intended App Router/server-rendering benefits.
3. The current navigation is implemented inside the existing application. Route mapping and deep-link behavior must be documented before splitting pages.
4. The Next.js API rewrite currently points to a fixed local Node API address. Use environment configuration for local, test and deployed environments before production use.
5. Do not move business logic into Next.js. The frontend should call the existing API through typed clients.
6. Do not delete root `src/`, Vite configuration or the current development scripts until parity, tests and rollback are demonstrated.
7. Keep the existing Node backend and current data sources unchanged during Phase 1.

## 4. Migration sequence

### 1.1 — Audit and baseline (current task)
- Record current UI entry points, components, styles, API usage and runtime dependencies.
- Record the current Next.js bridge and its limitations.
- Keep Vite as the reference implementation.

### 1.3 — Route and API contract map (initial implementation committed; validation pending)
- Added a route-aware Next.js shell that maps URL paths to the existing application view state.
- Added route destinations for overview, commands, Theatre Atlas, inventory, programmes, articles, briefs, documents, sources, procurement, timeline, watch, PIB releases, register and history.
- Updated the shared React application to accept an initial view and a navigation callback. Vite continues using its existing hash navigation when no callback is supplied.
- Added the Next.js catch-all section route so direct navigation and refreshes can resolve the supported section paths.
- Existing feature components and API calls remain shared; this is an incremental route integration, not a duplicate UI.
- Remaining: local typecheck/build, direct URL refresh checks, browser back/forward checks, and route-by-route feature verification.

### 1.4 — Incremental App Router migration
- Move one route/feature at a time.
- Extract shared navigation, layout, dialogs, search and feature components.
- Keep browser-only functionality in focused client components rather than making the entire application client-only.
- Verify feature parity against Vite after each route.

### 1.5 — Cutover
- Add automated route and interaction checks.
- Compare API behavior and user-visible features.
- Make Next.js the primary local runtime only after all agreed routes pass.
- Retire Vite only after parity, data integrity and rollback checks pass.

## 6. Acceptance criteria

- [ ] Next.js development server starts reliably.
- [ ] Next.js production build and TypeScript checks pass.
- [ ] All existing navigation destinations have a route or an explicitly approved equivalent.
- [ ] Inventory, programmes, news, Theatre Atlas, search, documents and assistant interactions retain feature parity.
- [ ] API requests continue to reach the active Node API without hard-coded production addresses.
- [ ] Loading, empty and error states remain usable.
- [ ] Keyboard navigation, dialog focus handling and responsive behavior are preserved.
- [ ] No existing data, API or Vite implementation is removed before cutover approval.
- [ ] CI validates the Next.js application before it becomes the primary frontend.

## 7. Local commands

Run these from the repository root in PowerShell:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. Keep the existing Node API running on port 8787 in a separate terminal.

For validation:

```powershell
npm run typecheck
npm run build
```

The Next.js API rewrite currently expects the Node API at `http://127.0.0.1:8787`.

## 8. Current decision

Phase 1.1 audit is recorded. Phase 1.2 API-proxy configuration and CI checks are committed; the user has confirmed that the Next.js homepage runs locally. The new CI result and local typecheck/production build remain to be verified. Phase 1.3 route integration is committed; browser navigation and deep-link verification remain pending. The Vite application remains the active reference until Phase 1 acceptance criteria are met. Phase 0 manual validation also remains open; this Phase 1 preparation does not mark Phase 0 as closed.
