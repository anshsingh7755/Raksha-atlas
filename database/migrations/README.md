# Historical database migrations

This folder contains the earlier SQL schema reference:

- `001_inventory.sql` — historical inventory schema.

The current Spring Boot service uses versioned Flyway migrations under `backend/src/main/resources/db/migration/`. Do not apply this historical SQL manually alongside Flyway. See the [database guide](../README.md) for the current migration and import process.
