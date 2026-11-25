# Raksha Atlas databases

Raksha Atlas has two separate PostgreSQL databases. Keep this split simple.

## 1. Defence database — actual website knowledge
Database name: `defence_db`

Stores everything the website knows about defence:
- Army, Navy, Air Force, Coast Guard and joint-service inventory.
- Equipment, platforms, variants, quantities and service categories.
- Historical inventory and past events.
- Programmes, development stages and milestones.
- Procurement pipeline: proposed, approved, tendered, contracted and delivered.
- News, articles, updates, sources and evidence.
- Reference catalogues for drones, tanks, aircraft, ships, submarines, missiles and other equipment.

**Important:** current inducted inventory is separate from future orders and proposals. A contracted or planned quantity must never be added to current inventory until delivery/induction is evidenced.

## 2. Application database — how the website works
Database name: `application_db`

Stores the short technical knowledge base:
- React frontend responsibilities and code locations.
- Node.js API responsibilities and code locations.
- How React calls the API and how responses return.
- Vite local development and Vercel deployment flow.
- Supporting services, configuration and component relationships.

The actual source code remains in Git. This database stores the explanation of the codebase, not a copy of the source code.

## 3. Main code locations
- `src/`: React + TypeScript + Vite frontend.
- `server/`: Node.js API, data processing and existing workers.
- `api/[...path].mjs`: Vercel API adapter.
- `ai/`: supporting FastAPI document/AI service.
- `database/defence/`: defence data schema.
- `database/application/`: application knowledge schema.

## 4. Migration safety
The existing application currently uses JSON files and an existing PostgreSQL connection. The new databases are created and populated separately first. Do not delete JSON files or switch the live API until counts, IDs and sample records reconcile. Back up the existing PostgreSQL volume before running the migration. The importer is safe to re-run by stable record ID.

## 5. Create and import
From PowerShell, set an administrator connection string and the two target database URLs in your local `.env`:
```env
PG_ADMIN_URL=postgresql://raksha:YOUR_PASSWORD@localhost:5432/postgres
DEFENCE_DATABASE_URL=postgresql://raksha:YOUR_PASSWORD@localhost:5432/defence_db
APPLICATION_DATABASE_URL=postgresql://raksha:YOUR_PASSWORD@localhost:5432/application_db
```
Then run:
```powershell
node scripts/setup-separated-databases.mjs
node scripts/import-defence-database.mjs
node scripts/seed-application-knowledge.mjs
```
The scripts create the two databases, apply their schemas, import existing defence JSON records, and seed the concise application architecture guide. They do not delete or rewrite source JSON files. Review the report before any application cutover.
