# Operations scripts — PostgreSQL backup and restore

## 1. What is this folder?

This folder contains shell scripts used to make a PostgreSQL backup and restore a database from a backup.

A **backup** is a saved copy of database contents. A **restore** loads saved contents into a database. Restoring to the wrong database can overwrite useful data, so these commands must be used carefully.

## 2. Files

- `backup-postgres.sh` — creates a database backup.
- `restore-postgres.sh` — restores a backup into the database selected by its configuration or arguments.

Read the script itself before running it. The script is the source of truth for its exact arguments and required environment variables.

## 3. Before a backup

1. Confirm the database host and database name.
2. Confirm there is enough disk space for the backup.
3. Keep the backup in a safe location outside Git.
4. Do not place passwords directly in the command line or source code.
5. Record when the backup was created and which database it came from.

## 4. Before a restore

1. Confirm the target database name carefully.
2. Confirm the backup file exists and is the correct backup.
3. Prefer restoring into a new empty test database first.
4. Understand whether the script drops, replaces or adds data.
5. Never restore over production without explicit approval and a recovery plan.

## 5. After a restore

- Check that the database can be opened.
- Run the relevant Flyway/schema validation.
- Compare record counts and important IDs with the source.
- Check representative inventory, source, programme and procurement records.
- Record the restore duration and any missing data.

Follow the [load and recovery plan](../../infrastructure/operations/LOAD-AND-RECOVERY-PLAN.md) for a full rehearsal.

## 6. Security

Do not commit backup files, database passwords, connection strings or secret values. Keep backups encrypted and restrict access to approved operators.