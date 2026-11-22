# Indian Armed Forces — Equipment, Fleet & Acquisition Catalogue

> **Snapshot date:** 23 November 2026  
> **Dataset:** `server/inventory.json` and `server/sources.json` on branch `work/step-1-foundation`  
> **Purpose:** Public-source reference catalogue for the Indian Army, Indian Navy and Indian Air Force, with joint and strategic categories retained where already represented.  
> **Important:** This is a structured open-source catalogue, not a government-certified order of battle, readiness return or complete official inventory. Quantities and statuses are only as reliable as their cited source and its publication date.

## 1. Executive coverage

The current structured dataset contains **362 records** and **144 Army**, **121 Navy**, **86 Air Force** records. It also retains **11 joint/strategic records** across Space, Cyber, Intelligence and Joint categories. The source register contains **99 source records** after this documentation update.

| Service / domain | Records |
|---|---:|
| Army | 144 |
| Navy | 121 |
| Air Force | 86 |
| Space | 1 |
| Cyber | 1 |
| Intelligence | 1 |
| Joint | 8 |
| **Total** | **362** |

### Record status distribution

Counts below are **record counts**, not equipment quantities. One programme can represent a multi-year order; one class can have several ships; one platform record may describe a whole fleet. Do not sum these record counts as force strength.

| Status in data | Records | Interpretation |
|---|---:|---|
| Active / in service (`in_service`) | 180 | Listed as currently in service by its cited source. |
| Pipeline / future programme (`pipeline`) | 76 | Future requirement/programme; approval and funding must be checked separately. |
| Ordered / contractually committed (`ordered`) | 57 | Procured/contracted but not necessarily delivered in full. |
| Planned requirement (`planned`) | 20 | Future requirement/programme; approval and funding must be checked separately. |
| AoN granted (`AoN`) | 6 | Acceptance of Necessity; not a contract or induction. |
| Contract signed (`contract_signed`) | 5 | Procured/contracted but not necessarily delivered in full. |
| Programme aggregate (`programme_total`) | 2 | Stage-specific; read the individual source and definition. |
| In production (`in_production`) | 2 | Stage-specific; read the individual source and definition. |
| Tender (`tender`) | 2 | Stage-specific; read the individual source and definition. |
| Under construction (`under_construction`) | 2 | Stage-specific; read the individual source and definition. |
| Phasing out (`phasing_out`) | 1 | Stage-specific; read the individual source and definition. |
| Leased (`leased`) | 1 | Stage-specific; read the individual source and definition. |
| Development (`development`) | 1 | Stage-specific; read the individual source and definition. |
| RFI (`RFI`) | 1 | Stage-specific; read the individual source and definition. |
| Trials (`trials`) | 1 | Stage-specific; read the individual source and definition. |
| Under development (`under_development`) | 1 | Stage-specific; read the individual source and definition. |
| Approved (`approved`) | 1 | Stage-specific; read the individual source and definition. |
| Design (`design`) | 1 | Stage-specific; read the individual source and definition. |
| Proposed (`proposed`) | 1 | Future requirement/programme; approval and funding must be checked separately. |
| Under production (`under_production`) | 1 | Stage-specific; read the individual source and definition. |

**Interpretation warning:** The status field records the source's claim about the record. It does not independently establish operational availability, serviceability, squadron strength, readiness, or whether all units are deployed. Quantities may refer to platforms, launchers, ships, systems, missiles, vehicles, kits or programme totals; always read the unit.

## 2. Counting and status methodology

### 2.1 Keep these quantities separate

- **Active / inducted quantity:** equipment explicitly reported as inducted, commissioned or in service.
- **Contracted / ordered quantity:** total quantity in a signed contract or order. It is not the active fleet.
- **Delivered quantity:** units physically delivered/accepted. A delivered unit may still require commissioning, conversion or operational clearance.
- **Outstanding quantity:** contracted total less confirmed deliveries only where both figures share the same programme scope and reporting date.
- **Under construction / production:** units being built or manufactured. Do not add these again to the contract total.
- **AoN quantity:** proposed quantity at the Acceptance of Necessity stage, if stated. AoN is an approval to proceed with acquisition, not a purchase order.
- **RFI / RFP / tender:** market-sounding or solicitation stages. They do not mean an order exists.
- **Planned / proposed:** aspirational or service requirement. Do not describe as approved procurement without an official approval source.
- **Programme total:** aggregate target or programme size; do not add to the individual batch/lot records it contains.

### 2.2 Acquisition stages (recommended canonical lifecycle)

`requirement_identified → AoN → RFI (if used) → RFP → technical/evaluation trials → commercial negotiation → CCS/competent authority approval (where applicable) → contract_signed → production/construction → delivery → acceptance/commissioning → in_service`

The process is not always strictly linear. Some procurement categories use different routes; record the actual milestone and date rather than forcing every programme into every stage. **AoN, CCS approval, contract signature, delivery and induction are different events.**

### 2.3 Confidence and source hierarchy

1. **Official primary source:** Ministry of Defence, PIB, service headquarters, DRDO, HAL, shipyards and parliamentary answers. Cite the exact release/report, not just the homepage.
2. **Official company / shipyard disclosure:** useful for build progress, delivery and contract milestones; distinguish company claims from MoD acceptance.
3. **Credible reporting:** use when primary information is unavailable; label it reported and retain the publication date.
4. **Wikipedia / community-edited pages:** useful for discovery and cross-checking, not final authority. Preserve attribution and CC BY-SA 4.0 requirements. Do not upgrade a Wikipedia-derived record to official without a primary source.

When sources conflict, preserve both claims in the notes, state the dates and scopes, and avoid silently choosing the larger number.

## 3. Official-source updates and notable programme milestones

The following official references were added to the source register for use in future record-level verification:

### 3.1 Defence Acquisition Council — 12 February 2026

PIB reported AoN proposals for:
- **Indian Air Force:** Multi Role Fighter Aircraft (MRFA/Rafale), combat missiles and Air-Ship Based High Altitude Pseudo Satellite (AS-HAPS).
- **Indian Army:** Vibhav anti-tank mines and overhaul of Armoured Recovery Vehicles, T-72 tanks and BMP-II platforms.
- **Indian Navy:** 4 MW marine gas-turbine electric power generators and P-8I long-range maritime reconnaissance aircraft.

These are **AoN-stage proposals**, not delivered equipment or signed contracts. Source: [PIB release, 12 February 2026](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2227018&lang=2&reg=3).

### 3.2 Defence Acquisition Council — 27 March 2026

PIB reported AoN for:
- **Army:** Air Defence Tracked System, armour-piercing tank ammunition, high-capacity radio relay, Dhanush gun system and Runway Independent Aerial Surveillance System.
- **Air Force:** Medium Transport Aircraft, S-400 long-range surface-to-air missile system, Remotely Piloted Strike Aircraft and Su-30 aero-engine aggregate overhaul.

These must remain at the AoN stage until a later RFP, contract or delivery source is recorded. Source: [PIB release, 27 March 2026](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2246125&lang=1&reg=3).

### 3.3 LCA Tejas Mk1A — 97-aircraft contract

MoD signed a contract with HAL on **25 September 2025** for **97 LCA Mk1A aircraft: 68 fighters and 29 twin-seaters**. PIB stated deliveries would commence in **2027–28** and complete over six years. The 97 contracted aircraft must not be counted as active IAF aircraft before delivery and induction. Source: [PIB contract release](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2171108&lang=2&reg=3).

### 3.4 Indian Navy shipbuilding

The official shipbuilding overview reported **51 large ships under construction in India**, valued at approximately ₹90,000 crore, at the time of that publication. This is an aggregate snapshot, not a separate class-level quantity to add to the ship records. Source: [PIB — Surface Fleet and Shipbuilding](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/dec/doc2025123716101.pdf).

PIB's naval platform update reports individual inductions and construction progress, including Project 17A, survey vessels, ASW shallow-water craft and Project 75 submarines. Use the ship-by-ship records and exact delivery dates; avoid treating a class's planned total as the number currently commissioned. Source: [PIB naval platform update](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2198298&lang=1&reg=3).

PIB confirmed **INS Dunagiri** was delivered to the Navy on **30 March 2026** under Project 17A. Source: [PIB release, 31 March 2026](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2247142&lang=1&reg=1).

PIB confirmed contracts on **2 November 2026** for **eight Next Generation Corvettes**: five to GRSE and three to GSL. This is a contracted construction programme, not eight active ships. Source: [PIB release, 2 November 2026](https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2331418&lang=1&reg=3).

### 3.5 Ministry of Defence Annual Report 2025–26

The Annual Report is an important primary reference for service-wise procurement, indigenisation and acquisition activity. It reports Army procurement and AoN aggregates, but those financial/programme aggregates must not be misrepresented as equipment quantities. Source: [MoD Annual Report 2025–26](https://www.dodmod.gov.in/static/uploads/2026/09/a7246d934eda1e2d031293822d4a323f.pdf).

## 4. Service-by-service catalogue — all current records

This appendix lists every current inventory record as it exists in `server/inventory.json`. It is a transparent index of the dataset, not a claim that every line has been independently verified. Where quantity is absent, the record does not establish a count. Where the source uses a programme total, it is labelled as such.


### 4.1 Army (141 records)

#### Acoustic gunshot detection

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Gun Shot Response System (GSRS) | Not stated | systems | Pipeline / future programme | Not stated | `gsrs-army-aon-oct26` |

#### Air defence missile

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| VSHORADS — additional procurement | Not stated | systems | Pipeline / future programme | Not stated | `vshorads-army-aon-oct26` |
| VSHORADS launchers and missiles — EP | Not stated | not disclosed | Ordered / contractually committed | Not stated | `vshorads-launchers-missiles-ep-2025` |

#### Air defence missile system

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Medium Range Surface-to-Air Missile (MRSAM) — Army | Not stated | not disclosed | Pipeline / future programme | Not stated | `mrsatm-army-aon` |
| Very Short Range Air Defence System (VSHORADS) — Army | Not stated | not disclosed | Pipeline / future programme | Not stated | `vshorads-army-aon` |

#### Air defence radar

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Air Defence Fire Control Radar | Not stated | not disclosed | Pipeline / future programme | Not stated | `ad-fire-control-radar-aon` |

#### Air surveillance radar

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Low Level Light Weight Radar | Not stated | not disclosed | Pipeline / future programme | Not stated | `low-level-radar-aon` |
| Low Level Lightweight Radars — EP | Not stated | not disclosed | Ordered / contractually committed | Not stated | `lllr-emergency-proc-army-2025` |

#### All-terrain vehicle

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Arctic Cat Alterra TBX 700 | Not stated | — | Active / in service | Not stated | `arctic-cat-alterra-tbx700` |
| BSV10 Sindhu | Not stated | — | Ordered / contractually committed | Not stated | `bsv10-sindhu` |
| JSW Kapidhwaj / ATOR N1200 | 96 | — | Active / in service | Not stated | `jsw-kapidhwaj` |
| Polaris MRZR | Not stated | — | Active / in service | Not stated | `polaris-mrzr-army` |
| Polaris Ranger | Not stated | — | Active / in service | Not stated | `polaris-ranger-army` |
| Polaris Sportsman 6×6 ATV | Not stated | — | Active / in service | Not stated | `polaris-sportsman-6x6` |

#### Anti-tank guided missile

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Man Portable Anti-Tank Guided Missile (MPATGM) | Not stated | not disclosed | Pipeline / future programme | Not stated | `mpatgm-aon` |
| Nag Mk II missiles for NAMIS Mk II | 2408 | missiles | AoN granted | Not stated | `nag-mk2-missile-aon-wiki` |

#### Anti-tank mine

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Vibhav anti-tank mines | Not stated | not disclosed | Pipeline / future programme | Not stated | `vibhav-mines-aon` |

#### Armoured ambulance

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| DRDO Armoured Ambulance | 275 | — | Active / in service | Not stated | `drdo-armoured-ambulance` |

#### Armoured personnel carrier

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| DRDO Prahaar 510 | Not stated | — | Active / in service | Not stated | `drdo-prahaar-510` |
| WhAP | 15 | — | Active / in service | Not stated | `whap-active-wiki` |
| WhAP — order | 9 | vehicles | Ordered / contractually committed | Not stated | `whap-order-wiki` |
| WhAP — planned | 105 | vehicles | Planned requirement | Not stated | `whap-planned-wiki` |
| Wheeled APC — RFI | 105 | vehicles | RFI | Not stated | `apc-wheeled-rfi-wiki` |

#### Armoured recovery vehicle overhaul

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Armoured Recovery Vehicle platform overhaul | Not stated | not disclosed | Pipeline / future programme | Not stated | `arv-overhaul-aon` |

#### Armoured vehicle protection

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Active Protection System for tanks | Not stated | not disclosed | Pipeline / future programme | Not stated | `tank-aps-aon` |

#### Bridging equipment

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Sarvatra Bridge System | Not stated | systems | Pipeline / future programme | Not stated | `sarvatra-bridge-aon-sep26` |

#### CBRN reconnaissance vehicle

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| CBRN Reconnaissance Vehicles | Not stated | systems | Pipeline / future programme | Not stated | `cbrn-recce-vehicle-aon-sep26` |
| NBC Reconnaissance Vehicle | 16 | — | Active / in service | Not stated | `nbc-reconnaissance-vehicle` |

#### Communications equipment

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| High Capacity Radio Relay | Not stated | systems | Pipeline / future programme | Not stated | `high-capacity-radio-relay-aon-mar26` |

#### Counter-UAS

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Platform Based Counter-UAS System | Not stated | systems | Pipeline / future programme | Not stated | `pb-cuas-army-aon-oct26` |

#### Counter-UAS / electronic warfare

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| AKASH TARANG anti-UAV electronic warfare system | Not stated | not disclosed | Pipeline / future programme | Not stated | `akash-tarang-aon` |

#### Counter-UAS system

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Integrated Drone Detection & Interdiction System Mk-II | Not stated | not disclosed | Pipeline / future programme | Not stated | `iddis-mk2-aon` |
| Integrated Drone Detection and Interdiction Systems — EP | Not stated | not disclosed | Ordered / contractually committed | Not stated | `iddis-emergency-proc-army-2025` |

#### Electronic intelligence system

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Ground Based Mobile ELINT System | Not stated | systems | Pipeline / future programme | Not stated | `gbmes-aon-oct25` |

#### Guided rocket ammunition

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Long Range Guided Rocket Ammunition for Pinaka MRLS | Not stated | not disclosed | Pipeline / future programme | Not stated | `pinaka-guided-rocket-aon` |

#### Infantry fighting vehicle overhaul

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| BMP-II infantry combat vehicle platform overhaul | Not stated | not disclosed | Pipeline / future programme | Not stated | `bmp2-overhaul-aon` |

#### Infantry fighting vehicle upgrade

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| BMP-2 / BMP-2K to BMP-2M upgrade programme | 693 | vehicles | Contract signed | Not stated | `bmp2m-upgrade-wiki` |
| BMP-2 to BMP-2M upgrade programme | 693 | — | Ordered / contractually committed | Armoured Vehicles Nigam Limited | `bmp2m-upgrade` |
| BMP-2M additional order | 156 | vehicles | Ordered / contractually committed | Not stated | `bmp2m-additional-order-wiki` |

#### Infantry mobility vehicle

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Mahindra Straton Plus | Not stated | — | Active / in service | Not stated | `mahindra-straton-plus` |
| Tata Quick Reaction Fighting Vehicle | 36 | — | Active / in service | Not stated | `tata-qrfv` |

#### Integrated surveillance and strike

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Integrated Surveillance and Strike System | Not stated | systems | Pipeline / future programme | Not stated | `isss-army-aon-oct26` |

#### Light combat helicopter

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| HAL LCH Prachand — Army contract | 90 | helicopters | Ordered / contractually committed | Not stated | `lch-prachand-army-contract-2025` |

#### Light tank

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Zorawar | 59 | — | Ordered / contractually committed | Not stated | `zorawar-light-tank` |
| Zorawar — additional planned quantity | 295 | tanks | Planned requirement | Not stated | `zorawar-planned-wiki` |

#### Light utility helicopter

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Light Multi Role Helicopters (LMRH) | Not stated | systems | Pipeline / future programme | Not stated | `lmhr-army-aon-oct26` |

#### Light utility vehicle

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Force Gurkha 4×4 | Not stated | — | Active / in service | Not stated | `force-gurkha-army` |
| Mahindra 550 | Not stated | — | Active / in service | Not stated | `mahindra-550-army` |
| Mahindra Scorpio | 3300 | — | Active / in service | Not stated | `mahindra-scorpio-army` |
| Maruti Suzuki Gypsy | 35000 | — | Active / in service | Not stated | `maruti-gypsy-army` |
| Tata Safari Storme | 1300 | — | Active / in service | Not stated | `tata-safari-storme-army` |
| Tata Sumo | Not stated | — | Active / in service | Not stated | `tata-sumo-army` |
| Tata Xenon | Not stated | — | Active / in service | Not stated | `tata-xenon-army` |
| Toyota Fortuner | Not stated | — | Active / in service | Not stated | `toyota-fortuner-army` |
| Toyota Hilux | Not stated | — | Active / in service | Not stated | `toyota-hilux-army` |

#### Logistics vehicle

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| High Mobility Vehicles — Army | Not stated | systems | Pipeline / future programme | Not stated | `hmv-army-aon-sep26` |
| High Mobility Vehicles (HMV) — additional procurement | Not stated | systems | Pipeline / future programme | Not stated | `hmv-army-aon-oct26` |
| High Mobility Vehicles with Material Handling Crane | Not stated | systems | Pipeline / future programme | Not stated | `hmv-mhc-aon-oct25` |

#### Loitering munition

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Loiter Munition System for Artillery Regiments | Not stated | not disclosed | Pipeline / future programme | Not stated | `loiter-munition-aon` |
| Loitering Munitions including VTOL systems — EP | Not stated | not disclosed | Ordered / contractually committed | Not stated | `loitering-munitions-ep-army-2025` |
| Long Range Kamikaze Drone System | Not stated | systems | Pipeline / future programme | Not stated | `long-range-kamikaze-army-aon-oct26` |
| NIBE Vayu Astra-1 | 30 | systems | Ordered / contractually committed | Not stated | `vayu-astra-loitering-wiki` |
| SkyStriker | 100 | — | Active / in service | Not stated | `skystriker-loitering-wiki` |
| TASL ALS Mk-II | 54 | systems | Ordered / contractually committed | Not stated | `als-mk2-loitering-wiki` |

#### Main battle tank

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Arjun Mk 1A | 2 | tanks | Active / in service | Not stated | `arjun-mk1a-active-wiki` |
| Arjun Mk 1A — order | 118 | tanks | Ordered / contractually committed | Not stated | `arjun-mk1a-order-wiki` |
| T-72M1 Ajeya / upgraded variants | 2418 | — | Active / in service | Not stated | `t72-ajeya-wiki` |
| T-90 Bhishma Mk III — order | 464 | tanks | Ordered / contractually committed | Not stated | `t90mk3-order-wiki` |
| T-90S Bhishma | 1300 | — | Active / in service | Not stated | `t90s-bhishma-wiki` |

#### Main battle tank development

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Future Main Battle Tank (FMBT) | Not stated | not stated | Development | Not stated | `fmbt-wiki` |

#### Main battle tank programme

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Future Ready Combat Vehicle (FRCV) | Not stated | not disclosed | Pipeline / future programme | Not stated | `frcv-aon` |
| Future Ready Combat Vehicle / Project Ranjit | 1770 | tanks | Planned requirement | Not stated | `frcv-ranjit-wiki` |

#### Military light utility vehicle

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Mahindra Armado / ALSV | 1300 | — | Active / in service | Not stated | `mahindra-armado` |
| Mahindra Marksman | Not stated | — | Active / in service | Not stated | `mahindra-marksman` |
| Mahindra Rakshak | 1000 | — | Phasing out | Not stated | `mahindra-rakshak` |
| Renault Sherpa | 14 | — | Active / in service | Not stated | `renault-sherpa-army` |

#### Mine-clearing vehicle

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Trawl Tanks | Not stated | systems | Pipeline / future programme | Not stated | `trawl-tank-aon-sep26` |

#### Mine-laying vehicle

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Self-Propelled Mechanical Mine Layers | Not stated | systems | Pipeline / future programme | Not stated | `mml-army-aon-sep26` |

#### Mine-resistant protected vehicle

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Casspir | 200 | — | Active / in service | Not stated | `casspir-army` |
| OFB Aditya | 1600 | — | Active / in service | Not stated | `ofb-aditya` |

#### Minibus

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Ashok Leyland Short Chassis 4×2 | 500 | — | Ordered / contractually committed | Not stated | `ashok-leyland-short-chassis` |

#### Mortar carrier

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Carrier Mortar Tracked | 220 | — | Active / in service | Not stated | `carrier-mortar-tracked` |
| Mahindra Airawat | 50 | — | Active / in service | Not stated | `mahindra-airawat` |

#### Motorcycle

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Royal Enfield Bullet | Not stated | — | Active / in service | Not stated | `royal-enfield-bullet-army` |

#### Multiple rocket launcher

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Pinaka Multi-Barrel Rocket Launcher | Not stated | — | Active / in service | DRDO; Indian production partners | `pinaka-mbrl-army` |

#### Personal protective equipment

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Ballistic Helmets — EP | Not stated | not disclosed | Ordered / contractually committed | Not stated | `ballistic-helmets-ep-army-2025` |
| Bullet Proof Jackets — EP | Not stated | not disclosed | Ordered / contractually committed | Not stated | `bpj-ep-army-2025` |

#### Pickup truck

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Mahindra Scorpio Pik-up | 1986 | — | Ordered / contractually committed | Not stated | `mahindra-scorpio-pickup-army` |

#### Protected mobility vehicle

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Quick Reaction Fighting Vehicles — Heavy and Medium — EP | Not stated | not disclosed | Ordered / contractually committed | Not stated | `qrfv-ep-army-2025` |

#### Rocket artillery

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Agnibaan / BM-21 Grad upgraded | 150 | — | Active / in service | Not stated | `agnibaan-mlrs-wiki` |
| Pinaka MBRL | 126 | — | Active / in service | Not stated | `pinaka-mbrl-wiki` |
| Pinaka MBRL — additional regiments | 3 | regiments | Ordered / contractually committed | Not stated | `pinaka-regiments-planned-wiki` |
| Smerch 9K58 MBRL | 42 | — | Active / in service | Not stated | `smerch-mbrl-wiki` |
| Suryastra | 2 | launchers | Trials | Not stated | `suryastra-mlrs-wiki` |

#### Self-propelled artillery
| K9 Vajra-T — 2024 contract record | Not stated | not disclosed | Contract signed | Larsen & Toubro | `k9-vajra-2024-contract-official` |

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| K9 Vajra-T | 100 | — | Active / in service | Not stated | `k9-vajra-public-record` |
| K9 Vajra-T — additional order | 100 | guns | Ordered / contractually committed | Not stated | `k9-vajra-additional-wiki` |
| K9 Vajra-T — additional planned | 100 | guns | Planned requirement | Not stated | `k9-vajra-future-wiki` |
| Self-Propelled Tracked Gun System | Not stated | systems | Pipeline / future programme | Not stated | `spts-army-aon-oct26` |

#### Staff transport

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Mitsubishi Pajero | Not stated | — | Active / in service | Not stated | `mitsubishi-pajero-army` |

#### Surface-to-surface missile

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| BrahMos Land-Attack System | Not stated | — | Active / in service | BrahMos Aerospace | `brahmos-army` |

#### Tank

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Arjun Main Battle Tank | Not stated | — | Active / in service | Defence Research and Development Organisation / Heavy Vehicles Factory | `arjun-mk1a-army` |
| T-72 Ajeya | Not stated | — | Active / in service | Not stated | `t-72-ajeya` |
| T-90 Bhishma | Not stated | — | Active / in service | Not stated | `t-90-bhishma` |

#### Tank ammunition

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Armour Piercing Tank Ammunition | Not stated | systems | Pipeline / future programme | Not stated | `armour-piercing-tank-ammunition-aon-mar26` |

#### Tank destroyer

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| NAMICA | 13 | — | Ordered / contractually committed | Not stated | `namica-tank-destroyer` |

#### Tank overhaul

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| T-72 tank platform overhaul | Not stated | not disclosed | Pipeline / future programme | Not stated | `t72-overhaul-aon` |

#### Tank powerpack

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| 1350 HP engine for T-90 tanks | Not stated | not disclosed | Pipeline / future programme | Not stated | `t90-1350hp-aon` |

#### Towed artillery

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Advanced Towed Artillery Gun System (ATAGS) | 307 | — | Ordered / contractually committed | DRDO; Bharat Forge; Tata Advanced Systems | `atags-army` |
| ATAGS — planned requirement | 307 | — | Planned requirement | Not stated | `atags-planned-wiki` |
| Dhanush 155 mm | Not stated | — | Active / in service | Not stated | `dhanush-towed-artillery` |
| Dhanush 155 mm howitzer | 114 | guns | Ordered / contractually committed | Not stated | `dhanush-howitzer-wiki` |
| Dhanush Gun System | Not stated | systems | Pipeline / future programme | Not stated | `dhanush-gun-aon-mar26` |
| M777 ultra-light howitzer | 145 | — | Ordered / contractually committed | Not stated | `m777-ultralight-howitzer` |

#### Tracked air defence system

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Air Defence Tracked System | Not stated | systems | Pipeline / future programme | Not stated | `air-defence-tracked-system-aon-mar26` |

#### Tracked anti-tank missile carrier

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| NAMIS (Tracked) / NAMICA | 13 | carriers | Contract signed | Not stated | `namis-tr-contract-wiki` |

#### Tracked anti-tank missile system

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Nag Missile System (Tracked) Mk-II (NAMIS) | Not stated | systems | Pipeline / future programme | Not stated | `namis-mk2-aon-oct25` |
| NAMIS (Tracked) Mk II | 107 | carriers | AoN granted | Not stated | `namica-mk2-aon-wiki` |

#### Tracked IFV

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| BMP-2 Sarath | Not stated | — | Active / in service | Not stated | `bmp-2-sarath` |

#### Tracked infantry fighting vehicle

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Future Infantry Combat Vehicle (FICV) | 1750 | vehicles | Planned requirement | Not stated | `ficv-wiki` |

#### Ultra-light howitzer

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| M777 | 145 | — | Active / in service | Not stated | `m777-active-wiki` |

#### Uncrewed aerial system

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Jet-based kamikaze drone system | Not stated | not disclosed | Pipeline / future programme | Not stated | `jet-kamikaze-aon` |
| Remotely Piloted Aerial Vehicles — EP | Not stated | not disclosed | Ordered / contractually committed | Not stated | `rpav-emergency-proc-army-2025` |
| Runway Independent Aerial Surveillance System | Not stated | systems | Pipeline / future programme | Not stated | `runway-independent-aerial-surveillance-aon-mar26` |
| Surveillance UAV | Not stated | systems | Pipeline / future programme | Not stated | `surveillance-uav-army-aon-oct26` |
| Unmanned Aerial System Brick — Long Range | Not stated | systems | Pipeline / future programme | Not stated | `uas-brick-lr-army-aon-oct26` |
| Various categories of drones — EP | Not stated | not disclosed | Ordered / contractually committed | Not stated | `army-drones-ep-2025` |

#### Unmanned ground vehicle

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| All Terrain Tactical Haulers | 300 | — | Active / in service | Not stated | `att-hauler-ugv-wiki` |
| DRDO Daksh | 250 | — | Active / in service | Not stated | `drdo-daksh-ugv-wiki` |
| Krushna | Not stated | — | Active / in service | Not stated | `krushna-ugv-wiki` |
| THeMIS | Not stated | — | Active / in service | Not stated | `themis-ugv-wiki` |
| Vision-60 robotic MULE | 100 | — | Active / in service | Not stated | `vision60-ugv-wiki` |

#### Utility helicopter

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Advanced Light Helicopters — Army | Not stated | systems | Pipeline / future programme | Not stated | `alh-army-aon-sep26` |
| ALH Dhruv Mk III — Army | 25 | helicopters | Ordered / contractually committed | Not stated | `alh-dhruv-army-contract-2024` |
| HAL Advanced Light Helicopter Dhruv Mk III | 25 | — | Ordered / contractually committed | Hindustan Aeronautics Limited | `alh-dhruv-army` |

#### Weapon sight

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Night Sights for Rifles — EP | Not stated | not disclosed | Ordered / contractually committed | Not stated | `rifle-night-sights-ep-army-2025` |

#### Wheeled armoured vehicle

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Stryker / wheeled mechanised infantry battalion requirement | 530 | vehicles | Planned requirement | Not stated | `stryker-army-rfi-wiki` |

#### Wheeled IFV

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Tata Kestrel | Not stated | — | Planned requirement | Not stated | `tata-kestrel` |

#### Wheeled infantry fighting vehicle

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Stryker — proposed Indian Army acquisition | 530 | vehicles | Planned requirement | Not stated | `stryker-wiki` |
| Tata Kestrel | 15 | — | Active / in service | Not stated | `tata-kestrel-active-wiki` |
| Tata Kestrel — additional planned | 105 | vehicles | Planned requirement | Not stated | `tata-kestrel-planned-wiki` |
| Tata Kestrel — order | 9 | vehicles | Ordered / contractually committed | Not stated | `tata-kestrel-order-wiki` |


### 4.2 Navy (117 records)

#### Aircraft carrier

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| INS Vikramaditya | 1 | — | Active / in service | Not stated | `ins-vikramaditya` |
| INS Vikrant | 1 | — | Active / in service | Not stated | `ins-vikrant` |

#### Amphibious assault ship

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Landing Platform Docks (LPD) | Not stated | systems | Pipeline / future programme | Not stated | `lpd-navy-aon-oct25` |

#### Amphibious transport dock

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| INS Jalashwa | Not stated | — | Active / in service | Not stated | `ins-jalashwa` |

#### Anti-ship missile

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| BrahMos | Not stated | — | Active / in service | Not stated | `brahmos-naval-system` |

#### Anti-submarine warfare craft

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| INS Agray | 2026 | — | Active / in service | Garden Reach Shipbuilders & Engineers | `ins-agray` |
| INS Androth | 2025 | — | Active / in service | Garden Reach Shipbuilders & Engineers | `ins-androth` |
| INS Arnala | 2025 | — | Active / in service | Garden Reach Shipbuilders & Engineers | `ins-arnala` |
| INS Mahe | 2025 | — | Active / in service | Cochin Shipyard Limited | `ins-mahe` |

#### Attack submarine

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| INS Kalvari | Not stated | — | Active / in service | Not stated | `ins-kalvari` |
| INS Karanj | Not stated | — | Active / in service | Not stated | `ins-karanj` |
| INS Khanderi | Not stated | — | Active / in service | Not stated | `ins-khanderi` |
| INS Shalki | Not stated | — | Active / in service | Not stated | `ins-shalki` |
| INS Shankul | Not stated | — | Active / in service | Not stated | `ins-shankul` |
| INS Shankush | Not stated | — | Active / in service | Not stated | `ins-shankush` |
| INS Shishumar | Not stated | — | Active / in service | Not stated | `ins-shishumar` |
| INS Sindhukesari | Not stated | — | Active / in service | Not stated | `ins-sindhukesari` |
| INS Sindhukirti | Not stated | — | Active / in service | Not stated | `ins-sindhukirti` |
| INS Sindhuraj | Not stated | — | Active / in service | Not stated | `ins-sindhuraj` |
| INS Sindhurashtra | Not stated | — | Active / in service | Not stated | `ins-sindhurashtra` |
| INS Sindhuratna | Not stated | — | Active / in service | Not stated | `ins-sindhuratna` |
| INS Sindhuvijay | Not stated | — | Active / in service | Not stated | `ins-sindhuvijay` |
| INS Vagir | Not stated | — | Active / in service | Not stated | `ins-vagir` |
| INS Vagsheer | Not stated | — | Active / in service | Not stated | `ins-vagsheer` |
| INS Vela | Not stated | — | Active / in service | Not stated | `ins-vela` |

#### Autonomous underwater vehicle

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Submersible Autonomous Vessel | Not stated | systems | Pipeline / future programme | Not stated | `submersible-autonomous-vessel-aon-jul25` |

#### Ballistic missile submarine

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| INS Aridhaman | Not stated | — | Active / in service | Not stated | `ins-aridhaman` |
| INS Arighaat | Not stated | — | Active / in service | Not stated | `ins-arighaat` |
| INS Arihant | Not stated | — | Active / in service | Not stated | `ins-arihan` |

#### Communications equipment

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| High Frequency Software Defined Radio Manpack | Not stated | not disclosed | Pipeline / future programme | Not stated | `hf-sdr-manpack-aon` |

#### Corvette
| Next Generation Corvettes — 2026 contract | 8 | ships | Contract signed | GRSE (5) / GSL (3) | `next-generation-corvettes-8-contract-2026` |

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Kamorta class | 4 | — | Active / in service | Not stated | `kamorta-corvette-class` |

#### Destroyer

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| INS Chennai | Not stated | — | Active / in service | Not stated | `ins-chennai` |
| INS Delhi | Not stated | — | Active / in service | Not stated | `ins-delhi` |
| INS Imphal | 2023 | — | Active / in service | Mazagon Dock Shipbuilders Limited | `ins-imphal` |
| INS Kochi | Not stated | — | Active / in service | Not stated | `ins-kochi` |
| INS Kolkata | Not stated | — | Active / in service | Not stated | `ins-kolkata` |
| INS Mormugao | 2022 | — | Active / in service | Mazagon Dock Shipbuilders Limited | `ins-mormugao` |
| INS Mumbai | Not stated | — | Active / in service | Not stated | `ins-mumbai` |
| INS Mysore | Not stated | — | Active / in service | Not stated | `ins-mysore` |
| INS Rana | Not stated | — | Active / in service | Not stated | `ins-rana` |
| INS Ranvijay | Not stated | — | Active / in service | Not stated | `ins-ranvijay` |
| INS Ranvir | Not stated | — | Active / in service | Not stated | `ins-ranvir` |
| INS Surat | 2025 | — | Active / in service | Mazagon Dock Shipbuilders Limited | `ins-surat` |
| INS Visakhapatnam | Not stated | — | Active / in service | Not stated | `ins-visakhapatnam` |
| Kolkata class | 3 | — | Active / in service | Not stated | `kolkata-destroyer-class` |
| Visakhapatnam class (Project 15B) | 4 | — | Active / in service | Mazagon Dock Shipbuilders Limited | `visakhapatnam-destroyer-class` |

#### Diesel-electric attack submarine

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Kalvari-class Batch II | 3 | platforms | Proposed | Not stated | `kalvari-batch2-3-wiki` |
| Project 75I submarines | 6 | platforms | Approved | Not stated | `p75i-6-wiki` |
| Project 76 submarines | 12 | platforms | Planned requirement | Not stated | `project76-12-wiki` |

#### Diving support vessel

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| INS Nistar | 2025 | — | Active / in service | Hindustan Shipyard Limited | `ins-nistar` |

#### Fast attack craft

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Water Jet Fast Attack Craft | Not stated | systems | Pipeline / future programme | Not stated | `waterjet-fast-attack-craft-aon-dec24` |

#### Fleet replenishment ship

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Surya-class fleet replenishment ships | 5 | platforms | Under construction | Not stated | `surya-replenishment-5-wiki` |

#### Frigate
| INS Vindhyagiri | Not stated | — | Under construction | Garden Reach Shipbuilders & Engineers | `ins-vindhyagiri-p17a` |

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| INS Dunagiri | 2026 | — | Active / in service | Garden Reach Shipbuilders & Engineers | `ins-dunagiri` |
| INS Himgiri | 2025 | — | Active / in service | Garden Reach Shipbuilders & Engineers | `ins-himgiri` |
| INS Mahendragiri | Not stated | — | Active / in service | Not stated | `ins-mahendragiri` |
| INS Nilgiri | Not stated | — | Active / in service | Not stated | `ins-nilgiri` |
| INS Sahyadri | Not stated | — | Active / in service | Not stated | `ins-sahyadri` |
| INS Satpura | Not stated | — | Active / in service | Not stated | `ins-satpura` |
| INS Tabar | Not stated | — | Active / in service | Not stated | `ins-tabar` |
| INS Talwar | Not stated | — | Active / in service | Not stated | `ins-talwar` |
| INS Tamal | Not stated | — | Active / in service | Not stated | `ins-tamal` |
| INS Taragiri | Not stated | — | Active / in service | Not stated | `ins-taragiri` |
| INS Tarkash | Not stated | — | Active / in service | Not stated | `ins-tarkash` |
| INS Teg | Not stated | — | Active / in service | Not stated | `ins-teg` |
| INS Trikand | Not stated | — | Active / in service | Not stated | `ins-trikand` |
| INS Trishul | Not stated | — | Active / in service | Not stated | `ins-trishul` |
| INS Tushil | Not stated | — | Active / in service | Not stated | `ins-tushil` |
| INS Udaygiri | 2025 | — | Active / in service | Mazagon Dock Shipbuilders Limited | `ins-udaygiri` |
| Nilgiri class (Project 17A) | 7 | — | Programme aggregate | Mazagon Dock Shipbuilders Limited / Garden Reach Shipbuilders & Engineers | `nilgiri-frigate-class` |
| Shivalik class | 3 | — | Active / in service | Not stated | `shivalik-frigate-class` |

#### Harbour tug

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Bollard Pull Tugs | Not stated | not disclosed | Pipeline / future programme | Not stated | `bollard-pull-tugs-aon` |

#### Heavyweight torpedo

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Additional Varunastra combat torpedoes | Not stated | not disclosed | Pipeline / future programme | Not stated | `varunastra-aon-2025` |
| Varunastra Heavy Weight Torpedoes — 2026 contract | Not stated | not disclosed | Ordered / contractually committed | Not stated | `varunastra-hwt-contract-oct26` |

#### Heritage vessel

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| INSV Kaundinya | Not stated | — | Active / in service | Not stated | `insv-kaundinya` |

#### Interceptor craft

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Fast Interceptor Craft | Not stated | systems | Pipeline / future programme | Not stated | `fast-interceptor-craft-aon-dec24` |

#### Landing craft utility

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| INS LCU 51 | Not stated | — | Active / in service | Not stated | `ins-lcu51` |
| INS LCU 52 | Not stated | — | Active / in service | Not stated | `ins-lcu52` |
| INS LCU 53 | Not stated | — | Active / in service | Not stated | `ins-lcu53` |
| INS LCU 54 | Not stated | — | Active / in service | Not stated | `ins-lcu54` |
| INS LCU 55 | Not stated | — | Active / in service | Not stated | `ins-lcu55` |
| INS LCU 56 | Not stated | — | Active / in service | Not stated | `ins-lcu56` |
| INS LCU 57 | Not stated | — | Active / in service | Not stated | `ins-lcu57` |
| INS LCU 58 | Not stated | — | Active / in service | Not stated | `ins-lcu58` |

#### Landing ship tank

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| INS Airavat | Not stated | — | Active / in service | Not stated | `ins-airavat` |
| INS Gharial | Not stated | — | Active / in service | Not stated | `ins-gharial` |
| INS Kesari | Not stated | — | Active / in service | Not stated | `ins-kesari` |
| INS Shardul | Not stated | — | Active / in service | Not stated | `ins-shardul` |

#### Lightweight anti-submarine torpedo

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Advanced Lightweight Torpedo (ALWT) | Not stated | systems | Pipeline / future programme | Not stated | `alwt-navy-aon-oct25` |

#### Marine power generation

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| 04 MW marine gas-turbine-based electric power generator | Not stated | not disclosed | Pipeline / future programme | Not stated | `naval-4mw-generator-aon` |

#### Maritime patrol aircraft

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Boeing P-8I Neptune | Not stated | — | Active / in service | Boeing | `p8i-navy` |
| Dornier aircraft mid-life upgrade | 25 | aircraft | Ordered / contractually committed | Not stated | `dornier-mlu-navy-contract-2024` |
| P-8I Long Range Maritime Reconnaissance Aircraft — additional procurement | Not stated | not disclosed | Pipeline / future programme | Not stated | `p8i-additional-aon` |

#### Midget submarine / diver delivery vehicle

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Swimmer Delivery Vehicles | 10 | platforms | Planned requirement | Not stated | `sdv-10-wiki` |

#### Mine countermeasure vessel

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Mine Counter Measure Vessels (MCMV) | Not stated | systems | Pipeline / future programme | Not stated | `mcmv-navy-aon-jul25` |

#### Missile fire-control system

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| BrahMos Fire Control System | Not stated | systems | Pipeline / future programme | Not stated | `brahmos-fire-control-navy-aon-aug25` |

#### Multi-purpose vessel

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| INS Samarthak | 2026 | — | Active / in service | Larsen & Toubro Shipyard | `ins-samarthak` |

#### Naval gun

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| 30 mm Naval Surface Gun | Not stated | systems | Pipeline / future programme | Not stated | `naval-30mm-gun-aon-oct25` |
| Super Rapid Gun Mount | Not stated | systems | Pipeline / future programme | Not stated | `srgm-navy-aon-jul25` |

#### Naval helicopter

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| MH-60R Seahawk | 24 | — | Ordered / contractually committed | Not stated | `mh-60r-seahawk` |

#### Naval mine

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Moored Mines | Not stated | systems | Pipeline / future programme | Not stated | `moored-mines-navy-aon-jul25` |
| Multi Influence Ground Mine (MIGM) | Not stated | not disclosed | Pipeline / future programme | Not stated | `mig-mine-aon` |

#### Nuclear ballistic missile submarine

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| S5-class SSBN | 4 | platforms | Planned requirement | Not stated | `s5-4-wiki` |

#### Nuclear-powered attack submarine

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| INS Chakra III lease | 1 | platforms | Planned requirement | Not stated | `chakra3-lease-wiki` |
| Project 77 nuclear attack submarines | 6 | platforms | Design | Not stated | `project77-6-wiki` |

#### Patrol vessel programme

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Next Generation Fast Patrol / Offshore Patrol Vessel | Not stated | not disclosed | Pipeline / future programme | Not stated | `ngfpv-opv-aon` |

#### Shallow water vessel

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| ASW Shallow Water Craft | 16 | — | Ordered / contractually committed | Not stated | `anti-submarine-shallow-water-craft` |

#### Shipborne air defence upgrade

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| BARAK-1 upgrade | Not stated | systems | Pipeline / future programme | Not stated | `barak1-upgrade-navy-aon-aug25` |

#### Submarine

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Project 75 / Kalvari class | 6 | — | Programme aggregate | Not stated | `project-75-kalvari` |

#### Submarine heavyweight torpedo

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Heavy Weight Torpedoes for Kalvari-class submarines | 48 | torpedoes | Ordered / contractually committed | Not stated | `kalvari-hwt-contract-2025` |

#### Survey vessel

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| INS Ikshak | 2025 | — | Active / in service | Garden Reach Shipbuilders & Engineers | `ins-ikshak` |
| INS Sanshodhak | 2026 | — | Active / in service | Garden Reach Shipbuilders & Engineers | `ins-sanshodhak` |
| Next Generation Survey Vessels | 6 | platforms | Tender | Not stated | `ngsv-6-wiki` |

#### Test infrastructure

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Land Based Testing Facility for electric propulsion | Not stated | not disclosed | Pipeline / future programme | Not stated | `naval-electric-propulsion-test-facility-aon` |

#### Uncrewed aerial system

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| High Altitude Long Endurance RPAS — lease | Not stated | not disclosed | Pipeline / future programme | Not stated | `hale-rpas-lease-aon` |
| Naval Shipborne Unmanned Aerial System (NSUAS) | Not stated | not disclosed | Pipeline / future programme | Not stated | `naval-shipborne-uas-aon` |

#### Uncrewed surface vessel

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Compact Autonomous Surface Craft | Not stated | systems | Pipeline / future programme | Not stated | `compact-autonomous-surface-craft-aon-aug25` |

#### Unmanned surface vessel

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Matangi unmanned surface vessels | 12 | platforms | Under production | Not stated | `matangi-usv-12-wiki` |


### 4.3 Air Force (84 records)

#### Aerial refuelling

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Boeing KC-135R | 1 | — | Leased | Not stated | `kc135r-tanker` |

#### Aerial refuelling aircraft

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Boeing 767 KC-767 MRTT | 6 | aircraft | Planned requirement | Not stated | `kc767-6-iaf-wiki` |
| Purpose-built mid-air refuellers | 6 | aircraft | Planned requirement | Not stated | `purpose-built-tanker-6-iaf-wiki` |

#### AEW&C / AWACS

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Netra AEW&C | 2 | — | Active / in service | Not stated | `netra-aewc` |
| Phalcon AWACS | 3 | — | Active / in service | Not stated | `phalcon-awacs` |

#### AEW&C aircraft

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Airborne Early Warning & Control aircraft systems | Not stated | not disclosed | Pipeline / future programme | Not stated | `aewc-aon-2025` |
| Beriev A-50EI | 3 | — | Active / in service | Not stated | `beriev-a50ei-iaf` |
| Embraer EMB-145I Netra Mk1/Mk1A | 3 | — | Active / in service | Not stated | `netra-mk1-iaf` |
| Netra Mk1A (EMB-145) | 6 | aircraft | Under development | Not stated | `netra-mk1a-6-wiki` |
| Netra Mk2 (Airbus A321) | 6 | aircraft | Planned requirement | Not stated | `netra-mk2-6-wiki` |

#### Air defence system

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Akash | Not stated | — | Active / in service | Not stated | `akash-air-defence` |
| S-400 Triumf | 5 | — | Ordered / contractually committed | Not stated | `s400-triumf` |

#### Air defence system upgrade

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| SAKSHAM / SPYDER system upgrades | Not stated | systems | Pipeline / future programme | Not stated | `saksham-spyder-upgrade-aon-aug25` |

#### Air surveillance radar

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Mountain Radars | Not stated | systems | Pipeline / future programme | Not stated | `mountain-radar-iaf-aon-aug25` |

#### Air-to-air missile

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Astra Mk-II missile | Not stated | not disclosed | Pipeline / future programme | Not stated | `astra-mk2-aon` |

#### Aircraft engine

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| AL-31FP engines for Su-30MKI | 240 | engines | Ordered / contractually committed | Not stated | `su30mki-al31fp-engine-contract-2024` |

#### Attack helicopter

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| AH-64E Apache Guardian | 22 | — | Active / in service | Boeing | `apache-ah64e-iaf` |
| HAL Prachand | 10 | — | Active / in service | Not stated | `prachand-lch-iaf-quantity` |
| HAL Prachand — IAF | 66 | aircraft | Ordered / contractually committed | Not stated | `prachand-iaf-66-wiki` |
| HAL Prachand Light Combat Helicopter | Not stated | — | Active / in service | Hindustan Aeronautics Limited | `prachaand-lch` |

#### Aviation safety system

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Automatic Take-off and Landing Recording System | Not stated | not disclosed | Pipeline / future programme | Not stated | `atol-recording-aon` |

#### Basic trainer aircraft

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| HAL HTT-40 | Not stated | — | Ordered / contractually committed | Hindustan Aeronautics Limited | `htt40-iaf` |

#### Combat missile procurement

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Combat missiles for Indian Air Force | Not stated | not disclosed | Pipeline / future programme | Not stated | `iaf-combat-missiles-aon` |

#### Fighter aircraft

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Dassault Mirage 2000 | Not stated | — | Active / in service | Dassault Aviation | `mirage-2000-iaf` |
| Dassault Rafale | 36 | — | Active / in service | Dassault Aviation | `rafale-iaf` |
| HAL Tejas Mk1A | 141 | aircraft | Ordered / contractually committed | Not stated | `tejas-mk1a-iaf-order-wiki` |
| MiG-29UPG | Not stated | — | Active / in service | Mikoyan | `mig-29upg-iaf` |
| Mikoyan MiG-29B | 40 | — | Active / in service | Not stated | `mig29b-iaf` |
| Rafale MRFA | 114 | aircraft | Planned requirement | Not stated | `rafale-mrfa-114-wiki` |
| SEPECAT Jaguar | Not stated | — | Active / in service | SEPECAT | `jaguar-iaf` |
| Su-30MKI | Not stated | — | Active / in service | Not stated | `su-30mki` |
| Su-30MKI additional aircraft | 12 | aircraft | Ordered / contractually committed | Not stated | `su30mki-12-future-wiki` |
| Tejas Mk1A fighter | 141 | — | Ordered / contractually committed | Not stated | `tejas-mk1a-orders` |

#### Fighter aircraft procurement

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Su-30MKI additional aircraft contract | 12 | — | Ordered / contractually committed | Hindustan Aeronautics Limited | `su30mki-additional-contract` |

#### Fighter trainer

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Dassault Mirage 2000TH/TI | 10 | — | Active / in service | Not stated | `mirage-2000th-ti-trainer` |
| HAL Tejas Mk 1 Trainer | 6 | — | Active / in service | Not stated | `tejas-mk1-trainer-iaf` |
| Mikoyan MiG-29UB | 7 | — | Active / in service | Not stated | `mig29ub-iaf` |
| SEPECAT Jaguar-IB | 26 | — | Active / in service | Not stated | `jaguar-ib-trainer-iaf` |

#### High-altitude pseudo-satellite

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Air-Ship Based High Altitude Pseudo Satellite (AS-HAPS) | Not stated | not disclosed | Pipeline / future programme | Not stated | `as-haps-aon` |
| Fixed-Wing Based High Altitude Pseudo Satellite (FW-HAPS) | Not stated | not disclosed | Pipeline / future programme | Not stated | `fw-haps-aon` |

#### Light combat aircraft

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| HAL Tejas Mk 1 | 30 | — | Active / in service | Not stated | `tejas-mk1-iaf` |

#### Light combat helicopter

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| HAL LCH Prachand — IAF contract | 66 | helicopters | Ordered / contractually committed | Not stated | `lch-prachand-iaf-contract-2025` |

#### Light transport aircraft

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Dornier 228-201 | 62 | — | Active / in service | Not stated | `dornier228-iaf` |
| Dornier-228 aircraft procurement | Not stated | not disclosed | Pipeline / future programme | Not stated | `dornier-228-aon-2024` |

#### Light utility helicopter

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| HAL Light Utility Helicopter | 6 | — | Ordered / contractually committed | Not stated | `luh-iaf` |

#### Medium-altitude long-endurance UAV

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Medium Altitude Long Endurance RPAs — tri-service | Not stated | systems | Pipeline / future programme | Not stated | `male-rpa-triservice-aon-aug25` |

#### Military communications satellite

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| GSAT-7C dedicated communication satellite | 1 | satellite | Ordered / contractually committed | Not stated | `gsat7c-iaf-contract-oct26` |

#### Multirole fighter

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Dassault Mirage 2000H/I | 36 | — | Active / in service | Not stated | `mirage-2000h-i-iaf` |
| Dassault Rafale DH | 8 | — | Active / in service | Not stated | `rafale-dh-iaf` |
| Dassault Rafale EH | 28 | — | Active / in service | Not stated | `rafale-eh-iaf` |
| Su-30MKI additional aircraft contract | 12 | aircraft | Ordered / contractually committed | Not stated | `su30mki-12-contract-2024` |
| Sukhoi Su-30MKI (source table entry) | 258 | — | Active / in service | Not stated | `su30mki-iaf-quantity` |

#### Multirole fighter procurement

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Multi Role Fighter Aircraft (MRFA) — Rafale | Not stated | not disclosed | Pipeline / future programme | Not stated | `mrfa-rafale-aon` |

#### Precision guidance kit

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| SPICE-1000 Long Range Guidance Kit | Not stated | not disclosed | Pipeline / future programme | Not stated | `spice-1000-aon` |

#### Reconnaissance aircraft

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| ISTAR aircraft | 3 | aircraft | Planned requirement | Not stated | `istar-3-iaf-wiki` |

#### Strategic transport aircraft

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Ilyushin Il-76MD | 17 | — | Active / in service | Not stated | `il76md-iaf` |

#### Strike aircraft

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| SEPECAT Jaguar-IM | 8 | — | Active / in service | Not stated | `jaguar-im-iaf` |
| SEPECAT Jaguar-IS | 78 | — | Active / in service | Not stated | `jaguar-is-iaf` |

#### Tactical transport aircraft

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Antonov An-32 (legacy entry) | 47 | — | Active / in service | Not stated | `an32-iaf-legacy` |
| Antonov An-32RE | 55 | — | Active / in service | Not stated | `an32re-iaf` |

#### Tanker / refueller

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Il-78MKI | 6 | — | Active / in service | Not stated | `il-78mki` |

#### Trainer aircraft

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| HAL HTT-40 | 70 | aircraft | Ordered / contractually committed | Not stated | `htt40-70-iaf-wiki` |
| HAL Tejas Mk1 conversion trainer | 18 | aircraft | In production | Not stated | `tejas-mk1-trainer-18-wiki` |
| HAL Tejas Mk1A trainer | 29 | aircraft | Ordered / contractually committed | Not stated | `tejas-mk1a-trainer-29-wiki` |
| Tejas Mk1A twin-seat trainer | 39 | — | Ordered / contractually committed | Not stated | `tejas-mk1a-trainers` |

#### Training simulator

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Full Mission Simulator for Light Combat Aircraft Tejas | Not stated | not disclosed | Pipeline / future programme | Not stated | `tejas-simulator-aon` |

#### Transport aircraft

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Airbus A321-200 | 4 | — | Active / in service | Not stated | `a321-transport-iaf` |
| Airbus C-295 | 56 | — | Ordered / contractually committed | Airbus Defence and Space | `c295-iaf` |
| Airbus C-295MW — India-built tranche | 40 | aircraft | In production | Not stated | `c295-40-iaf-wiki` |
| C-130J-30 Super Hercules | Not stated | — | Active / in service | Lockheed Martin | `c130j-30-iaf` |
| C-17 Globemaster III | 11 | — | Active / in service | Not stated | `c-17-globemaster` |
| HAL Dornier 228 | Not stated | — | Active / in service | Hindustan Aeronautics Limited | `dornier-228-iaf` |
| Hawker Siddeley HS 748 | 56 | — | Active / in service | Not stated | `hs748-iaf` |
| Medium Transport Aircraft (MTA) | 60 | aircraft | Tender | Not stated | `mta-60-iaf-wiki` |

#### Transport helicopter

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| CH-47F(I) Chinook | 15 | — | Active / in service | Boeing | `chinook-ch47f-iaf` |
| Mi-17V-5 | Not stated | — | Active / in service | Mil Moscow Helicopter Plant | `mi17v5-iaf` |

#### UCAV

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Remotely Piloted Strike Aircraft (RPSA) | 60 | aircraft | Planned requirement | Not stated | `rpsa-60-iaf-wiki` |

#### Utility helicopter

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Aérospatiale Alouette III / HAL Chetak | 79 | — | Active / in service | Not stated | `chetak-iaf` |
| Aérospatiale SA 315B Cheetah | 18 | — | Active / in service | Not stated | `cheetah-iaf` |
| HAL Cheetal | 18 | — | Active / in service | Not stated | `cheetal-iaf` |
| HAL Dhruv Mk I/III | 95 | — | Active / in service | Not stated | `dhruv-mk1-iii-iaf` |
| HAL Light Utility Helicopter — IAF | 6 | aircraft | Ordered / contractually committed | Not stated | `luh-iaf-6-wiki` |

#### VIP transport aircraft

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Boeing 777-300ER | 2 | — | Active / in service | Not stated | `boeing777-vip-transport` |
| Embraer Legacy 600 | 4 | — | Active / in service | Not stated | `embraer-legacy600-vip` |


### 4.4 Space (1 records)

#### Satellite

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| GSAT-7 / Rukmini | 1 | — | Active / in service | Not stated | `space-gisat` |


### 4.5 Cyber (1 records)

#### Command / capability

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Defence Cyber Agency | 1 | — | Active / in service | Not stated | `cyber-defence-agency` |


### 4.6 Intelligence (1 records)

#### Command / capability

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Defence Intelligence Agency | 1 | — | Active / in service | Not stated | `defence-intelligence-agency` |


### 4.7 Joint (8 records)

#### High altitude long endurance RPAS

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| MQ-9B SkyGuardian / SeaGuardian | 31 | aircraft | Ordered / contractually committed | Not stated | `mq9b-triservice-contract-2024` |

#### Infantry weapon

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Close Quarter Battle Carbine — Army and Navy | 425000 | carbines | Ordered / contractually committed | Not stated | `cqb-carbine-army-navy-contract-2025` |

#### Reconnaissance aircraft

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| Boeing 707-337C | 1 | — | Active / in service | Not stated | `boeing707-reconnaissance` |
| Boeing 737-700 | 2 | — | Active / in service | Not stated | `boeing737-reconnaissance` |
| Bombardier Global 5000 | 2 | — | Active / in service | Not stated | `global5000-elint-arc` |
| Gulfstream G100 / 1125 Astra | 2 | — | Active / in service | Not stated | `gulfstream-g100-astra` |
| Gulfstream III SRA | 3 | — | Active / in service | Not stated | `gulfstream-iii-sra` |

#### Remotely piloted aircraft

| Platform / programme | Quantity | Unit | Status | Manufacturer / yard | Record ID |
|---|---:|---|---|---|---|
| MQ-9B SkyGuardian / SeaGuardian | 31 | — | Ordered / contractually committed | General Atomics Aeronautical Systems | `mq9b-tri-service` |


## 5. Additional official records added in this update

### Indian Army
- **47 T-72 Bridge Laying Tanks:** contract signed on 21 January 2025 with Heavy Vehicles Factory (AVNL), value ₹1,560.52 crore. [PIB source](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2094857&lang=2&reg=3).
- **T-72/T-90 Auxiliary Power Units:** ₹586 crore contract signed on 21 September 2026 with Accurate Industrial Controls Pvt Ltd. The release does not state a unit count, so the catalogue leaves quantity blank. [PIB source](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2313016&lang=1&reg=3).
- **K9 Vajra-T:** ₹7,628.70 crore contract with L&T signed on 20 December 2024 for 155 mm/52 calibre tracked self-propelled guns. The cited PIB release does not state the number of guns; the catalogue preserves the separate Wikipedia-derived quantity record rather than silently treating it as official. [PIB source](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2086514&lang=2&reg=3).

### Indian Navy
- **Project 17A Nilgiri class:** seven ships in the programme; six commissioned by 11 July 2026 and INS Vindhyagiri still under construction. The six commissioned ships are Nilgiri, Himgiri, Udaygiri, Taragiri, Dunagiri and Mahendragiri. [PIB class status](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2283989&lang=1&reg=1).
- **Next Generation Corvettes:** contracts for eight ships signed on 2 November 2026, five with GRSE and three with GSL; these are future ships, not active fleet units. [PIB contract release](https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2331418&lang=1&reg=3).

### Data correction
Fourteen Navy ship records had incorrectly stored a commissioning year (for example, 2025 or 2026) in the numeric `quantity` field. Those values have been removed from `quantity` and retained as `technicalProfile.commissioningYear`. An individual ship is one hull; its commissioning year is not its quantity.


## Appendix A — Officially verified additions in the 23 November 2026 update

These are the five new platform/procurement rows added to `server/inventory.json`. The record IDs below are canonical references; the full record-level fields remain in the JSON catalogue.

| Service | Record ID | Platform / programme | Quantity | Status | Manufacturer / shipyard |
|---|---|---|---:|---|---|
| Army | `t72-bridge-layer-47-contract-2025` | T-72 Bridge Laying Tank contract | 47 vehicles | Contract signed / ordered | Heavy Vehicles Factory, AVNL |
| Army | `t72-t90-apu-contract-2026` | T-72/T-90 Auxiliary Power Unit contract | Not disclosed | Contract signed | Accurate Industrial Controls Pvt Ltd |
| Army | `k9-vajra-2024-contract-official` | K9 Vajra-T 155 mm/52 calibre tracked artillery contract | Not disclosed in cited PIB release | Contract signed | Larsen & Toubro |
| Navy | `next-generation-corvettes-8-contract-2026` | Next Generation Corvettes | 8 ships | Contract signed, 2 November 2026 | GRSE (5), GSL (3) |
| Navy | `ins-vindhyagiri-p17a` | INS Vindhyagiri, Project 17A | One named ship; quantity not expressed as a fleet count | Under construction | GRSE |
| Air Force | `aewec-aircraft-systems-aon-mar2025` | AEW&C Aircraft Systems | Not disclosed | AoN | Not stated |
| Navy | `arudhra-naval-radar-aon-sep2026` | Arudhra naval radar | Not disclosed | AoN | Not stated |
| Navy | `marine-gas-turbine-development-aon-sep2026` | Marine Gas Turbine design, development and procurement | Not disclosed | AoN | Not stated |
| Air Force | `ground-based-multipurpose-jammer-aon-sep2026` | Ground-Based Multi-Purpose Jammer | Not disclosed | AoN | Not stated |

## 6. Data quality and coverage limitations

- Current record total is a count of catalogue rows, **not** the number of aircraft, ships, tanks, guns, missiles or personnel.
- Some entries are programme-level and may overlap with class, variant, batch or individual-platform entries. Do not add overlapping rows into one fleet total.
- Manufacturer / shipyard is blank where the current source record does not establish it. Do not infer manufacturer from country of origin.
- A record with `in_service` status is not proof that every unit is mission-capable or available.
- A planned quantity is not an approved order. An AoN quantity is not a contract. A contract quantity is not an inducted fleet.
- A class under construction may include ships already delivered; class totals must be reconciled ship-by-ship with dated commissioning and delivery records.
- Public sources do not consistently disclose operational availability, serviceability, exact unit-level locations, readiness or classified force structure. These fields should remain unavailable rather than guessed.
- Wikipedia-derived entries are discovery-level records. Each should be checked against a dated official source before being labelled official.
- This document records the current 353-row data snapshot. It is **not yet a certified exhaustive inventory** of every small arm, sensor, radar, vehicle, ammunition type, depot asset, support system, regiment, squadron, ship or acquisition case.

## 7. Required fields for future expansion

Every new platform or programme record should capture, where publicly available:

| Field | Required meaning |
|---|---|
| Service | Army / Navy / Air Force / Joint |
| Category | Tank, IFV, fighter, frigate, submarine, radar, missile, artillery, UAV, support vessel, etc. |
| Platform / programme | Official name and variant |
| Quantity | Numeric value only when source states it |
| Quantity unit | Aircraft, ships, hulls, systems, launchers, vehicles, guns, missiles, sets, etc. |
| Quantity scope | Active fleet / class total / contract / lot / programme target / delivered / outstanding |
| Status | Controlled lifecycle status |
| Manufacturer / shipyard | Named OEM, DPSU, consortium or yard |
| Origin country | Country of design/manufacture, if sourced |
| Milestone dates | AoN, RFI, RFP, tender, contract, keel laying, launch, delivery, commissioning |
| Delivery window | Start/end dates, not guessed years |
| Source and publication date | Exact source URL and source-register ID |
| Verification | Official / reported / community-edited / unverified |
| Limitations | Conflicting totals, unclear scope, stale status, unknown quantity |

## 8. Maintenance workflow

1. Discover candidate platforms and programmes from service and manufacturer sources.
2. Capture the original claim verbatim in notes, including its date and unit.
3. Create a source-register entry before adding the inventory record.
4. Resolve whether the quantity is a fleet, class, contract, lot, delivered or programme figure.
5. Assign the precise lifecycle status; do not infer a later stage.
6. Cross-check deliveries and commissioning against service/PIB releases.
7. Update the record's `asOfDate` and explain what changed.
8. Run validation for unique IDs, valid source references, controlled statuses and required units.
9. Rebuild the website and inspect service filters, status filters and record detail views.
10. Keep the previous value and source in the change history when a quantity or stage changes.

## 9. Source register

The full source register is maintained in `server/sources.json`. The latest official additions include:
- [MoD Annual Report 2025–26](https://www.dodmod.gov.in/static/uploads/2026/09/a7246d934eda1e2d031293822d4a323f.pdf)
- [DAC AoN — 12 February 2026](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2227018&lang=2&reg=3)
- [DAC AoN — 27 March 2026](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2246125&lang=1&reg=3)
- [97 LCA Mk1A contract — 25 September 2025](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2171108&lang=2&reg=3)
- [Navy surface fleet and shipbuilding](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/dec/doc2025123716101.pdf)
- [Navy shipbuilding / induction update](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2198298&lang=1&reg=3)
- [INS Dunagiri delivery — 31 March 2026](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2247142&lang=1&reg=1)
- [Eight Next Generation Corvettes contract — 2 November 2026](https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2331418&lang=1&reg=3)
- [Project 17A six commissioned, one under construction — July 2026](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2283989&lang=1&reg=1)
- [T-72/T-90 APU contract — 21 September 2026](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2313016&lang=1&reg=3)
- [47 T-72 Bridge Laying Tanks contract — 21 January 2025](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2094857&lang=2&reg=3)
- [K9 Vajra-T contract — 20 December 2024](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2086514&lang=2&reg=3)

---
*Generated from the Raksha Atlas public-source inventory snapshot. Update this document whenever the underlying inventory changes; do not manually edit counts without regenerating or revalidating them.*
