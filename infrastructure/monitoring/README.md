# Monitoring foundation

FastAPI exposes Prometheus metrics at `/metrics`. Optional OpenTelemetry traces export over OTLP HTTP when `OTEL_EXPORTER_OTLP_ENDPOINT` is configured. Prometheus scrapes the AI service on the private Compose network; Grafana provisions dashboards from this directory.

Never capture prompts, document bodies, authorization headers, tokens or raw query strings. Do not use user IDs, source URLs or arbitrary request values as metric labels.

## Local profile

```bash
docker compose --profile monitoring up --build
```

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

Both ports bind to localhost only. Set `GRAFANA_ADMIN_PASSWORD` in the ignored local `.env`. Production requires a managed secret store, TLS, SSO/RBAC, retention policy and alert routing.

Alert thresholds are intentionally not enabled until baseline traffic and SLOs are measured.
