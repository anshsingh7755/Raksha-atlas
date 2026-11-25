# Defence — Architecture

Active application:
- src/: React and Vite frontend.
- server/: Node.js API and data services.
- api/: Vercel API adapter.
- ai/: FastAPI AI service.

Data:
- database/schemas/
- database/migrations/
- database/imports/
- database/seeds/

Operations:
- infrastructure/docker/
- infrastructure/deployment/
- infrastructure/monitoring/
- infrastructure/security/
- scripts/database/
- scripts/ingestion/
- scripts/maintenance/

Supporting:
- data-engineering/
- docs/
- archive/

Root Vite, Vercel and Node configuration remains at the repository root
to preserve existing Vercel compatibility.
