## Simple explanation

This plan describes how to test whether the application can handle normal traffic and how to recover it after a failure.

- **Load testing** checks how the service behaves when several users make requests.
- **Backup** creates a saved copy of data.
- **Restore** checks whether that saved copy can be used to recover a database.
- **RPO** is the maximum amount of recent data the business is willing to lose.
- **RTO** is the target time to restore service.

The numbers in this document are planning proposals, not approved production promises. Run exercises only in an isolated environment with approved test data.

# Load, backup and recovery exercise plan

Run only in an isolated non-production environment with synthetic or approved public data. Do not load-test public/third-party sources or production endpoints without written approval.

## Load profile

Use k6 from a controlled runner. Ramp 1 virtual user for 2 minutes, 5 users for 5 minutes, then 20 users for 10 minutes only if the previous stage is healthy. Capture p50/p95/p99 latency, throughput, HTTP errors, CPU, memory, DB connections and AI provider cost.

Initial candidate guardrails (not production SLOs): error ratio <1%, p95 <1 second for health/read-only smoke endpoints, no sustained resource saturation. Set endpoint-specific SLOs from measured baselines.

## Recovery objectives

Planning proposals only; product owner approval is required:
- RPO: 24 hours for public-source derived records; stricter objective for user/account/audit records.
- RTO: 4 hours for initial service restoration.

## Recovery rehearsal

1. Create a verified encrypted PostgreSQL backup and checksum.
2. Restore into a new isolated empty database using `scripts/ops/restore-postgres.sh`.
3. Run Flyway validation and domain-data reconciliation.
4. Verify inventory, sources, programmes, procurement and AI-index metadata.
5. Record restore duration, missing records, operator actions and errors.
6. Roll back to the last known-good immutable ECS task definition.
7. Confirm monitoring, access controls and retention after recovery.

Exit only when a named operator restores data/service within approved RPO/RTO, records reconcile, rollback is repeatable and evidence is attached to Phase 10.
