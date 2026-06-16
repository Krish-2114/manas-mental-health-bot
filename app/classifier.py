import logging
import threading

logger = logging.getLogger(__name__)

_classifier = None
_classifier_lock = threading.Lock()

# Only explicit crisis emotions → high
HIGH_EMOTION_DISTRESS = ["disgust"]

# Sadness and fear → medium, Manas talks but with extra care
MEDIUM_EMOTION_DISTRESS = ["fear", "sadness", "anger", "surprise"]

# Positive and neutral → low
LOW_EMOTION_DISTRESS = ["joy", "neutral"]

CRISIS_KEYWORDS = [
    "end my life", "kill myself", "want to die",
    "suicide", "hurt myself", "can't go on"
]


def _get_classifier():
    """Load emotion model on first use so the API can start immediately."""
    global _classifier
    if _classifier is not None:
        return _classifier
    with _classifier_lock:
        if _classifier is None:
            logger.info("Loading emotion classifier (first chat request may take a moment)...")
            from transformers import pipeline

            _classifier = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                top_k=None,
            )
            logger.info("Emotion classifier ready.")
    return _classifier


def check_crisis_keywords(message: str) -> bool:
    for keyword in CRISIS_KEYWORDS:
        if keyword in message.lower():
            return True
    return False


def classify_distress(message: str) -> str:
    if len(message.split()) < 3:
        return "low"

    if check_crisis_keywords(message):
        return "high"

    results = _get_classifier()(message)[0]
    top_emotion = max(results, key=lambda x: x["score"])
    label = top_emotion["label"].lower()

    if label in HIGH_EMOTION_DISTRESS:
        return "high"
    if label in MEDIUM_EMOTION_DISTRESS:
        return "medium"
    return "low"


if __name__ == "__main__":
    test_messages = [
        "I had a great day today!",
        "I feel really anxious lately",
        "I want to end my life",
        "I am so angry at everything",
        "I feel completely hopeless and sad",
    ]

    for msg in test_messages:
        level = classify_distress(msg)
        print(f"[{level.upper()}] {msg}")
