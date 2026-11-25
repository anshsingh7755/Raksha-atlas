#!/usr/bin/env bash
set -euo pipefail
umask 077
: "${DATABASE_URL:?Set DATABASE_URL to the PostgreSQL source}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
output="$BACKUP_DIR/raksha-atlas-$timestamp.dump"
pg_dump --format=custom --no-owner --no-privileges --file "$output" "$DATABASE_URL"
test -s "$output"
sha256sum "$output" > "$output.sha256"
echo "Backup created: $output"
echo "Store it in approved encrypted backup storage; do not commit it."
