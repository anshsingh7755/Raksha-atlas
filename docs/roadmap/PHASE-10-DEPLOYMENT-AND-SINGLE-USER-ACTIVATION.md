# Phase 10 — deployment, single-user activation and production readiness

**Branch:** `work/phase-10-deployment`  
**Base:** `work/phase-9-quality-validation`  
**Owner model:** one owner / one administrator account for the initial release  
**Goal:** prepare and validate a secure, maintainable first deployment. Production infrastructure creation and release remain approval-gated.

## 1. Operating decision: single user now, extensible later

Raksha Atlas is initially operated by one person: its owner, who holds the sole administrator account.

Initial scope:
- One owner identity, one administrator account and no public self-registration.
- Private, authenticated application access. Do not expose admin, ingestion, document-management, operational or audit functions to anonymous users.
- One logical application dataset and one production database; no tenant isolation or organization/workspace management is required.
- No invitation flow, team directory, multi-user administration UI, subscription/billing, collaborative editing or team roles in this release.
- The owner may use the application across their own devices through the same identity.
- Keep identity subjects and authorization checks explicit, so future user accounts and least-privilege roles can be introduced without changing domain ownership or data schema.
- Do not build multi-tenant architecture now. If additional people are needed, the owner will request a separately scoped collaboration phase.

**Identity provider decision is still open.** The repository supports OIDC/JWKS validation in the Spring candidate backend, but no real provider or browser login client has been selected/configured. Select a managed OIDC provider only after confirming account ownership, MFA, recovery and cost. Configure one explicitly allowlisted owner identity with MFA and disable public sign-up. Do not ship the current HS256 local compatibility mode as production identity.

**Current implementation boundary:** the active Vite/Node application remains the reference runtime. The Next.js/Spring/FastAPI target is not production-ready merely because its scaffolds and CI builds exist. The owner login must be integrated end-to-end before enabling protected Spring routes or claiming the full site is authenticated.

## 2. Deployment architecture target

Initial target is AWS ECS/Fargate, one application environment, one owner identity and a private PostgreSQL RDS instance. Keep the deployment as small as possible while preserving service isolation.

Target request path:
1. Owner browser connects over HTTPS to the approved application hostname.
2. TLS terminates at an approved ingress/load balancer.
3. OIDC login authenticates the single allowlisted owner; the browser receives only short-lived user tokens/session material through the approved client flow.
4. The application gateway validates identity and authorization.
5. The active application API handles domain operations. Candidate Spring/FastAPI services are activated only after Phase 9/10 parity and security gates pass.
6. PostgreSQL remains private. S3 stores approved document objects with encryption, versioning and public-access blocking.
7. Logs/metrics exclude tokens, prompts, document contents and other sensitive payloads.

Do not assume the existing Terraform foundation is sufficient for public traffic: it currently defines a VPC, public/database subnets, private RDS, S3, KMS, IAM and an ECS cluster, but no application ECS service, ALB, listener, target group, DNS, certificate, WAF, NAT/egress design or deployable task definitions. Design and cost-review those missing components before provisioning.

## 3. Phase 10 workstreams

### 10.1 — Deployment baseline and release target
- Review Phase 9 evidence and unresolved defects.
- Choose initial application runtime and define one canonical production path.
- Keep Vite/Node as the active reference until Next.js/Spring parity is proven; do not run two independent production products.
- Decide AWS account, region, hostname/domain, environment names, data classification and expected availability.
- Produce an architecture and monthly cost estimate, including compute, RDS, storage, load balancer, NAT/egress, identity provider, logs, backups and data transfer.
- Define owner, emergency access, recovery contact and release approver.

**Exit:** approved deployment topology, account/region/domain and cost ceiling.

### 10.2 — AWS infrastructure foundation
- Inspect AWS identity/account and region before any plan or apply.
- Configure remote Terraform state with encryption, versioning, locking and restricted access before shared/production use.
- Validate CIDR overlap, subnet routing, security groups, private database access, outbound egress and availability-zone design.
- Add only required ECS service, task definitions, execution/task roles, ingress, HTTPS listener/certificate, target group, health checks, DNS and optional WAF/rate limits.
- Keep RDS private, encrypted, deletion-protected and backed up. Use S3 public-access block, TLS-only policy, KMS encryption and versioning.
- Set budget alerts and resource tags. Prefer small initial task/database sizing with a documented scale path.
- Run `terraform fmt`, `init`, `validate` and reviewed `plan`; do not apply until account, cost, IAM, network and data-impact review are approved.

**Exit:** approved plan, cost estimate and explicit infrastructure-creation authorization. A successful Terraform plan is not a deployment.

### 10.3 — Runtime configuration and secrets
- Define separate staging/production configuration without committing actual values.
- Store database, admin, OIDC, AI and document-worker credentials in approved secret storage.
- Keep user identity, AI service token and document-worker token separate.
- Never place secrets in frontend `NEXT_PUBLIC_*` variables, source code, image layers, logs or CI artifacts.
- Configure exact allowed origins, API proxy targets, health checks, timeouts, upload limits and trusted document host allowlists.
- Verify container non-root users, resource limits, read-only filesystem where supported and graceful shutdown.

**Exit:** secrets injected at runtime and verified without printing values; service configuration validated.

### 10.4 — Database, migration and data readiness
- Create/verify encrypted PostgreSQL and backup policy.
- Apply reviewed migrations to an isolated staging database first.
- Import approved domain datasets from JSON using dry-run review before any apply.
- Reconcile inventory, sources, programmes, procurement and any other migrated records; verify IDs, counts, required fields, provenance and timestamps.
- Test idempotency and rollback/restore on a disposable environment.
- Keep original JSON data and legacy read paths intact until parity and rollback approval.
- Do not run data import or migration against production until backup and release approval are confirmed.

**Exit:** signed data reconciliation report, migration repeatability and verified restore.

### 10.5 — Single-owner identity and access
- Select a managed OIDC provider; configure one allowlisted owner account only.
- Disable public sign-up, user invitations and self-service role assignment.
- Require MFA and secure account recovery; configure session/token expiry and revocation.
- Integrate the browser login client and short-lived in-memory access-token provider.
- Validate issuer, audience, signature, expiry, clock skew and JWKS key rotation against the real provider.
- Map the single owner to ADMIN; reject unknown identities and role claims.
- Ensure all privileged API routes, operational summaries, document operations and audit access are protected.
- Keep admin service credentials separate from the human login token.
- No multi-user UI or tenant model is needed. Preserve a stable subject identifier and centralized authorization boundary for future expansion.

**Exit:** owner can log in/logout/recover securely; anonymous and unknown users are denied; privileged routes enforce owner authorization; MFA and token revocation are tested.

### 10.6 — CI/CD and deployment controls
- Keep validation CI separate from production deployment.
- Configure GitHub OIDC trust for the approved AWS role; no long-lived AWS access keys.
- Protect staging/production GitHub environments and require human approval for production.
- Pin deployment to an immutable image digest and exact task-definition revision.
- Validate image scan, commit, tests, migrations and configuration before promotion.
- Confirm the existing ECS workflow's deploy/rollback semantics and test it against a non-production ECS service before use.
- Ensure rollback selects a previously known-good task definition and compatible database schema.
- Limit deploy role permissions to the intended cluster/service and resources.

**Exit:** reviewed build-to-staging-to-production promotion and successful staging rollback rehearsal.

### 10.7 — Single-user application activation
- Configure one owner profile and one ADMIN identity.
- Verify the owner can access all intended application modules.
- Verify no anonymous access to private application functions or privileged APIs.
- Do not add team invitations, collaborator roles, organizations, tenant controls or shared workspaces.
- Document the future extension point: new identities, explicit role mapping, audit attribution and least-privilege access review.
- Keep user data model extensible but avoid speculative multi-tenant schema changes.

**Exit:** one owner account works end-to-end and no extra user-management surface is exposed.

### 10.8 — Observability, backup and recovery
- Configure structured logs, metrics and dashboards for application/API health, latency, errors, CPU/memory, DB connections, storage and deployment state.
- Set alert routing and a named operator (the owner initially).
- Redact authorization headers, secrets, prompts, document contents and sensitive query data.
- Configure encrypted automated backups, retention, point-in-time recovery where supported and S3 versioning/lifecycle policy.
- Restore a database backup into a separate isolated database; verify record counts and application startup.
- Rehearse task rollback, secret rotation, credential revocation and incident response.
- Approve RPO/RTO based on actual business need; do not treat draft values in planning documents as approved SLOs.

**Exit:** actionable monitoring and successful documented restore/rollback exercise.

### 10.9 — Release readiness and acceptance
- Run complete automated CI on the exact release commit.
- Run browser route/interaction checks on staging and verify mobile/responsive behavior.
- Verify owner login, MFA, logout, expiry, recovery and denial of unknown users.
- Verify API authorization, CORS, TLS, headers, rate limits and service-token boundaries.
- Verify data reconciliation, AI behavior (if enabled), source provenance, document extraction limits and error handling.
- Review dependency, container, IaC and secret scans; resolve release-blocking findings.
- Review load results, backups, restore, alerts, incident and rollback procedures.
- Confirm domain/DNS/TLS, privacy notice, terms/usage guidance and operational ownership where applicable.

**Exit:** release checklist signed by owner; no unresolved critical/high release blockers.

### 10.10 — Controlled production deployment and handoff
- Obtain explicit approval for the exact commit, image digest, task-definition revision, database migration and production change window.
- Deploy the approved release; wait for ECS service stability and verify target health.
- Smoke-test login, core pages, APIs, database reads/writes, documents and AI only if enabled.
- Monitor logs, errors, latency, resource usage and cost immediately after deployment.
- Keep the prior task definition and legacy fallback available for rollback.
- If acceptance fails, roll back to the last known-good application revision; do not delete data or old infrastructure during incident response.
- Record deployed versions, configuration references (never secret values), test results and open issues.

**Exit:** production deployment is verified and owner handoff is complete. Bugs discovered after go-live are handled in a separate post-deployment stabilization backlog, not hidden or marked as pre-release passes.

## 4. Single-user access policy

| Capability | Initial policy |
|---|---|
| Accounts | One owner account |
| Role | ADMIN |
| Sign-up | Disabled |
| Invitations | Disabled |
| MFA | Required |
| Authentication | Managed OIDC; provider selection pending |
| Application data | One owner-operated dataset |
| Audit attribution | Stable owner subject identifier |
| API credentials | Separate human, AI and worker identities |
| Future collaborators | Not enabled; scope only when owner requests |

## 5. Deployment safety rules

- No AWS resource creation or paid cloud provisioning without explicit approval.
- No Terraform apply, production deployment, DNS cutover or data import against production without explicit approval.
- Never share credentials or paste secret values into chat.
- Do not enable Spring routing, FastAPI AI gateway or Python ingestion by default until parity and rollback gates pass.
- Do not delete legacy Vite/Node paths, JSON sources, stashes or previous task definitions during initial deployment.
- Keep staging and production data/credentials separate.
- Do not claim deployment, security, backup, restore, performance or authentication is complete without recorded evidence.

## 6. Current readiness snapshot

| Area | Repository state | Remaining work |
|---|---|---|
| Active website/API | Vite + Node retained | Decide first production runtime and prove release build |
| Next.js | Migration scaffold and CI checks | Browser parity and production proxy/auth |
| Spring Boot | Candidate backend and OIDC/JWKS support | Real provider, owner token flow, DB parity and runtime |
| FastAPI | Candidate private service | Provider config, service auth, vector data and quality evaluation |
| PostgreSQL | Compose/RDS foundation and migrations | Staging migration, reconciliation and restore |
| AWS | Terraform foundation only | State backend, ingress, ECS service/task, DNS/TLS, cost review |
| CI | Validation workflow and manual ECS workflow | Protected environments, OIDC role, staging deploy/rollback |
| Single-user access | Role policy documented; no real IdP | Select provider, configure one owner identity and MFA |
| Monitoring | Local metrics/monitoring foundations | Production dashboards, alerts and recovery evidence |

## 7. Execution record

| Sub-phase | Status | Evidence |
|---|---|---|
| 10.1 Deployment baseline | Planned | Architecture, runtime and cost approval |
| 10.2 AWS infrastructure | Not provisioned | Reviewed plan and explicit approval |
| 10.3 Runtime configuration | Pending | Secret/config validation |
| 10.4 Database readiness | Pending | Migration, reconciliation and restore report |
| 10.5 Owner identity | Pending | Real OIDC/MFA/authz tests |
| 10.6 CI/CD | Pending | Protected environment and staging rollback |
| 10.7 Single-user activation | Scope decided | One owner ADMIN account end-to-end |
| 10.8 Observability/recovery | Pending | Dashboards, alerts and restore evidence |
| 10.9 Release readiness | Pending | Signed acceptance checklist |
| 10.10 Production deployment | Not authorized | Explicit production approval and smoke tests |

**Current result:** Phase 10 scope and single-user operating model are documented. No cloud resources have been created and no production deployment has been performed.
