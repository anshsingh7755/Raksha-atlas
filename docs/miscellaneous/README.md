# Raksha Atlas

Raksha Atlas is a defence information platform for collecting, organizing,
searching and analyzing defence-related information.

## Active application

- `src/`: React and Vite frontend.
- `server/`: Node.js API, data services and existing JSON compatibility data.
- `api/`: Vercel API adapter.
- `ai/`: FastAPI document and AI service.
- `database/`: PostgreSQL schemas, migrations, import snapshots and initialization.
- `infrastructure/`: Docker, deployment and monitoring configuration.
- `scripts/`: data import, database and maintenance operations.
- `docs/`: architecture and operating documentation.

The root frontend and API paths are intentionally retained for Vercel compatibility.

## Local requirements

- Docker Desktop with Docker Compose
- Node.js 22 or later for local development

## Run the complete application

Ensure the required values are configured in `.env`.

```powershell
docker compose up -d --build
docker compose ps
```

Open the application at:

`http://localhost:8080`

## Local development without Docker

```powershell
npm install
npm run dev
```

In another terminal:

```powershell
npm run dev:api
```

The AI service can be run separately using the instructions in `ai/README.md`.

## Database architecture

- `defence_db`: defence domain information.
- `application_db`: application documents and component metadata.
- `raksha_atlas`: retained legacy database.

The PostgreSQL Docker volume is persistent. Never use `docker compose down -v`
unless intentionally deleting all local database data.

## Useful commands

```powershell
docker compose up -d --build
docker compose ps
docker compose logs --tail 100 api
docker compose logs --tail 100 web
docker compose logs --tail 100 db
docker compose down
npm run build
npm test
```

## Vercel compatibility

The Vercel project continues to use the repository root. Do not move `src/`,
`server/`, `api/`, `package.json`, `vite.config.ts` or `vercel.json` without
updating and verifying the Vercel project configuration.

## Change policy

- Preserve original JSON data and migration backups.
- Use PostgreSQL for persistent application data.
- Keep database schemas and migrations in `database/`.
- Validate imported information before inserting it.
- Do not create separate services for features that can live in the existing API.
- Keep AI extraction optional to individual application workflows.
