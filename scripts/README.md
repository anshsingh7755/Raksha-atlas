# Project scripts

This folder contains command-line tools for data refresh, ingestion, database migration and maintenance. These scripts are run manually or by an approved workflow; they are not the website UI.

## Main scripts

| File | Purpose |
|---|---|
| `refresh-public-data.mjs` | Runs the public reference refresh and equipment-catalog build. |
| `sync-wikipedia-reference.mjs` | Refreshes the configured public reference pages. |
| `build-equipment-catalog.mjs` | Builds the equipment catalogue from available reference data. |
| `ingest-monitored-sources.mjs` | Runs monitored-source ingestion. |
| `migrate-db.mjs` | Applies the project's Node-side database migration process. |
| `import-domain-data-to-postgres.mjs` | Imports selected JSON datasets into PostgreSQL; dry-run unless `--apply` is supplied. |
| `reconcile-domain-data.mjs` | Compares migrated database records with source datasets. |

## Safe use

Run commands from the repository root and read each script's options before using it. Database import is read-only by default; `--apply` performs writes. Use a development database first and keep backups.

PostgreSQL backup and restore helpers are in [ops](ops/README.md). Never commit credentials, local environment files or production data.
