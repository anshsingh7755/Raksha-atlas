# Raksha Atlas data engineering

This package is the Phase 5 migration boundary. The existing JavaScript
collectors under `server/collectors/` remain active until each pipeline is
migrated and verified.

```text
collectors → processors → storage
```

## Local wiring check

```powershell
cd data-engineering
python -m pipeline.main --check
```

Future folders can be added without changing the boundary:

```text
pipeline/
├── collectors/    RSS, YouTube and public APIs
├── processors/    normalization, enrichment and deduplication
├── storage/       PostgreSQL and object storage adapters
└── main.py        pipeline CLI
```
