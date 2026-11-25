# API adapter — how Vercel reaches the backend

## 1. What is this folder?

This folder contains a very small connection between Vercel and the existing Node.js backend.

Vercel needs an entry file for serverless API requests. Raksha Atlas already has its API logic in `server/index.mjs`, so this adapter forwards the request to that existing handler.

It is not a second backend and should not contain duplicate business logic.

## 2. Main file

- `[...path].mjs` — a catch-all Vercel function. It receives requests under the API path and passes them to the Node.js request handler.

## 3. Request flow

```text
Browser asks for /api/inventory
          |
          v
Vercel routes request to api/[...path].mjs
          |
          v
Adapter imports server/index.mjs
          |
          v
Existing Node.js API handles the request
          |
          v
Response returns to the browser
```

The local development setup can use the Node API directly or the Vite proxy. The adapter is specifically the Vercel deployment entry point.

## 4. What should live here?

Only deployment glue: code required to connect the hosting platform to the existing API handler.

Put routes, validation, data access, collectors and business rules in `server/`.

## 5. What must stay in sync?

If the API entry file or hosting setup changes, check all of these together:

- `server/index.mjs` — exported request handler.
- `api/[...path].mjs` — Vercel adapter import and forwarding.
- `vercel.json` — function routing and included server files.
- `package.json` — build scripts and dependencies.
- `server/` — files needed at runtime.

## 6. Safe change checklist

1. Do not duplicate API route logic in this folder.
2. Keep the adapter import pointed at the active backend.
3. Run `npm run build`.
4. Check local API behaviour.
5. Check the Vercel build/deployment logs after an approved deployment.
6. Do not claim the deployed function works based only on a local frontend build.