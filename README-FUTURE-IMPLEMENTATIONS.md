# Raksha Atlas — Future Implementations

> **Status:** Proposed long-term requirements; for discussion and staged implementation.  
> **Purpose:** Define what the platform should eventually support. This document does not claim that these features are already implemented.  
> **Boundary:** Planning only. No website, database, configuration or runtime changes are authorized by this document.

## 1. Product objective

Raksha Atlas should evolve into a **public-source Defence Information and Intelligence Knowledge Platform**. It should collect relevant information from permitted public sources and user submissions; preserve original material and provenance; extract structured information; connect it to existing defence entities, programmes and events; track evidence and uncertainty; and make the resulting knowledge searchable through the website and a research assistant.

It should not become a collection of unrelated scrapers, databases or AI chatbots. It should be one coherent platform with a common ingestion pipeline and a traceable knowledge layer.

### Core principles

1. Different input channels feed one shared ingestion pipeline.
2. Original sources are preserved; AI output never replaces evidence.
3. A source statement is not automatically a verified fact.
4. Defence records use canonical identities, aliases and relationships.
5. Important structured-record changes are reviewed unless a narrow, tested auto-update policy is approved.
6. Extend the active system before introducing new infrastructure or replacing technology.
7. Use attributable, permitted public information only; do not ingest classified, leaked or non-public operational material.
8. Hosted collection must eventually operate independently of the owner's laptop.

## 2. Existing architecture and reuse boundary

The current working architecture is:
- **Frontend:** React, TypeScript and Vite.
- **API/data services:** Node.js.
- **AI/document processing:** Python and FastAPI.
- **Databases:** PostgreSQL, with separate Defence and Application databases.
- **Collection:** existing Node collectors, processors, source configuration and scheduler.
- **Runtime/deployment:** Docker Compose locally and Vercel compatibility for the website.

The active frontend and Node API remain the implementation baseline unless a separate migration is explicitly approved after parity and rollback checks. Do not reactivate Next.js or Spring Boot migration work merely to deliver the capabilities described here.

The repository already documents or contains parts of RSS/Atom collection, URL normalization, duplicate/story grouping, article metadata extraction, rule-based and optional AI enrichment, source/category configuration, PostgreSQL storage and JSON compatibility, a Node worker/scheduler, RAG/search and FastAPI document extraction. These are starting points, not reasons to create duplicate systems.

Before implementation, map each requirement to the actual code and mark it **reuse**, **extend**, **new** or **defer**.

## 3. Target architecture at a glance

```
INPUT CHANNELS
RSS/Atom | Official sites | News | X API | Wikipedia
Telegram | Website uploads | PDF/images | JSON/CSV
                    |
                    v
             SOURCE ADAPTERS
                    |
                    v
          UNIVERSAL SUBMISSION INBOX
                    |
                    v
     RETRIEVAL / EXTRACTION / OCR / PARSING
                    |
                    v
      NORMALIZATION / CLAIMS / ENTITIES
                    |
                    v
        DEDUPLICATION / QUALITY CHECKS
                    |
                    v
          HUMAN REVIEW / APPROVAL
                    |
                    v
      DEFENCE KNOWLEDGE + EVIDENCE LAYER
                    |
          SEARCH / WEBSITE / AI RESEARCH
```

Four cooperating layers:

- **Collection:** adapters retrieve information from supported channels.
- **Processing:** one pipeline extracts, normalizes, matches, validates and routes submissions.
- **Knowledge:** PostgreSQL stores defence-domain records and application workflow data; object storage eventually holds original binary files.
- **Experience:** the website exposes research modules, a protected review centre, search, reports and an evidence-aware assistant.

A connector retrieves information; it does not write directly into trusted defence tables.

# 4. Stage 1 — Universal collection and controlled ingestion

**Outcome:** every supported input type enters the same traceable processing and review lifecycle.

## 4.1 Required input channels

| Channel | Required capability | Constraint |
|---|---|---|
| RSS/Atom | Poll configured feeds and preserve publisher, URL and dates | Only feeds publishers provide |
| Official/public websites | Retrieve permitted pages and linked public documents | Respect access rules, robots policies and rate limits |
| News publishers | Use feeds, APIs or permitted page metadata | No paywall bypass or unauthorized full-article republication |
| X/Twitter | Accept post URLs and retrieve content through authorized API access | Access, historical search, quotas and pricing depend on the current API tier |
| Wikipedia | MediaWiki API, page and revision metadata | Preserve attribution/revision identity and respect rate limits |
| Telegram | Private bot accepts links, messages, images and documents | Standard Bot API file retrieval documents a 20 MB limit; larger files use website upload |
| Website upload | Images, PDFs and supported office documents | Enforce type, size, malware and processing limits |
| JSON/CSV | Versioned schema validation and bulk import | Invalid rows are rejected or quarantined with a report |
| YouTube | Permitted metadata and available authorized transcript sources | Metadata access does not imply transcript access |

Do not promise collection from every website or social account. Each source needs a verified access method, capability declaration, permitted schedule and failure policy.

## 4.2 Common submission envelope

Every connector or manual submission creates a common intake record containing:
- unique submission ID and idempotency key;
- connector/source ID and source type;
- submitted URL or original file reference;
- submitter/channel identity where applicable;
- submitted, collected and processed timestamps;
- content type, size and checksum where applicable;
- processing state, attempts and error details;
- attribution, access and retention metadata.

This is an intake record, not a trusted defence fact.

## 4.3 Extraction requirements

Support progressively:
- article title, publisher, canonical URL, publication date and permitted readable text/metadata;
- PDF text, page numbers, document metadata and tables where feasible;
- OCR text with page/image-region coordinates where available;
- image metadata and visual descriptions, distinguished from verified identification;
- spreadsheet rows and column mappings;
- JSON/CSV schema validation;
- language and date normalization;
- source excerpts supporting each extracted claim.

Preserve the original file or a durable source reference. Store extracted text and AI summaries separately. Never overwrite source material with generated output.

## 4.4 Duplicate and matching requirements

Use multiple levels:
1. canonical URL identity;
2. file/content checksum;
3. normalized title and publisher;
4. text similarity;
5. event/claim similarity, with review for ambiguous matches.

Repeated reports should link to an existing source document or event where appropriate. Similarity alone must not merge distinct events.

## 4.5 Review and publication workflow

Required states:
- **Received:** submission registered.
- **Processing:** retrieval/extraction running.
- **Needs review:** extraction complete, not approved.
- **Approved:** reviewer accepts specified fields/claims.
- **Published/linked:** approved data is created or linked to the correct domain record.
- **Rejected:** excluded from trusted records; reason retained.
- **Failed/quarantined:** technical, security or validation issue requires attention.

Reviewers should see the original source, extracted content, proposed fields, supporting excerpts, duplicate candidates, related records and automated suggestions.

AI models and Telegram bots must not have unrestricted write access to trusted defence tables.

## 4.6 Stage 1 deliverables

- Source registry and connector contract.
- Common submission envelope and job lifecycle.
- URL submission.
- PDF and image upload.
- Document extraction and OCR.
- RSS/Atom and selected official-source adapters.
- Wikipedia/MediaWiki adapter.
- Telegram submission bot.
- X connector when authorized access exists.
- JSON/CSV import with validation reports.
- Duplicate detection and existing-record matching.
- Protected review desk.
- Audit and processing history.
- Safe, idempotent publication to the Defence database.

## 4.7 Stage 1 acceptance criteria

- All supported inputs use the same submission lifecycle.
- Every submission retains provenance and timestamps.
- Original files/source references remain available after extraction.
- Retrying a job does not create duplicate publication.
- Duplicate candidates are visible; ambiguous matches are reviewable.
- Extracted claims are not automatically presented as confirmed facts.
- Important record changes are review-controlled.
- A connector failure does not stop unrelated connectors.
- URL-fetch and upload security controls are enforced.
- Reviewers can inspect, correct, approve or reject submissions.

# 5. Stage 2 — Defence knowledge, evidence and research engine

**Outcome:** the platform connects information to defence entities, programmes and events, and answers research questions with source-level evidence.

## 5.1 Separate the core concepts

Do not collapse these into one article record:

- **Source document:** original article, post, PDF, image or public release.
- **Claim:** statement made by a source, with a supporting excerpt or image region.
- **Event:** real-world development reported by one or more sources.
- **Entity:** aircraft, ship, missile, manufacturer, service, programme, country or organization.
- **Domain record:** curated inventory, programme, procurement or history entry.
- **Evidence:** material supporting, qualifying or contradicting a claim or record.

One source can contain several claims; multiple sources can report one event; one claim can be disputed. A source document does not prove every claim it contains.

## 5.2 Canonical knowledge model

Design and validate a logical model for:
- sources and source documents;
- extracted text and extraction versions;
- claims and claim-to-source evidence;
- events and event-to-source links;
- canonical entities and aliases;
- entity relationships;
- inventory, programmes and procurement records;
- milestones and historical revisions;
- review decisions and audit history.

Candidate logical entities include `source_documents`, `claims`, `events`, `entities`, `entity_aliases`, `entity_relationships`, `evidence`, `review_history` and `record_revisions`.

These are conceptual names, not an instruction to create tables immediately. Map them to existing schemas first, avoid duplicate tables and prefer additive migrations.

## 5.3 Evidence and editorial states

Keep separate:
- **Source provenance:** who published or supplied material.
- **Claim evidence:** unreviewed, single-source, corroborated, officially confirmed, disputed or rejected.
- **Review status:** pending, approved, corrected or rejected.
- **Confidence:** optional calibrated assessment for prioritization, never a substitute for evidence.

An official publisher does not automatically make every claim independently verified. Several articles repeating one original report are not necessarily independent corroboration.

## 5.4 Entity resolution and relationships

Resolve aliases and spelling variations to canonical entities while preserving original wording. Support manufacturer/platform, platform/service, programme/procurement, source/event and historical relationships.

Use deterministic identifiers and curated aliases first, contextual matching second and AI-assisted suggestions only as proposals. Ambiguous matches require review.

Start with relational PostgreSQL tables and foreign keys. Build graph-like navigation over those relationships. Add a separate graph database only if measured query requirements justify it.

## 5.5 Search and research assistant

Required capabilities:
- structured search and filters across domain modules;
- PostgreSQL full-text search;
- semantic retrieval using pgvector when evaluation shows benefit;
- hybrid text/vector retrieval;
- entity and event search;
- source citations and page references;
- source comparison and conflicting-claim presentation;
- research dossier generation;
- answers that explicitly state when evidence is insufficient.

AI answers must retrieve source records and cite them. They must not invent quantities, dates, programme stages or verification states. Summaries are derivative content, not evidence.

## 5.6 Website modules

The long-term product should organize research into:
1. Intelligence dashboard and briefings.
2. Defence inventory and platform profiles.
3. Programmes and procurement tracker.
4. News, signals and event clusters.
5. Document library and document intelligence.
6. History and programme timelines.
7. Knowledge graph and entity profiles.
8. Evidence and source comparison.
9. Theatre Atlas using appropriate public information.
10. AI research assistant.
11. Research workspace, saved searches and reports.
12. Protected collection, source management and review centre.

Build these incrementally. Administrative controls must not be exposed as public functionality.

## 5.7 Stage 2 acceptance criteria

- One event links multiple source documents without losing provenance.
- Claims have traceable excerpts and review states.
- Canonical entities resolve common aliases without silently merging ambiguous entities.
- Programme/inventory changes preserve history and evidence.
- Contradictory reports remain visible rather than overwritten.
- Search returns relevant records with source citations.
- AI answers expose supporting evidence and uncertainty.
- Evaluation measures extraction and retrieval accuracy for names, dates, quantities, programme stages and attribution.

# 6. Stage 3 — Autonomous operations, analytics and scale

**Outcome:** the platform operates reliably as a hosted service and monitors approved sources without depending on the owner's laptop.

## 6.1 Hosted monitoring

- Source-specific schedules and incremental collection.
- Change detection.
- Daily/weekly briefings and priority alerts.
- Source health, last-success and coverage dashboards.
- Bounded retries and overlap prevention.
- Dead-letter handling and operator replay.
- Per-source quotas and rate limits.
- Monitoring independent of the owner's laptop.

Reuse existing Node collectors, workers and scheduler wherever practical. The first hosted implementation should not require a complete rewrite.

## 6.2 Background processing

Start with a lightweight persistent job mechanism. Add Redis/BullMQ or a managed queue when concurrency, latency or reliability requires it.

Jobs need unique identity/idempotency, queued/running/succeeded/failed state, attempt count, bounded retries, timeout/cancellation, structured logs, dead-letter state and safe replay. Slow collection, extraction and AI work must not block normal API requests.

## 6.3 Advanced intelligence capabilities

- Event detection and clustering.
- Change and discrepancy detection.
- Contradiction detection.
- Programme lifecycle monitoring.
- Country/service/manufacturer comparisons.
- Research watchlists and notifications.
- Scheduled research reports and dossiers.
- Historical trends and data-quality dashboards.
- User collections, notes and collaborative review.

Automated alerts must state what changed and link to original material, not overstate what the change proves.

## 6.4 Multi-user governance

- Owner/admin, researcher, reviewer and editor roles.
- Authentication and role-based access.
- Submission and approval permissions.
- Audit trail for important changes.
- Private notes and research collections.
- Secure connector credential management.
- User notification and saved-search preferences.

## 6.5 Production operations

Introduce infrastructure in response to measured requirements:
- PostgreSQL backups and tested restoration;
- S3-compatible object storage for original media;
- managed PostgreSQL when justified;
- hosted API and workers;
- queue/cache when needed;
- OpenTelemetry traces, metrics and logs;
- suitable metrics/logging dashboards;
- GitHub Actions deployment and rollback;
- Terraform for repeatable cloud resources;
- cost, quota and retention controls.

Kafka, Airflow, Spark, Kubernetes and a separate graph database are optional future technologies, not prerequisites. Adopt them only when a concrete throughput, orchestration, analytics or deployment requirement cannot be met more simply.

## 6.6 Stage 3 acceptance criteria

- Scheduled collection continues while the owner's laptop is off.
- Failed jobs are visible, retryable and safely replayable.
- Source outages do not silently stop unrelated collection.
- Monitoring shows source health, latency and failures.
- Database and object-storage recovery procedures are tested.
- Administrative actions are authenticated and audited.
- Cloud costs and external API usage are measurable.
- Deployment rollback is documented and tested.

# 7. Data and storage boundaries

### Defence database

Owns defence-domain information: sources, source documents, claims, events, evidence, inventory, platforms, programmes, procurement, timelines, history, reference catalogues, canonical entities and relationships.

### Application database

Owns application operation: application components and architecture metadata, users/roles/preferences, submission and job workflow state where assigned to the application domain, review workflow configuration, application settings and audit metadata.

The exact ownership of ingestion metadata and review records must be finalized during data-model design. Avoid cross-database transactions; use stable IDs and explicit service boundaries.

### Object storage

Eventually owns original PDFs, images, retained source documents where permitted, extracted media derivatives and generated reports. PostgreSQL stores metadata, checksums, provenance and object references. Define retention policies before storing large volumes.

# 8. Security, legal and factual safeguards

### URL fetching
- Allow only supported HTTP/HTTPS schemes.
- Block localhost, private, link-local and reserved IP ranges.
- Resolve and validate destination addresses.
- Revalidate every redirect.
- Protect against DNS rebinding and SSRF.
- Enforce timeouts, response-size limits and content-type checks.
- Apply per-domain rate limits.
- Never bypass logins, paywalls, access controls or source terms.

### File uploads
- Allowlist supported formats and verify file signatures.
- Enforce size, page-count and decompression limits.
- Generate server-side filenames.
- Store uploads outside the public web root.
- Scan files where available.
- Process in restricted workers.
- Never execute uploaded content.

### Factual and publication safeguards
- Use public, attributable information only.
- Do not ingest classified, leaked, personally identifying or non-public operational information.
- Preserve original URLs, publishers and publication dates.
- Respect copyright, attribution, licences and retention conditions.
- Do not republish full copyrighted articles without permission.
- Distinguish proposals, approvals, tenders, contracts, deliveries and induction.
- A photograph alone does not prove identity, location, quantity or service status.
- AI output and repeated reports are not independent evidence.
- Preserve conflicting claims and correction history.

# 9. Technology direction

| Layer | Preferred direction | Adoption rule |
|---|---|---|
| Frontend | Existing React + TypeScript + Vite | Retain active application |
| API | Existing Node.js | Extend current API |
| AI/document service | Existing Python + FastAPI | Expand behind service boundaries |
| Structured data | PostgreSQL | Continue as source of truth |
| Semantic retrieval | pgvector | Add after search evaluation |
| Original files | S3-compatible storage | Add when durable media storage is needed |
| Extraction | PDF parser, Tesseract, optional cloud OCR/multimodal models | Provider-independent interface |
| Collection | RSS/Atom, official APIs, permitted pages and adapters | Common connector contract |
| Messaging | Telegram Bot API | Private submission channel |
| Jobs | Lightweight persistent jobs initially; Redis/BullMQ or managed queue later | Scale when needed |
| Scheduling | Hosted scheduler initially | Avoid orchestration overhead early |
| Cloud | AWS ECS/RDS/S3 or equivalent | Gradual migration with rollback |
| Monitoring | OpenTelemetry and suitable metrics/logging | Add with hosted operations |
| Infrastructure as code | Terraform | Introduce for repeatable cloud resources |

Do not activate archived Next.js or Spring Boot migration as a prerequisite for these features. Any stack migration requires separate parity, security, deployment and rollback approval.

# 10. Delivery order and dependencies

| Order | Milestone | Dependency |
|---:|---|---|
| 1 | Map current code/schemas to this target; label reuse/extend/new/defer | Current repository review |
| 2 | Define source, submission, document, claim and entity contracts | 1 |
| 3 | Build common submission and job lifecycle | 2 |
| 4 | Add URL, RSS and official-source adapters | 3 |
| 5 | Add PDF/image extraction and safe file storage | 3 |
| 6 | Add duplicate matching and review desk | 4–5 |
| 7 | Add JSON/CSV and Wikipedia connectors | 3 |
| 8 | Add Telegram and authorized X connector | 3 and external access |
| 9 | Add canonical entities, claims, events and evidence relationships | Reliable Stage 1 data |
| 10 | Add source comparison, history and entity linking | 9 |
| 11 | Add hybrid search and evidence-aware assistant | Reliable knowledge model |
| 12 | Move collection to hosted scheduling and workers | Stable collection pipeline |
| 13 | Add analytics, watchlists and reports | Reliable events and evidence |
| 14 | Add multi-user governance and production scaling | Stable hosted platform |

Each milestone needs a bounded implementation plan, acceptance criteria and rollback path. This is a dependency sequence, not a commitment to start all work immediately.

# 11. Non-goals and technologies to defer

Do not begin with:
- a separate pipeline/database for every source;
- unrestricted AI-to-database writes;
- fully autonomous publication of important defence facts;
- a frontend/backend framework migration;
- Kafka, Spark, Airflow or Kubernetes without a demonstrated need;
- expensive model calls for deterministic extraction tasks;
- scraping that bypasses access controls;
- claims of complete coverage of the internet or all social media.

# 12. Measures of success

Track:
- enabled-source coverage and last-success time;
- submission and extraction success rates;
- provenance completeness;
- duplicate and false-merge rates;
- extraction accuracy for names, dates, quantities and programme stages;
- entity-link accuracy;
- review backlog and review time;
- claim correction/dispute rates;
- search relevance and citation coverage;
- job latency, retries and failures;
- data freshness;
- database/object-storage recovery performance;
- external API usage and operating cost.

Maintain reviewed evaluation datasets for extraction, entity matching and retrieval. A single generic AI accuracy score is insufficient.

# 13. Decisions to confirm before implementation

1. **Coverage:** India-first with later international expansion, or global from the beginning.
2. **Publication policy:** human approval for every change, or limited auto-publication for explicitly trusted deterministic updates.
3. **Operating model:** local-first, hybrid or cloud-first.
4. **Cost strategy:** free/open-source-first, balanced paid services or performance-first.
5. **Initial source set:** exact official, publisher, reference and social sources to enable.
6. **Retention:** how long to retain original files, extracted text, rejected submissions and source snapshots.
7. **Access model:** single owner initially or multiple researchers/reviewers from the first release.

**Recommended defaults:** India-focused coverage first with international-ready data structures; human approval for important structured-record changes; hybrid operation moving gradually to hosted collection; free/open-source-first; begin with a small verified source set.

# 14. Definition of the complete product

Raksha Atlas will meet its long-term goal when it can:
1. Accept information through supported URLs, feeds, APIs, images, PDFs, Telegram and structured imports.
2. Preserve original material and provenance.
3. Extract and normalize content through a shared observable pipeline.
4. Detect duplicates and connect information to canonical entities and events.
5. Separate source statements, claims, evidence and curated defence records.
6. Provide review, correction, history and controlled publication.
7. Search structured records and documents with traceable citations.
8. Answer research questions using evidence and visible uncertainty.
9. Monitor approved sources on hosted schedules independently of the owner's laptop.
10. Recover safely from failures and restore data from backups.
11. Expand sources, modules and users without parallel pipelines or duplicate systems.

# 15. Official technical references

Check current documentation during implementation because API access, quotas, terms and limits can change.

- [X API documentation](https://docs.x.com/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [MediaWiki API](https://www.mediawiki.org/wiki/API:Main_page)
- [MediaWiki revision API](https://www.mediawiki.org/wiki/API:Revisions)
- [Robots Exclusion Protocol — RFC 9309](https://www.rfc-editor.org/rfc/rfc9309)
- [OWASP SSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP File Upload Security](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [PostgreSQL full-text search](https://www.postgresql.org/docs/current/textsearch.html)
- [pgvector](https://github.com/pgvector/pgvector)
- [OpenTelemetry](https://opentelemetry.io/docs/)

---

## Working rule for future implementation

This document is the long-term requirements reference. The root living handoff remains the source for current implementation state, latest commit and immediate next action. The delivery roadmap remains the phase/status record.

When implementation begins:
1. Read the living handoff and inspect the actual checked-out code.
2. Select the next unblocked milestone from this document.
3. Map the requirement to existing files and data contracts.
4. Reuse or extend existing modules wherever practical.
5. Define acceptance criteria before changing code.
6. Implement one bounded change at a time.
7. Run only relevant checks and record actual results.
8. Update the living handoff with one concise dated line and the resulting commit.
9. Do not mark a capability complete until its acceptance criteria have evidence.

**Current status:** requirements documented for discussion; no feature implementation is implied or authorized by this file.
