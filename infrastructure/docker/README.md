# Docker migration notes

Use the root `Dockerfile` and `docker-compose.yml` while the application
services are being migrated.

Future service images:

```text
frontend  → Next.js
backend   → Spring Boot
ai        → FastAPI
pipeline  → Python workers
database  → PostgreSQL
```
