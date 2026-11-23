from fastapi.testclient import TestClient

import app.main as main


client = TestClient(main.app)


def test_health_is_public():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "ai-service"


def test_extract_requires_worker_token(monkeypatch):
    monkeypatch.setenv("DOCUMENT_WORKER_TOKEN", "test-secret")
    response = client.post("/documents/extract", json={"url": "https://mod.gov.in/report.pdf"})
    assert response.status_code == 401


def test_extract_calls_pdf_worker_after_auth(monkeypatch):
    monkeypatch.setenv("DOCUMENT_WORKER_TOKEN", "test-secret")

    async def fake_extract(url, ocr=False):
        return {"extractionStatus": "text_extracted", "pages": [{"page": 1, "text": "public text"}], "ocrPages": []}

    monkeypatch.setattr(main, "extract_public_document", fake_extract)
    response = client.post(
        "/documents/extract",
        headers={"Authorization": "Bearer test-secret"},
        json={"url": "https://mod.gov.in/report.pdf", "ocr": False},
    )
    assert response.status_code == 200
    assert response.json()["pages"][0]["page"] == 1
