# Spark and Iceberg scale path

This is a deferred analytical scale adapter, not a runtime dependency. Use Spark/Iceberg only when measured batch volume, query latency or retention needs exceed the Polars/Parquet path.

Recommended future sequence:
1. Export immutable Parquet snapshots from the Python pipeline.
2. Configure a Spark session with an approved Iceberg catalog and object-store credentials supplied at runtime.
3. Read Parquet snapshots, validate schema evolution and deduplicate by canonical URL.
4. Write Iceberg tables with snapshot retention and rollback policies.
5. Compare row counts, partition coverage and aggregates against source snapshots before publishing.

No cloud catalog, bucket, credential or production table is assumed by this scaffold.
