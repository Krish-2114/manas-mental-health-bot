# Manas --- AI Mental Health Chatbot

Manas is an AI-powered mental wellness chatbot with conversational AI,
chat history, semantic memory, PDF-based retrieval, and safety checks.

## Architecture

``` mermaid
flowchart TD
    U[User] --> FE[React Frontend]
    FE -->|Axios requests + JWT| API[FastAPI Backend]
    API --> AUTH[Authentication]
    API --> ROUTER[Chat Router]
    AUTH --> PG[(PostgreSQL)]
    ROUTER --> SAFE[Safety Checks]
    SAFE --> CLASS[DistilRoBERTa Distress Classifier]
    SAFE -->|Crisis path| ALERT[Emergency Contact Notifications]
    ROUTER --> MEM[ChromaDB Semantic Memory]
    ROUTER --> RAG[LlamaIndex PDF Processing]
    RAG --> VDB[(ChromaDB PDF Chunks)]
    MEM --> CTX[Relevant Context]
    VDB --> CTX
    CTX --> LLM[GPT-OSS 20B via Groq API]
    LLM --> ROUTER
    ROUTER --> PG
    ROUTER --> FE
```

### Architecture summary

1.  The user interacts with the React frontend.
2.  Axios sends requests to the FastAPI backend; protected routes use
    JWT authentication.
3.  The chat router validates the message and coordinates safety checks.
4.  The safety pipeline uses keyword checks, an LLM-based safety check,
    and a DistilRoBERTa classifier. Potential crisis messages can follow
    a dedicated handling path.
5.  When relevant, the backend retrieves context from conversation
    memory in ChromaDB and PDF resources indexed for RAG.
6.  GPT-OSS 20B generates the response through Groq's API.
7.  The response and conversation records are stored in PostgreSQL.
    Selected message content can also be embedded for semantic
    retrieval.

Not every message necessarily uses every check or retrieval step; the
flow depends on the request.

## Tech Stack

-   **Frontend:** React, Vite, Axios, Zustand, Tailwind CSS
-   **Backend:** Python, FastAPI
-   **Language model:** GPT-OSS 20B through Groq API
-   **Relational database:** PostgreSQL, SQLAlchemy
-   **Vector database:** ChromaDB
-   **PDF processing / RAG:** LlamaIndex
-   **Distress classification:** Hugging Face Transformers,
    DistilRoBERTa
-   **Authentication:** JWT, bcrypt
-   **Validation:** Pydantic
-   **Notifications:** SMTP email; optional Twilio SMS when configured

## Main Features

-   User registration and login
-   JWT-protected API routes
-   Chat sessions and persistent chat history
-   Context-aware responses using profile and conversation information
-   Semantic retrieval of relevant past messages
-   Retrieval-augmented generation over PDF resources
-   Keyword and LLM-based safety checks
-   Distress-level estimation using DistilRoBERTa
-   Crisis response workflow and configurable emergency-contact
    notifications
-   Profile and mood-history information
-   Wellness tools available through the frontend

## What Each File Does

### Backend

  -----------------------------------------------------------------------
  File                                Responsibility
  ----------------------------------- -----------------------------------
  `main.py`                           Creates the FastAPI application,
                                      registers routers, and initialises
                                      backend components.

  `app/auth.py`                       Contains password hashing and JWT
                                      authentication utilities.

  `app/chat.py`                       Integrates the Groq API, defines
                                      the system prompt, and builds the
                                      messages sent to the language
                                      model.

  `app/classifier.py`                 Uses DistilRoBERTa-based text
                                      classification to estimate the
                                      distress level expressed in a
                                      message.

  `app/safety.py`                     Implements input validation,
                                      keyword-based checks, LLM-based
                                      safety checks, and output review.

  `app/memory.py`                     Stores and searches vector
                                      embeddings in ChromaDB for semantic
                                      retrieval.

  `app/rag.py`                        Reads and chunks PDF resources and
                                      retrieves relevant content for RAG.

  `app/database.py`                   Configures the SQLAlchemy database
                                      engine and sessions.

  `app/models.py`                     Defines database models for
                                      structured application data.

  `app/schemas.py`                    Defines Pydantic schemas used to
                                      validate API request and response
                                      data.

  `app/routers/auth_router.py`        Handles registration and login
                                      endpoints.

  `app/routers/chat_router.py`        Coordinates the main chat flow,
                                      including checks, context
                                      retrieval, response generation, and
                                      message storage.

  `app/routers/sessions_router.py`    Lists, retrieves, and deletes chat
                                      sessions.

  `app/routers/user_router.py`        Provides user profile information
                                      and related history.

  `app/routers/rag_router.py`         Exposes the PDF knowledge-base
                                      query endpoint.

  `alembic/`                          Contains database migration
                                      configuration and migration
                                      scripts.
  -----------------------------------------------------------------------

### Frontend

  -----------------------------------------------------------------------
  Path                                Responsibility
  ----------------------------------- -----------------------------------
  `frontend/src/pages/`               Contains the main pages, such as
                                      landing, login, signup, chat, and
                                      profile.

  `frontend/src/components/`          Contains reusable UI elements,
                                      including the sidebar, message
                                      bubbles, distress badge, and crisis
                                      banner.

  `frontend/src/api/client.js`        Configures Axios requests and
                                      attaches the JWT to authenticated
                                      API calls.
  -----------------------------------------------------------------------

## API Endpoints

  Method     Endpoint           Description
  ---------- ------------------ ------------------------------------------
  `POST`     `/auth/register`   Create an account
  `POST`     `/auth/login`      Log in
  `POST`     `/chat`            Send a chat message
  `GET`      `/sessions`        List chat sessions
  `GET`      `/sessions/{id}`   Get session messages
  `DELETE`   `/sessions/{id}`   Delete a session
  `GET`      `/user/profile`    Get profile and mood-history information
  `POST`     `/rag/query`       Query the PDF knowledge base
  `GET`      `/health`          Check API health

When the backend is running locally, interactive API documentation is
available at `http://localhost:8000/docs`.

## Project Structure

``` text
mental-health-bot/
├── main.py
├── alembic/
├── data/
│   └── resources/                 # PDF resources for RAG
├── app/
│   ├── auth.py
│   ├── chat.py
│   ├── classifier.py
│   ├── safety.py
│   ├── memory.py
│   ├── rag.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   └── routers/
│       ├── auth_router.py
│       ├── chat_router.py
│       ├── sessions_router.py
│       ├── user_router.py
│       └── rag_router.py
└── frontend/
    └── src/
        ├── pages/
        ├── components/
        └── api/
            └── client.js
```

## Local Setup

### Prerequisites

-   Python 3.10+
-   Node.js 18+
-   PostgreSQL
-   Groq API key

### 1. Configure environment variables

Copy the example environment file:

``` bash
cp .env.example .env
```

Set the values for your environment:

``` text
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/manas
GROQ_API_KEY=your_groq_api_key
SECRET_KEY=replace_with_a_long_random_secret
```

Keep real API keys and secrets private. Do not commit `.env` to source
control.

### 2. Create the database

``` bash
psql -U postgres -c "CREATE DATABASE manas;"
```

### 3. Install backend dependencies

``` bash
python -m venv venv
```

Windows:

``` bash
venv\Scripts\activate
```

macOS/Linux:

``` bash
source venv/bin/activate
```

Then:

``` bash
pip install -r requirements.txt
```

### 4. Run database migrations

``` bash
alembic upgrade head
```

### 5. Add PDF resources (optional)

Place PDF files in `data/resources/`. The RAG index is built during
application startup.

### 6. Start the backend

``` bash
uvicorn main:app --reload --port 8000
```

API documentation: `http://localhost:8000/docs`

### 7. Start the frontend

Open a separate terminal:

``` bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Notes

-   GPT-OSS 20B is the model configured for conversational generation
    through Groq.
-   ChromaDB supports semantic retrieval for both conversation memory
    and PDF chunks.
-   Email notifications require valid SMTP configuration. SMS requires
    the optional Twilio configuration.
-   Safety checks are safeguards, not a clinical diagnosis or a
    guarantee that every crisis will be detected.
-   Do not describe the application as cloud-deployed unless a
    deployment has been completed and verified.
