# Service container boundaries

- Root `Dockerfile`: current Vite static site and Node API. Keep this as the stable legacy runtime until Phase 10 cutover approval.
- `backend/Dockerfile`: Spring Boot 4 / Java 21 candidate API.
- `ai/Dockerfile`: FastAPI document/AI service (non-root runtime and extraction health check).
- `frontend/Dockerfile`: Next.js standalone candidate frontend.

Compose profiles `migration` and `cache` start candidate services without changing the default Vite/Node request path. The Next.js container is a candidate only; its proxy target must be explicitly configured for the intended environment. Never publish PostgreSQL, Redis, Spring Boot or FastAPI ports by default. Use health checks and the private Compose network for service-to-service traffic.

## Commands

```bash
# Existing Vite + Node + PostgreSQL stack
docker compose up --build

# Add Spring Boot candidate API
docker compose --profile migration up --build

# Add Redis for cache experiments
docker compose --profile cache up --build

# Validate resolved configuration without starting containers
docker compose config --quiet
```

Set required local values in an ignored `.env`; never commit it. The migration profile requires a local-only JWT secret of at least 32 characters. Do not reuse production signing keys.
