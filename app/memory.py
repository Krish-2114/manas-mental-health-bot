import os
import chromadb
from datetime import datetime

chroma_client = chromadb.PersistentClient(path="memory_store")
collection = chroma_client.get_or_create_collection(name="manas_memory")


def save_message(role: str, message: str):
    """Save a single message to the database"""
    collection.add(
        documents=[message],
        metadatas=[{
            "role": role,
            "timestamp": str(datetime.now())
        }],
        ids=[f"{role}_{datetime.now().timestamp()}"]
    )


def load_recent_memory(n: int = 10) -> list:
    """Load the last n messages from the database"""
    results = collection.get()

    if not results["documents"]:
        return []

    # Pair each message with its metadata
    messages = list(zip(results["documents"], results["metadatas"]))

    # Sort by timestamp — oldest message first
    messages.sort(key=lambda x: x[1]["timestamp"])

    # Take only the last n messages
    recent = messages[-n:]

    # Convert to the format Gemini expects
    history = []
    for doc, meta in recent:
        history.append({
            "role": meta["role"],
            "parts": [{"text": doc}]
        })

    return history