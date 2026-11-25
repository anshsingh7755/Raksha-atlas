# Raksha Atlas security review baseline

This checklist is a threat-model starting point, not a completed penetration test or security certification.

## Assets and trust boundaries

Public website and public-source content; authenticated analyst/admin identities; PostgreSQL and pgvector; original documents and AI responses; model/database/service credentials; build artifacts, Terraform state and deployment identities.

## Required controls

| Area | Control / evidence required |
|---|---|
| Identity | Approved OIDC provider; issuer/audience/role tests; short-lived credentials |
| Service identity | Separate JWT, AI and document-worker secrets; independent rotation |
| Network | Private database; no public DB/Redis/FastAPI ports; narrow ingress |
| Data | TLS in transit; KMS encryption at rest; S3 public access blocked and versioning enabled |
| Secrets | Secrets Manager; no credentials in Git, image layers, logs, CI output or Terraform variables |
| Application | Input validation, authorization tests, edge rate limits, SSRF and upload controls |
| AI/RAG | Retrieved text treated as untrusted; prompt-injection tests; citation checks; no prompt logging |
| Supply chain | Dependency/container vulnerability scans; image provenance |
| Audit | Protected access/deployment/database audit events with retention |
| Recovery | Encrypted backups; isolated restore tests; approved RPO/RTO and ownership |

## Release blockers

- Critical/high exploitable vulnerabilities unresolved.
- Public database endpoint or broad database ingress.
- Secrets or sensitive content in source, logs, metrics, traces or artifacts.
- Missing authorization on protected domain/AI routes.
- Unreviewed Terraform plan or unapproved IAM wildcard.
- Backup restore or rollback rehearsal fails.

Record reviewer, date, commit/image digest, scanner versions, findings, severity, owner, remediation, accepted exceptions and sign-off in Phase 10. CI success alone does not complete this review.
