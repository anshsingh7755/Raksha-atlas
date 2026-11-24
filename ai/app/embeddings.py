"""Explicitly configured embedding provider; no fake or random vectors."""
import os
import httpx
from fastapi import HTTPException


async def create_embeddings(texts: list[str], model: str | None = None) -> dict:
    base_url = os.getenv("EMBEDDING_API_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    api_key = os.getenv("EMBEDDING_API_KEY") or os.getenv("OPENAI_API_KEY")
    selected_model = model or os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    if not api_key:
        raise HTTPException(status_code=503, detail="Embedding provider is not configured.")
    if len(texts) > 64 or any(not text.strip() for text in texts):
        raise HTTPException(status_code=422, detail="Provide 1–64 non-empty texts.")
    timeout = httpx.Timeout(30.0, connect=5.0)
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{base_url}/embeddings",
                headers={"Authorization": f"Bearer {api_key}"},
                json={"model": selected_model, "input": texts},
            )
            response.raise_for_status()
            payload = response.json()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Embedding provider request failed.") from exc
    data = sorted(payload.get("data", []), key=lambda item: item.get("index", 0))
    vectors = [item.get("embedding", []) for item in data]
    if len(vectors) != len(texts) or not vectors or len({len(v) for v in vectors}) != 1:
        raise HTTPException(status_code=502, detail="Embedding provider returned an invalid vector batch.")
    return {"model": payload.get("model", selected_model), "dimensions": len(vectors[0]), "vectors": vectors}
