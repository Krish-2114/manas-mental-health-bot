import logging
import threading

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.rag import build_pdf_index, pdf_index_ready

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Manas", description="AI-powered mental health chatbot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _register_routers():
    """Import routers lazily so heavy ML deps are not loaded until needed."""
    from app.routers import (
        auth_router,
        chat_router,
        portfolio_router,
        rag_router,
        sessions_router,
        user_router,
    )

    app.include_router(auth_router.router)
    app.include_router(chat_router.router)
    app.include_router(sessions_router.router)
    app.include_router(user_router.router)
    app.include_router(portfolio_router.router)
    app.include_router(rag_router.router)


_register_routers()


def _warm_rag_index():
    try:
        build_pdf_index()
    except Exception as exc:
        logger.warning("RAG index build failed: %s", exc)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ensured.")

    if pdf_index_ready():
        logger.info("PDF RAG index ready.")
    else:
        logger.info("PDF RAG index missing — building in background...")
        threading.Thread(target=_warm_rag_index, daemon=True).start()


@app.get("/health")
def health():
    return {
        "status": "ok",
        "rag_index": pdf_index_ready(),
    }
