# Scripts — project maintenance commands

## 1. What are scripts?

Scripts are small programs that perform project jobs from the terminal. They are not website pages and are not normally imported by the browser.

This folder contains tools for refreshing public reference data, collecting monitored sources, importing data into PostgreSQL and checking that a migration matches its source.

Run commands from the repository root unless a script explicitly says otherwise.

## 2. Main scripts

| File | Simple explanation |
|---|---|
| `refresh-public-data.mjs` | Runs the public reference refresh and then rebuilds the equipment catalogue. |
| `sync-wikipedia-reference.mjs` | Refreshes configured public reference-page snapshots. |
| `build-equipment-catalog.mjs` | Builds a normalized equipment catalogue from available reference data. |
| `ingest-monitored-sources.mjs` | Runs the configured news/source ingestion process. |
| `migrate-db.mjs` | Runs the project's Node-side database migration script. |
| `import-domain-data-to-postgres.mjs` | Copies selected JSON domain records into PostgreSQL. It is a dry run unless `--apply` is supplied. |
| `reconcile-domain-data.mjs` | Compares source JSON records with database records after import. |

## 3. Common commands

Check the exact scripts in the root `package.json`. Current examples include:

```powershell
npm run sync:reference
npm run news:run
npm run db:migrate
npm run db:import
npm run db:reconcile
```

A script can have options that are not shown in this table. Read the script before using an unfamiliar option.

## 4. Safe database import

The importer is designed to report what it would import before writing. Start with a dry run:

```powershell
node scripts/import-domain-data-to-postgres.mjs
```

Review the output and confirm that the target database is a development database. Only then use the explicit write flag:

```powershell
node scripts/import-domain-data-to-postgres.mjs --apply
```

Do not use `--apply` against a production database without an approved backup, review and recovery plan.

## 5. Backup and restore helpers

PostgreSQL backup and restore shell scripts are under [scripts/ops](ops/README.md). A restore can overwrite data in the target database, so always verify the target before running it.

## 6. Troubleshooting

- **Missing environment variable:** check the local `.env.example` and configure only the values required by that script.
- **Database connection error:** confirm PostgreSQL is running and `DATABASE_URL` points to the intended database.
- **No source records returned:** check the configured public source, network access and source response. Do not assume the script is broken solely because a publisher has no new records.
- **Import reports mismatches:** stop before writing; inspect the source records and schema and resolve the mismatch first.

## 7. Rules

- Do not commit secrets, local environment files, backups or production data.
- Prefer dry-run and read-only checks before writes.
- Keep source attribution and original IDs when importing.
- Never silently delete records during reconciliation.
- Update this guide when script names, arguments or behaviour change.