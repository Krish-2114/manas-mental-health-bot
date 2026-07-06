import logging
import os
from pathlib import Path
import uuid
from datetime import datetime

from dotenv import load_dotenv
from groq import Groq

from app.memory import get_pdf_collection
from app.memory import search_pdf_rag

load_dotenv()

logger = logging.getLogger(__name__)

GROQ_MODEL = "openai/gpt-oss-20b"
PDF_DIR = Path("data/resources")
CHUNK_SIZE = 512
CHUNK_OVERLAP = 50

_groq_client = None


def _get_groq_client() -> Groq:
    global _groq_client
    if _groq_client is None:
        _groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    return _groq_client


def pdf_index_ready() -> bool:
    """True when PDF chunks are already indexed in Chroma."""
    try:
        return get_pdf_collection().count() > 0
    except Exception:
        return False


def build_pdf_index(force: bool = False) -> None:
    """
    Load PDFs from data/resources/, chunk their text, and add chunks directly to Chroma.

    This intentionally avoids LlamaIndex VectorStoreIndex/ChromaVectorStore because
    our runtime retrieval (`search_pdf_rag` in `app.memory`) queries the raw Chroma
    `pdf_collection` for documents.
    """
    collection = get_pdf_collection()
    if collection.count() > 0:
        logger.info("RAG index already exists (%d chunks) — skipping build.", collection.count())
        return
    if not force and pdf_index_ready():
        logger.info("PDF RAG index already exists — skipping rebuild.")
        return

    # Heavy deps loaded only when indexing is actually needed
    from llama_index.core import SimpleDirectoryReader
    from llama_index.core.node_parser import SentenceSplitter

    pdf_files = list(PDF_DIR.glob("*.pdf"))
    if not pdf_files:
        logger.warning("No PDFs found in %s — skipping RAG indexing.", PDF_DIR)
        return

    logger.info("Found %d PDF(s). Indexing into Chroma...", len(pdf_files))

    documents = SimpleDirectoryReader(
        input_dir=str(PDF_DIR),
        required_exts=[".pdf"],
    ).load_data()

    splitter = SentenceSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
    collection = get_pdf_collection()

    total_chunks = 0
    for doc_i, doc in enumerate(documents):
        # LlamaIndex Document typically exposes `.text`; keep it defensive.
        text = getattr(doc, "text", None)
        if text is None and hasattr(doc, "get_content"):
            try:
                text = doc.get_content()
            except Exception:
                text = None
        if not text:
            continue

        chunks = splitter.split_text(text)
        if not chunks:
            continue

        base_meta = dict(getattr(doc, "metadata", {}) or {})
        base_meta.update(
            {
                "source": "pdf",
                "user_id": "global",
                "session_id": "rag",
                "indexed_at": datetime.utcnow().isoformat(),
                "doc_index": doc_i,
            }
        )

        ids = [f"pdf_{uuid.uuid4()}" for _ in chunks]
        metadatas = [{**base_meta, "chunk_index": j} for j in range(len(chunks))]
        collection.add(documents=chunks, metadatas=metadatas, ids=ids)
        total_chunks += len(chunks)

    logger.info("PDF RAG index built successfully (%d chunk(s)).", total_chunks)


def query_rag(question: str, top_k: int = 3) -> tuple[str, list[str]]:
    """Retrieve top chunks and generate a grounded answer via Groq."""
    sources = search_pdf_rag(question, n=top_k, distance_threshold=1.2)
    if not sources:
        return (
            "I couldn't find relevant information in the knowledge base. "
            "Please try rephrasing your question.",
            [],
        )

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
