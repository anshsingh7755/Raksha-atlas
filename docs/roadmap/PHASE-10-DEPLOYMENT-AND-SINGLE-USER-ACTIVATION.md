# Phase 10 — Vercel-first deployment, single-user activation and AWS portability

**Branch:** `work/phase-10-deployment`  
**Initial hosting decision:** Vercel Hobby for the personal website, subject to its current fair-use and resource limits  
**Initial database decision:** Neon Postgres Free as the first hosted PostgreSQL candidate  
**Operating model:** one owner / one administrator account  
**Future cloud path:** retain AWS Terraform and ECS/RDS/S3 architecture as a separately maintained migration target  
**Goal:** complete the deployment plan and repository preparation for a low-cost first release without pretending that cloud services, authentication, data migration or deployment have already been activated.

> **Important status distinction:** This document completes the Phase 10 planning and execution design. It does not provision Vercel, Neon or AWS resources, migrate production data, configure real credentials, or publish the website. Those actions require the owner to create/authorize the external accounts and then execute the documented steps.

## 1. Decisions and scope

### 1.1 Initial platform

| Layer | Initial choice | Why | Boundary |
|---|---|---|---|
| Website hosting | Vercel Hobby | Git-connected deployments, HTTPS, preview deployments and serverless functions for a personal project | Personal/non-commercial use only under Hobby terms; usage and function limits apply |
| Database | Neon Postgres Free | Managed PostgreSQL compatible with the existing `pg` client and SQL migration direction | Free-tier storage, compute and transfer quotas; not a backup strategy |
| Source control / CI | GitHub Actions + Vercel Git integration | Existing repository and branch-based workflow | Production promotion must be protected and traceable |
| Authentication | Managed OIDC/auth provider, provider selection pending | One allowlisted owner, MFA and account recovery | No production access until end-to-end browser and API auth is verified |
| Object storage | Not selected for first deployment | Avoid introducing a second provider until document workflows are ready | Do not write persistent uploads to a Vercel function filesystem |
| AWS | Retain existing Terraform foundation | Future migration to ECS/Fargate, RDS, S3, KMS, IAM and CloudWatch | No provisioning or Terraform apply in this phase |

**Cost expectation:** target $0/month for the initial personal prototype, not a guarantee of permanent free operation. Provider limits, terms, traffic, storage, AI/model APIs, domain registration, email delivery and external data services may create costs. Check current pricing and usage before enabling each service. Do not enter a paid plan or enable paid usage without owner approval.

### 1.2 Single-owner scope

- One owner identity mapped to ADMIN.
- No public sign-up, invitations, team directory, organizations, tenant administration or collaboration UI.
- Require MFA, secure recovery, short-lived sessions/tokens and explicit owner allowlisting.
- The owner may sign in from their own devices using the same identity.
- Keep identity subject and authorization boundaries stable so additional users can be scoped later.
- Do not add speculative multi-tenant tables or permissions now.

### 1.3 Runtime decision

The current production reference remains the **Vite + React + TypeScript frontend and Node API**. The Vercel target is not a blind deployment of the current Docker Compose stack.

The repository inspection identified material serverless blockers in `server/index.mjs`:

- It creates a long-running `node:http` server rather than exporting a Vercel-compatible request handler.
- It reads and writes JSON files at runtime; Vercel function files are read-only and `/tmp` is temporary, not durable storage.
- It starts an in-process scheduler and invokes child processes for refresh/ingestion work.
- It assumes local files and a persistent process for several data paths.
- The existing Vite proxy is local-development configuration only.

**Required adaptation:** split the current API into Vercel-compatible request handlers (or an explicitly supported Express adapter), move every mutable record and durable job state to PostgreSQL, move document binaries to durable object storage when document uploads are activated, and move recurring/heavy ingestion to an external worker/scheduler. Keep the current local Docker runtime working while this is implemented and tested.

Do not deploy `server/index.mjs` unchanged as a Vercel function. Do not assume a successful static Vite build proves API or data parity.

## 2. Target architecture

```text
Owner browser
    |
    | HTTPS
    v
Vercel Hobby
  - Vite static frontend (initial runtime)
  - /api/* serverless request handlers (after adaptation)
  - preview deployments for validation
    |
    | TLS PostgreSQL connection (pooled URL for serverless)
    v
Neon PostgreSQL
  - canonical structured application data
  - migrations and audit records
  - durable ingestion/job state
    |
    +---- managed OIDC/auth provider (one allowlisted owner + MFA)
    |
    +---- external model API (only if explicitly configured)
    |
    +---- future durable object storage for uploaded documents

GitHub
  - branch / pull request checks
  - Vercel preview deployments
  - protected production promotion

Future migration target (not active):
AWS Route 53 / ACM / ingress -> ECS/Fargate -> private RDS
                                   |             |
                                   +-> S3/KMS ---+
                                   +-> CloudWatch
Terraform remains the infrastructure-as-code source for that future target.
```

## 3. Phase 10 workstreams

### 10.1 — Hosting baseline and deployment architecture

**Decision:** Vercel Hobby + Neon Postgres Free for the first personal deployment, with AWS retained as the future migration target.

Tasks:
- Keep Vite/Node as the current functional baseline; do not switch to the incomplete Next.js/Spring migration stack for this release.
- Confirm the Vercel Hobby use case remains personal/non-commercial and within current platform terms.
- Create a Vercel project connected to the intended GitHub repository and deployment branch.
- Select a Vercel region close to the Neon database region after checking latency; record the selected regions rather than assuming a default.
- Select a Neon region compatible with the chosen Vercel region.
- Define preview vs production environments, production branch, hostname, owner, recovery contact and acceptable downtime.
- Record the current architecture blockers: native Node HTTP server, filesystem writes, scheduler/child-process use, data still read from JSON, AI/document worker separation and authentication gap.
- Estimate costs and set usage alerts/limits where the provider supports them. Treat AI/model APIs and domain registration as separate costs.
- Keep AWS as a documented alternate deployment profile; do not mix AWS and Vercel resources in the initial release.

**Exit:** Vercel/Neon architecture, regions, cost ceiling, deployment branch and known adaptation backlog are recorded and approved.

### 10.2 — Vercel project and hosting foundation

Tasks:
- Configure Vercel project root/build settings for the repository's root Vite application.
- Build command: `npm run build`; output directory: `dist`; install command: `npm ci`.
- Add SPA history fallback/rewrite only after checking existing client-side routes and ensuring `/api/*` is never rewritten to `index.html`.
- Add a minimal health/version endpoint once the API adapter exists.
- Add separate preview and production environment scopes.
- Use HTTPS and Vercel-managed deployment domains initially; attach a custom domain only after owner control and DNS are confirmed.
- Configure function region to be near the selected database region.
- Keep Docker Compose as the local development/test environment; Vercel does not run the current multi-container Compose stack as-is.
- Do not configure a public API route until authentication and authorization are implemented and tested.

**Exit:** reproducible Vercel preview build and route behavior; production domain remains untouched until release approval.

### 10.3 — Runtime configuration and secret management

Tasks:
- Define a documented environment-variable inventory with purpose, scope (preview/production), required/optional status and rotation owner.
- Set database connection strings only in Vercel server-side environment settings; use the provider's pooled connection string for serverless request handlers where appropriate.
- Keep public frontend variables limited to non-secret configuration. Never put database credentials, admin tokens, OIDC client secrets, model keys or worker tokens in `VITE_*` variables.
- Separate database, human login, model API, ingestion worker and document worker credentials.
- Set exact allowed origins, trusted proxy behavior, upload limits, request timeouts and external document-host allowlists.
- Validate missing-variable behavior at build and runtime without printing secret values.
- Add secret rotation and revoke/redeploy steps to the runbook.
- Never commit `.env`, production values, credentials or provider export files.

**Exit:** environment matrix is complete; preview and production settings are separated; secrets are injected at runtime and verified without disclosure.

### 10.4 — Neon PostgreSQL and data migration readiness

Tasks:
- Create one Neon PostgreSQL project and separate production and development/preview branches where the selected plan supports the desired isolation.
- Use pooled connections for serverless handlers; size connection use to the provider limits and avoid opening a pool per request without lifecycle controls.
- Apply the repository's reviewed SQL migrations to an empty development database first.
- Audit all existing reads/writes. Move mutable sources, articles, inventory, timelines, programmes, procurement, documents, history, revisions, operations and audit data into canonical database tables or explicitly documented immutable seed assets.
- Treat JSON files as migration inputs/reference snapshots, not mutable production storage.
- Run the existing import and reconciliation scripts only after verifying they target the selected schema and can safely be re-run.
- Produce a reconciliation report: source counts, row counts by domain, IDs, required fields, duplicates, source URLs, timestamps, verification/review status and unresolved records.
- Test idempotent import, transaction boundaries, migration rollback strategy and restore from a database backup/snapshot.
- Do not import sensitive or operationally restricted data into a third-party free tier until data classification and provider suitability are reviewed.
- Keep a separate export of original JSON inputs and a documented rollback path.

**Exit:** staging data migration and reconciliation pass; production data import remains a separately approved action.

### 10.5 — Single-owner authentication and authorization

Tasks:
- Select a managed identity provider only after checking MFA, recovery, one-user allowlisting, OIDC/JWKS support, session revocation, data region and free-tier terms.
- Configure exactly one owner identity and map it to ADMIN.
- Disable public registration and invitation features.
- Require MFA; test login, logout, expiry, revocation, account recovery and unknown-user denial.
- Implement a browser login client and short-lived token/session handling; do not persist bearer tokens in localStorage.
- Validate issuer, audience, signature, expiry, clock skew and key rotation in the API adapter.
- Protect every private API, ingestion action, admin mutation, document operation and audit route.
- Keep the existing `RAKSHA_ADMIN_TOKEN` as a service/admin operation secret only where required; it is not a replacement for human login.
- Reject requests when auth configuration is absent in production; no wildcard CORS or anonymous admin fallback.
- Keep Spring OIDC support as a future migration asset, but do not enable Spring routing for this Vercel release.

**Exit:** one owner can authenticate end-to-end with MFA; anonymous, unknown and unauthorized requests are denied.

### 10.6 — CI/CD and release controls

Tasks:
- Connect GitHub to Vercel and define preview deployment for pull requests/branch updates.
- Require CI checks before merge: dependency install, formatting, unit tests, TypeScript checks, Vite build, API handler tests, migration checks and security/dependency scan.
- Protect the production branch and require explicit owner approval for production promotion.
- Pin each release to a Git commit and retain the prior known-good deployment.
- Keep preview and production environment variables and databases isolated.
- Prevent preview deployments from receiving production database credentials or production write access.
- Add deployment health checks and smoke tests after promotion.
- Document Vercel rollback to a known-good deployment and database migration compatibility rules.
- Keep the existing AWS ECS workflow intact for future use; do not repurpose it for Vercel or delete it.
- Avoid storing long-lived Vercel tokens in repository files. Use the Vercel Git integration or protected CI secrets only when required.

**Exit:** preview-to-production promotion and rollback are rehearsed without touching production data.

### 10.7 — Single-user application activation

Tasks:
- Configure one owner profile and one ADMIN identity.
- Verify owner access to the intended modules and private API routes.
- Ensure no public sign-up, invitations, user directory, team roles or tenant controls appear.
- Ensure audit events identify the stable owner subject, action, target and timestamp without storing tokens or sensitive request bodies.
- Restrict administrative mutation and ingestion endpoints to the owner.
- Keep future extension limited to identity mapping and centralized authorization; do not build multi-user features now.
- Make the initial production feature set explicit. Modules whose backend/data/auth parity is incomplete remain disabled or read-only rather than silently falling back to unsafe local files.

**Exit:** the owner-only user journey works; no additional account or anonymous access path is exposed.

### 10.8 — Observability, backups and recovery

Tasks:
- Capture structured request logs, deployment version, request IDs, API latency, error rates and database health.
- Redact authorization headers, secrets, prompts, document content, sensitive query parameters and personal data.
- Add owner-facing alert guidance for failed deployments, API errors, database unavailability, quota exhaustion and ingestion failures.
- Verify Neon backup/restore and instant-restore capabilities and limitations for the selected plan; do not treat a free-tier history window as an independent backup.
- Schedule periodic encrypted database exports to a separately controlled location once a durable backup destination is approved.
- Test restoring a backup to a separate database and verify counts and application startup.
- Keep uploaded files out of Vercel function local storage; use approved durable object storage when document uploads are activated.
- Document RPO/RTO as owner-approved objectives, not assumptions.
- Keep AWS CloudWatch, S3 versioning, KMS and RDS backup design documented for the later AWS deployment.

**Exit:** logs are useful and redacted; an independent export/restore path is tested; quota and outage response is documented.

### 10.9 — Release readiness and acceptance

Tasks:
- Run mandatory pre-release checks on the exact candidate commit: clean build, tests, environment validation, authentication, authorization, migration safety, database connectivity, backup readiness and smoke tests.
- Validate frontend routes, API routes, CORS, TLS, security headers, upload boundaries and request timeouts.
- Verify every production API path reads/writes the hosted database or an explicitly approved immutable asset; no required behavior depends on ephemeral local filesystem writes.
- Verify the API adapter has no process-lifetime scheduler assumptions or unsupported child-process dependencies.
- Verify ingestion is disabled until an approved external worker/scheduler and safe execution model are in place.
- Verify document extraction and AI features are either safely deployed as separately authenticated services or clearly disabled.
- Verify data reconciliation and source provenance.
- Review dependency, secret and application security scans; resolve critical/high findings before public exposure.
- Confirm rollback, backup restore, quota monitoring, owner login and incident instructions.
- Broader Phase 9 browser regression, responsive/accessibility, performance and defect-remediation work may continue in a post-deployment stabilization backlog, but critical security, authentication, data integrity and recoverability gates cannot be waived.

**Exit:** owner signs the minimum release checklist; no critical auth, security, data-loss or restore blockers remain.

### 10.10 — Controlled Vercel production deployment and handoff

Tasks:
- Obtain explicit approval for the exact commit, Vercel project, production domain, environment configuration and database branch.
- Confirm the production database is backed up and the migration is compatible with the previous application release.
- Promote the approved Vercel deployment to production; do not use an unreviewed preview deployment as the production release.
- Smoke-test owner login, main routes, API health, core read/write operations, database access and audit events.
- Verify all disabled features are visibly and safely unavailable rather than partially functional.
- Monitor Vercel function logs, runtime errors, database usage, storage, network transfer and AI/API provider costs.
- If acceptance fails, roll back to the previous known-good Vercel deployment; use forward-only or explicitly tested database rollback procedures and never delete production data during incident response.
- Record deployed commit, deployment URL, database migration version, environment-variable names (never values), smoke results, known limitations and open issues.
- After the first deployment, execute the broader Phase 9 regression/browser/performance/reliability campaign and fix issues in a tracked stabilization backlog.
- Keep AWS Terraform and ECS workflow available; a future AWS migration requires its own approved cost, identity, network, database, backup and cutover plan.

**Exit:** production deployment is verified, owner handoff is recorded and post-deployment stabilization backlog is opened.

## 4. Current code adaptation backlog (must be completed before production)

| ID | Required change | Reason | Acceptance evidence |
|---|---|---|---|
| V-01 | Extract API routes into Vercel-compatible handlers or supported Express adapter | Current app starts a native long-running HTTP server | Local handler tests + Vercel preview API smoke |
| V-02 | Remove runtime mutation of repository JSON files | Function filesystem is read-only/ephemeral | All production mutations persist in PostgreSQL |
| V-03 | Move every mutable domain read/write to PostgreSQL | Several current paths still read JSON files directly | Domain-by-domain parity/reconciliation report |
| V-04 | Remove in-process scheduler and child-process assumptions from request runtime | Functions are request-scoped and bounded | Separate worker/scheduler runbook and tests |
| V-05 | Add authenticated owner login and route-level authorization | No real production identity flow is wired | MFA, owner allowlist and negative auth tests |
| V-06 | Configure pooled Neon connection lifecycle | Serverless request concurrency differs from a persistent Node process | Connection/load tests and quota review |
| V-07 | Move document binaries to durable object storage | Local function disk is not durable | Upload/download/authorization/retention tests |
| V-08 | Decide AI/document-worker hosting and safe feature flags | Current FastAPI worker is a separate Compose service | Explicitly enabled service tests or feature disabled |
| V-09 | Replace hourly refresh assumption | Hobby cron scheduling is limited; current scheduler is in-process | Documented external scheduler/worker or manual refresh process |
| V-10 | Add deploy health/version and rollback tests | Deployment must be traceable and reversible | Preview smoke and rollback rehearsal |

Do not mark any item complete solely because the plan exists.

## 5. Free-tier and platform constraints

- Vercel Hobby is a free personal-project tier, not an unrestricted production SLA. Its fair-use terms, function duration/CPU, build, bandwidth and log limits apply. Confirm the current plan terms before public launch.
- Vercel Functions are request-driven serverless functions, not a persistent VM or Docker Compose host. Their filesystem is read-only except temporary scratch storage; temporary files are not durable application storage.
- Vercel Functions do not act as WebSocket servers. Use an external realtime service if a future feature requires WebSockets.
- Vercel Hobby cron is not a substitute for the current hourly in-process scheduler; plan around its schedule restrictions or use an independently approved worker/scheduler.
- Neon Free has finite compute, storage and network-transfer quotas and scales compute to zero after inactivity. A cold database connection/resume may affect first-request latency. Monitor quotas and keep an export/restore path.
- Vercel Hobby terms are for personal, non-commercial use. If the project becomes commercial or needs production-grade guarantees, reassess the plan before that use.
- AI model API usage, domain registration, email, object storage and any separate worker hosting may not be free.
- Never promise zero cost, continuous availability or backup guarantees based only on free-tier selection.

## 6. AWS portability plan

Retain, do not remove, the current `infrastructure/aws/terraform` foundation and manual ECS workflow.

Future AWS target:
- Vercel frontend can be replaced by an approved AWS static/SSR hosting path.
- Neon PostgreSQL can be migrated to private AWS RDS PostgreSQL using tested dump/restore or replication with reconciliation.
- Durable document objects can move to S3 with KMS encryption, versioning and public-access blocking.
- Vercel API handlers can move to ECS/Fargate or another approved AWS compute runtime.
- Managed OIDC identity remains provider-independent.
- GitHub Actions can assume an AWS role via OIDC; no long-lived AWS access keys.
- Terraform remote state, ALB/ingress, ACM, DNS, ECS service/task definitions, egress, WAF/rate limiting, alarms, budgets and RDS restore tests remain required before AWS provisioning.
- No AWS resource creation or Terraform apply is authorized by this plan.

## 7. Single-user access policy

| Capability | Initial policy |
|---|---|
| Accounts | One owner account |
| Role | ADMIN |
| Public sign-up | Disabled |
| Invitations | Disabled |
| MFA | Required |
| Authentication | Managed OIDC/auth provider; final provider selection pending |
| Application data | One owner-operated dataset |
| Audit attribution | Stable owner subject |
| Human/API/AI/worker credentials | Separate identities |
| Future collaborators | Not enabled; scope only when owner requests |

## 8. Execution record

| Sub-phase | Status | Evidence required |
|---|---|---|
| 10.1 Hosting baseline | Decision documented | Owner confirms Vercel/Neon and cost/terms |
| 10.2 Vercel foundation | Planned | Preview deployment and route tests |
| 10.3 Runtime secrets | Pending | Environment matrix and runtime validation |
| 10.4 Neon/data readiness | Pending | Migration, reconciliation and restore report |
| 10.5 Owner identity | Pending | Real MFA/OIDC and negative auth tests |
| 10.6 CI/CD | Pending | Protected promotion and rollback rehearsal |
| 10.7 Single-user activation | Scope decided | Owner-only end-to-end access evidence |
| 10.8 Observability/recovery | Pending | Redacted logs, independent export and restore test |
| 10.9 Release readiness | Pending | Signed safety checklist |
| 10.10 Production deployment | Not authorized | Explicit approval and production smoke evidence |

## 9. Safety rules

- Do not provision or connect external services without the owner's explicit action/approval.
- Do not paste credentials into chat or commit them to Git.
- Do not import production data before backup, classification and reconciliation.
- Do not expose private APIs before owner authentication and authorization are verified.
- Do not treat JSON seed files as a production database or Vercel function storage as durable storage.
- Do not enable ingestion, scheduled jobs, AI or document processing until their hosting, limits, authentication and failure handling are validated.
- Do not delete legacy Vite/Node paths, JSON source snapshots, stashes, AWS Terraform or ECS workflows during the initial Vercel deployment.
- Do not enable Spring routing or replace the Node API with the migration stack without a separate parity and rollback decision.
- Do not claim deployment, data migration, authentication, security, backup, restore or performance is complete without evidence.

## 10. Current result and next execution point

**Completed in this document:** the initial Vercel + Neon direction, single-owner policy, AWS portability boundary, all ten workstreams, Vercel-specific runtime blockers, migration backlog, release gates and rollback expectations.

**Not completed yet:** Vercel project creation, Neon database creation, API adaptation, database migration, owner identity integration, CI/CD activation, production deployment and runtime verification.

**Next implementation sequence:** complete V-01 through V-10 in dependency order while preserving the current local Docker workflow; then create the Vercel preview, migrate and reconcile a staging dataset, complete owner authentication and safety checks, and only then request production deployment approval.

**No external infrastructure has been provisioned and no production deployment has been performed.**
