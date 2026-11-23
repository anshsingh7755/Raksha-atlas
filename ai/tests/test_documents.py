import asyncio
import fitz
import httpx
import pytest
from fastapi import HTTPException

from app.documents import _allowed_host, _download_public_document, _extract_pdf, _extract_html, _validate_url


def test_host_allowlist_requires_explicit_domain(monkeypatch):
    monkeypatch.setattr("app.documents.ALLOWED_HOSTS", ("mod.gov.in",))
    assert _allowed_host("mod.gov.in")
    assert _allowed_host("reports.mod.gov.in")
    assert not _allowed_host("mod.gov.in.attacker.example")


def test_non_https_and_unapproved_hosts_are_rejected(monkeypatch):
    monkeypatch.setattr("app.documents.ALLOWED_HOSTS", ("mod.gov.in",))
    with pytest.raises(HTTPException):
        _validate_url("http://mod.gov.in/report.pdf")
    with pytest.raises(HTTPException):
        _validate_url("https://example.com/report.pdf")


def test_private_address_is_rejected(monkeypatch):
    monkeypatch.setattr("app.documents.ALLOWED_HOSTS", ("mod.gov.in",))
    monkeypatch.setattr("socket.getaddrinfo", lambda *args, **kwargs: [(None, None, None, None, ("127.0.0.1", 443))])
    with pytest.raises(HTTPException):
        _validate_url("https://mod.gov.in/report.pdf")


def test_extracts_page_numbered_text_from_pdf():
    document = fitz.open()
    page = document.new_page()
    page.insert_text((72, 72), "Public defence annual report. " * 8)
    content = document.tobytes()
    document.close()
    result = _extract_pdf(content, ocr=False)
    assert result["extractionStatus"] == "text_extracted"
    assert result["pages"][0]["page"] == 1
    assert "Public defence annual report" in result["pages"][0]["text"]


def test_empty_text_pdf_is_marked_for_ocr():
    document = fitz.open()
    document.new_page()
    content = document.tobytes()
    document.close()
    result = _extract_pdf(content, ocr=False)
    assert result["extractionStatus"] == "needs_ocr"
    assert result["pages"][0]["text"] == ""

def test_nonstandard_https_port_is_rejected(monkeypatch):
    monkeypatch.setattr("app.documents.ALLOWED_HOSTS", ("mod.gov.in",))
    with pytest.raises(HTTPException):
        _validate_url("https://mod.gov.in:8443/report.pdf")

def test_extracts_readable_html_and_title_without_script_or_navigation():
    html = b"<html><head><title>Public report</title><script>secret script</script></head><body><nav>menu</nav><main><h1>Defence report</h1><p>" + (b"Publicly available report text. " * 8) + b"</p></main></body></html>"
    result = _extract_html(html)
    assert result["extractionStatus"] == "text_extracted"
    assert result["documentTitle"] == "Public report"
    assert "Defence report" in result["extractedText"]
    assert "secret script" not in result["extractedText"]
    assert "menu" not in result["extractedText"]
    assert result["pages"] == []

def _install_mock_http(monkeypatch, handler):
    import app.documents as documents

    original_client = httpx.AsyncClient

    def client_factory(*args, **kwargs):
        kwargs["transport"] = httpx.MockTransport(handler)
        return original_client(*args, **kwargs)

    monkeypatch.setattr(documents, "ALLOWED_HOSTS", ("example.gov.in",))
    monkeypatch.setattr(documents.socket, "getaddrinfo", lambda *args, **kwargs: [(None, None, None, None, ("8.8.8.8", 443))])
    monkeypatch.setattr(documents.httpx, "AsyncClient", client_factory)


def test_downloads_public_pdf_after_robots_check(monkeypatch):
    pdf = fitz.open()
    page = pdf.new_page()
    page.insert_text((72, 72), "Public defence document text. " * 6)
    payload = pdf.tobytes()
    pdf.close()

    def handler(request):
        if request.url.path == "/robots.txt":
            return httpx.Response(404)
        return httpx.Response(200, headers={"content-type": "application/pdf"}, content=payload)

    _install_mock_http(monkeypatch, handler)
    content, final_url, content_type = asyncio.run(_download_public_document("https://example.gov.in/report.pdf"))
    assert content == payload
    assert final_url == "https://example.gov.in/report.pdf"
    assert content_type == "application/pdf"


def test_downloads_public_html_document(monkeypatch):
    html = b"<html><body><main><h1>Public report</h1><p>" + (b"Official public text. " * 8) + b"</p></main></body></html>"

    def handler(request):
        if request.url.path == "/robots.txt":
            return httpx.Response(404)
        return httpx.Response(200, headers={"content-type": "text/html; charset=utf-8"}, content=html)

    _install_mock_http(monkeypatch, handler)
    content, final_url, content_type = asyncio.run(_download_public_document("https://example.gov.in/report"))
    assert content == html
    assert final_url == "https://example.gov.in/report"
    assert content_type == "text/html"


def test_rejects_redirect_to_unapproved_host(monkeypatch):
    def handler(request):
        if request.url.path == "/robots.txt":
            return httpx.Response(404)
        return httpx.Response(302, headers={"location": "https://attacker.example/file.pdf"})

    _install_mock_http(monkeypatch, handler)
    with pytest.raises(HTTPException):
        asyncio.run(_download_public_document("https://example.gov.in/report.pdf"))
