# Monitoring — metrics, dashboards and traces

## 1. What is monitoring?

Monitoring helps an operator understand whether a service is running correctly. It collects measurements such as request counts, response times, errors and resource use.

Monitoring does not fix a problem by itself. It helps a person notice and investigate the problem.

## 2. Tools in this folder

- **Prometheus** collects and stores time-based metrics.
- **Grafana** displays metrics in dashboards.
- **OpenTelemetry** provides a common way to create and export traces and other telemetry.
- **FastAPI** exposes the service metrics endpoint at `/metrics` when configured.

Prometheus is configured to scrape the AI service over the private Docker Compose network. Grafana can load dashboards and data sources from the provisioning folders.

## 3. Start the local monitoring profile

From the repository root:

```powershell
docker compose --profile monitoring up --build
```

Local endpoints:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

Set a unique `GRAFANA_ADMIN_PASSWORD` in the ignored local `.env` file. Both services are intended to bind to localhost for local use.

## 4. OpenTelemetry

When `OTEL_EXPORTER_OTLP_ENDPOINT` is configured, the AI service can export traces using OTLP HTTP.

A trace helps follow one request across multiple internal operations. It should record timing and service boundaries, not private content.

## 5. What should never be recorded?

Do not place these values in metric labels, logs or traces:
- Prompts or document bodies.
- Authorization headers or tokens.
- Raw query strings.
- User IDs or arbitrary personal information.
- Full source URLs or other high-cardinality request values.

Prefer low-cardinality labels such as service name, endpoint class and response status.

## 6. Production requirements

The local profile is a development foundation. Production monitoring needs:
- Authentication and role-based access.
- TLS.
- A managed secret store.
- Retention and deletion policy.
- Alert routing and named responders.
- Measured service baselines and approved SLOs.
- Protection against collecting sensitive data.

Alert thresholds are intentionally not enabled until real baseline traffic and service objectives have been measured.# Monitoring foundation

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
