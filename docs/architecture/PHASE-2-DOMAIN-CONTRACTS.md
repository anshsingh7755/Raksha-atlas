# Phase 2 — Domain model and API contracts

**Status:** 2.1 contract baseline recorded; 2.2–2.5 implementation in progress  
**Runtime rule:** Node.js remains the production/reference API until each Spring endpoint passes parity and reconciliation.

## Domain ownership

| Domain | Primary key | PostgreSQL owner | Evidence/provenance |
|---|---|---|---|
| Inventory | stable string `id` | `inventory_items` | source ID/URL, confidence, verification status, as-of date |
| Sources | stable string `id` | `sources` | canonical URL, source type, official flag, default claim status |
| Programmes | stable string `id` | `programmes` | service/domain, reported and normalized stage kept distinct, evidence quality, source JSON |
| Procurement | stable string `id` | `procurement_records` | reference, source ID/URL, stage/status, publication and closing timestamps |

All imported rows retain their original JSON in `raw_record JSONB`. This is a migration/audit aid, not a substitute for normalized columns. IDs are preserved verbatim. Missing or ambiguous values remain NULL; narrative text is never promoted to a verified quantity, date or acquisition stage.

## API v1 baseline

Base path: `/api`. JSON uses camelCase property names. Lists are deterministic and return a stable shape. Errors use Spring's Problem Details format.

| Method | Path | Purpose | Initial response |
|---|---|---|---|
| GET | `/api/health` | service health | `{status, service, migration}` |
| GET | `/api/inventory` | inventory register | list of inventory records (compatibility baseline; filters/envelope added only with parity tests) |
| GET | `/api/sources` | source registry | list of source records |
| GET | `/api/programmes` | programme register | `{items, count, asOf, classificationPolicy}` |
| GET | `/api/procurement` | procurement records | `{items, count, asOf}` |

## Inventory fields

Stable identity and classification: `id`, `service`, `category`, `platform`, optional `variant`, `technicalProfile`.

Quantity/lifecycle: nullable `quantity`, `quantityStatus`, `procurementYear`, `inductedYear`, optional `acquisition`, `asOfDate`.

Description: `originCountry`, `manufacturer`, `role`, `capabilitySummary`, `definition`.

Evidence: `confidence`, `verificationStatus`, `sourceId`, `sourceUrl`, `supportingSourceIds`, `dataLimitations`.

## Source fields

`id`, `name`, `url`, `sourceType`, `official`, `defaultStatus`, `language`, `active`, `reliabilityNotes`, `termsReviewedAt`, `lastCheckedAt`, `lastIngestAt`, and original status/check metadata in `raw_record`.

## Programme fields

`id`, `name`, `serviceDomain`, `category`, `variant`, `developer`, `manufacturers`, `status`, `stageLabel`, `stageClassification`, nullable `quantity`, `quantityType`, `quantityConfidence`, `announcedDate`, `milestones`, `sources`, `evidenceQuality`, `summary`, `dossierText`, `lastVerifiedAt`, `reviewNotes`.

A heuristic stage label must remain explicitly heuristic; it must not be stored as a verified acquisition stage.

## Procurement fields

`id`, `title`, `reference`, `sourceId`, `sourceUrl`, `publishedAt`, `closingAt`, `status`, `scope`, `verificationStatus`, plus source-specific fields retained in `raw_record`. Future-procurement records preserve `service`, `system`, `quantityText`, nullable `quantity`, `stage`, `stageDate`, `deliveryWindow`, `verificationStatus`, `sourceUrl` and `notes`; these remain a separate pipeline dataset and are not merged into active inventory.

## Migration invariants

- Import is idempotent by stable source ID (`INSERT ... ON CONFLICT DO UPDATE`).
- A dry run is the default; writes require an explicit `--apply`.
- The import report records per-file input/imported/rejected counts and duplicate IDs.
- Do not delete or rewrite source JSON during import.
- Do not change the Node API, frontend proxy or active runtime as part of Phase 2.1–2.5.
- Do not publish the Spring API as primary until row-level reconciliation and endpoint parity pass.
