# Phase 5 — Infrastructure foundation and cutover runbook

## Scope

This runbook covers the implementation foundations for local containers, build validation, CI and AWS infrastructure as code. It does not authorize a production deployment or a migration cutover.

## 5.1 Local Compose

Default stack remains the current Vite/Node website, API, FastAPI document worker and PostgreSQL:

```bash
docker compose up --build
```

Optional profiles:
- `docker compose --profile migration up --build` adds the Spring Boot candidate API.
- `docker compose --profile cache up --build` adds Redis for cache experiments.
- PostgreSQL, Redis, Spring Boot and FastAPI are not published to host ports by default.

Required local `.env` values include `DB_PASSWORD`, `RAKSHA_ADMIN_TOKEN`, and (for the migration profile) a unique local-only `RAKSHA_JWT_SECRET` of at least 32 characters. Do not reuse production credentials.

## 5.2 Container boundaries

- Root `Dockerfile`: legacy Vite/Node runtime, retained.
- `backend/Dockerfile`: Java 21 multi-stage Spring Boot image with non-root runtime and health check.
- `ai/Dockerfile`: Python FastAPI extraction service with non-root runtime and health check.
- `frontend/Dockerfile`: Next.js standalone image; candidate only.

The Next.js container is not part of the default Compose stack. Its API proxy target must be set for its deployment network. Do not change active website routing in this phase.

## 5.3–5.4 Automated gates

GitHub Actions validates:
- Spring Boot Maven tests, Node tests and Next.js route/API tests;
- Vite and Next.js production builds and Next.js type checking;
- Python ingestion and AI worker tests;
- Docker Compose configuration;
- AI, Spring Boot and Next.js container image builds;
- Terraform formatting and static validation.

CI image builds are not deployments. Runtime health, database integration, browser parity and load testing remain Phase 10 acceptance work.

## 5.5 AWS Terraform foundation

Path: `infrastructure/aws/terraform`.

Resources defined:
- VPC, two public subnets and two isolated database subnets;
- internet gateway and public route table;
- task/database security groups (database ingress only from ECS task security group);
- encrypted private PostgreSQL 17 RDS with seven-day backups and deletion protection enabled by default;
- versioned, encrypted S3 bucket with public access blocked;
- ECS cluster with Container Insights;
- ECS execution role and narrowly scoped S3 document task policy.

Intentionally not defined: NAT gateway, public load balancer, ECS application service, DNS, WAF, Secrets Manager values, production secret rotation, or any actual deployment. Review these with the deployment topology and cost model before extending the stack.

### Terraform safety sequence

```bash
cd infrastructure/aws/terraform
cp terraform.tfvars.example terraform.tfvars
# Replace the example database password locally.
terraform init
terraform fmt -check -recursive
terraform validate
terraform plan
```

Never commit `terraform.tfvars`, state files, credentials or plan files containing secrets. State must move to an encrypted, versioned and locked remote backend before team/production use. Do not run `terraform apply` without explicit account, budget, security and release approval.

## Phase 10 acceptance gates

- Start each Compose profile on a clean local Docker host; verify health and logs.
- Confirm legacy Vite/Node routes and data remain unchanged.
- Verify Spring Boot connects to PostgreSQL and migrations are repeatable.
- Validate container vulnerability reports, non-root users, image size and secret handling.
- Run full Terraform plan review in a non-production AWS account; confirm CIDR design, IAM boundaries, encryption, backup restore, deletion protection and estimated cost.
- Add deployment service, ingress, secrets, alarms and rollback only after approved architecture.
- Perform backup restore, recovery, load, security and rollback exercises.
- Obtain explicit approval before any frontend/API/RAG cutover.
