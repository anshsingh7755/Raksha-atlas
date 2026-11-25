# Application layout

The active Vercel-compatible application currently uses the repository root:

- `src/`: React/Vite frontend.
- `server/`: Node.js API.
- `api/`: Vercel API adapter.
- `ai/`: FastAPI service.

The `apps/` directory is reserved for a future application layout. Do not move
the active root application into it without updating Vercel and Docker paths.
