from datetime import datetime, timezone
import pytest
from fastapi import HTTPException
from app.contracts import SourceReference
from app.chunking import chunk_document
from app.embeddings import create_embeddings
from app.model_router import allowed_models


def source():
    return SourceReference(source_id="pib-123", url="https://pib.gov.in/release", publisher="PIB",
                           title="Public release", collected_at=datetime.now(timezone.utc))


def test_chunking_preserves_page_and_source_and_is_deterministic():
    pages = [{"page": 2, "text": "A public defence document. " * 180}]
    first = chunk_document(document_id="doc-1", pages=pages, source=source(), max_chars=500, overlap=50)
    second = chunk_document(document_id="doc-1", pages=pages, source=source(), max_chars=500, overlap=50)
    assert len(first) > 1
    assert [c.chunk_id for c in first] == [c.chunk_id for c in second]
    assert all(c.page_number == 2 and c.source.source_id == "pib-123" for c in first)
    assert all(len(c.text) <= 500 for c in first)


def test_chunking_rejects_invalid_overlap():
    with pytest.raises(ValueError):
        chunk_document(document_id="doc-1", pages=[], source=source(), max_chars=300, overlap=300)


@pytest.mark.anyio
async def test_embeddings_fail_closed_without_provider_key(monkeypatch):
    monkeypatch.delenv("EMBEDDING_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    with pytest.raises(HTTPException) as error:
        await create_embeddings(["some text"])
    assert error.value.status_code == 503


def test_model_allowlist_is_explicit(monkeypatch):
    monkeypatch.setenv("AI_ALLOWED_MODELS", "openai/gpt-4.1,ollama/llama3")
    assert allowed_models() == ["openai/gpt-4.1", "ollama/llama3"]
