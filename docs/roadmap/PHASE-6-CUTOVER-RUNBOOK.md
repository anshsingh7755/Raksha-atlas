## Simple explanation

Phase 6 adds security foundations: login-token validation, roles, audit records, safe API defaults and security checks.

Security code is only one part of a secure system. A real identity provider, MFA, key rotation, production ingress protection and security exercises still need environment-specific setup and evidence.

# Phase 6 security implementation and acceptance runbook

## Implemented: 6.1–6.10
- 6.1 Threat model and trust-boundary register.
- 6.2 Stateless JWT validation, explicit HS256 local mode and OIDC issuer/JWKS mode; trusted role claims are restricted to VIEWER, ANALYST and ADMIN.
- 6.3 Flyway audit event table, mutation/rejection capture and ADMIN-only bounded read endpoint.
- 6.4 Exact-origin CORS, security response headers and bounded audit query.
- 6.5 Regression tests for role isolation, audit access, JWT mode selection and security headers.
- 6.6 OIDC discovery/JWKS decoder support through HTTPS issuer URI and audience validation.
- 6.7 Documented least-privilege role policy and identity-provider-owned user lifecycle/MFA/privileged access governance. No local role assignment endpoint is exposed.
- 6.8 Documented separation of user, AI and document-worker credentials; KMS automatic rotation is already enabled in the Phase 5 Terraform foundation. Operational secret/key rotation remains to be rehearsed.
- 6.9 Added scheduled CodeQL analysis for Java, JavaScript/TypeScript and Python. Rate limiting/WAF is an ingress control and remains deployment-dependent; no in-process limiter is presented as DDoS protection.
- 6.10 Added security release checklist and Phase 10 evidence gates; no penetration test or security certification is claimed.

## Local configuration
HS256 compatibility mode:
- `RAKSHA_JWT_MODE=hs256`
- `RAKSHA_JWT_SECRET` must contain at least 32 bytes.

OIDC candidate mode:
- `RAKSHA_JWT_MODE=oidc`
- `RAKSHA_JWT_ISSUER_URI` must be an HTTPS issuer URI with OIDC discovery/JWKS support.
- `RAKSHA_JWT_AUDIENCE` must exactly match the API audience in issued tokens.

Set exact comma-separated browser origins in `RAKSHA_ALLOWED_ORIGINS`. Keep AI service and document worker tokens independent. Do not commit local environment files or use local secrets in production.

## Validation commands
```powershell
mvn -B -f backend/pom.xml test
docker compose --profile migration config --quiet
docker build -t raksha-atlas-next-test -f frontend/Dockerfile .
```

## Phase 10 acceptance checklist
- [ ] Select and approve the real identity provider; validate issuer metadata, JWKS signature, audience, expiry, clock skew and signing-key rotation.
- [ ] Verify MFA, account lifecycle, group-to-role mapping, joiner/mover/leaver and privileged-access reviews.
- [ ] Test the complete VIEWER/ANALYST/ADMIN authorization matrix against the real provider.
- [ ] Configure database permissions so application identities cannot update/delete audit events; set retention, export, alerting and tamper-evidence.
- [ ] Rehearse secret rotation, emergency revocation and KMS key recovery; verify IAM scope and secret delivery to runtime.
- [ ] Configure edge rate limits/WAF after ingress and traffic budgets are approved; test abuse thresholds and safe throttling.
- [ ] Run dependency, container, IaC and secret scans; triage and resolve release-blocking findings.
- [ ] Conduct penetration tests, SSRF/upload abuse tests, incident-response exercise and security reviewer sign-off.
- [ ] Validate audit behavior during database outages and approve fail-open/fail-closed semantics.
- [ ] Complete deployment rollback rehearsal and explicit release approval.

## Release boundary
No production IdP, credentials, MFA, user provisioning or public route change is activated by this phase. The current Vite/Node path remains active. OIDC code support and CodeQL workflow do not constitute live provider verification or a security certification. Do not expose the candidate Spring API publicly until Phase 10 acceptance and explicit approval.
