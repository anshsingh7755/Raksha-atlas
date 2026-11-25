"""Optional OpenTelemetry tracing; never capture request bodies or secrets."""
import os
import logging

logger = logging.getLogger("raksha.ai.telemetry")


def configure_tracing(app) -> None:
    endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "").strip()
    if not endpoint:
        logger.info("OpenTelemetry exporter disabled; no OTLP endpoint configured")
        return

    try:
        from opentelemetry import trace
        from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor

        provider = TracerProvider(
            resource=Resource.create({
                "service.name": os.getenv("OTEL_SERVICE_NAME", "raksha-ai"),
                "deployment.environment": os.getenv("APP_ENV", "development"),
            })
        )
        trace_endpoint = endpoint.rstrip("/")\n        if not trace_endpoint.endswith("/v1/traces"):\n            trace_endpoint += "/v1/traces"\n        provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(endpoint=trace_endpoint)))
        trace.set_tracer_provider(provider)
        FastAPIInstrumentor.instrument_app(
            app,
            tracer_provider=provider,
            excluded_urls="/health,/metrics",
        )
        logger.info("OpenTelemetry tracing enabled")
    except Exception:
        # Tracing must never prevent the core API from starting.
        logger.exception("OpenTelemetry initialization failed; continuing without tracing")
