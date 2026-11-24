# Phase 4.1 — Existing ingestion inventory

## Scope reviewed

The active Node ingestion path is centered on `scripts/ingest-monitored-sources.mjs`. This audit records responsibilities and migration constraints; it does not change the active runtime.

| Responsibility | Existing Node implementation | Contract / behavior to preserve |
|---|---|---|
| Feed configuration | `server/monitor-sources.json` | Active flags, source IDs, publisher labels, official flag, verification defaults and notes |
| RSS/Atom fetch | `server/collectors/rss-collector.mjs` | RSS item and Atom entry parsing, link selection, publication timestamps, bounded summaries |
| Network retry | `server/collectors/fetch-with-retry.mjs` | Timeout, bounded retry, 429/5xx backoff and Retry-After |
| Metadata extraction | `server/extractors/article-metadata.mjs` | HTTPS-only public host checks, redirect checks, robots policy, metadata-only extraction and response size bound |
| YouTube | `server/collectors/youtube-collector.mjs` | Public API metadata only; API key required; channel identity remains subject to review |
| X | `server/collectors/x-collector.mjs` | Public API only; bearer token and exact configured accounts required |
| Article normalization | `scripts/ingest-monitored-sources.mjs` | Stable source-linked IDs, timestamps, attribution, unreviewed defaults |
| URL deduplication | `server/processors/deduplicator.mjs` | Tracking parameter cleanup, stable release IDs and canonical URLs |
| Story clustering | `server/processors/deduplicator.mjs` | Similarity threshold groups reports but preserves related source references |
| Enrichment | `server/processors/ai-article-enricher.mjs` | AI enrichment bounded by configured limit; fallback summary remains possible |
| Persistence | `server/db/store.mjs` plus JSON fallback | PostgreSQL adapter when configured; otherwise JSON state |
| Scheduling | `server/scheduler/hourly-scheduler.mjs` | Hourly run and daily run at 04:00 Asia/Kolkata; overlap guards |

## Operational observations

- The ingestion script currently writes `sources.json`, `monitor-sources.json` and `data.json`; the Python path must not write these files.
- Existing collector source outcomes and pipeline metrics are logged when the store is configured.
- The Node pipeline currently handles RSS, YouTube and X. Phase 4.3 ports RSS first; other collector types remain on Node until separately implemented and reconciled.
- The Node pipeline's story clustering is not equivalent to URL deduplication. Python 4.4 currently performs canonical URL deduplication only; semantic/story clustering is not claimed as parity.
- Official publisher provenance and claim verification are separate. New records remain `unverified` and `unreviewed`.
- RSS snippets and metadata are retained; the migration must not silently copy full publisher article text.

## Migration rule

Run Python as an isolated, dry-run-first pipeline. Do not add it to the Node scheduler, disable Node collectors, write to the Node article store, or change the website API until Phase 10 parity, runtime and rollback gates pass.
