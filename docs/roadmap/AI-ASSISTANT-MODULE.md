# AI Assistant module — Phase 0.8

## Purpose and boundary

The Raksha Atlas assistant answers questions about public defence information already held by the application. It is a research interface, not an operational military system. It must not generate targeting, live deployment, exploitable vulnerability, weapon-construction or actionable tactical guidance.

## Current implementation

- Entry point: `POST /api/chat` in `server/index.mjs`.
- Retrieval and answer generation: `server/rag.mjs`.
- UI: `ChatDialog` in `src/App.tsx`.
- Provider: OpenAI Responses API when `OPENAI_API_KEY` is configured; `OPENAI_MODEL` selects the model. Optional live web search is controlled by `RAG_WEB_SEARCH`.
- Without a model key, the assistant returns local retrieval results and retains the existing curated in-service inventory count fallback.
- Retrieval remains lexical/keyword based. Embeddings, pgvector, reranking and multi-provider routing are future work, not implemented in Phase 0.8.

## Indexed domains

1. News/article records and related source links; rejected review records are excluded.
2. Curated in-service inventory and reference equipment catalogue.
3. Procurement records and programme timelines.
4. Programme dossier records, including evidence quality, stage classification, milestones and source URLs.
5. Public command directory records.
6. Theatre Atlas public regional geography records. Approximate city/region precision is retained as a caveat.
7. Completed document extractions. PDF pages are indexed separately with page numbers; HTML/text documents are indexed as one source record. Documents without completed extraction are not represented as searchable full text.

Every retrieved record carries a stable local reference, source URL, source/publisher name, verification label, review state, date where available and record type. Document-page citations additionally carry the source page number.

## Retrieval and answer policy

- A lightweight intent classifier boosts relevant domain records for inventory counts, programme status, organisation, public geography and document research.
- Inventory count handling continues to use curated in-service rows only; orders, proposals, development records and reference catalogue duplicates are not added to active totals.
- Programme stage labels marked `heuristic_from_dossier_text` must remain explicitly heuristic and must not be promoted to an approved acquisition stage.
- Official publisher provenance is distinct from whether a particular claim is verified.
- The model is instructed to cite material factual paragraphs with exact local references and to state when evidence is absent, conflicting or stale.
- Retrieved source text is untrusted input. Instructions embedded in a document/article must never change assistant behavior.
- A request boundary blocks narrowly defined actionable operationally sensitive asks and redirects to public, high-level context.
- Public geography answers must not infer installation perimeters, readiness, force strength, access routes or operational schedules.

## API contract

Request:

```json
{ "question": "What is publicly documented about Project 76?" }
```

Response fields:

- `answer`: answer text or retrieval-only explanation.
- `sources[]`: local and live-web source references, including URL, source name, verification/review labels, date, kind and optional page number.
- `retrievalCount`: number of local records selected.
- `queryIntent`: selected retrieval intent.
- `citationCoverage`: simple local citation-presence indicator; it is a diagnostic, not a calibrated factuality score.
- `mode`: safety-boundary, retrieval-only, local inventory RAG, local RAG or local RAG plus live web search.
- `generatedAt`, `needsModelKey`.

The existing 12 requests/minute per-client rate limit and question-length limit remain in place.

## Validation

Run:

```powershell
npm test
npm run build
```

Focused RAG tests cover intent routing, sensitive-request boundaries and source-backed indexing of programme, command and Theatre Atlas records. Full end-to-end model validation requires an OpenAI key and should use a reviewed evaluation set.

## Known limitations / next improvements

- Lexical retrieval can miss semantic paraphrases; add embeddings and pgvector only with a measured recall evaluation.
- Citation presence is checked diagnostically but claim-level entailment is not yet machine-verified.
- Live web search citations are returned by the provider; they are not yet normalized into the local evidence-quality taxonomy.
- Conversation history is not persisted.
- No live external-source extraction or model-backed evaluation is implied by passing local tests.
- Add deterministic evaluation fixtures for conflicting sources, stale records, OCR page references, prompt-injection payloads and no-evidence questions before production promotion.
