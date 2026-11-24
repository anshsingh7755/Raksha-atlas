-- Requires PostgreSQL with pgvector installed.
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS ai_document_chunks (
 chunk_id TEXT PRIMARY KEY, document_id TEXT NOT NULL, ordinal INTEGER NOT NULL CHECK (ordinal >= 0),
 page_number INTEGER CHECK (page_number IS NULL OR page_number >= 1), content TEXT NOT NULL,
 source_id TEXT NOT NULL, source_url TEXT NOT NULL, publisher TEXT NOT NULL, source_title TEXT NOT NULL,
 published_at TIMESTAMPTZ, collected_at TIMESTAMPTZ NOT NULL, verification_status TEXT NOT NULL,
 embedding_model TEXT NOT NULL, embedding VECTOR(1536) NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ai_document_chunks_document_idx ON ai_document_chunks(document_id);
CREATE INDEX IF NOT EXISTS ai_document_chunks_source_idx ON ai_document_chunks(source_id);
CREATE INDEX IF NOT EXISTS ai_document_chunks_embedding_hnsw_idx
 ON ai_document_chunks USING hnsw (embedding vector_cosine_ops);
