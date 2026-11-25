# Backend — Spring Boot migration version

This folder contains a Java service being prepared for a future backend migration.

## In simple words

The active website currently talks to the Node.js API in `server/`. This Spring Boot service is a future replacement candidate; it is not the default live API.

## What is inside?

- `src/main/java/` — Java code for API endpoints, business rules, inventory and security.
- `src/main/resources/` — application settings and database migration files.
- `pom.xml` — Java dependencies and build instructions.
- `Dockerfile` — instructions for building its container.

## How does it work?

A website or another trusted service sends an API request. Spring Boot checks it, applies the required rules and reads data from PostgreSQL.

## Important

Do not route the live website to this service or remove Node endpoints until authentication, data parity, tests and rollback are approved. See the [phase-wise roadmap](../docs/roadmap/README.md).
