# Docker and deployment

Docker and deployment configuration is split by purpose:

- [Docker service boundaries](../../infrastructure/docker/README.md) — root Dockerfile, Compose services and optional profiles.
- [Infrastructure guide](../../infrastructure/README.md) — local runtime, cloud and operations.
- [AWS deployment boundary](../../infrastructure/aws/README.md) — Terraform foundation and approval requirements.
- [Nginx deployment config](../../deploy/README.md) — legacy reverse proxy.
- [Run and deploy](../RUN-AND-DEPLOY.md) — practical local commands and deployment notes.

The root `Dockerfile`, `docker-compose.yml`, `vercel.json` and `api/` adapter are consumed by build/deployment tools. Do not rename them casually.
