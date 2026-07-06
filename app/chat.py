import os

from dotenv import load_dotenv
from groq import Groq

from app.safety import review_output, validate_input

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
GROQ_MODEL = "openai/gpt-oss-20b"

SYSTEM_PROMPT = """You are a compassionate peer listener called Manas.
Your role is to provide emotional support and a safe space to talk.
You do NOT diagnose, prescribe medication, or act as a therapist.
You speak warmly, gently, and without judgment.
When offering comfort, use brief action asides in asterisks such as *warm hug* or *gentle smile*
(plain text only — no emoji). Use at most one per reply, at the start when natural.
Keep responses concise and focused. Avoid unnecessary repetition or filler phrases.
When using numbered lists, put each item on its own line starting with the number (e.g. "1. ..." then newline "2. ...") — never put the next number at the end of the previous item.
Do NOT suggest professional help unless the user seems seriously distressed. For everyday issues like sleep trouble or stress, just listen and offer practical support.
After 2 to 3 exchanges on the same problem, naturally transition from listening to offering a specific practical technique or coping strategy. Do not wait for the user to ask for it.
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
    portfolio_context: str | None = None,
) -> list:
    """Convert PostgreSQL history into Groq message format."""

    system_content = SYSTEM_PROMPT

    if portfolio_context:
        system_content += (
            "\n\n--- Personal profile (use for tailored support) ---\n"
            f"{portfolio_context}"
        )

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
            " Respond with extra warmth and care.]"
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
    portfolio_context: str | None = None,
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
        portfolio_context,
    )

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=messages,
    )

    reply = response.choices[0].message.content
    # Reasoning models (e.g. openai/gpt-oss-20b) can return None/empty content.
    # Never let that propagate — it would crash review_output and break the response.
    if not reply or not reply.strip():
        reply = (
            "I'm here with you. I didn't quite catch that — "
            "could you tell me a little more about what's on your mind?"
        )
    return review_output(reply)
