# Inventory Module — Implementation Specification

**Status:** Phase 0.1 — service-neutral default and data-driven filters implemented; local validation pending  
**Working branch:** `work/step-1-foundation`  
**Active runtime:** React + TypeScript + Vite and Node.js API

## Goal

Provide one consistent, service-independent inventory experience across Army, Navy, Air Force and other publicly documented domains. Service selection is a filter, not a separate data structure or service-specific page implementation.

## Domain hierarchy

```text
Service (ownership / operating service)
  -> Equipment domain (land / maritime / air / space / cyber / joint)
      -> Equipment category (ship, aircraft, tank, radar, etc.)
          -> Class / family
              -> Platform
                  -> Variant / sub-variant
```

Not every record needs every level. Do not invent a class or variant where a source does not provide one. A tri-service system may use `service: "Joint"` only where the source supports joint ownership/use. A platform shared by multiple services may later need explicit operator/owner fields rather than duplicated, inconsistent records.

## Canonical record fields

The current `server/inventory.json` schema is retained for this implementation slice:

| Field | Meaning |
|---|---|
| `id` | Stable unique record identifier |
| `service` | Owning/operating service label |
| `category` | Equipment category |
| `platform` | Platform/system display name |
| `variant` | Optional variant |
| `technicalProfile.class` | Optional class/family where present |
| `quantity` | Numeric value only when source quantity is unambiguous |
| `quantityStatus` | Lifecycle/quantity context (in-service, ordered, planned, etc.) |
| `originCountry`, `manufacturer` | Origin and manufacturer descriptors |
| `role`, `capabilitySummary`, `definition` | Public description |
| `procurementYear`, `inductedYear`, `acquisition` | Dated lifecycle and procurement evidence |
| `verificationStatus`, `confidence` | Evidence quality; not readiness |
| `sourceId`, `sourceUrl`, `supportingSourceIds` | Evidence trail |
| `asOfDate`, `dataLimitations` | Freshness and interpretation limits |

The inventory API may enrich a record with a representative image from the platform register. The source inventory JSON remains the record source until PostgreSQL migration and reconciliation are complete.

## Service domains

The current UI exposes Army, Navy, Air Force, Joint, Space, Cyber and Intelligence. These are navigation/filter domains, not a claim that each is a conventional armed service. Only records actually present in the public dataset should appear. An empty domain must show an honest empty state rather than fabricated records or counts.

**Default behaviour:** when the user opens Inventory without first choosing a service, show **All services**. Selecting a service in the Commands view can still open Inventory with that service preselected. The service cards should not visually imply a default selection when the active filter is All services.

## Current implementation audit

- UI: `Inventory` component in `src/App.tsx`.
- Service selection state: `activeForce` in `App()`; the default is now `"all"`.
- Data API: `GET /api/inventory` in `server/index.mjs`.
- Source data: `server/inventory.json`.
- Image enrichment: existing platform-register matching in the inventory API.
- Class explorer: existing `GET /api/inventory/register` and `GET /api/equipment-catalog`.
- Search: `GET /api/search` includes inventory records.
- Legacy exception: a Navy-specific frigate reader and `GET /api/inventory/frigates` route duplicated a subset of information represented in the common inventory catalogue. The reader, path constant and route have now been removed from the active API.

### Initial implementation slice applied

1. Changed the global selected-service default from Navy to All services in `src/App.tsx`.
2. Added an explicit neutral All services selection descriptor for the Commands view.
3. Removed `frigatesPath`, `readFrigates()` and `GET /api/inventory/frigates` from `server/index.mjs`.
4. Kept the common `GET /api/inventory` API, its filters, image enrichment and existing inventory records intact.
7. Added `availableFilters` metadata (services, categories, lifecycle statuses and origin countries) derived from the full dataset, so the UI no longer maintains hardcoded filter option lists.
8. Updated the inventory response date to the latest `asOfDate` among the source records (`asOf` remains as a compatibility alias and `latestRecordAsOf` is explicit).
5. Kept `server/frigates.json` in the repository for now as a rollback/reference artifact. It is no longer loaded by the API. Do not delete it until local build/smoke verification and a repository-wide usage check confirm it is safe to remove.
6. No inventory dataset records were intentionally changed by this slice.

## API contract

`GET /api/inventory?service=&category=&quantityStatus=&originCountry=`

Response:

```json
{
  "items": [],
  "count": 0,
  "filters": {
    "service": null,
    "category": null,
    "quantityStatus": null,
    "originCountry": null
  },
  "availableFilters": {
    "services": ["Army", "Air Force", "Cyber", "Intelligence", "Joint", "Navy", "Space"],
    "categories": ["..."],
    "quantityStatuses": ["AoN", "contract_signed", "in_service", "..."],
    "originCountries": ["..."]
  },
  "asOf": "latest source-record as-of date",
  "latestRecordAsOf": "latest source-record as-of date"
}
```

Each query parameter is optional and combines with the others using AND semantics. Service and category comparisons currently use exact string matching. Preserve source labels; add canonical enum mapping only through a reviewed migration that retains original values.

## Acceptance checks

- [ ] `npm run build` succeeds.
- [ ] `npm run dev:full` starts the frontend and API.
- [ ] `GET /api/health` returns HTTP 200.
- [ ] `GET /api/inventory` returns items and `count` equals the array length.
- [ ] Service filters for Army, Navy and Air Force return only matching service values.
- [ ] Service, category and lifecycle dropdown options are derived from the complete data response, not hardcoded arrays.
- [ ] Every lifecycle value present in the source data is available in the lifecycle dropdown.
- [ ] `GET /api/inventory?service=Joint` returns a valid empty list when there are no Joint rows; no dummy records are added.
- [ ] Category, lifecycle and origin filters compose correctly with service.
- [ ] Opening Inventory directly defaults to All services.
- [ ] Selecting a service from Commands opens Inventory with that service selected.
- [ ] Selecting All services shows the common catalogue across domains.
- [ ] Cards preserve quantity context, lifecycle, verification status and source links.
- [ ] Global search returns inventory records and opens Inventory with the query populated.
- [ ] No frontend or backend code calls `/api/inventory/frigates`.
- [ ] No active API code reads `server/frigates.json`.

## Manual local verification

From the repository root:

```powershell
npm install
npm run build
npm run dev:full
```

In a second terminal:

```powershell
Invoke-RestMethod http://localhost:8787/api/health
(Invoke-RestMethod http://localhost:8787/api/inventory).count
(Invoke-RestMethod "http://localhost:8787/api/inventory?service=Army").items.Count
(Invoke-RestMethod "http://localhost:8787/api/inventory?service=Navy").items.Count
(Invoke-RestMethod "http://localhost:8787/api/inventory?service=Air%20Force").items.Count
(Invoke-RestMethod "http://localhost:8787/api/inventory?service=Joint").count
```

Exact returned counts depend on the source snapshot. Check that returned service labels match the filter; do not compare against assumed fleet totals.

## Next implementation slices

1. Promote class/family to an explicit field where supported, retaining `technicalProfile.class` compatibility during transition.
2. Add source/as-of filters and clearer provenance presentation.
3. Add a record detail view with full technical profile and acquisition timeline.
4. Add backend contract tests for filter combinations.
5. Design the PostgreSQL inventory schema only after the UI/API contract is stable and the current dataset is reconciled.
