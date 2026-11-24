# Raksha Atlas data engineering

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
