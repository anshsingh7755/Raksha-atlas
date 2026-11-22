# Raksha Atlas AI service

This is the Phase 4 scaffold for the Python AI service. It does not replace
`server/rag.mjs` yet.

## Run locally

```powershell
cd ai
python -m uvicorn app.main:app --reload --port 8001
```

Health check:

```text
http://localhost:8001/health
```

Future responsibilities:

- RAG retrieval
- LangGraph workflows
- document extraction
- embeddings and evaluation
- model routing
