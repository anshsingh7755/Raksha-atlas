"""pgvector persistence and cosine-similarity retrieval."""
import json
import os
from fastapi import HTTPException
import psycopg
from pgvector.psycopg import register_vector


def _connection():
    dsn = os.getenv("DATABASE_URL", "")
    if not dsn:
        raise HTTPException(status_code=503, detail="Vector database is not configured.")
    try:
        conn = psycopg.connect(dsn, connect_timeout=5)
        register_vector(conn)
        return conn
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Vector database is unavailable or pgvector is not installed.") from exc


def upsert_chunks(chunks: list[dict], vectors: list[list[float]], model: str) -> int:
    if not chunks or len(chunks) != len(vectors):
        raise HTTPException(status_code=422, detail="Chunk and vector counts must match.")
    dimensions = len(vectors[0]) if vectors else 0
    if not dimensions or any(len(vector) != dimensions for vector in vectors):
        raise HTTPException(status_code=422, detail="Embedding dimensions are inconsistent.")
    try:
        with _connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT vector_dims(%s)", (vectors[0],))
                for chunk, vector in zip(chunks, vectors):
                    source = chunk["source"]
                    cur.execute("""
                        INSERT INTO ai_document_chunks
                        (chunk_id, document_id, ordinal, page_number, content, source_id,
                         source_url, publisher, source_title, published_at, collected_at,
                         verification_status, embedding_model, embedding)
                        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                        ON CONFLICT (chunk_id) DO UPDATE SET
                          content=EXCLUDED.content, page_number=EXCLUDED.page_number,
                          source_id=EXCLUDED.source_id, source_url=EXCLUDED.source_url,
                          publisher=EXCLUDED.publisher, source_title=EXCLUDED.source_title,
                          published_at=EXCLUDED.published_at, collected_at=EXCLUDED.collected_at,
                          verification_status=EXCLUDED.verification_status,
                          embedding_model=EXCLUDED.embedding_model, embedding=EXCLUDED.embedding
                    """, (
                        chunk["chunk_id"], chunk["document_id"], chunk["ordinal"], chunk.get("page_number"),
                        chunk["text"], source["source_id"], str(source["url"]), source["publisher"],
                        source["title"], source.get("published_at"), source["collected_at"],
                        source["verification_status"], model, vector,
                    ))
        return len(chunks)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Vector indexing failed; verify pgvector schema and embedding dimensions.") from exc


def search_vectors(vector: list[float], limit: int, source_ids: list[str]) -> list[dict]:
    try:
        with _connection() as conn:
            with conn.cursor() as cur:
                if source_ids:
                    cur.execute("""
                        SELECT chunk_id, document_id, ordinal, page_number, content, source_id,
                               source_url, publisher, source_title, published_at, collected_at,
                               verification_status, 1 - (embedding <=> %s) AS score
                        FROM ai_document_chunks WHERE source_id = ANY(%s)
                        ORDER BY embedding <=> %s LIMIT %s
                    """, (vector, source_ids, vector, limit))
                else:
                    cur.execute("""
                        SELECT chunk_id, document_id, ordinal, page_number, content, source_id,
                               source_url, publisher, source_title, published_at, collected_at,
                               verification_status, 1 - (embedding <=> %s) AS score
                        FROM ai_document_chunks ORDER BY embedding <=> %s LIMIT %s
                    """, (vector, vector, limit))
                rows = cur.fetchall()
        keys = ["chunk_id","document_id","ordinal","page_number","content","source_id","source_url",
                "publisher","source_title","published_at","collected_at","verification_status","score"]
        return [dict(zip(keys, row)) for row in rows]
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Vector search failed; verify pgvector schema and index.") from exc
