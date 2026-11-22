# Raksha Atlas implementation roadmap

This roadmap is the delivery order for the target stack. Build and verify one
week at a time; do not remove the working Vite/Node application until its
replacement is verified.

## Current status

| Area                        | Status                                                |
| --------------------------- | ----------------------------------------------------- |
| Existing React/Vite website | Working                                               |
| Next.js shell               | Started; reuses existing UI                           |
| Java Spring Boot service    | Scaffolded; Java 21 and local Maven installed         |
| Python FastAPI service      | Scaffolded and health-checked                         |
| Python data pipeline        | Boundary and deduplication check added                |
| Docker/AWS structure        | Documented; root Docker stack remains active          |
| PostgreSQL inventory schema | Migration and Spring code compile; runtime verification pending |
| Service communication       | Not started                                           |

## Six-month plan

| Weeks | Focus            | Deliverable                                                            |
| ----- | ---------------- | ---------------------------------------------------------------------- |
| 1–4   | Foundation       | Next.js, Spring Boot, PostgreSQL, FastAPI and local service contracts  |
| 5–8   | Backend          | Security, users, inventory, procurement, audit logs and tests          |
| 9–12  | Cloud            | Docker, S3, RDS, ECS and Terraform                                     |
| 13–16 | AI               | LLMs, embeddings, RAG, LangGraph, routing and evaluation               |
| 17–20 | Data engineering | Polars, Parquet, Kafka, Airflow, dbt, Spark and quality checks         |
| 21–24 | Production       | CI/CD, Kubernetes, observability, optimization, backups and load tests |

## Week-by-week implementation

### Month 1: foundation

| Week | Learn                           | Implement                     | Status      |
| ---- | ------------------------------- | ----------------------------- | ----------- |
| 1    | Git, TypeScript, React, Next.js | Migrate the existing frontend | In progress |
| 2    | Java, OOP, Spring Boot, REST    | Core Java API configuration   | Scaffolded  |
| 3    | PostgreSQL, SQL, JPA, Hibernate | Database and inventory APIs   | In progress |
| 4    | FastAPI, Python, Pydantic       | AI service foundation         | Scaffolded  |

### Month 2: enterprise backend

| Week | Learn                         | Implement                             |
| ---- | ----------------------------- | ------------------------------------- |
| 5    | Spring Security, JWT, OAuth   | Login and roles                       |
| 6    | SQL, JPA relationships        | Inventory and procurement persistence |
| 7    | Redis, WebSockets, API design | Caching and notifications             |
| 8    | JUnit, Testcontainers         | Backend tests and audit logs          |

### Month 3: cloud

| Week | Learn                     | Implement                   |
| ---- | ------------------------- | --------------------------- |
| 9    | IAM, VPC, S3              | Secure cloud storage        |
| 10   | Docker, Compose           | Containerize each service   |
| 11   | RDS, ECS, Lambda          | Deploy backend and database |
| 12   | Terraform, GitHub Actions | Infrastructure and CI/CD    |

### Month 4: AI

| Week | Learn                     | Implement                          |
| ---- | ------------------------- | ---------------------------------- |
| 13   | LLM APIs, Ollama, Qwen    | Local and cloud model gateway      |
| 14   | Prompts and embeddings    | News and document summaries        |
| 15   | RAG, pgvector, BGE-M3     | Source-based retrieval and answers |
| 16   | LangGraph, LiteLLM, RAGAS | Workflows, routing and evaluation  |

### Month 5: data engineering

| Week | Learn                       | Implement                              |
| ---- | --------------------------- | -------------------------------------- |
| 17   | Python ETL, Polars, Parquet | News ingestion and transformation      |
| 18   | Kafka                       | Event streaming                        |
| 19   | Airflow, dbt                | Scheduled workflows and SQL transforms |
| 20   | Spark, Iceberg, quality     | Historical analytics and lakehouse     |

### Month 6: production

| Week | Learn                              | Implement                     |
| ---- | ---------------------------------- | ----------------------------- |
| 21   | Kubernetes, Helm                   | Container orchestration       |
| 22   | OpenTelemetry, Prometheus, Grafana | Monitoring and tracing        |
| 23   | vLLM and optimization              | GPU inference and performance |
| 24   | Load testing, security, backups    | Production readiness          |

## Next implementation task

Complete Week 3 in a separate step:

1. Install Java 21 and Maven.
2. Start PostgreSQL through the existing Docker Compose stack.
3. Apply `database/migrations/001_inventory.sql`.
4. Add a minimal Spring inventory model and repository. **Compiled**
5. Add one read-only inventory endpoint. **Compiled; runtime pending**
6. Start PostgreSQL and apply the migration.
7. Compile and start Spring Boot.
8. Test it without changing the existing Node inventory endpoint.
9. Compare both responses before migrating any frontend request.

The Spring inventory slice is not complete until steps 6–9 pass.
