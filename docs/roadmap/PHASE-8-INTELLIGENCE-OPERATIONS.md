## Simple explanation

Phase 8 makes the public-source workflow easier to observe. It adds counts and status information so an operator can see whether sources have been checked, how many feeds are configured and how many news items need review.

These measurements help people understand the pipeline. They do not prove that a publisher is reachable or that a news claim is true. The existing Node collection process remains active.

# Phase 8 — intelligence operations and data quality

## Objective

Make the existing public-source intelligence workflow observable and easier to review. This phase adds operational counts, source-check freshness indicators, review-queue visibility and backward-compatible article pagination. It does not replace the Node ingestion scheduler or automatically verify reports.

## 8.1–8.10 implementation record

| Sub-phase | Workstream | Implementation |
|---|---|---|
| 8.1 | Operational summary API | Added read-only `GET /api/operations/summary` with source, feed, article-review and pipeline summary data. |
| 8.2 | Source freshness metrics | Classifies recorded source checks as within 24 hours, older than 24 hours, older than 7 days or never checked. |
| 8.3 | Feed configuration visibility | Reports configured, active and inactive RSS feed counts without exposing feed credentials or private configuration. |
| 8.4 | Editorial review queue metrics | Counts unreviewed, in-review, approved and rejected articles and verification labels separately. |
| 8.5 | Article API pagination | Added optional bounded `limit` (1–200) and non-negative `offset`, with `total` and `hasMore`; requests without pagination retain the original all-results behavior. |
| 8.6 | Typed operations client | Added `src/services/operations.ts` with an explicit summary response contract. |
| 8.7 | Operations dashboard UI | Added source freshness, feed configuration, review queue and latest refresh indicators to the existing source/RAG status panel. |
| 8.8 | Evidence interpretation | UI explicitly distinguishes a recorded source check from publisher availability and claim verification. |
| 8.9 | Regression coverage | Extended the real Node API smoke test and frontend contract tests for the new summary and pagination contracts. |
| 8.10 | Runbook and release boundary | Documented metric definitions, compatibility behavior, verification commands and deferred operational checks. |

## API contract

### `GET /api/operations/summary`

Returns:
- `sources`: total, active/inactive and recorded check-freshness counts.
- `feeds`: configured, active and inactive RSS feed counts.
- `articles`: total, review-state counts and verification-status counts.
- `pipeline`: last refresh/sync timestamps and results, plus sanitized aggregate counts for recent pipeline jobs when PostgreSQL storage is enabled. Error payloads, source URLs, tokens and job metrics are not returned.
- `storage`: current Node API storage mode.
- `generatedAt`: summary generation timestamp.

The endpoint intentionally omits secrets, tokens, feed URLs, article bodies and source credentials. It is an operational summary, not a source-quality or factuality score.

### Article pagination

`GET /api/articles` retains the existing response behavior when `limit` and `offset` are omitted. Optional pagination is:

`GET /api/articles?limit=50&offset=0`

- `limit`: integer clamped to 1–200.
- `offset`: non-negative integer; invalid values fall back to zero.
- `total`: number of records after filters, before pagination.
- `hasMore`: whether additional filtered records remain.
- Existing service/topic/category/source/date/verification/review filters remain unchanged.
- Rejected records remain excluded unless a specific review state is requested.

## Metric definitions and caveats

- **Checked within 24 hours:** source has a parseable `lastCheckedAt` timestamp no more than 24 hours old.
- **Stale over 24 hours / over 7 days:** based only on recorded check timestamps; it does not prove a feed is down.
- **Never checked:** no usable check timestamp is recorded.
- **Active feed:** feed configuration is enabled; it does not mean the last fetch succeeded.
- **Review queue:** editorial workflow state, independent of verification status.
- **Official publisher:** provenance classification only; it does not automatically verify each claim.

## Validation

Run from repository root:

```powershell
npm ci
npm test
npm run build
node --test frontend/tests/*.test.mjs src/services/*.test.mjs
```

The CI workflow also runs the API smoke test and frontend integration contracts. A green run validates code and fixture-backed contracts, not live source reachability, production scheduler reliability or editorial correctness.

## Phase 10 acceptance gates

- [ ] Validate source-check timestamps against real successful and failed check attempts.
- [ ] Compare operational counts with PostgreSQL pipeline tables and JSON fallback on the same snapshot.
- [ ] Verify scheduled ingestion timestamps, retry behavior and failure recording under controlled conditions.
- [ ] Confirm the operations endpoint is protected appropriately at the production edge and cannot expose privileged data.
- [ ] Review source freshness thresholds with actual collection cadence; do not treat the proposed 24-hour/7-day buckets as approved SLOs.
- [ ] Validate pagination with large datasets and all supported filters.
- [ ] Confirm article review counts reconcile with the underlying article register.
- [ ] Test the source and review dashboard at desktop, tablet and mobile breakpoints.
- [ ] Exercise source outage, scheduler failure, PostgreSQL outage and recovery.
- [ ] Record operational ownership and approve any alerting thresholds before enabling alerts.

## Release boundary

Phase 8 adds observability and review aids to the existing Node application. It does not change ingestion schedules, activate new providers, auto-approve articles, upgrade verification labels, enable production alerts or move data ownership. Node remains active; Spring/FastAPI cutover remains subject to Phase 10 acceptance and explicit approval.
