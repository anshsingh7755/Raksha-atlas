# Service container boundaries

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
