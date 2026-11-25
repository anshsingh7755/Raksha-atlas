import os
import secrets

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field, model_validator

from .chunking import chunk_document
from .contracts import DocumentChunk, EmbeddingRequest, RetrievalRequest, SourceReference
from .documents import extract_public_document
from .embeddings import create_embeddings
from .model_router import allowed_models, complete
from .observability import RequestMetricsMiddleware
from .retrieval import search_evidence
from .vector_store import upsert_chunks
from .workflows import run_research_workflow
from .telemetry import configure_tracing
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(
    title="Raksha Atlas AI",
    version="0.4.0",
    description="Private AI, RAG foundation and public-document extraction service.",
)
app.add_middleware(RequestMetricsMiddleware)
Instrumentator().instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)
configure_tracing(app)


class DocumentExtractionRequest(BaseModel):
    url: str = Field(min_length=12, max_length=2048)
    ocr: bool = False


class ChunkRequest(BaseModel):
    document_id: str = Field(min_length=1, max_length=200)
    pages: list[dict] = Field(min_length=1, max_length=300)
    source: SourceReference
    max_chars: int = Field(default=2400, ge=300, le=12000)
    overlap: int = Field(default=250, ge=0, le=11999)

    @model_validator(mode="after")
    def validate_overlap(self):
        if self.overlap >= self.max_chars:
            raise ValueError("overlap must be smaller than max_chars")
        return self


class IndexRequest(BaseModel):
    chunks: list[DocumentChunk] = Field(min_length=1, max_length=64)
    model: str | None = Field(default=None, max_length=120)


class ResearchRequest(BaseModel):
    query: str = Field(min_length=3, max_length=2000)
    limit: int = Field(default=5, ge=1, le=20)
    source_ids: list[str] = Field(default_factory=list, max_length=50)
    model: str | None = Field(default=None, max_length=120)


class CompletionRequest(BaseModel):
    model: str | None = Field(default=None, max_length=120)
    messages: list[dict] = Field(min_length=1, max_length=40)


def require_worker_token(authorization: str | None) -> None:
    expected = os.getenv("AI_SERVICE_TOKEN", "")
    if not expected:
        raise HTTPException(status_code=503, detail="AI service identity is not configured.")
    supplied = authorization.removeprefix("Bearer ").strip() if authorization else ""
    if not secrets.compare_digest(supplied, expected):
        raise HTTPException(status_code=401, detail="Service authorization required.")


def require_document_token(authorization: str | None) -> None:
    expected = os.getenv("DOCUMENT_WORKER_TOKEN", "")
    if not expected:
        raise HTTPException(status_code=503, detail="Document worker token is not configured.")
    supplied = authorization.removeprefix("Bearer ").strip() if authorization else ""
    if not secrets.compare_digest(supplied, expected):
        raise HTTPException(status_code=401, detail="Document worker authorization required.")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-service", "migration": "phase-3"}


@app.get("/v1/ai/capabilities")
def capabilities() -> dict:
    return {
        "api_version": "v1",
        "document_extraction": True,
        "page_aware_chunking": True,
        "embeddings_configured": bool(os.getenv("EMBEDDING_API_KEY") or os.getenv("OPENAI_API_KEY")),
        "vector_retrieval_configured": bool(os.getenv("DATABASE_URL") and (os.getenv("EMBEDDING_API_KEY") or os.getenv("OPENAI_API_KEY"))),
        "research_workflow": True,
        "model_routing_configured": bool(allowed_models()),
        "allowed_models": allowed_models(),
        "gateway_only": True,
    }


@app.post("/documents/extract")
async def extract_document(payload: DocumentExtractionRequest, authorization: str | None = Header(default=None)) -> dict:
    require_document_token(authorization)
    return await extract_public_document(payload.url, payload.ocr)


@app.post("/v1/documents/chunk")
def chunk_extracted_document(payload: ChunkRequest, authorization: str | None = Header(default=None)) -> dict:
    require_worker_token(authorization)
    chunks = chunk_document(
        document_id=payload.document_id, pages=payload.pages, source=payload.source,
        max_chars=payload.max_chars, overlap=payload.overlap,
    )
    return {"document_id": payload.document_id, "count": len(chunks),
            "chunks": [item.model_dump(mode="json") for item in chunks]}


@app.post("/v1/embeddings")
async def embed_text(payload: EmbeddingRequest, authorization: str | None = Header(default=None)) -> dict:
    require_worker_token(authorization)
    return await create_embeddings(payload.texts, payload.model)


@app.post("/v1/index/upsert")
async def index_chunks(payload: IndexRequest, authorization: str | None = Header(default=None)) -> dict:
    require_worker_token(authorization)
    chunks = [chunk.model_dump(mode="json") for chunk in payload.chunks]
    embedded = await create_embeddings([chunk["text"] for chunk in chunks], payload.model)
    count = upsert_chunks(chunks, embedded["vectors"], embedded["model"])
    return {"indexed": count, "model": embedded["model"], "dimensions": embedded["dimensions"]}


@app.post("/v1/retrieval/search")
async def retrieve_evidence(payload: RetrievalRequest, authorization: str | None = Header(default=None)) -> dict:
    require_worker_token(authorization)
    return await search_evidence(payload.query, payload.limit, payload.source_ids)


@app.post("/v1/assistant/answer")
async def research_answer(payload: ResearchRequest, authorization: str | None = Header(default=None)) -> dict:
    require_worker_token(authorization)
    return await run_research_workflow(payload.query, payload.limit, payload.source_ids, payload.model)


@app.post("/v1/models/completions")
async def model_completion(payload: CompletionRequest, authorization: str | None = Header(default=None)) -> dict:
    require_worker_token(authorization)
    return await complete(payload.messages, payload.model)
