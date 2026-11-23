import fitz
import pytest
from fastapi import HTTPException

from app.documents import _allowed_host, _extract_pdf, _validate_url


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
