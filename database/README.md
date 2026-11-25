# Database — PostgreSQL and data storage

## 1. What is a database?

A database stores information in an organized way so an application can find and update it reliably.

Raksha Atlas currently has two storage patterns:
- Existing JSON files under `server/` are still used by parts of the active Node application.
- PostgreSQL is being introduced as the structured database for migrated domains.

**Do not assume all project data has moved to PostgreSQL.** Each domain must be imported, checked and switched separately.

## 2. What is PostgreSQL?

PostgreSQL is a relational database. Information is stored in tables. A table has columns (fields) and rows (records). Related tables can be connected using IDs.

Example:
- `inventory_items` stores equipment records.
- `sources` stores publisher/source details.
- `programmes` stores programme information.
- `procurement_records` stores procurement entries.

The actual schema files define the exact columns. This guide does not replace those SQL definitions.

## 3. Where are database files?

| Path | Purpose |
|---|---|
| `backend/src/main/resources/db/migration/` | Flyway migrations used by the Spring Boot service. |
| `database/migrations/` | Historical/reference SQL migration. |
| `server/db/schema.sql` | Schema used by the active Node PostgreSQL storage path. |
| `server/db/store.mjs` | Node database connection and storage logic. |
| `ai/sql/` | AI document/vector schema. |
| `data-engineering/sql/` | Python ingestion landing-table schema. |
| `scripts/import-domain-data-to-postgres.mjs` | Controlled JSON-to-PostgreSQL importer. |
| `scripts/reconcile-domain-data.mjs` | Compares migrated records with source data. |

There are multiple schema areas because different services have separate responsibilities. Do not apply every SQL file to every database without reading its purpose and dependencies.

## 4. Migration management

Spring Boot uses Flyway versioned migrations under `backend/src/main/resources/db/migration`.

Current migration files include:
- `V1__inventory_items.sql` — inventory table and provenance.
- `V2__sources.sql` — source registry.
- `V3__programmes_and_procurement.sql` — programme and procurement records.

Flyway tracks which versions have run. Do not edit an old migration after it has been applied in an environment. Add a new version for a later schema change.

The SQL under `database/migrations/` is a historical reference and must not be run on top of the Flyway schema unless a reviewed migration plan specifically requires it.

## 5. Connection settings

The Spring Boot service uses JDBC settings such as `DB_JDBC_URL`, `DB_USERNAME` and `DB_PASSWORD`.

The Node scripts use `DATABASE_URL`, for example:

```text
postgresql://raksha:password@localhost:5432/raksha_atlas
```

Use local placeholder credentials only in examples. Real passwords belong in a local ignored `.env` file or a secret manager, never in Git.

## 6. Safe import process

First ensure PostgreSQL is running and the required target schema exists.

Run the importer in read-only mode:

```powershell
node scripts/import-domain-data-to-postgres.mjs
```

Review row counts, missing IDs and duplicate information. If the report is correct, point `DATABASE_URL` to a development database and explicitly apply:

```powershell
node scripts/import-domain-data-to-postgres.mjs --apply
```

The importer uses stable IDs and upserts. It retains the original record in `raw_record` and separates datasets using a dataset field where required. It does not edit or delete the JSON input files.

## 7. Reconciliation — checking that the copy is correct

Import success is not enough. Reconciliation checks whether the database contains the expected records and values.

Check:
1. Total rows in each source dataset and target table.
2. Missing or duplicate IDs.
3. Important fields such as service, category, status and quantity.
4. Source IDs and URLs.
5. Null/empty values and date formats.
6. A sample of individual records against the original JSON.
7. Whether the application reads the expected copy.

Use the reconciliation script and keep its report. Do not switch the website to the database until differences are understood.

## 8. Database safety

- Start with a local development database.
- Take a backup before schema or data changes.
- Never run an unreviewed import against production.
- Do not delete JSON files after an import until parity and rollback are approved.
- Do not commit credentials, dumps or private data.
- Keep database ports private; do not expose PostgreSQL directly to the public internet.
- Test restore, not just backup creation.

## 9. Current status

PostgreSQL is part of the migration and supporting architecture. Some schemas, importers and storage adapters exist, but full domain parity and cutover are separate acceptance tasks. Check the [roadmap](../docs/roadmap/README.md) for current phase status.# Raksha Atlas database

PostgreSQL is the canonical structured store after each domain has been migrated and reconciled. The active Node.js API and JSON files remain unchanged until explicit domain cutover.

## Schema migrations

Spring Boot applies versioned Flyway migrations from `backend/src/main/resources/db/migration`:

- `V1__inventory_items.sql` — inventory register and provenance.
- `V2__sources.sql` — source registry and reliability metadata.
- `V3__programmes_and_procurement.sql` — programme dossier records and procurement pipeline/tender records.

The historical `database/migrations/001_inventory.sql` remains a reference migration for the earlier schema. Do not run it manually in addition to Flyway.

## Local connection

Set `DB_JDBC_URL`, `DB_USERNAME` and `DB_PASSWORD` for the Spring Boot service. The default JDBC URL targets a local PostgreSQL database on port 5432. Never commit credentials.

## Safe data import

From the repository root, first run a read-only dry run:

```powershell
node scripts/import-domain-data-to-postgres.mjs
```

The importer reports row counts and duplicate/missing IDs without writing. After reviewing the report and ensuring Flyway has created the target schema, an explicit write is required:

```powershell
$env:DATABASE_URL = "postgresql://raksha:<password>@localhost:5432/raksha_atlas"
node scripts/import-domain-data-to-postgres.mjs --apply
```

The importer uses stable IDs and upserts, retains each source object in `raw_record`, and never edits or deletes JSON files. It imports inventory, source registry, programme records, current tender records and future-procurement pipeline records. Re-running is idempotent by ID; records from different datasets remain distinguished by the `dataset` column.

**Important:** the importer is not a cutover. Reconcile counts, IDs, nullable fields, provenance and representative records against the JSON inputs and the Node API before any consumer is switched.
