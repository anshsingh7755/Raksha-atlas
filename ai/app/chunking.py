"""Deterministic, page-aware chunking for extracted public documents."""
import hashlib
import re
from .contracts import DocumentChunk, SourceReference


def chunk_document(*, document_id: str, pages: list[dict], source: SourceReference,
                   max_chars: int = 2400, overlap: int = 250) -> list[DocumentChunk]:
    if max_chars < 300 or max_chars > 12000:
        raise ValueError("max_chars must be between 300 and 12000")
    if overlap < 0 or overlap >= max_chars:
        raise ValueError("overlap must be non-negative and smaller than max_chars")

    chunks: list[DocumentChunk] = []
    for page in pages:
        page_number = page.get("page")
        text = re.sub(r"\s+", " ", str(page.get("text", ""))).strip()
        if not text:
            continue
        start = 0
        while start < len(text):
            end = min(start + max_chars, len(text))
            if end < len(text):
                boundary = text.rfind(" ", start + max_chars // 2, end)
                if boundary > start:
                    end = boundary
            body = text[start:end].strip()
            if body:
                ordinal = len(chunks)
                digest = hashlib.sha256(
                    f"{document_id}:{page_number}:{ordinal}:{body}".encode("utf-8")
                ).hexdigest()[:24]
                chunks.append(DocumentChunk(
                    chunk_id=f"chunk_{digest}", document_id=document_id, text=body,
                    ordinal=ordinal, page_number=page_number, source=source,
                ))
            if end >= len(text):
                break
            start = max(end - overlap, start + 1)
    return chunks
