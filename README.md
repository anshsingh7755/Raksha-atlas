# Defence — Quick Start

1. Start Docker Desktop.
2. Open this project folder in PowerShell.
3. Run `docker compose up -d --build`.
4. Open http://localhost:8080.
5. Check services: `docker compose ps`.

Stop safely: `docker compose down`.
Never use `docker compose down -v` for a normal shutdown.

For architecture, development history and the next task, read `docs/README.md`.
