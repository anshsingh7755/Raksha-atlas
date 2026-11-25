# Raksha Atlas infrastructure

## Local runtime

Root deployment files remain the stable legacy runtime:

- `Dockerfile` — Vite static site and Node API images
- `docker-compose.yml` — default Vite/Node + PostgreSQL + FastAPI worker stack
- `deploy/nginx.conf` — legacy web/API proxy

Optional Compose profiles are documented in [Docker service boundaries](docker/README.md):

```bash
docker compose up --build
docker compose --profile migration up --build
docker compose --profile cache up --build
```

## Cloud infrastructure

- `aws/terraform/` — configurable AWS VPC, security groups, private RDS, S3, ECS cluster and IAM foundation. Plan only until approved.
- `aws/README.md` — account, security and cost guardrails.
- `docker/README.md` — service image boundaries.

The initial AWS target is ECS, not EKS. Kubernetes manifests and Helm are deferred until operational scale justifies them. No infrastructure is deployed by CI.
