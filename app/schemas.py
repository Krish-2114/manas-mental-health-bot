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


class PortfolioUpdate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=100)
    age: Optional[int] = Field(None, ge=13, le=120)
    pronouns: Optional[str] = Field(None, max_length=50)
    bio: Optional[str] = Field(None, max_length=1000)
    interests: Optional[str] = Field(None, max_length=500)
    coping_strategies: Optional[str] = Field(None, max_length=500)
    current_struggles: Optional[str] = Field(None, max_length=500)
    goals: Optional[str] = Field(None, max_length=500)
    preferred_tone: Optional[str] = Field(None, max_length=50)
    sos_enabled: Optional[bool] = None


class PortfolioOut(BaseModel):
    display_name: Optional[str]
    age: Optional[int]
    pronouns: Optional[str]
    bio: Optional[str]
    interests: Optional[str]
    coping_strategies: Optional[str]
    current_struggles: Optional[str]
    goals: Optional[str]
    preferred_tone: Optional[str]
    sos_enabled: bool
    sos_consent_at: Optional[datetime]

    class Config:
        from_attributes = True


class EmergencyContactCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    relationship_type: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)


class EmergencyContactOut(BaseModel):
    id: UUID
    name: str
    relationship_type: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
