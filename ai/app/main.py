from fastapi import FastAPI

app = FastAPI(
    title="Raksha Atlas AI",
    version="0.1.0",
    description="AI and retrieval service for Raksha Atlas.",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "ai-service",
        "migration": "scaffold",
    }
