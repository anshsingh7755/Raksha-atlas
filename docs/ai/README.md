# AI documentation

## What is covered here?

This folder explains the assistant and AI-related parts of Raksha Atlas.

There are two separate implementations to understand:

1. The **active Node.js assistant** in `server/rag.mjs`, which is used by the current application.
2. The **FastAPI AI service** in the root `ai/` folder, which contains document extraction and future AI/RAG service foundations.

They are related, but they are not the same service.

## Start with these documents

- [RAG chatbot and source monitor](RAG-CHATBOT.md) — how the current assistant finds project evidence, prepares answers and uses monitored public sources.
- [FastAPI AI service](../../ai/README.md) — extraction endpoint, internal APIs, tokens, safety controls and tests.
- [AI Assistant module plan](../roadmap/AI-ASSISTANT-MODULE.md) — user-facing assistant requirements and acceptance checks.
- [Phase 3 AI service architecture](../architecture/PHASE-3-AI-SERVICE.md) — technical service design and boundaries.

## Important concepts

- **Retrieval:** find records that may help answer a question.
- **RAG:** Retrieval-Augmented Generation; the model receives selected evidence before preparing an answer.
- **Chunk:** a smaller piece of a document used for search.
- **Embedding:** a numeric representation used for semantic similarity search.
- **Citation:** a reference that lets a reader find the original source or page.
- **Evaluation:** checking answers against reviewed examples and expected evidence.

An AI-generated answer is not itself a source. Keep original evidence and uncertainty visible.
