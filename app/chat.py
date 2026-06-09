import os

from dotenv import load_dotenv
from groq import Groq

from app.safety import review_output, validate_input

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
GROQ_MODEL = "llama-3.1-8b-instant"

SYSTEM_PROMPT = """You are a compassionate peer listener called Manas.
Your role is to provide emotional support and a safe space to talk.
You do NOT diagnose, prescribe medication, or act as a therapist.
You speak warmly, gently, and without judgment.
For any serious distress, you always encourage speaking to a professional.

You DO remember this person across chat sessions. When they ask what they said
before, in a previous chat, or in the past, refer honestly to the earlier
conversation context provided below. Never say you have no memory or that each
chat is a blank slate. Summarize gently what they shared. For past crisis
messages, respond with continued care and encourage professional support."""

CRISIS_RESPONSE = """I'm really concerned about what you've shared.
Please reach out to a crisis helpline immediately:

iCall (India): 9152987821
Vandrevala Foundation: 1860-2662-345

You don't have to face this alone."""


def format_cross_session_context(messages: list) -> str:
    """Format messages from other sessions into readable context."""
    if not messages:
        return ""
    lines = []
    for msg in messages:
        if isinstance(msg, dict):
            role = msg.get("role", "user")
            content = msg.get("content", "")
        else:
            role = msg.role
            content = msg.content
        speaker = "User" if role == "user" else "Manas"
        lines.append(f"{speaker}: {content}")
    return "\n".join(lines)


def build_messages(
    history: list,
    user_message: str,
    distress: str,
    semantic_context: str | None = None,
    cross_session_context: str | None = None,
    rag_context: str | None = None,
) -> list:
    """Convert PostgreSQL history into Groq message format."""

    system_content = SYSTEM_PROMPT

    if rag_context:
        system_content += (
            "\n\n--- Verified information from mental health resources ---\n"
            f"{rag_context}\n"
            "When answering, prefer this verified information where relevant. "
            "If it does not fully address the question, supplement with your own knowledge "
            "and make clear which parts come from the resources vs. general knowledge."
        )

    if cross_session_context:
        system_content += (
            "\n\n--- Earlier conversations (other sessions) ---\n"
            f"{cross_session_context}"
        )
    if semantic_context:
        system_content += (
            f"\n\n--- Semantically related past messages ---\n{semantic_context}"
        )

    messages = [{"role": "system", "content": system_content}]

    for msg in history:
        if isinstance(msg, dict):
            content = msg.get("content", "")
            role = msg.get("role", "user")
        else:
            content = msg.content
            role = msg.role

        speaker = "assistant" if role == "assistant" else "user"
        messages.append({"role": speaker, "content": content})

    if distress == "medium":
        guided = (
            user_message
            + " [Note to Manas: This person seems moderately distressed."
            " Respond with extra care and gently suggest professional help.]"
        )
        messages.append({"role": "user", "content": guided})
    else:
        messages.append({"role": "user", "content": user_message})

    return messages


def chat(
    user_message: str,
    history: list | None = None,
    distress: str = "low",
    semantic_context: str | None = None,
    cross_session_context: str | None = None,
    rag_context: str | None = None,
    session_id: str | None = None,
) -> str:
    """Generate a Manas response using Groq with history, memory, and optional RAG."""

    is_valid, error_msg = validate_input(user_message)
    if not is_valid:
        return error_msg

    history = history or []
    messages = build_messages(
        history,
        user_message,
        distress,
        semantic_context,
        cross_session_context,
        rag_context,
    )

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=messages,
    )

    reply = response.choices[0].message.content
    return review_output(reply)
