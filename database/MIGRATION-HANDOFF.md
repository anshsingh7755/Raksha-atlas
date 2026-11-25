# Database migration — handoff

> Updated: 25 November 2026. Read this first when continuing the database migration in a new chat. Keep steps short and give the user one PowerShell command at a time.

## Project runtime

- Active frontend: `src/` — React + TypeScript + Vite.
- Active API: `server/` — Node.js; Vercel adapter: `api/[...path].mjs`.
- AI service: `ai/` — FastAPI.
- Local full-stack command: `npm run dev:full`.
- Next.js (`frontend/`) and Spring Boot (`backend/`) are migration scaffolds, not the active runtime.
- Existing Vercel deployment: https://raksha-atlas.vercel.app.
- Main roadmap: `docs/roadmap/README.md`; run/deploy guide: `docs/RUN-AND-DEPLOY.md`.

## Database migration status

Two PostgreSQL databases exist in Docker (PostgreSQL 17):

- `defence_db`: defence inventory, programmes, procurement, articles/news, sources, timelines, history and reference data.
- `application_db`: concise application architecture and component knowledge.
- Original `raksha_atlas` database is still present and must remain untouched.

Schemas applied:
- `database/defence/schema.sql` — 8 tables.
- `database/application/schema.sql` — 2 tables.

### Imported and verified counts

| Database/table | Verified rows |
|---|---:|
| defence_db.defence_sources | 184 |
| defence_db.defence_inventory | 363 |
| defence_db.defence_programmes | 103 |
| defence_db.defence_procurement | 28 |
| defence_db.defence_articles | 1,224 |
| defence_db.defence_timelines | 22 |
| defence_db.defence_history | 20 |
| defence_db.defence_reference_data | 744 |
| application_db.application_components | 4 |
| application_db.application_documents | 6 |

Article details:
- `server/data.json` contains 1,176 records but only 48 distinct original IDs.
- Importer now assigns deterministic SHA-256-based IDs to imported articles.
- After import, `defence_articles` contains 1,224 unique rows: 1,176 imported source records plus 48 pre-existing rows. Verified with SQL count and distinct-ID count.
- The importer prints 1,176 processed articles; do not mistake that for the final table count.

Application DB was seeded successfully with `node scripts/seed-application-knowledge.mjs` and verified at 4 components + 6 documents. **Do not reseed unless its content changes.**

## Important local setup and safety

- Local `.env` exists in project root and is hidden in VS Code Explorer because it is a dotfile; use Explorer's show-hidden-files setting if needed. Never recreate or overwrite it.
- It contains secrets and DB URLs. Never print, paste, commit, or expose its contents. Credentials were exposed in a screenshot; rotate the DB password and affected API keys, then update dependent services.
- PostgreSQL container/service is `db`; DB user is `raksha`.
- A localhost-only port mapping was intended: `127.0.0.1:5432:5432`. Verify only if host connectivity is needed.
- A backup folder `backup-db-migration/` was created for `server/data.json`, `server/sources.json`, and `imp docs.txt`; verify before relying on it.
- Preserve local changes to `server/data.json`, `server/sources.json`, and untracked `imp docs.txt`. Never reset/clean or overwrite them.
- Never delete JSON files, remove Docker volumes, drop the original DB, or point production at the new DB yet.

## Next task — continue from here

**The data import/seed stage is done; live application cutover is NOT done.**

1. Inspect current Node API database access and environment handling.
2. Connect the defence-data API/repositories to `DEFENCE_DATABASE_URL` / `defence_db`.
3. Connect application knowledge access to `APPLICATION_DATABASE_URL` / `application_db` only where actually needed.
4. Preserve existing API response contracts and frontend behavior.
5. Test local API endpoints and frontend flows against the new databases; check errors and compare representative records.
6. Keep legacy `raksha_atlas` and JSON sources available for rollback. Do not switch Vercel/production until local cutover, data checks, deployment env configuration and rollback are verified.

Known incomplete source import:
- `server/documents.json` currently imports 0 rows into `defence_reference_data`. Inspect its shape and decide whether it belongs in defence reference data or another table before claiming every source file is migrated.
- Some reference datasets also reported 0 rows; inspect actual file shapes before changing mappings. Do not silently drop data.

## Relevant files

- `scripts/import-defence-database.mjs` — current defence importer; includes `server/data.json` article import and deterministic unique article IDs.
- `scripts/seed-application-knowledge.mjs` — application DB seed script.
- `database/defence/schema.sql`
- `database/application/schema.sql`
- `.env.example` — variable names only; actual secrets remain in local `.env`.

## Useful verification commands

```powershell
# Defence article count and uniqueness
docker compose exec db psql -U raksha -d defence_db -c "SELECT COUNT(*) AS total, COUNT(DISTINCT id) AS unique_ids FROM defence_articles;"

# Application DB seed counts
docker compose exec db psql -U raksha -d application_db -c "SELECT 'components' AS table_name, COUNT(*) FROM application_components UNION ALL SELECT 'documents', COUNT(*) FROM application_documents;"
```
