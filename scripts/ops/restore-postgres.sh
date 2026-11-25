#!/usr/bin/env bash
set -euo pipefail
umask 077
: "${BACKUP_FILE:?Set BACKUP_FILE to a verified custom-format pg_dump file}"
: "${RESTORE_DATABASE_URL:?Set RESTORE_DATABASE_URL to an isolated empty recovery database}"
test -s "$BACKUP_FILE"
if [ -f "$BACKUP_FILE.sha256" ]; then sha256sum --check "$BACKUP_FILE.sha256"; else echo "Missing checksum sidecar; refusing restore." >&2; exit 1; fi
if [ "${CONFIRM_ISOLATED_RESTORE:-}" != "YES" ]; then echo "Set CONFIRM_ISOLATED_RESTORE=YES only after verifying an isolated empty target." >&2; exit 1; fi
pg_restore --exit-on-error --no-owner --no-privileges --dbname "$RESTORE_DATABASE_URL" "$BACKUP_FILE"
echo "Restore completed. Run schema validation, reconciliation and application checks."
