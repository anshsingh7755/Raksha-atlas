# Migration and restructuring handoff

Updated: 25 November 2026

## Current state

- Primary frontend: root React/Vite application.
- Primary API: `server/`.
- Vercel adapter: `api/`.
- AI service: `ai/`.
- Next.js migration preserved in `archive/nextjs-migration/`.
- Spring Boot migration preserved in `archive/springboot-migration/`.
- Original deployment configuration preserved in `archive/deployment-legacy/`.
- Nginx configuration consolidated into `infrastructure/deployment/`.

## Database baseline

The reconciled migration contains 2,654 records across domain and reference
datasets. The two canonical databases are `defence_db` and `application_db`.
The legacy `raksha_atlas` database is retained.

Do not rerun the importer or remove the PostgreSQL volume as part of this
restructuring.

## Docker

The default Compose runtime includes PostgreSQL, Node API, AI service and web.
The Java migration service is no longer in the active Compose stack.
Monitoring and Redis remain optional profiles.

## Important compatibility rule

Vercel continues to depend on root `src/`, `server/`, `api/`, `package.json`,
`vite.config.ts` and `vercel.json`. Do not relocate these without changing and
verifying the Vercel project configuration.

## Next work

1. Confirm local Docker startup and API/database connectivity.
2. Verify the web application.
3. Refactor ingestion to use `database/imports/` as the canonical import location.
4. Implement shared validation for JSON, URLs and image extraction.
5. Add Telegram ingestion as another adapter when required.
6. Update architecture and operational documentation as features become active.
