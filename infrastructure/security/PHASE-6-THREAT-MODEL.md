## Simple explanation

A threat model is a list of things that could go wrong, what they could affect and which controls reduce the risk.

This register focuses on Raksha Atlas assets such as login tokens, privileged roles, audit records, public-source content, APIs, databases and service credentials. It also records what still needs to be tested.

A control being written in code is not the same as proving it works in production. The remaining verification column is important and must not be marked complete without evidence.

# Phase 6 threat model and abuse-case register

| Asset | Threat | Control | Remaining verification |
|---|---|---|---|
| Identity tokens | Forged, expired, wrong-issuer or wrong-audience JWT | Signature, issuer, audience and time validation; OIDC JWKS mode supported | Validate against approved IdP in Phase 10 |
| Privileged roles | Client role escalation | Roles accepted only from signed claims and restricted to VIEWER, ANALYST, ADMIN | Real IdP claim mapping and full matrix |
| Audit trail | Privilege abuse, missing events or sensitive data leakage | Minimal audit schema; no request body, query string, token, source content or client IP | DB append-only grants, retention, export and tamper-evidence |
| Public-source content | Prompt injection or malicious markup | Treat retrieved content as untrusted; evidence-only AI workflow | Adversarial corpus and UI output review |
| API perimeter | Cross-origin abuse, malformed input and request floods | Exact-origin CORS, bounded request contracts, security headers | Ingress/WAF limits and penetration tests |
| Secrets and service identities | Credential leakage or excessive privilege | Separate user, AI and document-worker tokens; Secrets Manager and KMS | Rotation drills and runtime IAM verification |
| Document processing | SSRF, malicious files and parser exhaustion | Existing HTTPS/public-host checks, file/page limits and isolated worker | Adversarial SSRF/file tests |
| Infrastructure | Public database or broad cloud permissions | Private RDS, scoped security groups and IAM, encrypted storage | Terraform plan review and cloud posture scan |

## Privileged access policy
- VIEWER: read domain APIs and use the AI answer endpoint; no audit or administrative controls.
- ANALYST: same current API capabilities as VIEWER; no administrative audit access.
- ADMIN: current domain/AI capabilities plus read-only security audit access. No user or role mutation endpoint is implemented.
- Roles are supplied by a trusted signed token; the frontend must never decide or submit authoritative roles.
- Use named individual identities, MFA, least privilege, time-bounded elevation and periodic access review at the identity-provider layer.

## Abuse cases
1. Altering a role claim invalidates the token signature.
2. A VIEWER or ANALYST requests `/api/admin/audit` and receives 403.
3. An untrusted Origin receives no CORS permission.
4. A malformed or oversized API request is rejected and recorded without sensitive request data.
5. Retrieved document instructions are treated as evidence text, not system policy.
6. A production token must validate through OIDC discovery/JWKS and the configured audience.

This document is a threat-model baseline, not a penetration-test report, compliance certification or security sign-off.
