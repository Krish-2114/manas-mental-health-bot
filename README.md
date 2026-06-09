# Manas — AI Mental Health Chatbot

A compassionate AI-powered mental health chatbot with JWT auth, PostgreSQL chat history, ChromaDB semantic memory, and RAG over PDF resources.

## Project Structure

```
mental-health-bot/
├── main.py                      # FastAPI entry point
├── alembic/                     # Database migrations
├── data/resources/              # PDF files for RAG
├── app/
│   ├── auth.py                  # JWT + bcrypt authentication
│   ├── chat.py                  # Groq LLM integration
│   ├── classifier.py            # DistilRoBERTa distress classification
│   ├── safety.py                # Hybrid safety guardrails
│   ├── memory.py                # ChromaDB semantic memory (RAG-only)
│   ├── rag.py                   # LlamaIndex PDF indexing + query
│   ├── database.py              # SQLAlchemy engine + session
│   ├── models.py                # User, Session, Message models
│   ├── schemas.py               # Pydantic request/response schemas
│   └── routers/
│       ├── auth_router.py       # POST /auth/register, /auth/login
│       ├── chat_router.py       # POST /chat
│       ├── sessions_router.py   # GET/DELETE /sessions
│       ├── user_router.py       # GET /user/profile
│       └── rag_router.py        # POST /rag/query
└── frontend/
    └── src/
        ├── pages/               # Landing, Login, Signup, Chat, Profile
        ├── components/          # Sidebar, MessageBubble, DistressBadge, CrisisBanner
        └── api/client.js        # Axios client with JWT interceptor
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Groq API key ([console.groq.com](https://console.groq.com))

## Step-by-Step Setup

### 1. Clone and configure environment

```bash
cp .env.example .env
```

Edit `.env` with your real values:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/manas
GROQ_API_KEY=gsk_...
SECRET_KEY=a-long-random-secret-string
```

### 2. Create PostgreSQL database

```bash
psql -U postgres -c "CREATE DATABASE manas;"
```

### 3. Install backend dependencies

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Run database migrations

```bash
alembic upgrade head
```

### 5. (Optional) Add PDF resources for RAG

Place mental health PDF files in `data/resources/`. The RAG index builds automatically on startup.

### 6. Start the backend

```bash
uvicorn main:app --reload --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 7. Install and start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: [http://localhost:5173](http://localhost:5173)

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Login |
| POST | `/chat` | Yes | Send message |
| GET | `/sessions` | Yes | List sessions |
| GET | `/sessions/{id}` | Yes | Get session messages |
| DELETE | `/sessions/{id}` | Yes | Delete session |
| GET | `/user/profile` | Yes | User profile + mood history |
| POST | `/rag/query` | Yes | Query PDF knowledge base |
| GET | `/health` | No | Health check |

## Architecture Notes

- **PostgreSQL** stores users, sessions, and chat history
- **ChromaDB** stores embedded message chunks (semantic memory) and PDF chunks (RAG)
- **Groq** (`llama-3.1-8b-instant`) powers chat and RAG answers
- **classifier.py** and **safety.py** are used as-is — not modified
