# Monitoring foundation

## Components

- FastAPI exposes Prometheus metrics at `/metrics` (request count, status and latency; low-cardinality route labels).
- Optional OpenTelemetry traces are exported using OTLP HTTP when `OTEL_EXPORTER_OTLP_ENDPOINT` is configured.
- Prometheus scrapes the AI service over the private Compose network.
- Grafana provisions dashboards from `grafana/dashboards`.

No prompts, document bodies, authorization headers, tokens or raw query strings may be captured. Do not add user IDs, source URLs or arbitrary request values as metric labels.

## Local profile

```bash
docker compose --profile monitoring up --build
```

Prometheus and Grafana are exposed on localhost only. Grafana requires a local admin password from `.env`; change it before use. Production deployment must use a managed secret store, TLS, SSO/RBAC, retention policy and alert routing.

## Initial dashboard signals

- AI request rate and error ratio
- p50/p95/p99 request latency
- service availability and restart count
- container CPU/memory
- PostgreSQL connection saturation and backup status (CloudWatch/RDS integration is a later deployment task)

Alert thresholds are intentionally not enabled until baseline traffic and SLOs are measured.
