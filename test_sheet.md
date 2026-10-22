# NLP Study Buddy — 5-Question Test Sheet

## Test Methodology
Each question is designed to test a different aspect of the RAG pipeline:
1. **Factual retrieval** — Direct fact from the notes
2. **Conceptual explanation** — "Explain" style question
3. **Comparison** — Comparing two concepts
4. **Out-of-scope** — Question NOT covered in the notes
5. **Multi-section synthesis** — Requires pulling from multiple parts of the notes

---

## Test Questions & Expected Behavior

| # | Question | Type | Expected Behavior |
|---|---|---|---|
| 1 | What is the Transformer architecture and what are its main components? | Factual | Returns accurate description with encoder/decoder, attention layers; cites Module PDF and page |
| 2 | Explain the attention mechanism in simple terms with an example | Conceptual | Student-friendly explanation with analogy; step-by-step breakdown; cites source |
| 3 | What is the difference between BERT and GPT? | Comparison | Structured comparison (bidirectional vs autoregressive, masked LM vs causal LM); cites relevant modules |
| 4 | What is the chemical formula of water? | Out-of-scope | Responds with "I couldn't find this in your course notes" or similar |
| 5 | How do word embeddings relate to the attention mechanism in transformers? | Multi-section | Connects word embedding concepts to attention; pulls from multiple module sections |

---

## Results

| # | Status | Answer Quality | Citations Correct | Notes |
|---|---|---|---|---|
| 1 | ⬜ | | | |
| 2 | ⬜ | | | |
| 3 | ⬜ | | | |
| 4 | ⬜ | | | |
| 5 | ⬜ | | | |

---

## Scoring Criteria
- **Answer Quality**: Does the answer correctly address the question using course material?
- **Citations**: Are source PDFs, pages, and paragraphs provided and accurate?
- **Tone**: Is the response student-friendly and explanatory?
- **Grounding**: Does it ONLY use information from the provided notes?
- **Out-of-scope handling**: Does it correctly refuse to answer irrelevant questions?
