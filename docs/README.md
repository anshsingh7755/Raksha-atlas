# Documentation Index

Use this page to find the current project documentation. Keep detailed technical instructions in their existing topic documents; avoid copying the same explanation into multiple files.

## Start here

1. [Run and deployment guide](RUN-AND-DEPLOY.md) — shortest path to install, run, build and deploy.
2. [Main README](../README.md) — project overview, quick start and delivery stages.
3. [Architecture quick reference](../ARCHITECTURE.md) — active code paths and repository areas.
4. [Architecture and service boundaries](architecture/README.md) — current runtime, target design and migration policy.
5. [Delivery roadmap](roadmap/README.md) — phases, sub-phases, work completed, pending checks and acceptance criteria.

## Simple code guides

- [Active frontend](../src/README.md)
- [Active Node backend](../server/README.md)
- [Next.js migration frontend](../frontend/README.md)
- [Spring Boot migration backend](../backend/README.md)
- [AI and document service](../ai/README.md)
- [Database](../database/README.md)
- [Data engineering](../data-engineering/README.md)
- [Infrastructure](../infrastructure/README.md)
- [Vercel API adapter](../api/README.md)
- [Project scripts](../scripts/README.md)
- [Nginx deployment config](../deploy/README.md)
- [GitHub Actions workflows](../.github/workflows/README.md)

## Documentation areas

| Area | Contents |
|---|---|
| [Architecture](architecture/README.md) | Service boundaries, current/target architecture and migration decisions |
| [Roadmap](roadmap/README.md) | Delivery phases, module plans, runbooks and quality gates |
| [Data](data/INVENTORY-CLASSIFICATION-AND-RECONCILIATION.md) | Data classification, provenance and reconciliation policies |
| [Intelligence](intelligence/THEATRE-ATLAS-SOURCE-REGISTER.md) | Public-source research, catalogues and intelligence dossiers |

## Topic guides at repository root

- [News pipeline](../NEWS-PIPELINE.md)
- [RAG chatbot](../RAG-CHATBOT.md)
- [Inventory data](../INVENTORY-DATA.md)
- [Database guide](../database/README.md)

## Documentation rules

- State whether a component is active, supporting, a migration scaffold or planned.
- Keep one canonical document for each topic and link to it elsewhere.
- Record phase work as short entries: change, issue, fix and validation result.
- Mark unverified work as pending; do not describe planned work as implemented.
- Update the main README only for project-level changes.
- Preserve older phase/runbook documents as history unless they are confirmed duplicates or obsolete.
