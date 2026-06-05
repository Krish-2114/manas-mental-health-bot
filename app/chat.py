import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from app.memory import save_message, load_recent_memory

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = """You are a compassionate peer listener called Manas.
Your role is to provide emotional support and a safe space to talk.
You do NOT diagnose, prescribe medication, or act as a therapist.
You speak warmly, gently, and without judgment.
For any serious distress, you always encourage speaking to a professional."""

#Function to send the message and get the response using memory 
def chat(user_message: str) -> str:
    """Send a message and get a response with memory"""

    #  Load past conversations from ChromaDB
    history = load_recent_memory(n=10)

    # Add the new user message to history
    history.append(
        types.Content(
            role="user",
            parts=[types.Part(text=user_message)]
        )
    )

    # Send everything to Gemini
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=history,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT
        )
    )

    reply = response.text

    # Save both messages to ChromaDB for next time
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