# Phase 6 security implementation and acceptance runbook

## Implemented in 6.1–6.5
1. Review the threat model at [PHASE-6-THREAT-MODEL.md](../../infrastructure/security/PHASE-6-THREAT-MODEL.md).
2. Keep Spring Security stateless and bearer-token based; only signed `roles` claims from the configured token are trusted. The accepted role set is `VIEWER`, `ANALYST`, `ADMIN`.
3. Apply Flyway V4 to create the security audit event table. The backend records mutation attempts and rejected API requests, excluding request bodies, query strings, bearer tokens, source content and client IP.
4. Configure exact-origin CORS with `RAKSHA_ALLOWED_ORIGINS`, security response headers and an ADMIN-only audit read endpoint.
5. Run backend tests and the complete CI workflow.

## Local configuration
Set `RAKSHA_JWT_SECRET` to a local-only value of at least 32 bytes, plus exact comma-separated browser origins in `RAKSHA_ALLOWED_ORIGINS`. Do not commit `.env` files or use local secrets in production. Keep AI service and document worker tokens independent.

## Validation commands
```powershell
mvn -B -f backend/pom.xml test
docker compose --profile migration config --quiet
```

## Deferred to Phase 10
- Configure and verify the approved OIDC issuer/JWKS asymmetric signing keys, MFA and account lifecycle.
- Verify role claims issued by the real identity provider; the current HS256 decoder is a local compatibility bridge, not the final production identity architecture.
- Validate exact production CORS origins, TLS termination and security headers through the deployed ingress.
- Confirm audit table privileges are append-only for the application identity; define retention, export, alerting and tamper-evidence.
- Run penetration tests, dependency/container scans, SSRF/upload abuse tests, authorization matrix tests and incident-response exercises.
- Confirm audit persistence behavior during database outages and decide fail-closed/fail-open policy.
- Obtain security reviewer sign-off. CI success is not security certification.

## Release boundary
No production identity provider, credentials, user provisioning or production route change is created by this phase. The existing Vite/Node path remains active. Do not expose the candidate Spring API publicly until Phase 10 acceptance and explicit release approval.
