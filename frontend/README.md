# Next.js frontend — migration version

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
