## Read this guide in simple terms

This document explains how Raksha Atlas finds public news leads and turns them into records that can be searched and reviewed.

A **collector** reads a configured public feed or API. An **extractor** reads a limited amount of permitted metadata from a page. A **processor** cleans the record, checks duplicates and may add a category or summary. The result is stored and can appear in the Signals feed.

The pipeline does not prove that a story is true. It records where the item came from and keeps a separate verification/review status. A human must review important claims.

# Raksha Atlas: automated news pipeline

## Scope and operating choices

- Initial coverage: Indian defence and security, with categories structured so other beats can be added without separate collectors.
- Collection: allowlisted RSS/Atom feeds, Google News discovery feeds, PIB metadata, and optional official YouTube/X APIs. Public endpoints only.
- Publishing: new leads are shown automatically with source, date, category, and verification/review labels. Publisher provenance is separate from claim verification: an official government publisher does not make every release claim editor-verified. Newly collected records remain `unverified` until reviewed.
- Review: weekly human review can approve, correct, or reject leads. Rejected records stay in the audit history and are excluded from public feeds and RAG retrieval.
- Backend: Node.js modular workers and API, matching the existing repository. PostgreSQL is the durable deployment store; JSON remains the no-configuration local fallback.
- Schedule: news collection at every hour boundary in Asia/Kolkata; PIB and reference data refresh at 04:00 IST. Both require the API process to remain running.

## Implemented pipeline

```text
Hourly scheduler ──> RSS / discovery / optional YouTube & X collectors
                  ──> URL normalization + duplicate/event clustering
                  ──> capped public-page metadata extraction (Open Graph only)
                  ──> AI summary + category/tags (rules fallback if no model key)
                  ──> PostgreSQL or local JSON
                  ──> public Signals feed + searchable category filter + RAG
                  ──> human review / corrections / rejection

04:00 IST scheduler ──> PIB release index + reference table refresh
```

### Modules

- `server/collectors/` — source adapters are separated by source family. RSS/Atom parsing prefers an alternate HTML link over an Atom self link. Feed polling is in `scripts/ingest-monitored-sources.mjs` today and can be split into more adapters without changing the UI contract.
- `server/extractors/article-metadata.mjs` — validates HTTPS/public hosts and extracts Open Graph title, description, image URL, author and date. It does not copy full article bodies and blocks local/private network destinations.
- `server/processors/ai-article-enricher.mjs` — produces a short non-verbatim summary and category/tags from the source excerpt. With no OpenAI key it uses deterministic keyword classification. It cannot change the verification label.
- `server/db/schema.sql` and `server/db/store.mjs` — PostgreSQL schema/store for sources, dynamically managed RSS feeds, categories, article records, related source links, image attribution, editorial revisions, pipeline logs and failed jobs. `DATABASE_URL` enables Postgres; otherwise JSON files are used.
- `server/workers/news-worker.mjs` — worker entrypoint invoked independently from the HTTP route and scheduler.
- `server/scheduler/hourly-scheduler.mjs` — hourly and 04:00 IST schedule with overlap guards.
- `server/monitor-sources.json` — local RSS/API allowlist. Add and pause feeds in the Sources page; in PostgreSQL deployments the feed configuration is stored in the database, and new feeds start as non-official and unverified.
- `server/categories.json` — category hierarchy and keyword seeds. Category additions do not require creating a new ingestion pipeline.
- `server/index.mjs` — read API, review endpoints, health/configuration status, controlled writes and source management.

## Duplicate and story handling

1. Canonical URL identity removes common tracking parameters and deduplicates exact links.
2. Normalized headline token similarity groups close reports into one lead.
3. High-overlap source excerpts provide a third lexical content-similarity check.
5. Grouped articles retain every additional publisher URL in `relatedSources` and PostgreSQL `article_sources`.
6. A story cluster is not proof of truth. Each source maintains its own publisher and verification label.

The current duplicate detector is lexical headline similarity, not semantic embeddings. Review grouped-source records when titles are generic or the cluster looks wrong.

## Categories and images

Categories include Defence, Naval Forces, Air Forces, Land Forces, Missiles & Space, Defence Industry, Technology, Politics & Policy, Business & Economy and Sports. The feed currently collects defence-focused configured sources; adding broad categories does not imply the corresponding sources have been configured.

Image metadata may be recorded from a publisher page, but `imageReusePermitted` defaults to false and the UI does not render it. A public URL does not establish a reuse licence. Set reuse permission only after an editor records a permitted licence and attribution. No unrelated image is substituted.

## Storage and deployment

### Local development

```powershell
Copy-Item .env.example .env
npm install
npm run dev:full
```

Without `DATABASE_URL`, the API and collector use `server/data.json` and `server/sources.json`. The OpenAI key is optional for deterministic summary/category fallback but required for generated summaries and synthesized RAG answers.

### PostgreSQL / Docker Compose

1. Copy `.env.example` to `.env`.
2. Set strong unique, URL-safe values for `DB_PASSWORD` and `RAKSHA_ADMIN_TOKEN`; add `OPENAI_API_KEY` if model summaries/chat are wanted.
3. Set `CORS_ORIGIN` and `PUBLIC_SITE_URL` to the hosted site origin.
4. Run `docker compose up --build -d`.
5. Visit `http://localhost:8080` by default. PostgreSQL data persists in the `raksha-postgres` volume.

The Compose stack runs PostgreSQL, the API/worker scheduler and the static React site behind Nginx. Production writes require the admin token. Do not publish the database port to the internet.

### Optional platform connectors

- YouTube Data API key: enables public video metadata searches. It does not retrieve transcripts.
- X API bearer token plus exact public usernames in `server/monitor-sources.json`: enables recent public posts subject to the account's current API tier.
- Current handles/channel IDs are deliberately not guessed. Use only identities verified by the operator.

## Monitoring and operations

- `GET /api/health` — liveness, latest daily/hourly results and next refresh target.
- `GET /api/rag/status` — configured feature flags and storage counts; never returns key values.
- `GET /api/pipeline/logs?limit=30` — persisted PostgreSQL pipeline runs; JSON mode returns the latest collector result.
- Failed runs are recorded in `failed_jobs` in PostgreSQL and source-level fetch outcomes are retained. The 15-minute `next_retry_at` is a retry schedule marker; automated dead-letter replay is not yet implemented.
- HTTP collectors retry transient network, rate-limit and server errors up to three times with bounded backoff. YouTube broad search rotates one configured term per hourly run by default to contain quota usage; exact channels use the lower-cost uploads playlist API.
- Run a collector once with `npm run news:run`; refresh reference tables with `npm run sync:reference`; initialize/migrate the database with `npm run db:migrate`.

## Editorial, legal and factual boundaries

- The collector operates on explicit feeds/API endpoints; it cannot collect from literally every public website or social account.
- RSS/search feeds are discovery channels. Open the publisher's original link before treating a headline/snippet as an established fact.
- Do not bypass logins, paywalls, robots/access controls, or source terms. Copyrighted full articles are not republished. Summaries are original and limited to source-provided excerpts.
- Official publisher means government/service provenance, not that every claim in a release is a completed event. A plan, AoN, RFI, tender, contract, delivery and induction remain separate stages.
- Never ingest classified, leaked, personally identifying, deployment, vulnerability or other non-public operational material.
- AI output can be wrong. An automated summary is not a source; original URLs and review labels remain visible.

## Expansion path

1. **Current foundation:** hourly RSS/API pipeline, labels, lexical dedupe, metadata extraction, category tagging, PostgreSQL option, API and review desk.
2. **Next scale step:** Redis/BullMQ queue, per-source retry/dead-letter replay, source schedules and distributed workers.
3. **Editorial/search step:** authenticated multi-user audit trail, corrections/version history, semantic retrieval and story clustering evaluation.
4. **Media step:** licensed image provider or object storage with verified attribution/permission records.
5. **Broader coverage:** configurable regions/languages and category source packs, with source coverage measured rather than claiming completeness.


## News pipeline tests

Run the focused parser and deduplication tests with:

```powershell
npm test
```

The current Node test suite covers canonical URL normalization, PIB release identity, headline matching, RSS parsing, Atom alternate-link selection and malformed feed entries. GitHub Actions runs `npm test` and `npm run build` on pushes and pull requests to the active foundation branch. Add regression tests whenever collector or editorial-state behavior changes.


## Future requirement: laptop-independent monitoring

The current pipeline already has collectors, deduplication, enrichment, storage, an hourly scheduler and a 04:00 IST reference refresh. However, the scheduler runs only while the Node API process is alive. It does not guarantee collection when the owner's laptop is offline.

The new owner requirement is documented separately in [Automated Defence Intelligence Monitoring](../intelligence/AUTOMATED-INTELLIGENCE-MONITORING.md). It proposes a hosted scheduler/worker, an 08:00–09:00 IST morning digest, a separate 10:00 IST refresh, incremental collection through the day, event-level source comparison, explicit evidence labels and phone-based controls.

This is a **proposed future capability**, not a claim that the hosted worker, new schedule, X monitoring or phone trigger is already implemented. The first implementation should reuse the existing Node collectors and storage, move execution to a suitable hosted runtime, and preserve current website/API behaviour. Free-tier limits and publisher access restrictions must be visible rather than bypassed.
