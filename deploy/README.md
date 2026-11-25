# Legacy Nginx deployment configuration

This folder contains the Nginx reverse-proxy configuration used by the legacy container deployment.

- `nginx.conf` serves the built single-page website.
- Requests under `/api/` are forwarded to the Node API service named `api` on port `8787`.

The active Vercel deployment uses the root `vercel.json` and `api/` adapter instead. This Nginx file is retained for the Docker-based runtime; it is not the Vercel configuration.

If you change service names, ports or routes, update and validate the matching Docker Compose configuration too. See [Docker service boundaries](../infrastructure/docker/README.md).
