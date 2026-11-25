## Simple explanation

This document explains where identity checks and security rules belong in the target backend.

The backend must check who is making a request, whether the token is valid and which actions the user's role allows. Internal AI service credentials are separate from user login tokens and must never be sent to the browser.

The document also describes audit records, role boundaries and the checks needed before a real identity provider can be used in production.

# Phase 6 — security, identity, authorization and audit

## Enforcement architecture
Spring Boot is the policy enforcement point. It accepts stateless bearer tokens, validates signature, issuer, audience and time, then maps only the allowlisted VIEWER, ANALYST and ADMIN roles. FastAPI remains private behind the Spring gateway. The browser never receives service credentials.

## Identity modes
- `RAKSHA_JWT_MODE=hs256`: local compatibility mode requiring a 32-byte minimum `RAKSHA_JWT_SECRET`; do not use this shared-secret model as the production IdP integration without formal approval.
- `RAKSHA_JWT_MODE=oidc`: uses `RAKSHA_JWT_ISSUER_URI` over HTTPS and issuer discovery/JWKS signature verification. The configured `RAKSHA_JWT_AUDIENCE` is still enforced.

OIDC mode must be tested against the selected provider's real issuer metadata, signing-key rotation, token claims, clock skew and audience before production use. No provider is selected or provisioned here.

## Role and privilege policy
| Role | Domain reads | AI answer | Security audit | User/role administration |
|---|---:|---:|---:|---:|
| VIEWER | Yes | Yes | No | No |
| ANALYST | Yes | Yes | No | No |
| ADMIN | Yes | Yes | Yes (read-only) | No |

The identity provider owns user lifecycle, MFA, group-to-role mapping, joiner/mover/leaver processes and privileged access reviews. The application does not expose role assignment or account provisioning endpoints.

## Audit trail
Flyway V4 creates `security_audit_events`. Mutations and rejected API requests are recorded with actor subject, roles, method, bounded route, status and optional validated correlation ID. Bodies, query strings, bearer tokens, source text and client IP are excluded. The application exposes a bounded ADMIN-only read endpoint. Database-level append-only privileges, retention, export, tamper evidence and failure policy are deployment controls still requiring approval.

## API and perimeter controls
Exact-origin CORS is configured by `RAKSHA_ALLOWED_ORIGINS`; credentials are not allowed cross-origin. Security headers include frame denial, content-type nosniff, referrer policy and HSTS. Rate limiting and WAF policy belong at the deployment edge once public ingress and traffic budgets are defined; no in-process limiter is represented as production DDoS protection.

## Secret and key handling
User JWT validation, AI service authentication and document-worker authentication are separate trust domains. Production secrets belong in Secrets Manager and must not be embedded in frontend builds, Docker layers, source files or logs. KMS key rotation is enabled in the infrastructure foundation. Rotation, expiry/revocation, emergency key rollover and least-privilege IAM require a rehearsal before release.

## Phase 10 acceptance
Real IdP/JWKS tests, MFA, role lifecycle, audit immutability/retention, secret rotation, WAF/rate limits, dependency/container scans, penetration tests, incident exercises and security sign-off remain mandatory before production cutover.
