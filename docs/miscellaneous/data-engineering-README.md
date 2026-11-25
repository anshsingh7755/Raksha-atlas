# Data engineering — Python ingestion and analytics

## 1. What is data engineering?

Data engineering is the work of collecting information from sources, cleaning it, checking it, organizing it and storing it so other parts of the application can use it.

For Raksha Atlas, this includes public RSS/Atom collection and preparation of structured article records.

**Current boundary:** The existing Node.js collectors, scheduler and article storage in `server/` remain active. This Python pipeline is a parallel migration path. Do not switch production collection to it until the planned parity and cutover checks pass.

## 2. What happens in a pipeline?

```text
Approved public source
        |
        v
Collector reads feed information
        |
        v
Processor normalizes and deduplicates
        |
        v
Quality checks validate important fields
        |
        v
Storage writes to an approved destination
        |
        +--> PostgreSQL operational records
        +--> Parquet analytical snapshots
        +--> optional Kafka events
```

The pipeline must preserve the original source, URL, publication date and other provenance. A clean-looking record is not automatically a verified claim.

## 3. Main parts

| Path | Responsibility |
|---|---|
| `pipeline/` | Python command-line pipeline and shared processing code. |
| `pipeline/collectors/` | Public RSS/Atom source readers. |
| `pipeline/processors/` | Normalization, deduplication and batch transforms. |
| `pipeline/schemas.py` | Shared data shapes for pipeline records. |
| `pipeline/storage.py` | PostgreSQL landing-table storage. |
| `pipeline/analytics.py` | Optional Parquet export. |
| `pipeline/events.py` | Optional Kafka publishing. |
| `pipeline/quality.py` | Freshness, duplicate and validation measurements. |
| `orchestration/` | Airflow scheduling definitions. |
| `dbt/` | SQL models and schema tests. |
| `spark/` | Deferred Spark/Iceberg scale design. |
| `sql/` | Additive PostgreSQL schema. |
| `tests/` | Offline pipeline and quality tests. |

## 4. Phase 4 implementation map

| Sub-phase | Goal | Current description |
|---|---|---|
| 4.1 | Understand current Node collectors and schedules | Inventory documented |
| 4.2 | Define common data contracts | Dataclasses and article contract |
| 4.3 | Build first Python RSS/Atom collector | Public feed collector |
| 4.4 | Normalize, deduplicate and validate | URL, field, date and provenance checks |
| 4.5 | Add PostgreSQL landing storage | Additive landing table; S3 integration remains future work |
| 4.6 | Add Polars transformations | Optional processor |
| 4.7 | Export Parquet snapshots | Optional analytics path |
| 4.8 | Publish Kafka events | Optional; disabled without broker configuration |
| 4.9 | Add Airflow and dbt foundations | Dry-run DAG and staging model/tests |
| 4.10 | Add quality and scale options | Metrics and documented Spark/Iceberg path |

The table describes implementation foundations, not a production cutover.

## 5. Install and run locally

From the repository root:

```powershell
cd data-engineering
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e .
```

Run tests and a safe check:

```powershell
python -m unittest discover -s tests -v
python -m pipeline.main --check
```

The collection command is:

```powershell
python -m pipeline.main --collect-rss
```

Collection is dry-run by default. Review the output before enabling any persistent write.

## 6. Optional integrations

Install only what the task needs:

- `.[analytics]` — Polars and Parquet support.
- `.[postgres]` — PostgreSQL persistence.
- `.[events]` — Kafka publisher.
- `.[orchestration]` — Airflow dependencies.
- `.[dbt]` — dbt Core/Postgres.
- `.[quality]` — optional richer quality checks.
- `.[scale]` — PySpark and PyIceberg.

These are optional because not every local run needs a database, broker or distributed compute engine.

## 7. Safe operating rules

- Use public sources only and follow their access rules.
- Do not log into private accounts or bypass access controls.
- Do not write to production by default.
- Keep raw/source provenance separate from normalized fields.
- Do not overwrite the active Node JSON store from this migration pipeline.
- Treat Parquet as an analytical snapshot, not the main operational database.
- Kafka, Airflow and Spark must not start automatically without explicit configuration.
- Do not cut over until record counts, IDs, important fields, quality and recovery have been compared.

## 8. When this folder becomes active

The Python pipeline can replace a Node ingestion path only after the same source coverage, schedules, output fields, review states, retry behaviour and failure handling have been tested. The cutover plan and rollback evidence must be recorded in the roadmap.# Raksha Atlas data engineering

Python ingestion and analytics are a **parallel migration path**. Existing Node collectors, scheduler and article storage remain active until Phase 10 parity and cutover acceptance.

## Phase 4 status

| Sub-phase | Deliverable | Implementation |
|---|---|---|
| 4.1 | Inventory existing Node collectors and scheduled jobs | Documented in `docs/architecture/PHASE-4-INGESTION-INVENTORY.md` |
| 4.2 | Canonical article, source, programme and equipment schemas | Dataclasses and normalized article contract |
| 4.3 | First Python RSS/Atom collector | Existing active-feed configuration; public HTTPS only |
| 4.4 | Normalize, deduplicate, classify and validate records | Canonical URL, field/date/state checks, source provenance |
| 4.5 | Persist operational records in PostgreSQL and raw documents in S3 | Additive PostgreSQL landing table; object storage remains a later integration |
| 4.6 | Polars batch transformations | Optional Polars processor |
| 4.7 | Parquet analytical snapshots | Optional Parquet export |
| 4.8 | Kafka event publishing | Optional publisher, disabled without broker configuration |
| 4.9 | Airflow and dbt | Scheduled dry-run DAG and dbt staging model/tests |
| 4.10 | Quality monitoring and Spark/Iceberg scale path | Quality metrics plus documented scale adapter; heavy compute is optional |

## Layout

```text
pipeline/
  collectors/       public RSS/Atom collection
  processors/       normalization, deduplication and Polars batch transforms
  schemas.py        canonical domain contracts
  storage.py        PostgreSQL landing sink
  analytics.py      Parquet snapshot export
  events.py         optional Kafka publisher
  quality.py        freshness/duplicate/validation coverage metrics
orchestration/      Airflow DAG
dbt/                SQL staging model and schema tests
spark/              Spark/Iceberg scale design
sql/                additive PostgreSQL DDL
tests/              offline contract and quality tests
```

## Local checks

From this directory:

```powershell
python -m unittest discover -s tests -v
python -m pipeline.main --check
python -m pipeline.main --collect-rss
```

Collection is dry-run by default. For analytical snapshots, install `pip install -e ".[analytics]"` and pass `--parquet-output ./artifacts/parquet`. To persist, install `pip install -e ".[postgres]"`, set `DATABASE_URL`, apply `sql/001_ingested_articles.sql` to a development database, then explicitly pass `--apply`.

Optional integrations:
- `.[events]` — Kafka producer; requires `KAFKA_BOOTSTRAP_SERVERS`.
- `.[orchestration]` — Airflow scheduler; deploy the DAG only after environment configuration and acceptance.
- `.[dbt]` — dbt Core/Postgres; configure a local profile outside source control.
- `.[quality]` — Great Expectations for richer suites; core deterministic quality checks work without it.
- `.[scale]` — PySpark and PyIceberg for measured historical workloads.

## Rollout constraints

- No login, private account, or access-control bypass.
- No production writes by default; no Node JSON/article store writes.
- Publisher provenance and claim verification remain separate.
- The first collector stores feed metadata/snippets, not full publisher article text.
- Kafka and Airflow are not started by the application automatically.
- Parquet is an analytical snapshot, not a second operational source of truth.
- Spark/Iceberg are scale options, not mandatory dependencies.
- Do not switch website/API consumers or disable Node ingestion before Phase 10 parity, quality, recovery and rollback gates pass.
