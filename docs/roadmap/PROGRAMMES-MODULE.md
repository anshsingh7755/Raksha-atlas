# Programmes Module — Data Contract and Delivery Plan

**Active branch:** `work/step-1-foundation`  
**Status:** Phase 0.3 in progress  
**Register input:** `server/programmes.json`  
**Research source:** [Future Programmes & Acquisition Intelligence dossier](../intelligence/FUTURE-PROGRAMMES-ACQUISITION-DOSSIER.md)

## 1. Purpose

Provide a source-led public register of Indian defence programmes and acquisitions. The module is for discovery and research; it is not an official procurement status dashboard, contract ledger, or order-of-battle.

The register may contain official programme announcements, official test milestones, secondary reporting, mixed evidence and unconfirmed concepts. These evidence classes must remain distinguishable.

## 2. Current implementation

- `GET /api/programmes` reads the curated JSON register.
- The Programmes page loads the API and provides client-side search and filters.
- Programme detail records expose source references, research notes, quantity confidence and dated timeline records linked through explicit `dossierRecordIds`.
- The 22 timeline records are maintained in `server/timelines.json`; 13 programme-register entries currently have an explicit timeline link. Unmatched timeline records remain separate rather than being attached by fuzzy name matching.
- Global search already indexes programme records.
- The API now returns stage-classification provenance, record status, evidence quality, source records, structured milestone fields and summary counts.

### API filters

| Query parameter | Meaning |
|---|---|
| `service` | Exact service/domain value; `all` or omitted returns all |
| `status` | Exact record status |
| `stageClassification` | Exact classification method |
| `evidenceQuality` | Exact evidence-quality class |
| `q` | Case-insensitive text search over title, service, category, summary, notes and reported stage |

### Response contract

- `items`: filtered programme records.
- `count`: number of returned records.
- `availableFilters`: service, status, stage-classification and evidence-quality values from the full register.
- `summary`: register entries, records needing verification, records with structured stage classification, programme entries linked to dated timeline milestones, timeline-record count and records containing at least one official source.
- `asOf`: research cutoff declared by the register.
- `classificationPolicy`: register-level classification caveat.

Each record preserves:
- stable record ID and programme name;
- service/domain, category, variant, developer and manufacturers where structured;
- normalized stage display and original dossier stage wording;
- stage-classification method and record status;
- quantity, quantity type and quantity confidence (nullable);
- announced date and structured milestones (nullable/empty when not captured);
- evidence quality, source metadata, source URLs and last verification date;
- original dossier summary, detail text and review notes.

## 3. Stage-classification safety rule

The initial register contains text-derived stage guesses. A keyword match such as “trial”, “contract”, “construction” or “delivered” inside a narrative is not sufficient evidence that the programme itself has reached that acquisition stage.

For records where `stageClassification = heuristic_from_dossier_text`:
- API `stage` is returned as `Needs verification`;
- original `stageLabel` is retained as `reportedStage`;
- the UI labels the original text as an unverified dossier label;
- the record is not counted as a structured stage record.

Only a source-backed, explicitly structured milestone may support a normalized acquisition stage. Keep these states distinct:
1. Concept / requirement
2. Acceptance of Necessity (AoN)
3. RFI / RFP / tender
4. Development / prototype
5. Trials / testing
6. User evaluation / clearance
7. Contract signed / ordered
8. Construction / production
9. Delivered
10. Commissioned / inducted / in service

An AoN is not a contract. A test is not user clearance. A contract is not delivery. A delivery is not automatically commissioning or induction.

## 4. Evidence and quantity rules

- Official government, service, DRDO, named developer and shipyard sources should be preferred for official status.
- IDRW and other secondary reporting can be retained as discovery evidence, but must not be labelled official.
- Mixed records must identify which claim is official and which is secondary.
- Do not promote unnamed-source claims, estimated quantities or projected schedules to verified facts.
- Keep quantity null when no defensible structured quantity exists. Narrative estimates must not be silently converted into order quantities.
- A source URL is not proof that every field in the record is supported by that URL.
- Preserve publication dates, source identity, verification date and confidence when adding evidence.

## 5. Known data-quality work

The JSON register currently declares **103 records**, while the dossier executive summary describes **97 working records**. Treat this as an unresolved reconciliation issue, not as a confirmed coverage count. Reconcile the dossier table, detailed programme sections and JSON records before publishing a definitive total.

The initial extraction also contains a high proportion of heuristic stage labels, unnormalized evidence-quality values, missing quantities and empty milestone arrays. The API/UI now expose these limitations rather than hiding them. The next data-quality pass should:
1. reconcile the 97-versus-103 record count and duplicate programme names;
2. normalize service/domain values without collapsing strategic/joint categories incorrectly;
3. identify official source support per milestone, not merely per programme;
4. structure dates and milestones only when the source states them;
5. normalize evidence quality without upgrading secondary reporting;
6. populate quantity only with explicit quantity type and confidence;
7. record last-verified dates only after an actual source review.

## 6. Acceptance criteria

- [x] Programme register is served through an API, not read by the browser from a JSON file.
- [x] Search and service filtering are available in the Programmes page.
- [x] API exposes status, stage-classification and evidence-quality filters.
- [x] Text-derived stage guesses are presented as needing verification.
- [x] Original dossier stage wording remains available for audit.
- [x] Source links and evidence metadata remain visible in programme detail.
- [ ] Reconcile the JSON/dossier record-count discrepancy and duplicate candidates.
- [ ] Normalize programme stages from dated source milestones.
- [x] Link existing dated timeline records to their matching programme-register entries where identity is explicit.
- [ ] Expand programme-specific milestone coverage with source-level evidence and explicit record mappings.
- [ ] Confirm quantities and acquisition status against primary sources.
- [ ] Add automated API/data-contract tests and end-to-end page coverage.

## 7. Explicit non-goals

- Do not invent classified or operationally sensitive details.
- Do not infer exact quantities, dates, approvals or delivery schedules from general reporting.
- Do not turn the register into a second inventory catalogue.
- Do not migrate this module to Next.js/Spring Boot before the current website feature is complete.
