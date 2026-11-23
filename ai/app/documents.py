from __future__ import annotations

import hashlib
from html.parser import HTMLParser
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
from starlette.concurrency import run_in_threadpool

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


async def _download_public_document(raw_url: str) -> tuple[bytes, str, str]:
    current = _validate_url(raw_url)
    timeout = httpx.Timeout(20.0, connect=8.0)
    async with httpx.AsyncClient(timeout=timeout, trust_env=False) as client:
        for redirect_count in range(4):
            current = _validate_url(current)
            if not await _robots_allows(client, current):
                raise HTTPException(status_code=403, detail="Publisher robots.txt disallows document retrieval.")
            try:
                async with client.stream("GET", current, headers={"User-Agent": USER_AGENT, "Accept": "application/pdf,text/html,application/xhtml+xml"}, follow_redirects=False) as response:
                    if response.status_code in (301, 302, 303, 307, 308):
                        location = response.headers.get("location")
                        if not location or redirect_count == 3:
                            raise HTTPException(status_code=502, detail="Document redirect limit exceeded.")
                        current = urljoin(current, location)
                        continue
                    if response.status_code != 200:
                        raise HTTPException(status_code=502, detail=f"Publisher returned HTTP {response.status_code}.")
                    content_type = response.headers.get("content-type", "").split(";")[0].strip().lower()
                    allowed_types = ("application/pdf", "application/octet-stream", "binary/octet-stream", "text/html", "application/xhtml+xml")
                    if content_type not in allowed_types:
                        raise HTTPException(status_code=415, detail="Publisher did not return a supported PDF or HTML document.")
                    declared_length = response.headers.get("content-length")
                    try:
                        declared_size = int(declared_length) if declared_length else 0
                    except ValueError as exc:
                        raise HTTPException(status_code=502, detail="Publisher returned an invalid content length.") from exc
                    if declared_size > MAX_FILE_BYTES:
                        raise HTTPException(status_code=413, detail="Document exceeds the configured download size limit.")
                    chunks = []
                    size = 0
                    async for chunk in response.aiter_bytes():
                        size += len(chunk)
                        if size > MAX_FILE_BYTES:
                            raise HTTPException(status_code=413, detail="Document exceeds the configured download size limit.")
                        chunks.append(chunk)
                    content = b"".join(chunks)
                    if content_type in ("application/pdf", "application/octet-stream", "binary/octet-stream") and not content.startswith(b"%PDF-"):
                        raise HTTPException(status_code=415, detail="Downloaded file does not have a valid PDF signature.")
                    if content_type in ("text/html", "application/xhtml+xml") and content.startswith(b"%PDF-"):
                        content_type = "application/pdf"
                    return content, current, content_type
            except httpx.HTTPError as exc:
                raise HTTPException(status_code=502, detail="Could not retrieve the public document.") from exc
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


class _ReadableHTMLParser(HTMLParser):
    SKIP_TAGS = {"script", "style", "noscript", "svg", "nav", "footer", "aside", "form"}
    BLOCK_TAGS = {"p", "div", "section", "article", "h1", "h2", "h3", "h4", "li", "br", "tr"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip_depth = 0
        self.parts = []
        self.title_parts = []
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag in self.SKIP_TAGS:
            self.skip_depth += 1
        if tag == "title":
            self.in_title = True
        if not self.skip_depth and tag in self.BLOCK_TAGS:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in self.SKIP_TAGS and self.skip_depth:
            self.skip_depth -= 1
        if tag == "title":
            self.in_title = False
        if not self.skip_depth and tag in self.BLOCK_TAGS:
            self.parts.append("\n")

    def handle_data(self, data):
        if self.in_title:
            self.title_parts.append(data)
        if not self.skip_depth:
            self.parts.append(data)


def _extract_html(content: bytes) -> dict:
    parser = _ReadableHTMLParser()
    parser.feed(content.decode("utf-8", errors="replace"))
    text = "\n".join(" ".join(line.split()) for line in "".join(parser.parts).splitlines() if line.strip())
    title = " ".join(" ".join(parser.title_parts).split())[:300]
    if len(text) > MAX_TEXT_CHARS:
        text = text[:MAX_TEXT_CHARS]
    return {
        "extractionStatus": "text_extracted" if len(text) >= 80 else "metadata_only",
        "extractedText": text,
        "pages": [],
        "pageCount": None,
        "ocrPages": [],
        "warnings": ["HTML text has no stable PDF page references."],
        "documentTitle": title,
    }


async def extract_public_document(raw_url: str, ocr: bool = False) -> dict:
    url = _validate_url(raw_url)
    content, final_url, content_type = await _download_public_document(url)
    if content_type == "application/pdf" or content.startswith(b"%PDF-"):
        result = await run_in_threadpool(_extract_pdf, content, ocr)
        file_format = "pdf"
        engine = f"PyMuPDF {fitz.VersionBind}"
    elif content_type in ("text/html", "application/xhtml+xml"):
        result = await run_in_threadpool(_extract_html, content)
        file_format = "html"
        engine = "Python HTMLParser"
    else:
        raise HTTPException(status_code=415, detail="Unsupported public document format.")
    result.update({
        "canonicalUrl": final_url,
        "checksumSha256": hashlib.sha256(content).hexdigest(),
        "fileSizeBytes": len(content),
        "fileFormat": file_format,
        "retrievedAt": datetime.now(timezone.utc).isoformat(),
        "extractionEngine": engine,
    })
    return result
