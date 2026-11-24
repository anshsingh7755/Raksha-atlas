# Phase 2 — Spring Boot backend and PostgreSQL

**Target:** Java 21, Spring Boot 4, Spring Data JPA, Flyway and PostgreSQL 17  
**Branch:** `work/step-1-foundation`  
**Status:** 2.1 contract baseline recorded; 2.2 migrations and connection configuration implemented; 2.3 inventory service boundary implemented; 2.4 safe import utility implemented (dry-run default); 2.5 programme/procurement schema implemented. Local PostgreSQL import and row-level reconciliation remain pending.

## Migration boundary

The existing Node API on port 8787 remains active and unchanged. Spring Boot on port 8081 is a parallel migration service. PostgreSQL is not promoted to the live source of truth until imported data has been reconciled and each consumer has passed API parity. Never delete or rewrite `server/*.json` during this phase.

## 2.1 — Domain model and API contracts

**Implemented:** `docs/architecture/PHASE-2-DOMAIN-CONTRACTS.md` defines canonical keys, field ownership, provenance rules and initial API v1 endpoints for inventory, sources, programmes and procurement.

Acceptance:
- Stable string IDs are preserved from source JSON.
- Unknown quantities/dates/stages remain null or explicitly reported.
- Programme heuristic stage labels remain distinguishable from structured milestones.
- Original source objects remain available in `raw_record` during migration.

## 2.2 — PostgreSQL connection and migration runner

**Implemented:** Spring datasource settings are environment-configurable; Flyway PostgreSQL support is included; Hibernate uses `ddl-auto: validate`, not schema mutation. Versioned migrations live under `backend/src/main/resources/db/migration`.

- V1 inventory
- V2 source registry
- V3 programmes and procurement

The inventory migration is additive for databases created from the earlier inventory schema. Set `DB_JDBC_URL`, `DB_USERNAME` and `DB_PASSWORD` outside source control.

Acceptance:
- Flyway applies migrations in order on a clean database.
- Existing inventory schema can be upgraded without dropping records.
- Hibernate validates the mapped schema.
- No credentials are committed.

## 2.3 — Entities, repositories, services and controllers

**Implemented vertical slice:** the inventory entity/repository/controller now uses an `InventoryService` boundary. The existing health endpoint remains available. Remaining source, programme and procurement API layers are subsequent work; their schemas and contracts are established in 2.1/2.5.

Acceptance:
- Controllers contain HTTP mapping only.
- Services own use-case orchestration.
- Repositories own persistence access.
- API response shape is not changed without parity tests.

## 2.4 — Inventory and source migration

**Implemented:** `scripts/import-domain-data-to-postgres.mjs` imports inventory, sources, programmes and both procurement JSON datasets. It is dry-run by default; `--apply` and `DATABASE_URL` are required to write. It uses stable-ID upserts and stores the original record in JSONB.

Dry run:

```powershell
node scripts/import-domain-data-to-postgres.mjs
```

Apply only after database migrations and dry-run review:

```powershell
$env:DATABASE_URL = "postgresql://raksha:<password>@localhost:5432/raksha_atlas"
node scripts/import-domain-data-to-postgres.mjs --apply
```

Acceptance:
- Dry-run reports input, unique and duplicate IDs for every dataset.
- Apply is repeatable and preserves IDs and source provenance.
- Reconciliation compares counts, IDs, nullable fields and representative records.
- Source JSON remains unchanged.

## 2.5 — Programmes and procurement persistence

**Implemented:** V3 creates normalized programme and procurement tables, indexes key filter columns, retains nested source/milestone arrays as JSONB, and keeps tender records separate from future-procurement pipeline records through the `dataset` field.

Acceptance:
- Heuristic programme stage remains in `stage_classification` and `stage_label`; it is not silently promoted to verified status.
- Contracted quantities remain separate from active inventory quantities.
- Tender closing times retain timezone offsets on import.
- Future pipeline and live tender datasets remain distinguishable.

## Local validation checkpoint

Prerequisites: Java 21, Maven, Docker Desktop and a PostgreSQL instance.

```powershell
docker compose up -d db
mvn -f backend/pom.xml test
```

Then configure `DB_JDBC_URL`, `DB_USERNAME`, `DB_PASSWORD` for the local database and start Spring Boot:

```powershell
mvn -f backend/pom.xml spring-boot:run
```

Check:

```powershell
Invoke-RestMethod http://localhost:8081/api/health
```

Do not run the importer with `--apply` until the migrations have completed successfully and the dry-run report has been reviewed.

## Phase 2.1–2.5 exit gate

- [x] Domain contracts documented.
- [x] PostgreSQL connection and Flyway migrations configured.
- [x] Inventory service layer introduced.
- [x] Safe idempotent importer created, dry-run by default.
- [x] Programme and procurement schemas created.
- [ ] Maven build passes in CI.
- [ ] Local Flyway migration passes against PostgreSQL.
- [ ] Import dry-run reviewed, then data import applied.
- [ ] Row-level reconciliation report reviewed.
- [ ] Source/programme/procurement service/controller layers and API parity tests completed.

Phase 2.6 onward (authentication, authorization, expanded API validation and pagination) must not be treated as complete by this work.
