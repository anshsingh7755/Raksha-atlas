# Database backup and restore helpers

This folder contains operational shell scripts for PostgreSQL:

- `backup-postgres.sh` — creates a database backup.
- `restore-postgres.sh` — restores a backup into a target database.

Use only an isolated, approved environment. Confirm the target database and backup file before running either script. A restore can overwrite data in the target database.

Keep credentials in environment variables or an approved secret manager. Do not put passwords in command history or commit backup files. Follow the [load and recovery plan](../../infrastructure/operations/LOAD-AND-RECOVERY-PLAN.md) for validation and recovery evidence.
