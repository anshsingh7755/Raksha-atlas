## Simple explanation

Phase 7 connects the shared website UI to the candidate Spring Boot and FastAPI services. The goal is to let the frontend use typed API clients and controlled routing without creating a second UI or switching away from Node by default.

Spring routing is opt-in. Unsupported features continue to use the Node API. This phase is integration groundwork, not approval to send all live traffic to the new services.

# Phase 7 — frontend integration and backend connectivity

## Objective

Connect the existing shared React experience to candidate Spring Boot/PostgreSQL and FastAPI services without duplicating the UI or switching the active Node API by default.

## 7.1–7.10 implementation record

| Sub-phase | Workstream | Implementation |
|---|---|---|
| 7.1 | Frontend/backend contract inventory | Mapped existing UI calls against Spring inventory, sources, programmes, procurement and AI gateway contracts. Unsupported modules remain on Node. |
| 7.2 | Secure API identity handoff | Added an in-memory access-token provider to the shared API transport. No token is persisted or exposed through public environment variables. |
| 7.3 | Typed backend API client | Added typed clients for inventory, sources, programmes, procurement and assistant chat, including cancellation and filter support. |
| 7.4 | Configurable API routing | Added opt-in Spring routing for supported endpoints with Node fallback for all other API paths. Spring routing is disabled by default. |
| 7.5 | Inventory and reference integration | Existing inventory and source UI requests can use the Spring read contracts without changing component ownership or response envelopes. |
| 7.6 | Programme and procurement integration | Existing programme UI can use the Spring programme read contract; procurement endpoint is routable where the current UI calls it. Unimplemented legacy datasets remain on Node. |
| 7.7 | AI assistant integration | Added a Spring /api/chat compatibility adapter that calls FastAPI through the protected service gateway and maps citations to the existing UI contract. The UI now uses the typed client. |
| 7.8 | Loading and failure behavior | Inventory API failures now render an accessible alert; existing chat loading/error behavior is retained. |
| 7.9 | Integration regression gates | Added frontend contract tests for routing, token handoff, typed clients, assistant citation mapping and visible API failures; added Spring chat fail-closed tests. |
| 7.10 | Controlled routing and rollback | Documented opt-in activation, Node fallback, rollback and the Phase 10 gates. No production cutover or legacy API retirement is performed. |

## API routing configuration

The Next.js rewrite configuration is evaluated during the Next.js build.

```dotenv
RAKSHA_API_PROXY_TARGET=http://127.0.0.1:8787
RAKSHA_SPRING_API_PROXY_TARGET=http://127.0.0.1:8081
RAKSHA_SPRING_API_ENABLED=false
```

When RAKSHA_SPRING_API_ENABLED=true, these paths are routed to Spring:
- GET /api/inventory and /api/inventory/*
- GET /api/sources
- GET /api/programmes
- GET /api/procurement-2026
- POST /api/chat

All other /api/* paths continue to route to Node. Rebuild Next.js after changing routing environment values.

## Authentication contract

Spring domain and AI endpoints are protected by Spring Security. src/services/api.ts exposes setApiAccessTokenProvider() so the approved OIDC client can supply a short-lived access token in memory. The API transport adds it as a Bearer token and never writes it to localStorage, sessionStorage or browser-readable cookies.

No production identity provider or browser login/session SDK is configured in this phase. Therefore Spring routing must remain disabled until the approved OIDC provider is integrated and the token provider is wired to it. Without a valid token, Spring correctly returns 401/403.

## Supported versus legacy-only domains

| UI capability | Current backend path |
|---|---|
| Inventory catalogue | Spring candidate supported |
| Source registry | Spring candidate supported |
| Programme ledger/dossier | Spring candidate supported |
| Procurement 2026 | Spring candidate endpoint supported; confirm exact UI consumer before switching |
| AI assistant | Spring gateway to FastAPI supported; requires gateway, service token, pgvector and model configuration |
| Documents/extraction | Node + document worker remains active |
| News/articles/review/moderation | Node remains active |
| Commands, timelines, briefs, watch, PIB and reference catalogues | Node remains active unless a matching Spring endpoint is implemented and tested |

## Validation

Run from the repository root:

```powershell
npm test
npm run build
cd frontend
npm ci
npm run typecheck
npm run build
cd ..
mvn -B -f backend/pom.xml test
docker build -t raksha-atlas-next-test -f frontend/Dockerfile .
```

The CI workflow is the authoritative automated check. A green CI run does not prove populated PostgreSQL parity, real OIDC login, live FastAPI/pgvector retrieval or browser/device behavior.

## Phase 10 acceptance gates

- [ ] Configure the approved OIDC browser client and wire its short-lived token provider.
- [ ] Apply PostgreSQL migrations and import/reconcile inventory, sources, programmes and procurement records.
- [ ] Compare Spring and Node responses on the same populated data snapshot, including filters and provenance.
- [ ] Enable FastAPI gateway with separate service credentials; verify pgvector indexing, retrieval, citations, abstention and model provider behavior.
- [ ] Run browser end-to-end tests for every route and supported user interaction.
- [ ] Verify 401/403 handling, token expiry/refresh and role-based access with the real IdP.
- [ ] Verify documents, news, commands, timelines, briefs, watch and PIB continue to work through Node fallback.
- [ ] Rehearse disabling Spring routing and returning all traffic to Node.
- [ ] Obtain explicit release approval before changing the default API target or retiring any Node endpoint.

## Release boundary

Phase 7 integration code is implemented, but live Spring routing remains opt-in. The Vite + Node application remains the active reference. Do not enable Spring routing in production or retire legacy API endpoints until Phase 10 parity, identity, runtime, browser and rollback evidence is accepted.
