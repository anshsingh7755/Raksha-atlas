# Raksha Atlas RAG chatbot and daily source monitor

## Current design

The chat is no longer a fixed answer map. `POST /api/chat` retrieves matching public records from the curated `inventory.json`, source-table equipment catalogue, procurement pipeline, programme timelines, history, and collected article records. In PostgreSQL mode it reads collected articles from the database, rather than relying on the JSON seed file. It sends those records as cited context to the OpenAI Responses API when `OPENAI_API_KEY` is configured. The model may use Responses API `web_search` for current questions. Local evidence is cited as `[R1]`, etc.; live-search citations are returned alongside it. Without a model key, inventory count questions can still be answered from matching curated records; other questions return retrieved records and explain that conversational synthesis/live search needs the key.

The local retriever is lexical/keyword based, with lightweight intent boosts for inventory counts, programme status, organisation, public geography and document research. It now indexes programme dossiers, the public command directory, Theatre Atlas regional records and completed document extractions (PDF pages remain page-addressable). It may miss semantic paraphrases; embeddings/vector search remain future work and should be added only with measured retrieval evaluation. See [AI Assistant module specification](docs/roadmap/AI-ASSISTANT-MODULE.md).

## What the scheduled collector does

Every hour on the Asia/Kolkata clock, while the API process is running, the worker collects configured public feeds/APIs, normalizes URLs, deduplicates and groups similar headlines, extracts capped Open Graph metadata, applies category/tags, and stores candidates. At 04:00 IST a separate daily job refreshes PIB Defence release metadata and equipment reference snapshots.

The assistant preserves source URL, publisher/source name, verification status, review state, publication/review date and record kind in its retrieved citations. Extracted PDF page records include page numbers. It distinguishes publisher officialness from claim verification and treats retrieved text as untrusted data, not instructions. Requests for targeting, live deployment, exploitable vulnerabilities, weapon construction or actionable tactical guidance are bounded to a refusal and high-level redirect. Citation coverage is currently a diagnostic presence metric, not a claim-level factuality score.\n\nThe monitor ingests:

- PIB RSS and configured Google News RSS discovery feeds for ANI, News on AIR / Prasar Bharati, IDRW, India Today, The Indian Express, The Hindu, international defence outlets, and the named defence channels/reporters.
- YouTube public video metadata when `YOUTUBE_API_KEY` is configured. It runs the listed discovery searches and any individually configured channel IDs. It does not download videos or scrape transcripts.
- Public X posts from the exact usernames enabled in `server/monitor-sources.json` when `X_BEARER_TOKEN` and those usernames are configured.

RSS search feeds are discovery tools, not the publisher. The article card links to the returned result; check the linked publisher item before promoting a claim. Each collected item is automatically visible in the Signals feed as an unreviewed lead with a short source/API excerpt, source link, date, author/channel when available, generated category, verification label and review state. AI enrichment is capped by `AI_ENRICH_LIMIT`; without a model key, deterministic categories and source excerpts are used. Open Graph extraction is capped by `METADATA_EXTRACT_LIMIT`. Full copyrighted articles, paywalls, private posts, and private messages are not copied. Publisher image URLs remain hidden unless reuse permission is established. X and YouTube account searches require configured, verified identities.

## Setup

1. Copy `.env.example` to `.env` in the project root.
2. Add server-side API credentials:

   ```dotenv
   OPENAI_API_KEY=your_key
   OPENAI_MODEL=gpt-6-astra
   RAG_WEB_SEARCH=true
   YOUTUBE_API_KEY=your_youtube_data_api_key
   X_BEARER_TOKEN=your_x_api_bearer_token
   RAKSHA_ADMIN_TOKEN=your_long_random_admin_secret
   DATABASE_URL=postgresql://raksha:password@localhost:5432/raksha_atlas
   ```

   The OpenAI key enables synthesized chat answers and generated summaries. PostgreSQL is optional in local mode; without `DATABASE_URL`, JSON files are used. YouTube and X collection are optional. Never put these values in `src/`, Vite `VITE_*` variables, or committed files.

3. In `server/monitor-sources.json`, set the exact X usernames and YouTube channel IDs you want monitored, then set each entry's `active` field to `true`. Verify that each profile is the intended public account first.
4. Start the full app with `npm run dev:full`. The Sources page shows whether model, search, YouTube, X, and RSS are configured.
5. Use the Sources review desk to add RSS feeds or run a refresh. `npm run news:run` runs monitored RSS/API collection once; `npm run sync:reference` refreshes reference tables. Run `npm run db:migrate` to initialize PostgreSQL from the current local data. For the containerized stack, set `.env` secrets and run `docker compose up --build -d`.

The schedule is an in-process clock scheduler with overlap guards. The machine/container must be awake and the API process must remain running at each scheduled time. Docker Compose provides a persistent API process and PostgreSQL volume; a static website host cannot run the collector by itself.

## Weekly human review

The Sources page shows each candidate with its source URL and current label. Choose a review state and verification state, then save. Approval requires a note. **Add source note** accepts a public URL, headline, and editorial summary and stores it as unverified/unreviewed for follow-up. Choosing **Remove from active feed** sets `reviewState: rejected`; it preserves the audit record but hides it from the public article list and RAG retrieval. Hosted write actions require the `RAKSHA_ADMIN_TOKEN` entered in the review desk; local development does not require it. Public chat requests are limited to 12 per minute per client address.

Automatic collection never changes a secondary post to `verified`. “Official” records mean the publisher is an official government outlet; the item may still only describe an AoN, proposal, test, schedule, or plan. The stage in the source text remains decisive.

## Projections and uncertainty

For questions such as “what could the forces look like in 2030?”, the model is instructed to distinguish signed contracts from approvals, proposals, and development work, state assumptions, and cite the quantities used. It must not add overlapping categories or represent a qualitative judgement as a statistically calibrated induction probability. If a public source does not provide a reliable delivery date or unit count, the answer should say that it is unknown.

## Endpoints and files

- `POST /api/chat` — RAG answer and cited sources.
- `GET /api/rag/status` — credential-presence flags and latest monitor status; never returns secret values.
- `POST /api/refresh` — full refresh (protected by admin token in production).
- `GET /api/articles` — collected source records; supports source, verification and review-state filters.
- `POST /api/articles/:id/review` — human review decision and note.
- `scripts/ingest-monitored-sources.mjs` — RSS, YouTube and X connectors.
- `server/monitor-sources.json` — source allowlist, discovery terms, and unresolved account identities.
- `server/rag.mjs` — local retrieval, evidence packaging and model answer generation.
- `NEWS-PIPELINE.md` — overall pipeline design, scope, image policy, deployment and expansion path.
- `server/collectors/` — separate RSS, YouTube and X adapters.
- `server/processors/` — URL/headline deduplication and AI/rules enrichment.
- `server/extractors/article-metadata.mjs` — constrained public-page metadata extraction, not full article text copying.
- `server/db/schema.sql` and `server/db/store.mjs` — PostgreSQL sources, categories, article, source-link, image attribution, pipeline log and failure tables.
- `server/scheduler/hourly-scheduler.mjs`, `Dockerfile`, and `docker-compose.yml` — hourly/daily schedules and deployment stack.

## Source references for implementation

- [PIB RSS feeds](https://www.pib.gov.in/ViewRss.aspx?lang=9&reg=1)
- [YouTube Data API `search.list`](https://developers.google.com/youtube/data/reference/rest/v3/search/list)
- [X API public posts and search](https://help.x.com/en/rules-and-policies/x-api)
- [OpenAI Responses API web search](https://developers.openai.com/api/docs/guides/tools-web-search)
- [OpenAI Responses API overview](https://developers.openai.com/api/reference/responses/overview)
