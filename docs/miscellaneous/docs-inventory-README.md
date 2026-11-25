# Inventory documentation

## What is inventory?

Inventory is the catalogue of equipment and platforms that the website displays. It can include service, category, platform, quantity wording, status, origin, manufacturer and supporting sources.

Inventory data must be treated carefully: one source may report a single vehicle, another a class total, and another a future order. Those values must not be added together unless their scope is known to match.

## Start with these documents

- [Inventory data guide](INVENTORY-DATA.md) — current source files, catalogue generation, quantity rules and procurement-stage definitions.
- [Inventory classification and reconciliation](../data/INVENTORY-CLASSIFICATION-AND-RECONCILIATION.md) — field meanings, provenance and data-quality rules.
- [Programme timeline guide](../data/PROGRAMME-TIMELINE-AND-INFORMATION-ARCHITECTURE.md) — programme milestones and date handling.
- [Inventory module specification](../roadmap/INVENTORY-MODULE.md) — UI/API requirements and acceptance criteria.

## Where is the data?

The active application's current data files are in `server/`, including inventory, equipment catalogue, procurement and source records. PostgreSQL migration is partial and must be reconciled domain by domain.

## Key rule

A public estimate is not an exact count. An approval is not a signed contract. A contract is not proof that equipment has been delivered or inducted. Preserve the original source wording and status.
