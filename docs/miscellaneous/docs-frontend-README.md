# Frontend documentation

## What is covered here?

This folder explains the two frontend codebases:

- `src/` — active React + TypeScript + Vite website.
- `frontend/` — Next.js migration application.

## Read these guides

- [Active frontend source](../../src/README.md) — how the current browser UI starts, renders pages and calls the API.
- [Next.js migration frontend](../../frontend/README.md) — migration structure, local run and cutover checks.
- [Phase 1 frontend migration](../roadmap/PHASE-1-FRONTEND-MIGRATION.md) — migration work and acceptance requirements.
- [Phase 7 frontend integration](../roadmap/PHASE-7-FRONTEND-INTEGRATION.md) — API integration and controlled routing.

## Which one should I change?

For the current deployed website, start in `src/`. Only work in `frontend/` when the task explicitly concerns the Next.js migration.

Do not maintain two independent copies of the same feature. Migration work should reuse components where possible and prove feature parity before switching the live route.
