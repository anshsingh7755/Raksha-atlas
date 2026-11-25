## Simple explanation

This runbook is the safety checklist for switching API requests from Node.js to Spring Boot and returning them to Node.js if something goes wrong.

A cutover is not allowed until the new database, imported data, API responses, authentication and automated tests have been checked. If any critical check fails, do not switch traffic.

# Phase 2 — Spring Boot API cutover and rollback runbook

**Status:** Prepared; not approved or executed  
**Active service:** Node.js API on port 8787  
**Candidate service:** Spring Boot API on port 8081  
**Database:** PostgreSQL 17

## Preconditions

Do not begin traffic migration until every item is evidenced:

- [ ] Phase 2 CI passes on the release commit.
- [ ] Flyway V1–V3 succeed on a clean database and on a copy of the intended existing database.
- [ ] Import dry-run has been reviewed; import is applied to the candidate database.
- [ ] `npm run db:reconcile` reports zero missing IDs, extra IDs and changed raw records.
- [ ] Every frontend-used endpoint has been compared with the Node API using representative empty, typical and filtered datasets.
- [ ] The approved identity provider issues tokens with the expected issuer, audience policy and role claim.
- [ ] Security review verifies secrets, TLS, CORS, access logs, permissions and rate limiting at the edge.
- [ ] Candidate service health, latency, error rate, database connection pool and logs are monitored.
- [ ] Rollback has been rehearsed against the same deployment topology.

## Candidate deployment

1. Keep Node API and current frontend unchanged.
2. Provision PostgreSQL backup/snapshot and verify restore.
3. Run Flyway migrations against the candidate database.
4. Run importer in dry-run mode, review counts, then apply.
5. Run row-level reconciliation and archive its JSON output.
6. Start Spring Boot with private network access only and configured JWT secret/issuer.
7. Smoke-test public health and authenticated domain routes.
8. Compare candidate responses to Node responses for all migrated endpoints and filters.
9. Route a small internal/test cohort to Spring Boot using a reversible proxy configuration.
10. Observe errors, latency, authorization failures, database load and record freshness.
11. Expand traffic only after owner approval and a documented observation period.

## Rollback

1. Stop sending new traffic to Spring Boot.
2. Restore the frontend/API proxy to the Node API target (port 8787).
3. Keep Spring Boot and PostgreSQL isolated for diagnosis; do not delete candidate data.
4. If a database restore is needed, restore to a new database from the verified pre-cutover snapshot. Do not overwrite source JSON.
5. Confirm core pages, reads and authorized admin workflows against Node.
6. Record the trigger, timestamps, affected endpoints, data writes and recovery actions.
7. Reconcile any writes made during the candidate window before attempting another cutover.

## Non-negotiable safeguards

- Do not run both Node and Spring as independent writers to the same domain during the migration window.
- Do not dual-write without an explicit idempotency and conflict-resolution design.
- Do not retire Node endpoints or JSON fallback until all consumers have moved and the rollback window is closed.
- Do not run destructive SQL or manually edit production tables.
- Preserve original IDs, source links, confidence and verification status.
- A passing CI run is not evidence of production parity; use populated data and real authentication.
- Production cutover and Node retirement require explicit release-owner approval.
