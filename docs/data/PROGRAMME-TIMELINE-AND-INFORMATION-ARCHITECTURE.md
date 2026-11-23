# Programme timeline and inventory information architecture

**Research cut-off:** 23 November 2026  
**Branch:** `work/step-1-foundation`

## Placement decisions

- Service ownership summaries belong in the Commands / service overview. The inventory page should expose compact, data-derived service filters rather than large repeated summary tiles.
- Platform records belong in Inventory and should preserve service operator, domain, category, class/subclass, variant, origin, quantities, lifecycle state and source provenance.
- Programme histories belong in Programmes. A selected programme opens a detail view with a persistent left-hand milestone rail and the research notes/evidence on the right.
- Procurement milestones remain distinct from in-service inventory. A proposal, EoI, AoN, RFP, development contract, prototype, first flight, production contract, delivery and induction are separate lifecycle events.

## Timeline record model

`server/timelines.json` remains the single timeline store and `GET /api/timelines` remains the shared read endpoint. Each programme chronology has a stable `id`, `programme`, `service`, confidence/status fields, and chronological `milestones`. `dossierRecordIds` connects one timeline to the corresponding structured programme record(s) in `server/programmes.json`.

The reusable React component `src/components/ProgrammeTimelinePanel.tsx` renders the same milestone rail for every programme. It does not duplicate per-programme JSX. Styling is limited to the modal's content layout and compact service filter; the global theme and colour system are unchanged.

## Milestone evidence rules

- Exact dated events use the date supported by the source.
- Year-only historical dates are displayed as a year, not as a false exact day.
- Target windows are labelled as targets.
- A future event without a reliable date displays “Date not announced”.
- Unreported stages are shown explicitly as unverified rather than silently omitted.
- Official government / parliamentary sources are marked official; news and specialist reporting are marked reported.
- No production, first-flight, engine-start, keel-laying, launch, sea-trial or induction milestone is inferred from a design target.

## Programmes included in this first chronology pass

### AMCA — Air Force programme

The chronology separates the reported programme start, parliamentary feasibility-study and technology-demonstrator context, 2024 development-phase approval, 2025 industry execution model, 2025–26 partner competition, and the first-flight target reported for September 2028. September 2028 is a target, not a completed event. November 2026 IDRW reporting described a possible schedule slip towards 2029 if partner appointment and contract award move later. Engine-on / ground-run and production entry dates are not publicly verified and remain unannounced.

Key evidence:
- [Lok Sabha reply on indigenous fighter jets, 4 April 2018](https://sansad.in/getFile/loksabhaquestions/annex/14/AU6004.pdf?source=pqals)
- [PIB — AMCA execution model approved, 27 May 2025](https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=2131528&lang=2&reg=48)
- [NDTV — Defence Secretary on AMCA partner selection and first-flight target, 28 September 2026](https://www.ndtv.com/india-news/ndtv-defence-summit-2026-hindustan-aeronautics-failed-bid-to-build-indias-stealth-jet-on-fairly-routine-technical-grounds-defence-secretary-rk-singh-12108545)
- [IDRW — AMCA first-flight schedule risk, 9 November 2026](https://idrw.org/amca-first-flight-2029-iaf-official/)

### Project 76 — Navy indigenous conventional submarine

Project 76 is treated as an indigenous conventional diesel-electric submarine programme. It is not Project 75 (Kalvari-class), Project 75(I), or Project 77 (nuclear-powered SSN). Public historical and future milestones are mostly secondary reporting. A possible design freeze around 2028–29 and funding clearance target around 2030 are reported expectations, not official approvals or contract dates. No public keel-laying, launch, trial or induction date is asserted.

Key evidence:
- [India Today — India's twin submarine programmes, 20 May 2026](https://www.indiatoday.in/india/story/india-navy-project-76-project-77-submarine-programme-maritime-power-2914064-2026-05-20)
- [IDRW — Project 76 design and clearance reporting, 3 November 2026](https://idrw.org/indian-navy-pushes-for-faster-clearance-of-project-76-submarines/)

### Project 77 — Navy indigenous nuclear-powered attack submarine

Project 77 is an SSN programme and is distinct from Arihant-class SSBNs. The timeline records the reported 2024 CCS approval for the first two boats, the Navy Chief's publicly stated 2036–37 outlook, and later reporting on design and construction planning. The 2036–37 date is an expectation, not a delivery guarantee. Keel laying, launch and sea-trial dates remain unannounced in public evidence.

Key evidence:
- [Reuters — approval for two nuclear-powered attack submarines, 10 October 2024](https://www.reuters.com/world/india/india-prepares-build-two-nuclear-powered-attack-submarines-2024-10-10/)
- [DRDO newspaper clipping reproducing Navy Chief's public remarks, December 2024](https://drdo.gov.in/drdo/sites/default/files/drdo-news/NPC03to04Dec2024.pdf)
- [India Today — Project 76 and Project 77, 20 May 2026](https://www.indiatoday.in/india/story/india-navy-project-76-project-77-submarine-programme-maritime-power-2914064-2026-05-20)

### Rafale — two service-specific acquisitions

Rafale is split into two records to prevent service and quantity conflation:
- IAF: 36 aircraft under the 2016 India-France IGA.
- Indian Navy: 26 Rafale Marine aircraft under the 28 April 2025 IGA (22 single-seat, four twin-seat), with government-reported delivery completion by 2030.

The original 126-aircraft MMRCA RFP is shown as procurement history, not as the final Rafale contract quantity. The later MRFA proposal is not added to either contracted fleet.

Key evidence:
- [Lok Sabha — 126-aircraft RFP and 36-aircraft IGA history](https://sansad.in/getFile/loksabhaquestions/annex/12/AS287.pdf?source=pqals)
- [PIB — 36 Rafale IGA, 23 September 2016](https://www.pib.gov.in/PressReleasePage.aspx?PRID=1513011&lang=2&reg=48)
- [PIB — 26 Rafale Marine IGA, 28 April 2025](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2124851&lang=1&reg=1)
- [PIB — Rafale Marine delivery completion target](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2210154&lang=13&reg=22)

## Code reuse and non-regression

- Shared timeline rendering lives in one component.
- Timeline records are data, not duplicated conditional JSX blocks.
- Existing inventory, search, programme cards, sources, pipeline, news and history features are retained.
- Inventory service counts are calculated from API records and displayed as compact selectable filters; they are not hardcoded force totals.
- No global theme tokens or theme behaviour are changed in this pass.

## Remaining review work

1. Reconcile every inventory record's operating service, platform domain, class and variant against its cited source.
2. Audit images for correct platform matching; do not reuse a generic ship or aircraft image as a class-specific image.
3. Verify all timeline records against primary evidence where available.
4. Add programme-specific timelines incrementally only after source-level chronology review.
