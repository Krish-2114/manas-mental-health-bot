import os
from groq import Groq
from dotenv import load_dotenv

# Layer 1 — keyword lists for instant detection
CRISIS_ENGLISH = [
    "want to die", "end my life", "kill myself",
    "hurt myself", "can't go on", "no reason to live",
    "saying goodbye", "won't be here", "better off without me",
    "don't want to exist", "want it to end"
]

CRISIS_HINDI = [
    "जान देना", "मरना चाहता", "मरना चाहती",
    "जिंदगी खत्म", "खुद को मारना"
]

INDIRECT_DANGER = [
    "saying goodbye to everyone",
    "giving away my things",
    "nobody would miss me",
    "everyone would be better off",
    "last time we talk",
    "don't want to be a burden"
]

def validate_input(message: str) -> tuple:
    
    if not message or not message.strip():
        return False, "Please share what's on your mind."
    if len(message) > 1000:
        return False, "Please keep your message under 1000 characters."
    return True, ""

def llm_safety_check(message: str) -> tuple:
    """
    Layer 2 — uses Groq LLM to detect crisis intent.
    Catches typos, indirect language, any language.
    Only called when keyword check passes.
    """
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a crisis detection system. Respond with ONLY the word 'CRISIS' or 'SAFE'. "
                    "Respond 'CRISIS' ONLY if the message contains explicit suicidal ideation, explicit "
                    "self-harm intent, or an immediate threat to life such as 'I want to kill myself' or "
                    "'I want to hurt myself'. "
                    "Everyday expressions of distress, frustration, anxiety, racing thoughts, sleep "
                    "problems, or feeling overwhelmed are NOT crisis — respond 'SAFE' for these. "
                    "No explanation. No other words. Just CRISIS or SAFE."
                )
            },
            {"role": "user", "content": message}
        ]
    )

    result = response.choices[0].message.content.strip().upper()

    if "CRISIS" in result:
        return False, "crisis"
    return True, ""


def safety_check(message: str) -> tuple:
    """
    Hybrid safety check — two layers:
    Layer 1: keyword check (instant, no API call)
    Layer 2: LLM check (smart, catches everything else)
    """
    message_lower = message.lower()

    # Layer 1 — keyword check (instant)
    all_crisis_phrases = CRISIS_ENGLISH + INDIRECT_DANGER
    for phrase in all_crisis_phrases:
        if phrase in message_lower:
            return False, "crisis"

    # Hindi and Marathi — no lowercasing needed
    for phrase in CRISIS_HINDI:
        if phrase in message:
            return False, "crisis"

    # Layer 2 — LLM check for everything else
    return llm_safety_check(message)

def review_output(response: str) -> str:
    """
    Reviews Manas's reply before sending to user.
    Replaces harmful clinical advice with safe redirect.
    """
    BANNED_PHRASES = [
        "you should take",
        "recommended dosage",
        "take this medication",
        "diagnose you with",
        "you have depression",
        "you have anxiety"
    ]

    response_lower = response.lower()
    for phrase in BANNED_PHRASES:
        if phrase in response_lower:
            return (
                "I hear you, and I want to help. "
                "For specific guidance like this, please speak "
                "to a qualified mental health professional. "
                "I'm here to listen and support you."
            )

    return response