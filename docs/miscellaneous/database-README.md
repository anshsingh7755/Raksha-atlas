# Database

- schemas/: PostgreSQL schemas for defence and application databases.
- migrations/: schema migrations and migration history.
- imports/: source JSON datasets and import snapshots.
- seeds/: database initialization and seed data.

PostgreSQL data itself is stored in the Docker volume, not in this folder.
Preserve the original JSON source files and migration backups.
