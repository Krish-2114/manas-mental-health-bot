import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.rag import build_pdf_index
from app.routers import auth_router, chat_router, rag_router, sessions_router, user_router

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

app.include_router(auth_router.router)
app.include_router(chat_router.router)
app.include_router(sessions_router.router)
app.include_router(user_router.router)
app.include_router(rag_router.router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ensured.")
    try:
        build_pdf_index()
    except Exception as exc:
        logger.warning("RAG index build failed: %s", exc)


@app.get("/health")
def health():
    return {"status": "ok"}
