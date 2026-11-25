# Raksha Atlas — Spring Boot backend

This directory contains the Java 21 / Spring Boot 4 migration backend. It is a candidate service, not a replacement for the active Node.js API in `server/`.

## Current scope

- Spring Boot application and REST API scaffold.
- Flyway database migrations under `src/main/resources/db/migration`.
- Initial domain APIs and security foundations.
- Docker image and local migration-profile support.

## Run and validate

Use the root Docker Compose migration profile and the environment settings documented in [infrastructure](../infrastructure/README.md). For the active website, continue using the root `npm run dev:full` workflow.

## Migration rule

Do not route production website traffic to this service or remove Node endpoints until authentication, populated-data parity, API contract tests, end-to-end validation and rollback are accepted. See [architecture](../docs/architecture/README.md) and the [delivery roadmap](../docs/roadmap/README.md).
