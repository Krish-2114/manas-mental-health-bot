from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Message, Session as ChatSession, User
from app.schemas import MoodEntry, UserProfile

router = APIRouter(tags=["user"])


@router.get("/user/profile", response_model=UserProfile)
def get_profile(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_sessions = (
        db.query(func.count(ChatSession.id))
        .filter(ChatSession.user_id == user.id)
        .scalar()
    )

    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    messages = (
        db.query(Message)
        .join(ChatSession)
        .filter(
            ChatSession.user_id == user.id,
            Message.role == "assistant",
            Message.distress_level.isnot(None),
            Message.created_at >= thirty_days_ago,
        )
        .order_by(Message.created_at.asc())
        .all()
    )

    daily_distress: dict[str, list[str]] = defaultdict(list)
    for msg in messages:
        date_key = msg.created_at.strftime("%Y-%m-%d")
        daily_distress[date_key].append(msg.distress_level)

    distress_rank = {"low": 0, "medium": 1, "high": 2}
    mood_history = []
    for date_key in sorted(daily_distress.keys()):
        levels = daily_distress[date_key]
        worst = max(levels, key=lambda d: distress_rank.get(d, 0))
        mood_history.append(MoodEntry(date=date_key, distress_level=worst))

    return UserProfile(
        username=user.username,
        joined_date=user.created_at,
        total_sessions=total_sessions or 0,
        mood_history=mood_history,
    )
