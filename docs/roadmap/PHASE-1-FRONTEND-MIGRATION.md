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
| 1.4 | Shared shell extraction | Extract reusable layout elements, navigation, header, search dialog and accessible dialog primitive without duplicating the Vite UI. **Implemented; CI validation in progress.** |
| 1.5 | Feature boundary extraction | Move one feature at a time into reusable modules and App Router route modules; preserve existing feature behavior and API contracts. **In progress: Programmes page/dossier explorer and Armed Forces History are extracted into feature modules; remaining major sections are still being separated.** |
| 1.6 | Typed API layer | Centralize typed API requests and response models; remove duplicated request logic only where parity is proven. **Foundation implemented: shared `apiRequest`, `apiGet`, `apiPost` and `ApiError` in `src/services/api.ts`; inventory register and history now use the shared client. Endpoint-by-endpoint migration and response-contract hardening remain in progress.** |
| 1.7 | Rendering and states | Define server/client boundaries and retain loading, empty, error and browser-only behavior. |
| 1.8 | UX parity | Preserve responsive layouts, theme, keyboard access, dialogs, reduced-motion and accessibility behavior. |
| 1.9 | Automated parity gate | Add route/interaction coverage and verify API contracts, production build and feature parity against Vite. |
| 1.10 | Controlled cutover | Make Next.js primary only after acceptance; keep rollback available and retire Vite only after explicit parity approval. |

### Current implementation notes
- Shared footer: `src/components/AtlasFooter.tsx`, consumed by `src/App.tsx`.
- Shared section heading: `src/components/SectionTitle.tsx`, consumed by existing feature sections.
- Shared navigation: `src/components/AtlasNavigation.tsx`, receives the active view, navigation items and navigation callback as props.
- Shared header/search shell: `src/components/AtlasHeader.tsx`, receives state and callbacks through typed props; search-result session handoff and keyboard-accessible dialog behavior are preserved.
- Accessible dialog primitive: `src/components/AccessibleDialog.tsx`, retains focus management, Escape handling, focus trapping and focus restoration.
- These components remain in the shared root `src/` tree so Vite and Next.js can reuse one implementation.
- Programme feature: `src/features/programmes/Programmes.tsx` owns the page composition; `ProgrammeDossierExplorer.tsx` owns its data loading, filters, evidence details and milestone modal; `ProgrammeHistoryNotes.tsx` is a focused display component.
- Armed Forces History feature: `src/features/history/ArmedForcesHistory.tsx` owns history data loading and presentation; the existing reference-table component is injected as a dependency to avoid duplicating the shared source-table renderer.
- Typed API foundation: `src/services/api.ts` provides common JSON request handling, typed generic results, structured `ApiError`, and GET/POST helpers. `src/services/inventory.ts` and the history feature have been migrated; other direct `fetch` calls are intentionally left for controlled endpoint-by-endpoint migration.
- The large application component remains the integration point for remaining features. Extract only components with clear ownership and limited dependencies; do not split nested components blindly.
- Existing Node API endpoints, server JSON data and the Vite runtime remain unchanged during Phase 1.
- A successful build is not proof of route or interaction parity.

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

Phase 1.1 audit is recorded. Phase 1.2 API-proxy configuration and CI checks are committed; local typecheck and production build have passed. Phase 1.3 route integration is committed; browser navigation and deep-link verification remain pending. Phase 1.4 implementation is complete: shared footer, section heading, navigation, header/search shell and accessible dialog primitive are extracted into `src/components/` and reused by the existing app. The extracted header receives its state and callbacks through typed props; feature behavior remains in the shared app. Automated CI passed for the shared-shell extraction. Phase 1.5 remains active; the Programmes page/dossier explorer and Armed Forces History have been moved into feature boundaries while retaining existing API behavior, filters, source links, timeline behavior and the shared reference-table renderer. Phase 1.6 has started: a shared typed API request foundation is committed and is used by the platform register and history feature; remaining endpoint migrations and stronger response contracts are pending. The Vite application remains the active reference until Phase 1 acceptance criteria are met. Phase 0 manual validation also remains open; this Phase 1 work does not mark Phase 0 as closed.
