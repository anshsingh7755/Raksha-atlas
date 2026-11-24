# Phase 1 — Frontend Migration to Next.js

**Target:** Next.js 15 App Router + React 18 + TypeScript  
**Branch:** `work/step-1-foundation`  
**Status:** Active — feature extraction and typed API foundation are underway; migration cutover not started.

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

## 4. Phase 1 — ten sub-phases (no nested tasks)

| Sub-phase | Workstream | Scope and completion result |
|---|---|---|
| 1.1 | Audit and baseline | Inventory the existing UI, routes, styles, assets, API usage and runtime dependencies; retain Vite as the reference. **Recorded.** |
| 1.2 | Next.js foundation | Configure the API proxy through environment variables and add Next.js typecheck/build CI. **Implemented; local checks passed.** |
| 1.3 | Route integration | Map supported URLs to existing views, preserve navigation callbacks and support direct route refreshes. **Implemented; browser parity checks pending.** |
| 1.4 | Shared shell extraction | Extract reusable layout elements, navigation, header, search dialog and accessible dialog primitive without duplicating the Vite UI. **Implemented; automated CI passed on the shared-shell extraction.** |
| 1.5 | Feature boundary extraction | Move one feature at a time into reusable modules and App Router route modules; preserve existing feature behavior and API contracts. **Feature boundaries implemented: Programmes, Armed Forces History, Intelligence Briefs, Procurement Watch, PIB Defence releases, programme Timelines, Documents, Signals and Sources are extracted. Sources receives shared review state and controls through typed props.** |
| 1.6 | Typed API layer | Centralize typed API requests and response models; remove duplicated request logic only where parity is proven. **In progress: shared `apiRequest`, `apiGet`, `apiPost`, `apiPatch` and `ApiError` in `src/services/api.ts`; response parsing is isolated and tested for JSON, text, empty, 204/205 and malformed JSON. Platform register, history, briefs, watch, PIB Defence, timelines, Documents, Sources and source-review controls use the shared client. Remaining legacy fetches in the integration shell and typed endpoint models still need migration.** |
| 1.7 | Rendering and states | Define server/client boundaries and retain loading, empty, error and browser-only behavior. **Implemented: App Router loading, error and not-found boundaries; browser-dependent shared UI remains an explicit client-only bridge.** |
| 1.8 | UX parity | Preserve responsive layouts, theme, keyboard access, dialogs, reduced-motion and accessibility behavior. **Implementation recorded: shared responsive styles, theme, skip link, focus-visible styles, accessible dialog and reduced-motion support; static parity contracts added. Manual browser/device verification remains pending.** |
| 1.9 | Automated parity gate | Add route/interaction coverage and verify API contracts, production build and feature parity against Vite. **Partially implemented: route registry and response parser tests run in CI alongside API smoke tests, both app builds and worker checks. Real-browser interaction and Vite comparison remain pending.** |
| 1.10 | Controlled cutover | Make Next.js primary only after acceptance; keep rollback available and retire Vite only after explicit parity approval. **Runbook and Next.js lifecycle commands implemented; public promotion and Vite retirement remain gated by manual parity checks and explicit release approval.** |

### Current implementation notes
- Shared footer: `src/components/AtlasFooter.tsx`, consumed by `src/App.tsx`.
- Shared section heading: `src/components/SectionTitle.tsx`, consumed by existing feature sections.
- Shared navigation: `src/components/AtlasNavigation.tsx`, receives the active view, navigation items and navigation callback as props.
- Shared header/search shell: `src/components/AtlasHeader.tsx`, receives state and callbacks through typed props; search-result session handoff and keyboard-accessible dialog behavior are preserved.
- Accessible dialog primitive: `src/components/AccessibleDialog.tsx`, retains focus management, Escape handling, focus trapping and focus restoration.
- These components remain in the shared root `src/` tree so Vite and Next.js can reuse one implementation.
- Programme feature: `src/features/programmes/Programmes.tsx` owns the page composition; `ProgrammeDossierExplorer.tsx` owns its data loading, filters, evidence details and milestone modal; `ProgrammeHistoryNotes.tsx` is a focused display component.
- Armed Forces History feature: `src/features/history/ArmedForcesHistory.tsx` owns history data loading and presentation; the existing reference-table component is injected as a dependency to avoid duplicating the shared source-table renderer.
- Intelligence Briefs feature: `src/features/briefs/Briefs.tsx` owns the briefs page, search handoff, loading state and source-linked cards; its list request uses the shared typed API client.
- Procurement Watch feature: `src/features/watch/Watch.tsx` owns the public tender watchlist, search handoff and source-linked records; its API request uses the shared typed client and preserves an explicit empty fallback on failure.
- PIB Defence feature: `src/features/pib/PibDefence.tsx` owns the official PIB release index, year filter and loading/error states; its year-scoped API request uses the shared typed client.
- Programme Timeline feature: `src/features/timeline/Timeline.tsx` owns the service-filtered milestone view; its timeline list request uses the shared typed client and keeps milestone provenance fields.
- Signals feature: `src/features/signals/Signals.tsx` owns the public-lead list, publisher/category filters, search handoff and source attribution; article and source data arrive through typed props.
- Sources feature: `src/features/sources/Sources.tsx` owns the provenance/review desk, feed form and refresh actions; article state, source registry, admin token, review controls and composer callbacks are passed through explicit props. Shared source/article types live in `src/features/sources/types.ts`.
- API response contract: `src/services/api-response.mjs` parses JSON/text/empty responses and handles 204/205; `src/services/api-response.test.mjs` covers these cases and malformed JSON. `src/services/api.ts` wraps parse and HTTP errors in `ApiError` and exposes GET/POST/PATCH helpers.
- Next.js route registry: `frontend/lib/routes.mjs` is the single route/view map used by `frontend/app/AtlasApp.tsx`; `frontend/tests/routes.test.mjs` checks route coverage, reversibility and unknown routes.
- App Router boundaries: `frontend/app/loading.tsx`, `error.tsx` and `not-found.tsx` provide explicit loading, error and not-found experiences. `AtlasApp` does not silently map an unknown path to the overview.
- Accessibility/responsive foundations are shared from `src/styles.css`: responsive breakpoints, focus-visible styles, skip-link behavior and reduced-motion handling remain common to Vite and Next.js.
- Documents feature: `src/features/documents/Documents.tsx` owns the public document register, metadata form, extraction actions, filters and provenance/detail dialog; it receives the existing admin token through a typed prop and uses the shared API client for GET/POST requests.
- Typed API foundation: `src/services/api.ts` provides common JSON request handling, typed generic results, structured `ApiError`, and GET/POST/PATCH helpers. The client has been adopted by the platform register, history, briefs, watch, PIB Defence, timelines, Documents and Sources. Remaining direct fetches in the root integration component are still tracked for endpoint-by-endpoint migration.
- The large application component remains the integration point for remaining features. Extract only components with clear ownership and limited dependencies; do not split nested components blindly.
- Existing Node API endpoints, server JSON data and the Vite runtime remain unchanged during Phase 1.
- A successful build is not proof of route or interaction parity.

## 6. Acceptance criteria

- [x] Next.js development server, type-check and production build pass in CI.
- [x] Next.js production build and TypeScript checks pass in CI.
- [x] All existing application views have a centralized route mapping; direct browser refresh parity still requires manual verification.
- [ ] Inventory, programmes, news, Theatre Atlas, search, documents and assistant interactions retain feature parity.
- [ ] API requests continue to reach the active Node API without hard-coded production addresses.
- [x] Shared loading, empty and error states are retained; App Router loading/error boundaries are present.
- [ ] Keyboard navigation, dialog focus handling and responsive behavior are manually verified across target browsers/viewports.
- [ ] No existing data, API or Vite implementation is removed before cutover approval.
- [x] CI validates the Next.js application, route registry, response parser and existing API smoke suite.

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

The Next.js API rewrite uses `RAKSHA_API_PROXY_TARGET`; local default is `http://127.0.0.1:8787`. See `frontend/.env.example`.

## 8. Current decision

Phase 1.1 audit is recorded. Phase 1.2 API-proxy configuration and CI checks are committed; local typecheck and production build have passed. Phase 1.3 route integration is committed; browser navigation and deep-link verification remain pending. Phase 1.4 implementation is complete: shared footer, section heading, navigation, header/search shell and accessible dialog primitive are extracted into `src/components/` and reused by the existing app. The extracted header receives its state and callbacks through typed props; feature behavior remains in the shared app. Automated CI passed for the shared-shell extraction. Phase 1.5 feature boundaries are implemented for all current page-level sections, including Signals and Sources with explicit shared-state props. Phase 1.6 has a hardened typed API client and response-parser tests; several root-shell endpoints remain to be migrated. Phase 1.7 App Router loading/error/not-found boundaries are implemented while the shared app remains client-only because it depends on browser APIs. Phase 1.8 responsive and accessibility foundations are retained and statically guarded; manual browser/device checks remain open. Phase 1.9 route and response-parser tests are in CI alongside the existing API smoke tests; full browser E2E parity remains open. Phase 1.10 has a controlled cutover/rollback runbook and Next.js lifecycle scripts, but public promotion and Vite retirement are intentionally blocked until manual route/interaction parity and explicit release approval. Phase 0 manual validation also remains open; this Phase 1 work does not mark Phase 0 as closed.
