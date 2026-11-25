# Backend — Spring Boot and Java migration service

## 1. What is this folder?

This folder contains the Java Spring Boot backend being prepared as a possible future replacement for parts of the current Node.js API.

**The active website still uses the Node API in `server/`.** This Spring Boot service is a migration scaffold. It must not be treated as the live backend just because it has controllers, services or a Dockerfile.

## 2. What is Spring Boot?

Spring Boot is a Java framework for building backend services and REST APIs.

In simple terms:
- A browser or trusted service sends an HTTP request.
- A controller receives the request.
- Validation and business services check what should happen.
- Repository code reads or writes the database.
- Spring Boot returns a structured response.

## 3. Main folder layout

| Path | Responsibility |
|---|---|
| `src/main/java/` | Java application code: API controllers, business logic, domain models and security. |
| `src/main/resources/` | Application configuration and database migration scripts. |
| `src/test/java/` | Automated Java tests. |
| `pom.xml` | Maven project file: dependencies, plugins and build settings. |
| `Dockerfile` | Instructions for building the Java service container. |

The exact package structure is visible under `src/main/java/com/raksha/`. Read the class before changing it; the package names alone do not prove that a feature is fully migrated.

## 4. How a request should flow

```text
Trusted frontend or service
          |
          v
Spring Boot controller
          |
          v
Input validation and security
          |
          v
Service / business rules
          |
          v
Repository / PostgreSQL
          |
          v
Structured API response
```

The browser should not connect directly to PostgreSQL. Database credentials remain on the server.

## 5. Database migrations

Spring Boot uses Flyway migration files under:

`src/main/resources/db/migration/`

The migrations create versioned database structures. Flyway records which migrations have been applied. Do not edit an already-applied migration casually; create a new migration when a schema change is needed.

The older SQL under the root `database/migrations/` folder is a historical reference. Do not apply it manually on top of Flyway without understanding the schema history.

## 6. Build and test

This is a Maven project. From the repository root:

```powershell
cd backend
.\mvnw.cmd test
```

If the repository does not contain the Maven wrapper, use an installed Maven version:

```powershell
mvn test
```

Build/test requirements can depend on the installed Java version. Check `pom.xml` for the configured Java toolchain before changing versions.

## 7. Configuration and secrets

Database URL, username, password, JWT and service tokens must be supplied through environment variables or an approved secret manager. Never commit real values.

Do not expose internal AI service tokens to browser code. Spring Boot is the trusted gateway when it calls the private FastAPI service.

## 8. What must happen before this becomes active?

Before switching a live feature from Node to Spring Boot:

1. Confirm the Spring endpoint matches the existing feature contract.
2. Confirm authentication and authorization rules.
3. Import and reconcile the required data.
4. Test normal, invalid and failure cases.
5. Check performance and operational logging.
6. Keep the Node path available for rollback.
7. Obtain release approval and update the roadmap.

See the [delivery roadmap](../docs/roadmap/README.md) and the phase-specific cutover runbooks for acceptance requirements.# Backend — Spring Boot migration version

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
