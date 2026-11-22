# Raksha Atlas infrastructure

The current deployment files remain at the project root:

```text
Dockerfile
docker-compose.yml
deploy/nginx.conf
```

This folder is the future home for deployment code:

```text
infrastructure/
├── docker/       service-specific Dockerfiles and compose helpers
├── aws/          ECS, RDS, S3, Bedrock and IAM configuration
├── terraform/    reusable infrastructure definitions
├── kubernetes/   future EKS manifests and Helm charts
└── monitoring/   OpenTelemetry, Prometheus and Grafana configuration
```

## Current local deployment

```powershell
docker compose up --build
```

The existing Compose stack provides:

```text
web → api → PostgreSQL
```

Do not move or duplicate the root deployment files until the new service
containers are ready and tested.
