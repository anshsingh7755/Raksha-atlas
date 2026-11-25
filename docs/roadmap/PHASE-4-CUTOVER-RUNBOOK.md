## Simple explanation

This runbook covers the later parts of the Python data-engineering migration: analytics, Parquet snapshots, optional Kafka events, Airflow scheduling, dbt models and quality checks.

These tools are optional building blocks. They should be enabled only when configured and useful. They do not automatically replace the current Node ingestion process.

# Phase 4.6–4.10 — Analytics, events and orchestration

## Implemented capabilities

| Sub-phase | Deliverable | Guardrail |
|---|---|---|
| 4.6 | Optional Polars batch normalization and deterministic batch transforms | Installed only through the analytics extra |
| 4.7 | Zstandard Parquet analytical snapshot export | Snapshot is not an operational source of truth |
| 4.8 | Kafka article event publisher | No broker connection unless explicitly configured |
| 4.9 | Airflow public RSS dry-run DAG and dbt staging model/tests | Airflow deployment and dbt profile remain environment configuration |
| 4.10 | Quality report for duplicates, required fields, date validity and source coverage; optional Spark/Iceberg snapshot job | Spark/Iceberg require an approved catalog and are scale-gated |

## Commands and optional dependencies

From `data-engineering/`:

- Offline tests: `python -m unittest discover -s tests -v`
- Wiring check: `python -m pipeline.main --check`
- Public-feed dry run: `python -m pipeline.main --collect-rss`
- Parquet export: install `.[analytics]`, then add `--parquet-output ./artifacts/parquet`
- PostgreSQL apply: install `.[postgres]`, configure `DATABASE_URL`, apply the additive SQL, and explicitly add `--apply`

Extras are defined in `pyproject.toml`: `analytics`, `events`, `orchestration`, `dbt`, `quality` and `scale`. Kafka, Airflow, dbt, Great Expectations, Spark and Iceberg are not mandatory for the basic collector.

## Phase 10 acceptance still required

- Install and validate optional dependencies in the target runtime.
- Compare the same feed/time window between Node and Python: coverage, stable IDs, publication dates, canonical URLs, duplicate decisions and error handling.
- Validate Polars/Parquet schema and row-count reconciliation on a reviewed sample.
- Verify PostgreSQL landing-table constraints and idempotent writes in a non-production database.
- Configure and test Kafka delivery/retry behavior only if event consumers are approved.
- Deploy Airflow only after secrets, concurrency, retries and failure alerting are configured.
- Run dbt tests against a populated test database.
- Validate quality thresholds and source freshness with operators.
- Test Spark/Iceberg only against an approved catalog and sample dataset.
- Rehearse rollback; keep Node ingestion active until explicit cutover approval.

No production schedule, broker, cloud catalog, credentials or consumer routing is activated by these commits.
