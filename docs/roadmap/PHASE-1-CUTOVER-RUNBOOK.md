## Simple explanation

This is the checklist for switching the website from the current Vite frontend to the Next.js frontend. A cutover means sending real website traffic to the new version.

The new frontend must not become active just because it builds. It must first match the existing pages and behaviour, connect to the correct API, pass tests and have a working rollback plan. Until then, keep Vite and the Node API available.

# Phase 1.10 — Controlled Next.js Cutover Runbook

**Status:** Cutover procedure implemented; production activation remains gated by browser parity sign-off.  
**Reference branch:** `work/step-1-foundation`  
**Rollback principle:** Keep the Vite application, Node API and existing data paths available until the Next.js release has passed the acceptance checks below.

## Runtime commands

| Purpose | Command |
|---|---|
| Existing Vite + API reference | `npm run dev:full` |
| Next.js development server | `npm run dev:next` |
| Next.js production build | `npm run build:next` |
| Next.js production server | `npm run start:next` |

Run the Node API separately when using the Next.js development server:

```powershell
npm run api
```

Configure the Next.js process with `RAKSHA_API_PROXY_TARGET`. The local default is `http://127.0.0.1:8787`; production must use the private HTTPS origin of the deployed API. Never put credentials in this value or commit secrets.

## Release gate

Do not switch the public deployment until every item is verified against the same release commit:

- [ ] GitHub Actions passes root tests/build, frontend route and response-parser tests, Next.js typecheck/build, Compose validation and document-worker tests.
- [ ] Every supported route loads directly and survives a hard refresh: overview, commands, theatre atlas, inventory, programmes, articles, briefs, documents, sources, procurement, timeline, watch, PIB, register and history.
- [ ] Navigation, search handoff, theme persistence, dialogs, assistant, document extraction and source-review actions work against the deployed API.
- [ ] API proxy reaches the intended API origin; authentication headers remain private and admin actions still enforce server-side authorization.
- [ ] Loading, empty, offline, API-error and unknown-route states are usable.
- [ ] Keyboard-only navigation, focus restoration, reduced-motion preference and 360px/768px/desktop layouts are manually checked.
- [ ] Data counts and representative records match the Vite reference; no data file or API contract was changed as part of frontend cutover.
- [ ] Product owner explicitly approves the release after reviewing the above results.

## Cutover sequence

1. Deploy the Next.js build as a parallel/staging frontend with the production API proxy configured.
2. Run the release gate and compare representative pages and API responses with Vite.
3. Promote Next.js at the hosting/router layer; do not rewrite or migrate the Node API in this phase.
4. Keep the previous Vite deployment and its routing configuration available as the immediate rollback target.
5. Monitor frontend errors, API failures and user-visible route failures through the agreed observation window.
6. Retire Vite only in a separate approved change after the observation window and a verified rollback rehearsal.

## Rollback

If route, interaction, API or runtime regressions appear, route traffic back to the last known-good Vite deployment. Keep the Node API and data stores untouched. For local development, return to:

```powershell
npm run dev:full
```

Do not delete `src/`, `vite.config.ts`, root Vite scripts, Node endpoints or existing JSON data as part of this runbook.

## Current limitation

Automated CI verifies builds, route registry consistency, response parsing and static accessibility foundations. It does not execute a real browser session or prove interactive parity. Browser/device checks and explicit release approval remain required; therefore this runbook does not declare the public cutover complete.
