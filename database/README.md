# Raksha Atlas database

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
