import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq
from llama_index.core import Settings, SimpleDirectoryReader, VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.vector_stores.chroma import ChromaVectorStore

from app.memory import get_pdf_collection

load_dotenv()

logger = logging.getLogger(__name__)

GROQ_MODEL = "llama-3.1-8b-instant"
PDF_DIR = Path("data/resources")
EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

_pdf_index = None
_groq_client = None


def _get_groq_client() -> Groq:
    global _groq_client
    if _groq_client is None:
        _groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    return _groq_client


def build_pdf_index() -> None:
    """Load PDFs from data/resources/ and build ChromaDB vector index on startup."""
    global _pdf_index

    embed_model = HuggingFaceEmbedding(model_name=EMBED_MODEL)
    Settings.embed_model = embed_model
    Settings.node_parser = SentenceSplitter(chunk_size=512, chunk_overlap=50)

    pdf_files = list(PDF_DIR.glob("*.pdf"))
    if not pdf_files:
        logger.warning("No PDFs found in %s — skipping RAG indexing.", PDF_DIR)
        return

    logger.info("Found %d PDF(s). Building RAG index...", len(pdf_files))

    collection = get_pdf_collection()
    vector_store = ChromaVectorStore(chroma_collection=collection)

    documents = SimpleDirectoryReader(
        input_dir=str(PDF_DIR),
        required_exts=[".pdf"],
    ).load_data()

    for doc in documents:
        doc.metadata["source"] = "pdf"
        doc.metadata["user_id"] = "global"
        doc.metadata["session_id"] = "rag"

    _pdf_index = VectorStoreIndex.from_documents(
        documents,
        vector_store=vector_store,
        show_progress=True,
    )
    logger.info("RAG index built successfully.")


def query_rag(question: str, top_k: int = 3) -> tuple[str, list[str]]:
    """Retrieve top chunks and generate a grounded answer via Groq."""
    collection = get_pdf_collection()

    results = collection.query(
        query_texts=[question],
        n_results=top_k,
        where={"source": "pdf"},
    )

    if not results["documents"] or not results["documents"][0]:
        return (
            "I couldn't find relevant information in the knowledge base. "
            "Please try rephrasing your question.",
            [],
        )

    sources = results["documents"][0]
    context = "\n\n---\n\n".join(sources)

    client = _get_groq_client()
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are Manas, a compassionate mental health support assistant. "
                    "Answer the user's question using ONLY the provided context. "
                    "If the context doesn't contain enough information, say so honestly. "
                    "Do not diagnose or prescribe medication."
                ),
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {question}",
            },
        ],
    )

    answer = response.choices[0].message.content
    return answer, sources
