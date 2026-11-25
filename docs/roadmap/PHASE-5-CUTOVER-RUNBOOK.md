## Simple explanation

Phase 5 prepares the containers and cloud infrastructure needed to run the services. It includes Docker Compose for local development and a Terraform foundation for a possible AWS deployment.

Having a Dockerfile or Terraform plan does not mean the service is deployed. This runbook explains what exists and what still needs approval, environment setup and operational testing.

# Phase 5 — Infrastructure foundation and cutover runbook

## Scope

Phase 5.1–5.10 implementation foundations are committed. This runbook does not authorize production deployment, Terraform apply or migration cutover. Local runtime, cloud and recovery acceptance remain Phase 10 gates.

## 5.1 Local Compose

Default stack remains the current Vite/Node website, API, FastAPI document worker and PostgreSQL:

```bash
docker compose up --build
```

Optional profiles:
- `docker compose --profile migration up --build` adds the Spring Boot candidate API.
- `docker compose --profile cache up --build` adds Redis.
- `docker compose --profile monitoring up --build` adds Prometheus and Grafana on localhost ports 9090 and 3001.

Required local `.env` values include `DB_PASSWORD`, `RAKSHA_ADMIN_TOKEN`, and (for the migration profile) a unique local-only `RAKSHA_JWT_SECRET` of at least 32 characters. Monitoring requires a unique local `GRAFANA_ADMIN_PASSWORD`. Do not reuse production credentials.

## 5.2 Container boundaries

- Root `Dockerfile`: legacy Vite/Node runtime, retained.
- `backend/Dockerfile`: Java 21 multi-stage Spring Boot image with non-root runtime and health check.
- `ai/Dockerfile`: Python FastAPI service with non-root runtime and health check.
- `frontend/Dockerfile`: Next.js standalone image; candidate only.

The Next.js container is not part of the default Compose stack. Do not change active website routing in this phase.

## 5.3–5.4 Automated gates

GitHub Actions validates Spring Boot Maven tests, Node tests, Next.js route/API tests, Vite and Next.js builds, Python ingestion/AI tests, Compose configuration, service image builds, and Terraform formatting/static validation. CI image builds are not deployments.

## 5.5–5.6 AWS, secrets and recovery controls

Terraform path: `infrastructure/aws/terraform`.

Defined foundations:
- VPC, public subnets, isolated database subnets and security groups;
- private PostgreSQL 17 RDS with KMS encryption, managed master password in Secrets Manager, configurable 7–35 day automated backups, backup/maintenance windows and deletion protection;
- S3 with KMS encryption, versioning, public-access blocking and TLS-only bucket policy;
- KMS key rotation, CloudWatch log group retention, ECS cluster and least-privilege IAM roles;
- Secrets Manager application-secret placeholder with a 30-day recovery window.

The application secret is intentionally not populated. No application ECS service, load balancer, NAT gateway, DNS, WAF or production deployment is created. The Terraform state backend must be configured separately with encryption, versioning and locking before team/production use.

### Terraform safety sequence

```bash
cd infrastructure/aws/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform fmt -check -recursive
terraform validate
terraform plan
```

Review the selected AWS account, region, CIDRs, cost, IAM, backup policy and deletion protection. Do not run `terraform apply` without explicit account, budget, security and release approval.

## 5.7 Deployment and rollback

`.github/workflows/deploy-ecs.yml` is a manual, protected workflow. It requires:
- selected GitHub environment with required reviewers configured;
- environment variables `AWS_REGION`, `AWS_DEPLOY_ROLE_ARN`, `ECS_CLUSTER` and `ECS_SERVICE`;
- an exact reviewed ECS task-definition ARN;
- explicit `confirm_execution=true`.

The workflow uses GitHub OIDC, not long-lived AWS keys, then updates the ECS service and waits for stability. For rollback, supply the last known-good task-definition ARN and choose `rollback`. No ECS service exists in the Terraform foundation yet, so the workflow remains unconfigured and cannot deploy until the service and protected environment are approved.

## 5.8 Observability

FastAPI exposes Prometheus metrics at `/metrics`; optional OpenTelemetry traces export over OTLP HTTP when `OTEL_EXPORTER_OTLP_ENDPOINT` is set. Prometheus and Grafana are local opt-in Compose services. No prompts, documents, tokens or raw query strings should be captured. Production alert thresholds and SLOs require measured baselines.

## 5.9 Security, load and recovery

- Security checklist: `infrastructure/security/SECURITY-REVIEW.md`.
- Load/recovery plan: `infrastructure/operations/LOAD-AND-RECOVERY-PLAN.md`.
- k6 smoke profile: `infrastructure/operations/k6-health-smoke.js`.
- PostgreSQL backup/restore helpers: `scripts/ops/`.

These are implementation aids, not evidence that a penetration test, load test or recovery exercise has passed. Execute only against isolated non-production systems and record evidence in Phase 10.

## 5.10 ECS versus EKS

Decision: ECS/Fargate for the initial deployment. EKS/Helm is deferred until measured workload, multi-team, platform or Kubernetes-specific requirements justify the added operational burden. See `docs/architecture/PHASE-5-ECS-DECISION.md`.

## Phase 10 acceptance gates

- Start every Compose profile on a clean Docker host; verify health, metrics and logs.
- Confirm legacy Vite/Node routes and data remain unchanged.
- Verify Spring Boot/PostgreSQL integration and migration repeatability.
- Scan containers/dependencies and review IAM, TLS, KMS, Secrets Manager and logs.
- Review a non-production Terraform plan and cost estimate; apply only after approval.
- Configure and test ECS deployment/rollback against a real approved service.
- Restore PostgreSQL backup into an isolated database and reconcile records.
- Perform approved load, security and recovery exercises.
- Obtain explicit release approval before any frontend/API/RAG cutover.
