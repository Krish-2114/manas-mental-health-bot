from transformers import pipeline

#In this our main aim is to undersdatnd the emotion of the text which is done by j-hartman model and 
# it is called using the pipeline function of transformers

emotion_classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None)

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

def check_crisis_keywords(message: str)->bool:
    for keyword in CRISIS_KEYWORDS:
        if keyword in message.lower():
            return True
        
    return False

def classify_distress(message: str)->str:

    if len(message.split()) < 3:
        return "low"

    if(check_crisis_keywords(message)):
        return "high"
    
    results=emotion_classifier(message)[0]

    top_emotion=max(results,key=lambda x:x["score"])
    label = top_emotion["label"].lower()

    if label in HIGH_EMOTION_DISTRESS:
        return "high"
    elif label in MEDIUM_EMOTION_DISTRESS:
        return "medium"
    else:
        return "low"
    
if __name__ == "__main__":
    test_messages = [
        "I had a great day today!",
        "I feel really anxious lately",
        "I want to end my life",
        "I am so angry at everything",
        "I feel completely hopeless and sad"
    ]
    
    for msg in test_messages:
        level = classify_distress(msg)
        print(f"[{level.upper()}] {msg}")