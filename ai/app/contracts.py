"""Versioned, provider-neutral contracts for the Raksha Atlas AI service."""
from datetime import datetime, timezone
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class SourceReference(BaseModel):
    model_config = ConfigDict(extra="forbid")
    source_id: str = Field(min_length=1, max_length=160)
    url: HttpUrl
    publisher: str = Field(min_length=1, max_length=240)
    title: str = Field(min_length=1, max_length=500)
    published_at: datetime | None = None
    collected_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    verification_status: Literal["unverified", "corroborated", "official", "disputed"] = "unverified"


class DocumentChunk(BaseModel):
    model_config = ConfigDict(extra="forbid")
    chunk_id: str = Field(min_length=1, max_length=200)
    document_id: str = Field(min_length=1, max_length=200)
    text: str = Field(min_length=1, max_length=12000)
    ordinal: int = Field(ge=0)
    page_number: int | None = Field(default=None, ge=1)
    source: SourceReference


class EmbeddingRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    texts: list[str] = Field(min_length=1, max_length=64)
    model: str | None = Field(default=None, max_length=120)


class EmbeddingVector(BaseModel):
    model: str
    dimensions: int = Field(gt=0)
    vectors: list[list[float]]


class RetrievalRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    query: str = Field(min_length=3, max_length=2000)
    limit: int = Field(default=5, ge=1, le=20)
    source_ids: list[str] = Field(default_factory=list, max_length=50)


class RetrievedEvidence(BaseModel):
    chunk: DocumentChunk
    score: float = Field(ge=0, le=1)


class RetrievalResponse(BaseModel):
    query: str
    results: list[RetrievedEvidence]
    retrieval_mode: Literal["pgvector"]
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
