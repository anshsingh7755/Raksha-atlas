"""Embedding-backed evidence retrieval with source-preserving citations."""
from .embeddings import create_embeddings
from .vector_store import search_vectors

async def search_evidence(query: str, limit: int, source_ids: list[str]) -> dict:
    embedded = await create_embeddings([query])
    rows = search_vectors(embedded["vectors"][0], limit, source_ids)
    results = []
    for row in rows:
        results.append({
            "score": max(0.0, min(1.0, float(row["score"]))),
            "chunk": {
                "chunk_id": row["chunk_id"], "document_id": row["document_id"],
                "ordinal": row["ordinal"], "page_number": row["page_number"], "text": row["content"],
                "source": {"source_id": row["source_id"], "url": row["source_url"],
                    "publisher": row["publisher"], "title": row["source_title"],
                    "published_at": row["published_at"], "collected_at": row["collected_at"],
                    "verification_status": row["verification_status"]},
            },
        })
    return {"query": query, "results": results, "retrieval_mode": "pgvector"}
