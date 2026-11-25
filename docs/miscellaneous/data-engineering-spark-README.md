# Spark and Iceberg — future large-scale analytics

## What is this?

Apache Spark is a tool for processing very large datasets across multiple computers. Apache Iceberg is a table format that helps manage large analytical datasets over time.

This folder is a **future scale option**, not a service required to run Raksha Atlas today. The normal Python pipeline should use the simpler Polars and Parquet path until real data volume or performance measurements show that a larger system is needed.

## What each technology does

- **Parquet:** stores data in a column-based file format that works well for analytics.
- **Spark:** processes large datasets, including data spread across machines.
- **Iceberg:** manages analytical tables, snapshots and schema changes.

These tools are for batch analytics. They are not a replacement for the operational PostgreSQL database.

## Recommended future flow

1. The Python pipeline produces a versioned Parquet snapshot.
2. A configured Spark session reads that snapshot.
3. The job checks the schema and removes duplicate records using the agreed identity key.
4. Spark writes the approved result to an Iceberg table.
5. The team compares counts, partitions and important totals with the input snapshot.
6. Only a reviewed result is published to analytical consumers.

## What is not configured here?

This scaffold does not assume a cloud catalog, object-storage bucket, production credentials or production table. Those must be configured and approved separately.

## When should this be used?

Use Spark/Iceberg only when measurements show that the current Polars/Parquet approach is not sufficient. Do not add a distributed system just because it appears in the target technology list.

## Safety checks

- Keep credentials outside source control.
- Preserve the input snapshot so a result can be reproduced.
- Validate schema changes before writing.
- Keep a rollback or snapshot-retention plan.
- Do not treat analytical tables as the operational source of truth.
