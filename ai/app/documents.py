from __future__ import annotations

import hashlib
import ipaddress
import os
import shutil
import socket
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

import fitz
import httpx
from fastapi import HTTPException

USER_AGENT = "RakshaAtlasDocumentBot/1.0"
MAX_FILE_BYTES = int(os.getenv("DOCUMENT_MAX_FILE_BYTES", str(25 * 1024 * 1024)))
MAX_PAGES = int(os.getenv("DOCUMENT_MAX_PAGES", "300"))
MAX_TEXT_CHARS = int(os.getenv("DOCUMENT_MAX_TEXT_CHARS", "200000"))
MAX_OCR_PAGES = int(os.getenv("DOCUMENT_MAX_OCR_PAGES", "20"))
ALLOWED_HOSTS = tuple(host.strip().lower().lstrip(".") for host in os.getenv("DOCUMENT_ALLOWED_HOSTS", "").split(",") if host.strip())


def _allowed_host(host: str) -> bool:
    host = host.rstrip(".").lower()
    return any(host == allowed or host.endswith("." + allowed) for allowed in ALLOWED_HOSTS)


def _validate_url(raw_url: str) -> str:
    parsed = urlparse(raw_url)
    try:
        port = parsed.port
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Document URL contains an invalid port.") from exc
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password or port not in (None, 443):
        raise HTTPException(status_code=400, detail="Only public HTTPS document URLs on port 443 are allowed.")
    host = parsed.hostname.encode("idna").decode("ascii").lower()
    if not _allowed_host(host):
        raise HTTPException(status_code=403, detail="Document host is not in DOCUMENT_ALLOWED_HOSTS.")
    try:
        addresses = socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)
    except OSError as exc:
        raise HTTPException(status_code=502, detail="Document host DNS lookup failed.") from exc
    if not addresses:
        raise HTTPException(status_code=502, detail="Document host did not resolve.")
    for address in {entry[4][0] for entry in addresses}:
        try:
            if not ipaddress.ip_address(address).is_global:
                raise HTTPException(status_code=403, detail="Private or non-public document host blocked.")
        except ValueError as exc:
            raise HTTPException(status_code=403, detail="Invalid document host address.") from exc
    return parsed.geturl()


async def _robots_allows(client: httpx.AsyncClient, url: str) -> bool:
    parsed = urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    try:
        async with client.stream("GET", robots_url, headers={"User-Agent": USER_AGENT}, follow_redirects=False) as response:
            if response.status_code == 404:
                return True
            if response.status_code != 200:
                raise HTTPException(status_code=403, detail="Publisher robots.txt policy could not be confirmed.")
            robots_bytes = bytearray()
            async for chunk in response.aiter_bytes():
                robots_bytes.extend(chunk)
                if len(robots_bytes) > 512 * 1024:
                    raise HTTPException(status_code=413, detail="Publisher robots.txt file is unexpectedly large.")
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Could not verify publisher robots.txt policy.") from exc
    parser = RobotFileParser()
    parser.set_url(robots_url)
    parser.parse(robots_bytes.decode("utf-8", errors="replace").splitlines())
    return parser.can_fetch(USER_AGENT, url)


async def _download_pdf(raw_url: str) -> tuple[bytes, str]:
    current = _validate_url(raw_url)
    timeout = httpx.Timeout(20.0, connect=8.0)
    async with httpx.AsyncClient(timeout=timeout, trust_env=False) as client:
        for redirect_count in range(4):
            current = _validate_url(current)
            if not await _robots_allows(client, current):
                raise HTTPException(status_code=403, detail="Publisher robots.txt disallows document retrieval.")
            try:
                async with client.stream("GET", current, headers={"User-Agent": USER_AGENT, "Accept": "application/pdf"}, follow_redirects=False) as response:
                    if response.status_code in (301, 302, 303, 307, 308):
                        location = response.headers.get("location")
                        if not location or redirect_count == 3:
                            raise HTTPException(status_code=502, detail="Document redirect limit exceeded.")
                        current = urljoin(current, location)
                        continue
                    if response.status_code != 200:
                        raise HTTPException(status_code=502, detail=f"Publisher returned HTTP {response.status_code}.")
                    content_type = response.headers.get("content-type", "").split(";")[0].strip().lower()
                    if content_type not in ("application/pdf", "application/octet-stream", "binary/octet-stream"):
                        raise HTTPException(status_code=415, detail="Publisher did not return a PDF file.")
                    declared_length = response.headers.get("content-length")
                    if declared_length and int(declared_length) > MAX_FILE_BYTES:
                        raise HTTPException(status_code=413, detail="PDF exceeds the configured download size limit.")
                    chunks = []
                    size = 0
                    async for chunk in response.aiter_bytes():
                        size += len(chunk)
                        if size > MAX_FILE_BYTES:
                            raise HTTPException(status_code=413, detail="PDF exceeds the configured download size limit.")
                        chunks.append(chunk)
                    content = b"".join(chunks)
                    if not content.startswith(b"%PDF-"):
                        raise HTTPException(status_code=415, detail="Downloaded file does not have a valid PDF signature.")
                    return content, current
            except httpx.HTTPError as exc:
                raise HTTPException(status_code=502, detail="Could not retrieve the public PDF.") from exc
    raise HTTPException(status_code=502, detail="Document redirect limit exceeded.")


def _extract_pdf(content: bytes, ocr: bool) -> dict:
    try:
        pdf = fitz.open(stream=content, filetype="pdf")
    except Exception as exc:
        raise HTTPException(status_code=422, detail="PDF could not be opened or is encrypted/corrupt.") from exc
    with pdf:
        if pdf.is_encrypted:
            raise HTTPException(status_code=422, detail="Encrypted PDFs are not supported.")
        if len(pdf) == 0 or len(pdf) > MAX_PAGES:
            raise HTTPException(status_code=413, detail=f"PDF must contain between 1 and {MAX_PAGES} pages.")
        pages = []
        ocr_pages = []
        warnings = []
        remaining = MAX_TEXT_CHARS
        for index, page in enumerate(pdf):
            text = page.get_text("text").strip()
            if len(text) < 40 and ocr:
                if shutil.which("tesseract") and len(ocr_pages) < MAX_OCR_PAGES:
                    try:
                        text_page = page.get_textpage_ocr(language="eng", dpi=180, full=True)
                        text = page.get_text("text", textpage=text_page).strip()
                        if text:
                            ocr_pages.append(index + 1)
                    except Exception:
                        warnings.append(f"OCR failed on page {index + 1}.")
                elif not shutil.which("tesseract"):
                    warnings.append("OCR was requested but Tesseract is not installed.")
                else:
                    warnings.append(f"OCR page limit reached at page {index + 1}.")
            text = text[: min(20000, max(0, remaining))]
            remaining -= len(text)
            pages.append({"page": index + 1, "text": text})
            if remaining <= 0:
                warnings.append("Extracted text reached the configured character limit.")
                break
        extracted_text = "\n\n".join(f"[Page {item['page']}]\n{item['text']}" for item in pages if item["text"])
        text_count = sum(len(item["text"]) for item in pages)
        status = "needs_ocr" if text_count == 0 or any(len(item["text"]) < 40 for item in pages) else "text_extracted"
        return {"extractionStatus": status, "extractedText": extracted_text[:MAX_TEXT_CHARS], "pages": pages, "pageCount": len(pdf), "ocrPages": ocr_pages, "warnings": warnings}


async def extract_public_pdf(raw_url: str, ocr: bool = False) -> dict:
    url = _validate_url(raw_url)
    content, final_url = await _download_pdf(url)
    result = _extract_pdf(content, ocr)
    result.update({
        "canonicalUrl": final_url,
        "checksumSha256": hashlib.sha256(content).hexdigest(),
        "fileSizeBytes": len(content),
        "fileFormat": "pdf",
        "retrievedAt": datetime.now(timezone.utc).isoformat(),
        "extractionEngine": f"PyMuPDF {fitz.VersionBind}",
    })
    return result
