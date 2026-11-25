# AI and RAG

This folder contains the design and operating guide for the active Node.js retrieval assistant and the supporting FastAPI AI service.

- [RAG chatbot and source monitor](RAG-CHATBOT.md) — how the current assistant retrieves evidence, uses model services and handles source monitoring.
- [FastAPI AI/document service](../../ai/README.md) — separate extraction and AI migration service.

**Current runtime:** the website calls the Node API in `server/`; its retrieval logic is `server/rag.mjs`. The FastAPI service in `ai/` is not yet a replacement. Keep the two clearly separated.
