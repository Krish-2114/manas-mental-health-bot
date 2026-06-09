from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    token: str
    username: str


class ChatRequest(BaseModel):
    text: str
    session_id: Optional[UUID] = None


class ChatResponse(BaseModel):
    response: str
    session_id: UUID
    distress: str


class SessionSummary(BaseModel):
    id: UUID
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MessageOut(BaseModel):
    role: str
    content: str
    distress_level: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class MoodEntry(BaseModel):
    date: str
    distress_level: str


class UserProfile(BaseModel):
    username: str
    joined_date: datetime
    total_sessions: int
    mood_history: list[MoodEntry]


class RagQueryRequest(BaseModel):
    question: str


class RagQueryResponse(BaseModel):
    answer: str
    sources: list[str]
