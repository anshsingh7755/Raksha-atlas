# Vercel API adapter

This folder contains the entry point Vercel uses for API requests.

## Main file

- `[...path].mjs` — forwards incoming API requests to the existing Node.js handler in `server/index.mjs`.

## Request flow

1. The browser requests an `/api/...` URL.
2. Vercel runs this adapter.
3. The adapter passes the request to the Node.js API.
4. The Node.js API returns the response.

## Important

This is a thin deployment adapter, not a second backend. Keep API logic in `server/` and preserve the handler import and `vercel.json` function configuration. Do not duplicate routes here.
