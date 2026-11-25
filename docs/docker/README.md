# Docker and deployment documentation

## What is covered here?

This folder is the starting point for understanding how Raksha Atlas is packaged and deployed.

## Read these guides

- [Docker service boundaries](../../infrastructure/docker/README.md) — which Dockerfile belongs to which service and how Compose profiles work.
- [Infrastructure overview](../../infrastructure/README.md) — local runtime, cloud resources, monitoring and operations.
- [AWS deployment foundation](../../infrastructure/aws/README.md) — Terraform resources and approval requirements.
- [Nginx configuration](../../deploy/README.md) — legacy Docker reverse proxy.
- [Run and deploy](../RUN-AND-DEPLOY.md) — exact local commands and deployment checks.

## Important difference

Docker describes how to package and run containers. Vercel describes the current hosted website path. AWS Terraform describes a separate cloud infrastructure foundation.

These are different deployment paths. A change to one does not automatically update the others. Check the configuration and test the exact path you intend to use.
