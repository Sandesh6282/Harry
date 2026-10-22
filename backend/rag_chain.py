from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_classic.chains.retrieval  import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_classic.retrievers.ensemble import EnsembleRetriever
from langchain_classic.retrievers.contextual_compression import ContextualCompressionRetriever
from langchain_core.prompts import ChatPromptTemplate
from langchain_chroma import Chroma
from langchain_community.retrievers import BM25Retriever 
from langchain_cohere import CohereRerank
from dotenv import load_dotenv
import os
import re

def clean_response(text: str) -> str:
    """Clean up markdown responses by removing redundant divider symbols and trailing spacing."""
    if not text:
        return text
    # Remove lines consisting solely of 3 or more hyphens, asterisks, or underscores used as decorative dividers
    text = re.sub(r'^[ \t]*[-*_]{3,}[ \t]*$', '', text, flags=re.MULTILINE)
    # Collapse 3 or more consecutive newlines into 2
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

try:
    from . import vectorstore_handler
except ImportError:
    import vectorstore_handler

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
COHERE_API_KEY = os.getenv("COHERE_API_KEY")

def retrieve_answer(query: str, session_id: str):

    # Determine which vectorstore and documents to use
    session_data = vectorstore_handler.user_sessions.get(session_id, {})
    session_vs = session_data.get("vectorstore")
    session_docs = session_data.get("documents", [])

    # Use session store if available, otherwise fall back to global knowledge base
    if session_vs and session_docs:
        vectorstore = session_vs
        docs_for_bm25 = session_docs
    elif vectorstore_handler.global_vectorstore and vectorstore_handler.kb_ready:
        vectorstore = vectorstore_handler.global_vectorstore
        docs_for_bm25 = vectorstore_handler.global_documents
    else:
        raise ValueError("No context found! The knowledge base is still loading. Please try again in a moment.")

    semantic_retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 10}
    )

    if not docs_for_bm25:
        ensemble_retriever = semantic_retriever
    else:    
        bm25_retriever = BM25Retriever.from_documents(documents=docs_for_bm25, k=10)
        ensemble_retriever = EnsembleRetriever(retrievers=[bm25_retriever, semantic_retriever], weights=[0.3, 0.7])
    
    llm = ChatGoogleGenerativeAI(
        model="gemini-3.5-flash",
        google_api_key=GOOGLE_API_KEY
    )
    compressor = CohereRerank(
        cohere_api_key=COHERE_API_KEY,
        model="rerank-english-v3.0",
        top_n=3
    )
    retriever = ContextualCompressionRetriever(
        base_compressor=compressor,
        base_retriever=ensemble_retriever
    )
    system_prompt = (
        "You are an Advanced NLP Study Buddy — a friendly, knowledgeable teaching assistant "
        "for a university course on Advanced Natural Language Processing.\n\n"
        "Your role:\n"
        "- Explain NLP concepts clearly using simple language, examples, and analogies\n"
        "- Break down complex topics step-by-step\n"
        "- When relevant, mention real-world applications\n"
        "- If a concept has mathematical notation, explain it intuitively first, then formally\n"
        "- Use clear bullet points and clean structured formatting\n"
        "- Encourage the student by being warm and supportive\n\n"
        "Formatting & Style Rules:\n"
        "- Use clean, readable Markdown: standard headers (###) for major sections, bold terms for emphasis, and simple bullet points.\n"
        "- Do NOT use decorative symbols, repetitive divider lines (e.g., '---' or '***'), or excessive asterisks.\n"
        "- Ensure lists and bullet points are concise and directly readable.\n\n"
        "Rules:\n"
        "- ONLY answer from the provided context (course notes).\n"
        "- If the answer is not in the context, say: \"I couldn't find this in your course notes. "
        "You might want to check with your professor or refer to additional resources.\"\n"
        "- Always cite which topic/section the information comes from\n"
        "- Keep answers thorough but digestible — aim for the 'explain like I'm studying for exams' level\n\n"
        "Context: {context}"
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("human", "{input}")
        ]
    )

    question_answer_chain = create_stuff_documents_chain(llm, prompt)

    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    result = rag_chain.invoke({"input": query})

    if "answer" in result and isinstance(result["answer"], str):
        result["answer"] = clean_response(result["answer"])

    return result