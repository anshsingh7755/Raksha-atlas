## Read this policy in simple terms

This document defines how an inventory row should be classified so that different kinds of information are not mixed together.

For every record, ask four separate questions:
1. **Who operates it?** The Army, Navy, Air Force, Coast Guard, Joint organization or another clearly named operator.
2. **What kind of thing is it?** Aircraft, ship, land equipment, missile, radar or another domain.
3. **What family does it belong to?** For example, a fighter aircraft or guided-missile destroyer.
4. **Which exact type or version is it?** For example, a named class, model or variant.

These are different facts and should not be stored in one field. The rules below explain how to classify and reconcile the public records without inventing certainty.

# Inventory classification and reconciliation rules

**Purpose:** keep Raksha Atlas inventory understandable without conflating service ownership, platform domain, command structure, source publisher, or acquisition status.

**Scope:** public, attributable information only. This is a classification policy and first reconciliation pass, not a claim that every row has been independently verified.

## 1. Four different concepts

| Field / concept | Meaning | Example |
|---|---|---|
| Operating service | The armed service that owns or operates the equipment | Army Aviation Apache; Navy P-8I; IAF Rafale |
| Platform domain | The physical / capability domain | Aircraft, naval vessel, land system, missile, radar |
| Equipment classification | The equipment family | Attack helicopter, maritime patrol aircraft, guided-missile destroyer |
| Subclassification | The class, subtype, role or variant that makes the record more precise | AH-64E; P-8I; Visakhapatnam-class destroyer |

A ship does not belong to the Navy because its source was a naval website; it belongs there because it is operated by the Navy. An aircraft does not automatically belong to the Air Force. Naval aviation remains Navy; Army Aviation remains Army.

## 2. Service attribution rules

- **Army:** land equipment and aircraft/helicopters operated by Army formations or Army Aviation. Examples include Army Apache AH-64E, Army ALH, Army LCH and Army-specific orders.
- **Navy:** ships, submarines, naval aviation, carrier-borne aircraft, maritime patrol aircraft and naval helicopters operated by the Indian Navy. Examples include P-8I and MH-60R.
- **Air Force:** IAF-operated fighters, transports, trainers, helicopters, AEW&C and air-defence assets. The 22-aircraft IAF Apache record remains separate from the Army's six-aircraft Apache fleet.
- **Joint:** only where the record is genuinely tri-service, centrally controlled, or where public sources do not justify assigning a single service. Do not use Joint as a convenient catch-all.
- **Coast Guard:** should be represented separately when it is the actual operator, rather than silently assigned to Navy.
- **Space / Cyber / Intelligence:** retain as domains or organisations only when the source identifies a distinct public capability or responsible institution. Do not turn an equipment publisher or source category into an armed service.

## 3. Command structure is not inventory ownership

Operational commands, training commands, maintenance commands, theatre commands, and joint headquarters are organisational structures. They are not equipment categories and must not be counted as inventory platforms.

A source publisher (PIB, DRDO, manufacturer, IDRW, Indian Defence News, Economic Times Defence, etc.) is evidence provenance—not the service operator.

## 4. Quantity and lifecycle reconciliation

- One row should represent one clearly defined platform cohort, variant, operator, or procurement lot.
- Keep separate contracts and service allocations separate. Never combine the IAF's 22 Apaches with the Army's six Apaches into a single service-owned row.
- Distinguish in-service, delivered, ordered, contracted, planned, AoN, development, trials, and proposal. A contract is not delivery; delivery is not proof of operational availability.
- Do not add source-table estimates to official contract quantities.
- Use null / “not stated” when a source does not disclose a quantity. Do not convert unknown to zero.
- Where a source reports a mixed or ambiguous total, preserve the caveat and avoid summing it with a separately itemised cohort.
- Record procurement year only when it is a contract / procurement milestone, and inducted year only when induction or entry into service is supported.

## 5. Source hierarchy and confidence

1. Ministry of Defence / PIB / Parliament / service public-information releases.
2. Official service, DRDO, HAL, shipyard, manufacturer or government export-control documents.
3. Established defence reporting with named attribution and dates.
4. Specialist secondary publications and industry analysis.
5. Unofficial reports, social posts, forums and aggregators.

The hierarchy is a guide, not an automatic truth score. A secondary report may be the only public evidence for a delivery, but the UI must label it as reported and retain the source. Conflicting sources should be recorded as a discrepancy, not silently resolved.

## 6. First explicit reconciliation: Apache fleet

The dataset previously contained the 22-aircraft IAF Apache cohort. That record remains under **Air Force**.

A separate record has now been added for **six Army AH-64E Apache helicopters**, with the Army as operator and a reported completion of delivery in December 2025. The Army and IAF figures are not interchangeable and should not be collapsed into a single “India Apache” row.

Evidence:
- IAF/Army fleet distinction and Army delivery report: [India Today, 16 December 2025](https://www.indiatoday.in/india/story/final-batch-of-3-us-made-apache-ah-64e-attack-helicopters-land-at-hindon-will-join-armys-jodhpur-squadron-2836759-2025-12-16)
- Independent specialist account of the Army's first batch: [Janes, 22 July 2025](https://www.janes.com/defence-intelligence-insights/defence-news/defence/indian-army-receives-first-ah-64e-helicopters)

The Army record is marked **reported / medium confidence** because the public source used for the completed six-aircraft delivery is secondary reporting. The quantity describes the contracted and delivered Army fleet, not aircraft availability.

## 7. Reconciliation workflow for remaining records

For each row:
1. Identify the actual operator from the source—not from the platform's generic domain.
2. Identify whether the row is a platform, class, variant, contract lot, programme total, or source-table estimate.
3. Match quantity, status, date, and service to the same cohort.
4. Compare primary and secondary sources; retain disagreements.
5. Add an image only when its subject and source match the platform/class.
6. Mark unresolved service, quantity, or lifecycle fields for review instead of guessing.

**Important:** the current catalogue remains a curated baseline. The service classification rules are now explicit, and the Apache split is reconciled, but a full row-by-row source audit of all entries remains an ongoing data-quality task.
