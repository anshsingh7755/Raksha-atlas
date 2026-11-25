# Historical database migrations

## What is this folder?

This folder keeps an earlier SQL migration for reference. It helps explain how the inventory database schema started.

## File

- `001_inventory.sql` — historical SQL definition for the earlier inventory schema.

## Is this the current migration folder?

No. The Spring Boot service uses Flyway migration files under:

`backend/src/main/resources/db/migration/`

Flyway tracks which numbered migrations have been applied to a database.

## Important warning

Do not run `001_inventory.sql` manually on a database that already has the matching Flyway migration. That can create duplicate tables or schema conflicts.

Before changing a database:
1. Read the main [database guide](../README.md).
2. Check which migrations have already run.
3. Use a new versioned migration for a new schema change.
4. Back up the development database.
5. Validate the result and keep a rollback plan.

This folder is historical reference material; it is not a general place to put new application queries.
