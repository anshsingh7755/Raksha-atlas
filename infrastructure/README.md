# Infrastructure — how the application runs

## 1. What is infrastructure?

Infrastructure is the supporting environment that lets software run: containers, networks, databases, cloud resources, monitoring and deployment workflows.

The application code is mainly in `src/` and `server/`. Infrastructure files describe how those services are packaged and operated.

## 2. Local runtime

The repository includes these important runtime files:

| File/folder | Purpose |
|---|---|
| Root `Dockerfile` | Builds the current website/API container image. |
| `docker-compose.yml` | Starts the local multi-service stack. |
| `deploy/nginx.conf` | Routes browser requests to the website and Node API in the legacy container setup. |
| `backend/Dockerfile` | Candidate Spring Boot container. |
| `frontend/Dockerfile` | Candidate Next.js container. |
| `ai/Dockerfile` | FastAPI document/AI service container. |

The default runtime and optional profiles are defined in `docker-compose.yml`. Always inspect that file for exact service names, ports, required environment variables and profiles.

## 3. Common Compose commands

Check the configuration:

```powershell
docker compose config --quiet
```

Start the default stack:

```powershell
docker compose up --build
```

Optional profiles may be available for migration services, cache or monitoring:

```powershell
docker compose --profile migration up --build
docker compose --profile cache up --build
docker compose --profile monitoring up --build
```

A profile starts additional services; it does not automatically make them the active website/API path.

## 4. Monitoring

The monitoring foundation includes Prometheus and Grafana. FastAPI can expose metrics, and optional OpenTelemetry configuration can export traces.

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

These local endpoints are intended for local development. Production monitoring needs access control, TLS, retention rules, alert routing and approved secret storage.

Never put prompts, document bodies, tokens or personal information into metric labels.

## 5. Cloud infrastructure

The `aws/` folder contains a Terraform foundation for resources such as networking, private PostgreSQL, S3, ECS, KMS, CloudWatch and Secrets Manager.

This is infrastructure code, not proof that those resources have been deployed. The current AWS design is a foundation and still needs reviewed application service, ingress, networking and operational configuration.

Read [the AWS deployment boundary](aws/README.md) before using Terraform.

## 6. Security and operations

- `security/` contains security review and threat-model documents.
- `operations/` contains load, backup and recovery plans.
- `monitoring/` contains Prometheus/Grafana configuration.
- `docker/` explains which container belongs to which service.

## 7. Safe operating rules

1. Keep secrets outside source control.
2. Do not expose database, Redis or internal service ports publicly by default.
3. Inspect the Compose configuration before starting optional profiles.
4. Use a local development environment for experiments.
5. Run Terraform plan and review cost, network and IAM changes before apply.
6. Test database restore and service rollback.
7. Do not claim infrastructure is deployed until the cloud environment and service health have been verified.# Raksha Atlas infrastructure

## Local runtime

Root deployment files remain the stable legacy runtime:

- `Dockerfile` — Vite static site and Node API images
- `docker-compose.yml` — default Vite/Node + PostgreSQL + FastAPI worker stack
- `deploy/nginx.conf` — legacy web/API proxy

Optional profiles:

```bash
docker compose up --build
docker compose --profile migration up --build
docker compose --profile cache up --build
docker compose --profile monitoring up --build
```

Monitoring profile: Prometheus at localhost:9090 and Grafana at localhost:3001. Set `GRAFANA_ADMIN_PASSWORD` in local ignored `.env`.

## Cloud and operations

- `aws/terraform/` — VPC, private RDS, S3, ECS, KMS, Secrets Manager and IAM foundation; plan only until approved.
- `docker/README.md` — service image boundaries.
- `monitoring/` — Prometheus, Grafana and optional OpenTelemetry.
- `security/SECURITY-REVIEW.md` — security review checklist.
- `operations/` — load and recovery plan.

The initial AWS target is ECS/Fargate, not EKS. No cloud infrastructure is deployed by CI.
