import os
import uuid
from datetime import datetime

import chromadb

CHROMA_PATH = os.getenv("CHROMA_PATH", "memory_store")
CHAT_COLLECTION = "manas_chat_memory"
PDF_COLLECTION = "manas_pdf_rag"

chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
chat_collection = chroma_client.get_or_create_collection(name=CHAT_COLLECTION)
pdf_collection = chroma_client.get_or_create_collection(name=PDF_COLLECTION)


def embed_message(
    user_id: str,
    session_id: str,
    content: str,
    source: str = "chat",
) -> None:
    """Embed a message chunk into ChromaDB for semantic retrieval."""
    collection = chat_collection if source == "chat" else pdf_collection
    collection.add(
        documents=[content],
        metadatas=[{
            "user_id": user_id,
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat(),
            "source": source,
        }],
        ids=[f"{source}_{uuid.uuid4()}"],
    )


def search_semantic(
    user_id: str,
    query: str,
    n: int = 5,
    source: str | None = None,
) -> list[str]:
    """Retrieve semantically similar message chunks for a user."""
    where_filter: dict = {"user_id": user_id}
    if source:
        where_filter = {"$and": [{"user_id": user_id}, {"source": source}]}

    results = chat_collection.query(
        query_texts=[query],
        n_results=n,
        where=where_filter,
    )

    if not results["documents"] or not results["documents"][0]:
        return []

    return results["documents"][0]


def search_pdf_rag(
    query: str,
    n: int = 3,
    distance_threshold: float = 1.2,
) -> list[str]:
    """
    Search the PDF RAG collection for relevant chunks.
    Only returns chunks whose cosine distance is below the threshold
    (lower = more similar). Returns empty list when no PDFs are indexed
    or nothing is relevant enough.
    """
    try:
        count = pdf_collection.count()
    except Exception:
        return []

    if count == 0:
        return []

    n_results = min(n, count)
    results = pdf_collection.query(
        query_texts=[query],
        n_results=n_results,
        include=["documents", "distances"],
    )

    if not results["documents"] or not results["documents"][0]:
        return []

    relevant = []
    for doc, dist in zip(results["documents"][0], results["distances"][0]):
        if dist <= distance_threshold:
            relevant.append(doc)

    return relevant


def get_pdf_collection():
    return pdf_collection
