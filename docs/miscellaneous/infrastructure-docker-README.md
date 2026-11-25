# Docker — containers and service boundaries

## 1. What is Docker?

Docker packages an application and the files it needs into an image. A container is a running instance of that image.

Docker Compose is used to start multiple containers together, such as a website, API and database.

## 2. Which Dockerfile belongs to which service?

| Dockerfile | Service | Role |
|---|---|---|
| Root `Dockerfile` | Current Vite website and Node API runtime | Existing application container path |
| `backend/Dockerfile` | Spring Boot / Java | Migration candidate |
| `ai/Dockerfile` | FastAPI / Python | Supporting AI and document service |
| `frontend/Dockerfile` | Next.js | Migration candidate |

These images are not interchangeable. Each has its own runtime and build process.

## 3. Compose profiles

The root `docker-compose.yml` describes the services and optional profiles. The available profile names in the current configuration include migration, cache and monitoring.

Start the default stack:

```powershell
docker compose up --build
```

Start an optional profile:

```powershell
docker compose --profile migration up --build
docker compose --profile cache up --build
docker compose --profile monitoring up --build
```

Check the actual Compose file before relying on a profile. Optional services do not automatically replace the active Node/Vite request path.

## 4. Validate before starting

```powershell
docker compose config --quiet
```

This checks whether Compose can read and expand the configuration. It does not start containers or prove that services can connect successfully.

## 5. Ports and network safety

Database, Redis, Spring Boot and FastAPI services should remain on the private Compose network unless a reviewed local development need requires a host port. Monitoring interfaces should bind to localhost for local use.

Do not publish internal databases or service tokens to the public internet.

## 6. Environment variables

Use an ignored local `.env` file for required values. The exact variables are defined by `.env.example`, Compose and each service's configuration.

- Use unique local passwords.
- Do not reuse production credentials.
- Never commit `.env`.
- Do not paste secrets into screenshots or logs.

## 7. Stop services safely

Stop the foreground stack with `Ctrl+C`, or run:

```powershell
docker compose down
```

Do not add `-v` unless you intentionally want to delete persistent volumes, including a local database volume.

## 8. Troubleshooting

- If Compose reports a missing variable, check `.env.example` and the error message.
- If a container exits, inspect `docker compose ps` and `docker compose logs <service>`.
- If one service cannot reach another, check the Compose service name and internal port.
- If a port is already used, identify the local process before changing the port mapping.
- If a build fails, inspect the Dockerfile for that specific service rather than changing the root Dockerfile blindly.# Service container boundaries

- Root `Dockerfile`: current Vite static site and Node API. Keep as stable legacy runtime until Phase 10 cutover approval.
- `backend/Dockerfile`: Spring Boot 4 / Java 21 candidate API.
- `ai/Dockerfile`: FastAPI document/AI service with non-root runtime, Prometheus metrics and optional OpenTelemetry traces.
- `frontend/Dockerfile`: Next.js standalone candidate frontend.

Compose profiles `migration`, `cache` and `monitoring` start candidate services without changing the default Vite/Node request path. Never publish PostgreSQL, Redis, Spring Boot or FastAPI ports by default. Prometheus and Grafana bind to localhost only.

## Commands

```bash
docker compose up --build
docker compose --profile migration up --build
docker compose --profile cache up --build
docker compose --profile monitoring up --build
```

Set required local values in an ignored `.env`; never commit it. Migration profile requires a local-only JWT secret of at least 32 characters. Monitoring profile requires a unique local Grafana password. Do not reuse production credentials.
