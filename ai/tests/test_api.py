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


def test_phase3_capabilities_are_safe_and_versioned(monkeypatch):
    monkeypatch.setenv("AI_ALLOWED_MODELS", "openai/gpt-4.1")
    response = client.get("/v1/ai/capabilities")
    assert response.status_code == 200
    payload = response.json()
    assert payload["api_version"] == "v1"
    assert payload["gateway_only"] is True
    assert payload["allowed_models"] == ["openai/gpt-4.1"]
    assert "api_key" not in payload


def test_chunk_endpoint_requires_service_token(monkeypatch):
    monkeypatch.setenv("AI_SERVICE_TOKEN", "test-secret")
    response = client.post("/v1/documents/chunk", json={
        "document_id": "doc-1",
        "pages": [{"page": 1, "text": "Public evidence text"}],
        "source": {
            "source_id": "pib-1", "url": "https://pib.gov.in/release",
            "publisher": "PIB", "title": "Release"
        }
    })
    assert response.status_code == 401


def test_chunk_endpoint_returns_source_linked_chunks(monkeypatch):
    monkeypatch.setenv("AI_SERVICE_TOKEN", "test-secret")
    response = client.post(
        "/v1/documents/chunk",
        headers={"Authorization": "Bearer test-secret"},
        json={
            "document_id": "doc-1",
            "pages": [{"page": 3, "text": "Public evidence text"}],
            "source": {
                "source_id": "pib-1", "url": "https://pib.gov.in/release",
                "publisher": "PIB", "title": "Release"
            }
        }
    )
    assert response.status_code == 200
    chunk = response.json()["chunks"][0]
    assert chunk["page_number"] == 3
    assert chunk["source"]["source_id"] == "pib-1"


def test_chunk_endpoint_rejects_overlap_larger_than_chunk(monkeypatch):
    monkeypatch.setenv("AI_SERVICE_TOKEN", "test-secret")
    response = client.post(
        "/v1/documents/chunk",
        headers={"Authorization": "Bearer test-secret"},
        json={
            "document_id": "doc-1", "pages": [{"page": 1, "text": "Text"}],
            "source": {
                "source_id": "pib-1", "url": "https://pib.gov.in/release",
                "publisher": "PIB", "title": "Release"
            },
            "max_chars": 300, "overlap": 300
        }
    )
    assert response.status_code == 422


def test_answer_endpoint_requires_service_token(monkeypatch):
    monkeypatch.setenv("AI_SERVICE_TOKEN", "test-secret")
    response = client.post("/v1/assistant/answer", json={"query": "What is the evidence?"})
    assert response.status_code == 401


def test_index_endpoint_requires_service_token(monkeypatch):
    monkeypatch.setenv("AI_SERVICE_TOKEN", "test-secret")
    response = client.post("/v1/index/upsert", json={"chunks": []})
    assert response.status_code in (401, 422)
