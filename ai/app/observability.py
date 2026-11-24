"""Low-cardinality request telemetry; never records prompts, documents or secrets."""
import logging
import time
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("raksha.ai.metrics")

class RequestMetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        started = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
        if request.url.path.startswith("/v1/"):
            logger.info("ai_request method=%s path=%s status=%s duration_ms=%s",
                        request.method, request.url.path, response.status_code, elapsed_ms)
        response.headers["X-AI-Response-Time-Ms"] = str(elapsed_ms)
        return response
