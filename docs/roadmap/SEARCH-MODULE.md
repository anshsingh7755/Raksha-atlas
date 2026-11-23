# Global Search — API and implementation

**Status:** Implemented; validation pending  
**Branch:** work/step-1-foundation

## Scope

The global search modal is the single cross-module discovery entry point. It searches:

- Inventory records
- Programme dossier records
- News articles and intelligence briefs (with a dedicated Briefs destination page)
- Programme timeline records
- Current procurement and future procurement records
- Reference equipment catalogue and platform classes
- Registered sources
- Service and joint command records
- Theatre Atlas location records

Rejected news articles are excluded. Search results retain the owning module's route key and record ID so the frontend can navigate to the correct page and carry the query into that page's filter.

## API contract

GET /api/search?q=<query>&section=<section>&limit=<n>

| Parameter | Behavior |
|---|---|
| q | Required for results; queries shorter than 2 characters return an empty result set |
| section | Optional exact section filter; defaults to all |
| limit | Optional result limit, clamped to 1–100; defaults to 40 |

Response fields:

- query, section
- count: number of returned results
- totalIndexed: number of indexed records before filtering
- sections: available section filters
- results: section, view, id, title and concise summary

## Relevance model

Search normalization is case-insensitive and removes punctuation differences, normalizes accents, expands ampersands and collapses whitespace. A curated acronym dictionary expands common defence abbreviations such as IAF, DRDO, HAL, BEL, AMCA, LCA, MRFA, SSN, QRSAM and MRSAM.

A multi-token query must match every query concept, while each acronym can match either its literal form or a complete expanded phrase. Results are ranked using weighted title/name/category/summary/body matches, exact phrase matches and token coverage. Stable title/ID ordering breaks equal-score ties. The engine is dependency-free and separately unit-tested.

## Frontend behavior

- Debounced requests with AbortController cancellation.
- Search across all sections or narrow to one section without closing the modal.
- Loading, API error and no-results states are distinct.
- Enter opens the highest-ranked result; clicking a result opens its owning module.
- The query is passed into the destination module's existing search/filter where available. Command, source, platform-register, Theatre Atlas and Briefs destinations accept the carried query.

## Validation

Run npm test and npm run build.

Focused search-engine tests: node --test server/search/index.test.mjs

Tests cover normalization, title ranking, acronym expansion, multi-term matching, section filtering, limits and unrelated-record rejection.

## Known limitations

- Search is an in-memory index assembled from the active JSON/PostgreSQL-backed read paths on each request; it is not a persistent search engine.
- Fuzzy typo correction, stemming, multilingual transliteration and semantic/vector retrieval are not implemented.
- Result summaries are concise snippets, not verified answers. Open the underlying module and source record to assess the evidence.
- Search result navigation filters the destination page; not every module currently opens a dedicated record-detail modal automatically.
