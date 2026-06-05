import os
from dotenv import load_dotenv
from groq import Groq
from app.memory import save_message, load_recent_memory
from app.classifier import classify_distress

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
GROQ_MODEL = "llama-3.1-8b-instant"

SYSTEM_PROMPT = """You are a compassionate peer listener called Manas.
Your role is to provide emotional support and a safe space to talk.
You do NOT diagnose, prescribe medication, or act as a therapist.
You speak warmly, gently, and without judgment.
For any serious distress, you always encourage speaking to a professional."""

CRISIS_RESPONSE = """I'm really concerned about what you've shared.
Please reach out to a crisis helpline immediately:

iCall (India): 9152987821
Vandrevala Foundation: 1860-2662-345

You don't have to face this alone."""


def build_messages(history: list, user_message: str, distress: str) -> list:
    """Convert memory history into Groq message format"""
    
    # Always start with system prompt
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Add past conversation from memory
    for msg in history:
        if isinstance(msg, dict):
            role = msg["parts"][0]["text"] if "parts" in msg else msg.get("content", "")
            speaker = "assistant" if msg.get("role") == "model" else "user"
        else:
            role = msg.parts[0].text
            speaker = "assistant" if msg.role == "model" else "user"
        messages.append({"role": speaker, "content": role})
    
    # Add current message
    if distress == "medium":
        guided = (
            user_message +
            " [Note to Manas: This person seems moderately distressed."
            " Respond with extra care and gently suggest professional help.]"
        )
        messages.append({"role": "user", "content": guided})
    else:
        messages.append({"role": "user", "content": user_message})
    
    return messages


def chat(user_message: str) -> str:
    """Send a message and get a response with memory and distress detection"""

    # Step 1 — Check distress level first
    distress = classify_distress(user_message)
    print(f"[Distress level: {distress}]")

    # Step 2 — High distress = crisis response, skip LLM
    if distress == "high":
        save_message("user", user_message)
        save_message("model", CRISIS_RESPONSE)
        return CRISIS_RESPONSE

    # Step 3 — Load memory
    history = load_recent_memory(n=10)

    # Step 4 — Build messages in Groq format
    messages = build_messages(history, user_message, distress)

    # Step 5 — Send to Groq
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=messages
    )

    reply = response.choices[0].message.content

    # Step 6 — Save to memory
    save_message("user", user_message)
    save_message("model", reply)

    return reply


if __name__ == "__main__":
    print("Manas: Hi, I'm here to listen. How are you feeling today?")
    print("(Type 'exit' to quit)\n")
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Manas: Take care. I'm here whenever you need to talk.")
            break
        response = chat(user_input)
        print(f"Manas: {response}\n")