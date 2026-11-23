# India & Indian Ocean Theatre Atlas — source register and display rules

**Research cut-off:** 23 November 2026  
**Branch:** `work/step-1-foundation`

## What this feature is

The Theatre Atlas is a user-facing, source-led geography page inspired by the useful interaction patterns in the Council on Foreign Relations Global Conflict Tracker:
- map-first exploration with a corresponding searchable list;
- filters / layers to narrow the displayed records;
- selectable map markers that open a concise profile;
- clear status labels and source links;
- a methodology note that explains what the map can and cannot establish.

CFR's tracker combines an interactive map, search and filters, conflict profiles, status assessments, background and latest developments. Its methodology explains that status labels are analyst assessments, that updates can be routine or event-driven, and that coverage is not exhaustive. Raksha Atlas adopts the information architecture, not CFR's conflict judgments or content. See [CFR Global Conflict Tracker](https://www.cfr.org/global-conflict-tracker), [dashboard](https://www.cfr.org/global-conflict-tracker/dashboard), and [methodology](https://www.cfr.org/global-conflict-tracker/methodology).

## Current implementation

- New navigation view: **Theatre Atlas**.
- New reusable view component: `src/components/TheatreAtlas.tsx`.
- Responsive layout and styles: `src/styles.css`.
- Search and category layers:
  - All locations
  - Indian commands
  - Indian infrastructure
  - Partner access & ports
- Selectable schematic map markers and a synchronized location list.
- Detail panel with source, status and caveat.
- Map positions are deliberately schematic and are not navigational coordinates.

## Geography and records included in the first pass

| Record | Classification | What the public evidence supports | What the UI must not imply |
|---|---|---|---|
| Andaman & Nicobar Command | Established tri-service command | Parliamentary defence committee material identifies it as a tri-service command | Do not imply that all proposed theatre commands already exist |
| Project Varsha / NAOB, Rambilli region | Naval infrastructure programme | Lok Sabha debate material identifies the project at Rambilli / Anakapalli district | Do not show installation layouts, precise coordinates or operational details |
| Port Blair | Joint logistics / command location | Parliamentary material identifies the Andaman & Nicobar Command and Joint Logistics Node context | Do not infer readiness, force strength or operational schedule |
| Duqm, Oman | Logistics access / defence cooperation | India–Oman defence cooperation and logistics arrangements | Do not call it an Indian sovereign overseas base |
| Agalega, Mauritius | Bilateral air/sea infrastructure cooperation | PIB lists the MoU for improvement of sea and air transportation facilities at Agalega | Do not label the facility an Indian-owned military base |
| Sabang, Indonesia | Maritime access / cooperation reporting | Publicly discussed port and maritime cooperation | Do not represent it as a permanently based Indian naval force |
| Port Victoria, Seychelles | Partner port / naval visits | PIB records IOS SAGAR's visit and EEZ cooperation context | A port call or EEZ mission is not a listening post or permanent base |
| Bagram, Afghanistan | External reference / exclusion | AFP Fact Check found no evidence of the claimed 2025 handover; reporting states it remained under Taliban control | Explicitly not an Indian overseas base |

### Sources

1. [Standing Committee on Defence, 2025–26](https://eparlib.sansad.in/bitstream/123456789/3019267/1/18_Defence_19.pdf) — status of theatre-command reforms and Andaman & Nicobar Command.
2. [Lok Sabha debate, 16 December 2022](https://sansad.nic.in/getFile/debatestextmk/17/X/16.12.2022.pdf?source=loksabhadocs) — public reference to INS Varsha / NAOB at Rambilli.
3. [Ministry of Defence Annual Report 2025–26](https://www.dodmod.gov.in/static/uploads/2026/09/a7246d934eda1e2d031293822d4a323f.pdf) — defence cooperation with foreign countries and logistics arrangements.
4. [Embassy of India, Muscat — India–Oman bilateral relations](https://www.indemb-oman.gov.in/page/india-and-oman-bilateral-relations/) — defence cooperation context.
5. [PIB — agreements with other countries](https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=1519147&lang=2&reg=3) — Agalega MoU reference.
6. [PIB — IOS SAGAR in Port Victoria, Seychelles, 2 May 2025](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2126198&lang=2&reg=48) — public port call and EEZ cooperation.
7. [AFP Fact Check — Bagram handover claim, 11 April 2025](https://factcheck.afp.com/doc.afp.com.39VY2ZP) — correction of unsupported handover claims.

## Theatre-command status: important distinction

The Standing Committee on Defence says theatre-command creation had made substantial progress, broad consensus existed, and important issues remained under discussion for finalisation. That does not establish that a Northern, Western or Maritime theatre command has been formally notified.

Therefore:
- Existing service commands and the Andaman & Nicobar Command belong in the **established command** layer.
- Northern / Western / Maritime theatre concepts belong in a separate **proposed / under consideration** layer only after each proposal is source-checked.
- Do not draw authoritative theatre boundaries or assign operational areas of responsibility from press reporting.
- Label any future regional overlays “illustrative proposal — not formally notified”.

## Overseas facilities, access and port taxonomy

Raksha Atlas must distinguish:
1. Indian sovereign military bases.
2. Bilateral infrastructure built or supported with partner countries.
3. Logistics support / reciprocal access arrangements.
4. Partner ports used for port calls, exercises or replenishment.
5. Maritime domain awareness / information-sharing partnerships.
6. Proposed, negotiated or unconfirmed arrangements.
7. External facilities that are not Indian facilities (e.g. Bagram).

A port call is not a base. An access agreement is not ownership. An infrastructure project is not automatically an Indian military installation. A listening post or intelligence collection site must not be inferred from port visits, maritime information-sharing agreements or unverified reporting.

## Safety and precision policy

The public map intentionally uses regional markers. It does not display:
- exact coordinates of sensitive military installations;
- listening-post or intelligence-collection locations;
- facility layouts, access points or security perimeters;
- force deployment, patrol patterns, readiness or vulnerabilities;
- inferred operational boundaries.

The purpose is public geography and defence-policy literacy, not operational targeting or facility tracking.

## Next data work

1. Add verified command headquarters and service command profiles from official sources.
2. Add proposed theatre concepts as a separate, explicitly unapproved layer.
3. Expand the Indian Ocean partner-access register only when the agreement's legal status and scope are source-supported.
4. Add date-stamped profile updates and source review dates.
5. Add a global conflict / maritime developments layer using sourced public news events, separate from static base and command geography.
