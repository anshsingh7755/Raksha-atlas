import os
import secrets

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from .documents import extract_public_pdf

app = FastAPI(
    title="Raksha Atlas AI",
    version="0.2.0",
    description="AI and public-document extraction service for Raksha Atlas.",
)


class DocumentExtractionRequest(BaseModel):
    url: str = Field(min_length=12, max_length=2048)
    ocr: bool = False


def require_worker_token(authorization: str | None) -> None:
    expected = os.getenv("DOCUMENT_WORKER_TOKEN", "")
    if not expected:
        raise HTTPException(status_code=503, detail="Document extraction worker token is not configured.")
    supplied = authorization.removeprefix("Bearer ").strip() if authorization else ""
    if not secrets.compare_digest(supplied, expected):
        raise HTTPException(status_code=401, detail="Worker authorization required.")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-service", "migration": "document-extraction-enabled"}


@app.post("/documents/extract")
async def extract_document(payload: DocumentExtractionRequest, authorization: str | None = Header(default=None)) -> dict:
    require_worker_token(authorization)
    return await extract_public_pdf(payload.url, payload.ocr)
