## Read this guide in simple terms

This document explains where the website's inventory and procurement information comes from and how it should be understood.

- **Inventory** means equipment and platforms that are in service or otherwise explicitly recorded as current holdings.
- **Procurement** means equipment that is being considered, requested, ordered or contracted for future delivery.
- **Source catalogue** means the original public pages and tables used to build the records.
- **Normalized catalogue** means those source rows arranged into a consistent format so the website can filter and display them.

The key rule is: do not mix current equipment with future orders, and do not turn a source estimate into an exact number. The sections below describe the actual files and current data rules.

# Inventory and procurement data

## What the website now reads

- `server/equipment-catalog.json` is the normalized, source-row catalogue for the Army equipment table, active military aircraft table, active Navy ships table, the Drones of India compilation, and a small set of official space-asset records.
- `server/future-procurement.json` is the curated programme pipeline. It separates signed contracts from AoN approvals, RFPs, aggregate pipeline statements, and reported schedule delays.
- `server/wikipedia-equipment.json` retains the source table snapshots, including the future Air Force, future Navy, Integrated Rocket Force and drone reference pages. Those future-page excerpts are shown in the separate reference-table explorer, not counted as active inventory.
- `server/sources.json` is the application source registry. Each normalized catalogue row also carries its own source URL, source ID, source freshness, source fields, and verification label.

The inventory and procurement explorers are available in the website's Inventory section. Search and filters operate on the source-derived rows. Each quantity keeps its source wording, including ranges and estimates. A parsed number is only provided when one unambiguous exact number is present.

## Quantities and totals

The catalogue contains records, not a reconciled grand total. It deliberately does not add a ship row to a class total, combine active platforms with orders, sum different services, or treat an estimate as exact. A blank or ambiguous source quantity stays blank. This avoids manufacturing a misleading total from sources with different scopes and update dates.

The official space row reports ISRO's end-2025 aggregate of 22 operational Government of India satellites in LEO and 31 in GEO. This includes government-wide civil and dual-use assets; it is not a Defence Space Agency or military-only count. The separate DSA record explicitly says a public service-specific total was not itemized in the sources reviewed.

The drone compilation is non-official and may mix operational, ordered, trial, prototype and development systems. Operator and quantity claims are preserved as the compiler states them. Do not treat those claims as government-verified force totals.

## Procurement stage definitions

- **Contract signed / contracted:** an official contract or inter-governmental agreement is publicly announced. Keep it outside active inventory until delivery and service acceptance.
- **AoN approved:** Acceptance of Necessity is an approval gate, not a contract, order quantity (unless explicitly stated), delivery, or induction.
- **RFP issued:** a request for proposals is open/issued; the programme is not thereby contracted.
- **Aggregate pipeline statement:** a government release states an aggregate number of future or under-construction platforms without publishing a complete itemized contract list. Do not add it to itemized programs where overlap is unclear.
- **Reported:** a secondary report, not a primary confirmation. The UI labels this separately.
- **Planned / in development:** retain the source's status and quantity wording; never upgrade it to an order without a primary source.

## Selected official records currently in the pipeline file

The curated pipeline includes Tejas Mk1A first and follow-on orders (83 and 97), 12 Su-30MKI, 31 tri-service MQ-9B RPAS, 34 ALH Dhruv Mk III for Army and Coast Guard, 26 Rafale Marine, 156 LCH Prachand, 307 ATAGS plus 327 tow vehicles, eight contracted Next Generation Corvettes, six Next Generation Missile Vessels, eleven Next Generation Offshore Patrol Vessels, GSAT-7C, Varunastra (unit count undisclosed), P-8I AoN (quantity omitted in cited release), MRFA / Rafale AoN (no official quantity assigned), AS-HAPS AoN, six P-75(I) submarines at RFP stage, Navy aggregate shipbuilding pipeline statements, and the October 2025 DAC modernization package. Project 18 destroyers, Project 17B frigates, Project 77 SSNs and the S4* fourth SSBN are also included as separately labelled secondary-source reports where no public itemized contract/commissioning release was used. Sources are linked on each row.

For Tejas Mk1A, the first order's 2021 PIB release stated a delivery schedule of the first three aircraft in year three and the full 83 over eight years. A September 2026 secondary report said no first-order Mk1A had yet been handed over. This is marked **reported**, not treated as a ministry delivery ledger. The 97-aircraft follow-on contract was officially signed on 25 September 2025; the PIB release said deliveries would commence in 2027–28 and complete over six years.

## Refresh and build

From the project directory:

```powershell
npm run sync:reference
npm run build
```

The refresh script fetches the public reference pages, retains the previous snapshot for any failed page, then rebuilds the normalized equipment catalogue. It does not automatically promote third-party claims to official news. The server's scheduled refresh runs the same public-reference refresh alongside PIB release-metadata ingestion at the configured 04:00 IST target.

## Source and attribution notes

Primary references used for official records:

- [ISRO: Indian Space Situational Assessment Report 2025](https://www.isro.gov.in/Indian_Space_Situational_Assessment_Report_2025.html)
- [PIB: Ministry of Defence Year End Review 2025](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2210154&lang=1&reg=6)
- [PIB: MQ-9B, Su-30MKI and ALH contracts (2024)](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2088180&lang=1&reg=6)
- [PIB: 97 LCA Mk1A contract (2025)](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2171108&lang=2&reg=3)
- [PIB: 26 Rafale Marine agreement (2025)](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2124851&lang=1&reg=1)
- [PIB: 2026 AoN package incl. P-8I, MRFA and AS-HAPS](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2227018&lang=2&reg=48)
- [PIB: eight Next Generation Corvettes contract (2 Nov 2026)](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2331418&lang=2&reg=48)
- [PIB: 11 NGOPVs and six Next Generation Missile Vessels contracts](https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=1912286&lang=2&reg=48)
- [PIB: GSAT-7C and Varunastra contracts (2026)](https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2323814&lang=1&reg=48)
- [PIB: P-75(I) RFP](https://www.pib.gov.in/pressreleaseiframepage.aspx?lang=2&prid=1737191&reg=48)

The full equipment source tables are attributed and linked on the site. Wikipedia-derived material is identified as secondary reference and the page includes a CC BY-SA attribution note. Review applicable source licenses and attribution before redistributing a repackaged dataset. The Drones of India compiler is separately identified as non-official.
