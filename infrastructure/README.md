# Raksha Atlas infrastructure

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
