# NLP Study Buddy — RAG-powered Student Assistant

An AI-powered student assistant for **Advanced Natural Language Processing** built with Retrieval-Augmented Generation (RAG). Ask questions about your NLP course notes and get grounded, cited answers with an explanatory, student-friendly tone.

## Domain

Advanced Natural Language Processing — covering transformers, attention mechanisms, NER, parsing, word embeddings, BERT, GPT, and more.

## Tech Stack

- **Backend**: Python, FastAPI, LangChain, ChromaDB (persistent), Google Gemini 3.5 Flash, Cohere Rerank
- **Frontend**: React + TypeScript (Vite), Tailwind CSS
- **Embeddings**: Google `gemini-embedding-001`
- **Retrieval**: Hybrid (BM25 + Semantic) → Cohere Rerank → LLM Generation
- **Evaluation**: RAGAS, pandas

## Architecture

1. **Ingest** — Course note PDFs are extracted, chunked (800 chars), and embedded at server startup. Stored persistently in ChromaDB.
2. **Retrieve** — User queries are matched using hybrid retrieval: BM25 keyword search + vector semantic search via ChromaDB.
3. **Generate** — Top re-ranked chunks (Cohere Rerank) are passed to Gemini 2.5 Flash with an NLP-tuned, student-friendly system prompt.
4. **Cite** — Every answer includes source citations (PDF name, page number, paragraph) so students can verify from their notes.

## Quick Start

### Backend

Requirements: Python 3.10+, Google API key, Cohere API key

```bash
pip install -r requirements.txt
```

Create `.env` in the project root:

```env
GOOGLE_API_KEY=your_google_api_key
COHERE_API_KEY=your_cohere_api_key
```

Place your NLP course PDFs in the `knowledge-base/` folder, then run:

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will automatically ingest the knowledge base on first startup. Subsequent restarts reuse the persisted embeddings.

### Frontend

```bash
cd frontend_v2
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Key Features

- **Pre-loaded knowledge base** — No upload needed; course notes are ingested once at startup
- **Hybrid retrieval** — BM25 + semantic search for better recall
- **Cohere Rerank** — Re-scores candidates for precision
- **Student-friendly tone** — Explanatory answers with examples and analogies
- **Source citations** — Every answer cites the exact PDF, page, and paragraph
- **Grounded answers** — Only answers from the provided context; says "I don't know" for out-of-scope questions

## Notes

- The knowledge base is persisted to `chroma_db/` — delete this folder to force re-ingestion
- Backend CORS allows localhost frontend development origins
- Additional PDFs can be uploaded via the "Add Notes" button in the UI
