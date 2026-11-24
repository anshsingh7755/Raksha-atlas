# Raksha Atlas data engineering

Python ingestion is being introduced as a **parallel migration path**. Existing Node collectors, enrichment, scheduler and article storage remain active and authoritative until parity and Phase 10 acceptance.

## Phase 4 implementation

| Sub-phase | Deliverable |
|---|---|
| 4.1 | Inventory of Node collectors, processors, scheduler and their operational contracts |
| 4.2 | Canonical article, source, programme and equipment data contracts |
| 4.3 | First Python RSS/Atom collector using the existing active-feed configuration |
| 4.4 | URL normalization, validation and deterministic deduplication |
| 4.5 | Dry-run-first PostgreSQL landing sink and additive schema |

## Layout

```text
pipeline/
  collectors/  RSS/Atom and future public API collectors
  processors/  normalization, validation, deduplication
  schemas.py   canonical domain contracts
  storage.py   PostgreSQL sink
  main.py      CLI
sql/           additive landing-table DDL
tests/         offline contract and processor tests
```

## Run locally

From this directory:

```powershell
python -m unittest discover -s tests -v
python -m pipeline.main --check
python -m pipeline.main --collect-rss
```

The default collection mode is a dry run. To persist, install the optional driver, set `DATABASE_URL`, apply `sql/001_ingested_articles.sql` to a development database, then explicitly pass `--apply`:

```powershell
pip install -e ".[postgres]"
python -m pipeline.main --collect-rss --feed-id pib-rss-defence --apply
```

The collector accepts HTTPS feed URLs only, reads public RSS/Atom metadata (not full article text), and preserves publisher provenance separately from claim verification. Official publisher status never implies that an article's claims are verified.

## Safety and rollout

- Only configured active RSS feeds are eligible; no login, private account, or access-control bypass.
- No production writes are enabled by default.
- PostgreSQL landing table is additive and separate from Phase 2 domain tables.
- Existing Node pipeline is not disabled, redirected or modified by this package.
- Do not schedule this parallel collector in production or compare it against live Node ingestion until Phase 10 validation.
