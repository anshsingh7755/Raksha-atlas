# Frontend — Next.js migration application

## 1. What is this folder?

This folder contains a Next.js version of the Raksha Atlas website that is being prepared for a future migration.

**The active website is still the React + Vite application in the root `src/` folder.** This Next.js project is not the default live frontend.

## 2. What is Next.js?

Next.js is a React framework. It adds routing and server-side features around React. It can render pages on the server and provide a structured application framework.

This project currently uses a temporary bridge to reuse the existing React screen. That helps migration work start without immediately rebuilding every screen.

## 3. Main files

| Path | Purpose |
|---|---|
| `app/` | Next.js routes, pages and layouts. |
| `lib/` | Helpers for routing and API access. |
| `tests/` | Route and integration tests. |
| `next.config.mjs` | Next.js build and runtime configuration. |
| `Dockerfile` | Container build instructions. |
| `package.json` | Next.js dependencies and commands. |

## 4. How it connects to the existing backend

The migration frontend can send requests to the current Node API. The temporary bridge reuses existing UI code rather than creating a second permanent copy.

```text
Browser
  |
  v
Next.js app in frontend/
  |
  v
Existing Node API in server/
  |
  v
Current data and services
```

The final target may route through Spring Boot, but that is a separate migration step. Do not assume that target routing is already enabled.

## 5. Run locally

Start the Node API in one terminal from the repository root:

```powershell
npm run api
```

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

## 6. Build and test

Use the scripts defined in `frontend/package.json`. From the root, the available convenience commands are:

```powershell
npm run build:next
```

A successful Next.js build does not prove feature parity with the active Vite application. Test routes, API calls, responsive layout, error states and authentication behaviour separately.

## 7. Before switching the live website

- [ ] All active pages and features are present.
- [ ] Navigation and deep links work.
- [ ] API routes and response contracts are verified.
- [ ] Authentication and authorization are tested.
- [ ] Accessibility and mobile layout are checked.
- [ ] Build and integration tests pass.
- [ ] Performance is measured.
- [ ] Rollback to the Vite frontend is documented.

Keep the root `src/` frontend active until the migration has passed these checks and the release is approved.# Next.js frontend — migration version

This folder contains a second frontend being prepared for a future migration. It is not the default active website.

## In simple words

- The active website is in the root `src/` folder and uses React + Vite.
- This folder contains the Next.js version.
- It currently reuses the existing React screen through a temporary bridge.
- It can send API requests to the existing Node backend.

## Main files

| Path | Purpose |
|---|---|
| `app/` | Next.js pages and layouts. |
| `lib/` | Route and API helper code. |
| `tests/` | Route and integration checks. |
| `next.config.mjs` | Next.js configuration. |
| `Dockerfile` | Container build instructions. |

## Run this migration version

Start the active Node API in one terminal. In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

Do not switch the live website to this version until the roadmap's feature-parity, authentication, API and rollback checks are complete.
