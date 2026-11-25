# Documentation index — where to find project information

This page is the table of contents for Raksha Atlas documentation. Start here when you do not know which file explains a part of the project.

The documents use simple explanations first and technical details after them. Folder-specific READMEs explain what the folder is for. The deeper guides explain how a feature, service or migration works.

## 1. Start here

| If you want to... | Read this |
|---|---|
| Understand the project | [Main README](../README.md) |
| See which code is active today | [Architecture quick reference](../ARCHITECTURE.md) |
| Understand the full system and migration boundaries | [Architecture guide](architecture/README.md) |
| Install, run, build or test the website | [Run and Deploy](RUN-AND-DEPLOY.md) |
| Understand what has been built and what comes next | [Delivery roadmap](roadmap/README.md) |
| Find the history of changes | [Development history](development-history/README.md) |

## 2. Understand each major system

| System | Start with | What it explains |
|---|---|---|
| Frontend | [Frontend guide](frontend/README.md) and [active source guide](../src/README.md) | Browser screens, React, components, features and API calls |
| Backend | [Backend guide](backend/README.md) and [active server guide](../server/README.md) | Node API, routes, collectors, processors and request flow |
| AI and assistant | [AI guide](ai/README.md) | RAG, evidence retrieval and the separate FastAPI service |
| Inventory | [Inventory guide](inventory/README.md) | Inventory files, quantities, procurement stages and sources |
| Docker and deployment | [Docker guide](docker/README.md) | Containers, Compose, Vercel and Nginx boundaries |
| Database | [Database guide](../database/README.md) | PostgreSQL schema, migrations, imports and reconciliation |
| Data engineering | [Data engineering guide](../data-engineering/README.md) | Python collectors, normalization, storage and analytics |
| Infrastructure | [Infrastructure guide](../infrastructure/README.md) | AWS, Terraform, monitoring, security and operations |
| Scripts | [Scripts guide](../scripts/README.md) | Manual refresh, ingestion, import and maintenance commands |

## 3. Detailed reference areas

### Architecture
- [Architecture and service boundaries](architecture/README.md)
- [Phase 2 domain contracts](architecture/PHASE-2-DOMAIN-CONTRACTS.md)
- [Phase 3 AI service](architecture/PHASE-3-AI-SERVICE.md)
- [Phase 4 ingestion inventory](architecture/PHASE-4-INGESTION-INVENTORY.md)
- [Phase 5 ECS decision](architecture/PHASE-5-ECS-DECISION.md)
- [Phase 6 security and identity](architecture/PHASE-6-SECURITY-IDENTITY.md)

### Data and inventory
- [Data documentation](data/README.md)
- [Inventory guide](inventory/INVENTORY-DATA.md)
- [Inventory classification and reconciliation](data/INVENTORY-CLASSIFICATION-AND-RECONCILIATION.md)
- [Programme timeline information architecture](data/PROGRAMME-TIMELINE-AND-INFORMATION-ARCHITECTURE.md)

### AI and backend
- [AI and RAG guide](ai/RAG-CHATBOT.md)
- [News pipeline guide](backend/NEWS-PIPELINE.md)

### Public research
- [Intelligence and research index](intelligence/README.md)
- [Armed Forces catalogue](intelligence/INDIAN-ARMED-FORCES-CATALOGUE.md)
- [Future programmes dossier](intelligence/FUTURE-PROGRAMMES-ACQUISITION-DOSSIER.md)
- [Theatre Atlas source register](intelligence/THEATRE-ATLAS-SOURCE-REGISTER.md)
- [Three-source research plan](intelligence/THREE-SOURCE-RESEARCH-AND-NEWS-PLAN.md)

### Delivery roadmap
The [roadmap index](roadmap/README.md) links to module specifications, phase plans, cutover runbooks and quality gates. Keep these detailed records; do not replace them with a short summary.

## 4. How to keep documentation correct

When code changes:
1. Update the README for the folder whose responsibility changed.
2. Update the detailed guide for the affected feature or service.
3. Update the architecture guide if a service boundary or request flow changed.
4. Update the roadmap if a phase, acceptance criterion or migration status changed.
5. Add a history entry for a meaningful completed change.
6. Record tests only after they have actually been run.

Use one main document for each subject and link to it from other files. Avoid copying the same long explanation into multiple places.

## 5. Status words used in these documents

- **Active:** currently used by the running application.
- **Supporting:** helps the active application but is not its main request path.
- **Migration scaffold:** code prepared for a possible future replacement; not yet the active replacement.
- **Planned:** described as future work; not necessarily implemented.
- **Pending validation:** code or documentation exists, but the required check has not yet been completed.
- **Completed:** the stated work and its acceptance checks have evidence. If a status is only owner-reported, the document should say so.

### Automated intelligence monitoring
- [Automated Defence Intelligence Monitoring](intelligence/AUTOMATED-INTELLIGENCE-MONITORING.md) — complete requirements, source groups, evidence labels, 08:00–09:00 morning collection, 10:00 refresh, all-day monitoring, phone access, free-first constraints and phased implementation plan.
