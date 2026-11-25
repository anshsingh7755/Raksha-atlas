# Nginx deployment configuration

## What is Nginx?

Nginx is a web server that can serve the built frontend and forward API requests to another service. Forwarding requests is called a reverse proxy.

This folder contains the Nginx configuration used by the legacy Docker deployment. It is not the Vercel API configuration.

## Main file

- `nginx.conf` — listens for browser traffic, serves the built website and forwards API requests.

## How requests flow

```text
Browser
  |
  v
Nginx web container
  |
  +--> Website files (HTML, CSS, JavaScript)
  |
  +--> /api/... request
          |
          v
      Node API service on port 8787
```

The proxy uses the Compose service name `api`. That name must match the service definition in the root `docker-compose.yml`.

## Nginx versus Vercel

- Docker deployment: Nginx uses this folder's `nginx.conf`.
- Vercel deployment: root `vercel.json` and `api/[...path].mjs` route the application.

Do not edit one configuration and assume the other deployment path has changed.

## Safe changes

If you change the API service name, port or route:
1. Check `docker-compose.yml`.
2. Update the proxy target if needed.
3. Run `docker compose config --quiet`.
4. Start the local stack and test both a website page and an API endpoint.

Keep security headers and request-size limits unless a reviewed change requires otherwise.
