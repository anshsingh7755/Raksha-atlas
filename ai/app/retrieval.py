"""pgvector retrieval boundary. Database access is deliberately fail-closed until configured."""
import os
from fastapi import HTTPException


async def search_evidence(query: str, limit: int, source_ids: list[str]) -> dict:
    if not os.getenv("DATABASE_URL"):
        raise HTTPException(status_code=503, detail="Vector retrieval is not configured: DATABASE_URL is missing.")
    # The database adapter is intentionally not faked. The pgvector schema/extension
    # and populated corpus must be provisioned and acceptance-tested before retrieval.
    raise HTTPException(status_code=503, detail="pgvector retrieval adapter is not enabled yet.")
