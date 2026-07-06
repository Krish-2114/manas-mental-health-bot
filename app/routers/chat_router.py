import logging
import os
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from groq import Groq
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.chat import CRISIS_RESPONSE, chat, format_cross_session_context
from app.classifier import classify_distress
from app.database import get_db
from app.memory import embed_message, search_pdf_rag, search_semantic
from app.models import Message, Session as ChatSession, User
from app.notifications import notify_emergency_contacts
from app.portfolio import get_cached_portfolio_context
from app.safety import safety_check, validate_input
from app.schemas import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)

_groq = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Intent labels returned by the pre-classifier
# CRISIS       → genuine self-harm / emergency → run safety_check normally
# MEDICAL      → asking for prescriptions / diagnoses / clinical advice → gentle decline
# SAFE         → normal conversation → proceed as usual
def _classify_intent(text: str) -> str:
    """
    Lightweight LLM call that runs BEFORE safety_check.
    Distinguishes genuine crisis messages from medical help-seeking requests
    so the latter don't incorrectly trigger the crisis response.
    """
    try:
        resp = _groq.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an intent classifier for a mental health chatbot. "
                        "Classify the user message into exactly ONE of these labels:\n\n"
                        "CRISIS   — the message contains suicidal ideation, self-harm intent, "
                        "or an immediate threat to life.\n"
                        "MEDICAL  — the message is asking for a prescription, specific medication, "
                        "clinical diagnosis, dosage, or medical treatment that requires a licensed doctor.\n"
                        "SAFE     — everything else: emotional support, general questions, grounding, "
                        "coping strategies, life problems, jokes, etc.\n\n"
                        "Reply with ONLY the single word: CRISIS, MEDICAL, or SAFE. No explanation."
                    ),
                },
                {"role": "user", "content": text},
            ],
            max_tokens=5,
        )
        label = resp.choices[0].message.content.strip().upper()
        if label in ("CRISIS", "MEDICAL", "SAFE"):
            return label
        return "SAFE"
    except Exception:
        return "SAFE"

router = APIRouter(tags=["chat"])


def _generate_title(text: str) -> str:
    cleaned = text.strip()
    return cleaned[:40] + ("..." if len(cleaned) > 40 else "")


def _load_cross_session_messages(
    db: Session, user_id: UUID, current_session_id: UUID, limit: int = 30
) -> list[Message]:
    """Load recent messages from other sessions for cross-chat memory."""
    return (
        db.query(Message)
        .join(ChatSession)
        .filter(
            ChatSession.user_id == user_id,
            Message.session_id != current_session_id,
        )
        .order_by(Message.created_at.desc())
        .limit(limit)
        .all()[::-1]
    )


def _get_portfolio_context(db: Session, user_id) -> str | None:
    return get_cached_portfolio_context(db, user_id)


def _handle_crisis(
    db: Session,
    user: User,
    session: ChatSession,
    user_text: str,
) -> ChatResponse:
    """
    Same path as the crisis popup (distress=high + helpline message).
    Also notifies emergency contacts if the user has SOS enabled.
    """
    user_msg = Message(session_id=session.id, role="user", content=user_text)
    db.add(user_msg)
    assistant_msg = Message(
        session_id=session.id,
        role="assistant",
        content=CRISIS_RESPONSE,
        distress_level="high",
    )
    db.add(assistant_msg)
    session.updated_at = datetime.utcnow()
    db.commit()

    embed_message(str(user.id), str(session.id), user_text, source="chat")
    embed_message(str(user.id), str(session.id), CRISIS_RESPONSE, source="chat")

    notified = notify_emergency_contacts(db, user)
    if notified:
        logger.info("[SOS] Notified %d contact(s) for %s", notified, user.username)
    else:
        logger.info("[SOS] Crisis detected for %s — alerts off or not configured", user.username)

    return ChatResponse(
        response=CRISIS_RESPONSE,
        session_id=session.id,
        distress="high",
    )


def _is_recall_query(text: str) -> bool:
    lowered = text.lower()
    recall_phrases = [
        "past", "previous", "before", "remember", "wrote", "written",
        "said", "earlier", "last time", "last chat", "other chat",
        "other session", "what did i", "what had i", "recall",
    ]
    return any(phrase in lowered for phrase in recall_phrases)


@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(
    body: ChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    is_valid, error_msg = validate_input(body.text)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)

    if body.session_id:
        session = (
            db.query(ChatSession)
            .filter(ChatSession.id == body.session_id, ChatSession.user_id == user.id)
            .first()
        )
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
    else:
        session = ChatSession(
            user_id=user.id,
            title=_generate_title(body.text),
        )
        db.add(session)
        db.flush()

    # Pre-classify intent so medical requests never trigger the crisis path
    intent = _classify_intent(body.text)
    logger.info("[INTENT] %s — %r", intent, body.text[:60])

    if intent == "MEDICAL":
        # Decline politely — route through normal chat with explicit instruction
        medical_instruction = (
            body.text
            + "\n\n[System note: The user is asking for medical advice, a prescription, "
            "or clinical diagnosis. You MUST politely explain that you are not a doctor "
            "and cannot prescribe medication or make diagnoses. Encourage them to consult "
            "a qualified healthcare professional. Keep the tone warm and supportive.]"
        )
        history = (
            db.query(Message)
            .filter(Message.session_id == session.id)
            .order_by(Message.created_at.asc())
            .all()
        )
        user_msg = Message(session_id=session.id, role="user", content=body.text)
        db.add(user_msg)
        db.flush()
        portfolio_context = _get_portfolio_context(db, user.id)
        reply = chat(
            user_message=medical_instruction,
            history=history,
            distress="low",
            portfolio_context=portfolio_context,
            session_id=str(session.id),
        )
        assistant_msg = Message(
            session_id=session.id,
            role="assistant",
            content=reply,
            distress_level="low",
        )
        db.add(assistant_msg)
        session.updated_at = datetime.utcnow()
        db.commit()
        embed_message(str(user.id), str(session.id), body.text, source="chat")
        embed_message(str(user.id), str(session.id), reply, source="chat")
        return ChatResponse(response=reply, session_id=session.id, distress="low")

    # Only run the full safety check for non-medical messages
    if intent == "CRISIS":
        is_safe = False
    else:
        is_safe, _ = safety_check(body.text)

    if not is_safe:
        return _handle_crisis(db, user, session, body.text)

    distress = classify_distress(body.text)

    if distress == "high":
        return _handle_crisis(db, user, session, body.text)

    history = (
        db.query(Message)
        .filter(Message.session_id == session.id)
        .order_by(Message.created_at.asc())
        .all()
    )

    user_msg = Message(session_id=session.id, role="user", content=body.text)
    db.add(user_msg)
    db.flush()

    recall_query = _is_recall_query(body.text)
    if recall_query:
        recall_limit = 50
        cross_session_msgs = _load_cross_session_messages(
            db, user.id, session.id, limit=recall_limit
        )
        cross_session_context = format_cross_session_context(cross_session_msgs) or None
    else:
        cross_session_context = None

    semantic_n = 10 if recall_query else 5
    semantic_chunks = search_semantic(str(user.id), body.text, n=semantic_n)
    if recall_query and not semantic_chunks:
        semantic_chunks = search_semantic(
            str(user.id), "previous conversations feelings thoughts", n=semantic_n
        )
    semantic_context = "\n".join(semantic_chunks) if semantic_chunks else None

    # RAG: search PDFs, inject only if relevant chunks found
    pdf_chunks = search_pdf_rag(body.text, n=3, distance_threshold=1.2)
    rag_context = "\n\n---\n\n".join(pdf_chunks) if pdf_chunks else None
    if pdf_chunks:
        logger.info("[RAG] %d chunk(s) injected for: %r", len(pdf_chunks), body.text[:60])
    else:
        logger.info("[RAG] No relevant chunks — using general knowledge for: %r", body.text[:60])

    portfolio_context = _get_portfolio_context(db, user.id)

    reply = chat(
        user_message=body.text,
        history=history,
        distress=distress,
        semantic_context=semantic_context,
        cross_session_context=cross_session_context,
        rag_context=rag_context,
        portfolio_context=portfolio_context,
        session_id=str(session.id),
    )

    assistant_msg = Message(
        session_id=session.id,
        role="assistant",
        content=reply,
        distress_level=distress,
    )
    db.add(assistant_msg)
    session.updated_at = datetime.utcnow()
    db.commit()

    embed_message(str(user.id), str(session.id), body.text, source="chat")
    embed_message(str(user.id), str(session.id), reply, source="chat")

    return ChatResponse(
        response=reply,
        session_id=session.id,
        distress=distress,
    )
