# Phase 2 — Spring Boot backend and PostgreSQL

**Target:** Java 21, Spring Boot 4, Spring Security, Spring Data JPA, Flyway, PostgreSQL 17 and optional Redis.  
**Branch:** `work/step-1-foundation`  
**Implementation status:** 2.1–2.9 code and documentation foundations implemented. 2.10 parity and cutover controls implemented as a gated process. **Runtime acceptance is not yet closed:** local PostgreSQL migration, data import, row-level reconciliation and production identity-provider configuration require environment-specific execution.

## Migration boundary

Node.js on port 8787 remains the active/reference API. Spring Boot on port 8081 is a parallel migration service. Do not change the active frontend proxy, delete JSON source files or retire Node endpoints until database reconciliation, API parity, authentication integration and rollback checks pass.

## 2.1 — Domain model and API contracts

**Implemented:** `docs/architecture/PHASE-2-DOMAIN-CONTRACTS.md` defines canonical IDs, inventory/source/programme/procurement fields, API v1 endpoints and provenance rules. All records retain the original input in `raw_record JSONB`; heuristic programme stage classifications remain distinct from verified milestones.

## 2.2 — PostgreSQL connection and migrations

**Implemented:** environment-configurable datasource, Flyway PostgreSQL support and Hibernate `ddl-auto: validate`. Migrations V1–V3 create inventory, sources, programmes and procurement structures. No schema auto-update or destructive migration is enabled.

Required environment:
- `DB_JDBC_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

## 2.3 — Backend layers and domain APIs

**Implemented vertical slices:**
- Inventory: JPA entity, repository, service and REST controller.
- Sources, programmes and procurement: read service/controller over normalized tables and preserved raw JSON records.
- Health endpoint remains public; domain APIs are protected by JWT authentication.
- Inventory v1 response keeps the established `items/count/filters/availableFilters/asOf/latestRecordAsOf` envelope. `/api/inventory/v2` provides bounded pagination and sorting.

The remaining domain write workflows are intentionally not exposed until validation, authorization and audit behavior are specified.

## 2.4 — Inventory and source migration

**Implemented:** `scripts/import-domain-data-to-postgres.mjs` imports inventory, sources, programmes, active procurement and future procurement. Dry-run is the default; `--apply` plus `DATABASE_URL` are required to write. Stable IDs are upserted and source JSON is retained in JSONB.

## 2.5 — Programmes and procurement

**Implemented:** Flyway V3 creates programme and procurement tables with source/milestone JSONB, evidence metadata, indexes and a dataset discriminator. Active tenders and future procurement remain separate. Contracted quantities are not merged into active inventory.

## 2.6 — Authentication and role-based access

**Implemented:** Spring Security OAuth2 Resource Server validates HS256 JWTs, enforces issuer and minimum 32-byte secret, maps the JWT `roles` claim to `ROLE_*` authorities, enables method-level authorization, and leaves only health endpoints public.

Configuration:
- `RAKSHA_JWT_SECRET`: secret shared with the trusted token issuer; at least 32 bytes.
- `RAKSHA_JWT_ISSUER`: expected `iss` claim (default `raksha-atlas`).
- `RAKSHA_JWT_AUDIENCE`: required `aud` claim (default `raksha-atlas-api`).

No login endpoint or token issuer is fabricated in this API. Connect the organization-approved identity provider before public activation. Do not reuse the existing Node admin token as a JWT signing secret.

## 2.7 — Validation, pagination, filtering and errors

**Implemented:** stable Problem Details validation responses, bounded page size (1–100), page validation, sort-field allowlist, service/category/text filters on inventory v2, and source/programme/procurement filters. Legacy inventory read filters and response envelope are preserved. Unknown sort fields and invalid pagination return HTTP 400.

## 2.8 — Redis caching and rate limiting

**Implemented:** Redis cache manager with five-minute TTL and inventory-register cache annotation. Redis caching is opt-in through `RAKSHA_REDIS_CACHE_ENABLED=true`; it is disabled by default and must not be required for correctness.

**Rate-limit decision:** no application-local limiter is enabled. The initial deployment is a private service behind the existing web/API boundary; distributed rate limiting should be applied at the API gateway/edge when public traffic and authenticated client quotas are defined. Do not use per-process memory limits for a multi-instance deployment. If Redis-backed limits are later required, add them with explicit endpoint quotas and tests.

## 2.9 — Automated tests

**Implemented:** JUnit/Spring Boot integration tests use Testcontainers PostgreSQL 17 and cover Flyway startup, public health, protected API access, JWT-authenticated inventory, pagination validation, and response-envelope contracts for inventory, sources, programmes and procurement. A separate pagination metadata unit test is included.

GitHub Actions now installs Java 21 and runs `mvn -B -f backend/pom.xml test` before the existing Node, Next.js, Docker and Python checks.

## 2.10 — API parity and controlled migration

**Implemented migration controls:**
- Legacy read envelopes and filters are retained for inventory, sources, programmes and procurement endpoints.
- Authenticated integration tests verify the Spring API contracts.
- `scripts/reconcile-domain-data.mjs` compares source IDs and complete `raw_record` payloads against PostgreSQL for each imported dataset.
- Node remains available for rollback; frontend traffic is not switched automatically.

**Cutover is intentionally gated:** endpoint-by-endpoint comparison against a populated local database, identity-provider integration, feature-level browser verification, monitoring and rollback rehearsal must pass before any frontend proxy or production route is changed. Follow [Phase 2 cutover and rollback runbook](PHASE-2-CUTOVER-RUNBOOK.md). The existing Node endpoints are not retired in Phase 2.10 without explicit release approval.

## Local validation and migration procedure

Prerequisites: Java 21, Maven, Docker Desktop and the repository's PostgreSQL Compose service.

1. Start PostgreSQL:

```powershell
$env:DB_PASSWORD = "<local database password>"
docker compose up -d db
```

2. Configure Spring Boot:

```powershell
$env:DB_JDBC_URL = "jdbc:postgresql://localhost:5432/raksha_atlas"
$env:DB_USERNAME = "raksha"
$env:DB_PASSWORD = "<local database password>"
$env:RAKSHA_JWT_SECRET = "<at least 32 random bytes>"
$env:RAKSHA_JWT_ISSUER = "raksha-atlas"
$env:RAKSHA_JWT_AUDIENCE = "raksha-atlas-api"
mvn -f backend/pom.xml test
mvn -f backend/pom.xml spring-boot:run
```

3. Run the read-only import preview:

```powershell
npm run db:import
```

4. After reviewing the preview and confirming Flyway has completed, apply the import:

```powershell
$env:DATABASE_URL = "postgresql://raksha:<password>@localhost:5432/raksha_atlas"
npm run db:import -- --apply
```

5. Generate the row-level reconciliation report:

```powershell
npm run db:reconcile
```

The reconciliation command exits non-zero if any imported ID is missing, extra or has a changed source payload. Keep the report with the release evidence. Do not proceed to cutover if it fails.

6. Start/keep the Node API and compare matching filters and records against Spring Boot using the same populated database. Verify JWT issuer/roles with the approved identity provider. Run the browser feature suite against the candidate API before routing users.

## Phase 2 exit checklist

- [x] 2.1 Domain model and API contracts
- [x] 2.2 PostgreSQL connection and Flyway migration set
- [x] 2.3 Inventory and domain read API layers
- [x] 2.4 Safe idempotent data importer
- [x] 2.5 Programme and procurement persistence
- [x] 2.6 JWT authentication and role mapping
- [x] 2.7 Validation, filtering, pagination and error contracts
- [x] 2.8 Optional Redis cache strategy and deployment rate-limit decision
- [x] 2.9 JUnit and PostgreSQL Testcontainers coverage
- [x] 2.10 Reconciliation utility, API contract tests and gated cutover procedure
- [ ] GitHub Actions run passes on the final Phase 2 commit
- [ ] Local PostgreSQL migration and import are executed
- [ ] Row-level reconciliation report passes
- [ ] Approved identity provider is configured and verified
- [ ] Manual API parity and rollback rehearsal are approved

**Phase 2 implementation is ready for environment validation. Phase 2 production cutover is not approved or performed by this change.** The final unchecked items require the local environment, credentials and release-owner acceptance; they cannot be truthfully marked complete from repository edits alone.
