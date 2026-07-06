import logging

from app.models import UserPortfolio

logger = logging.getLogger(__name__)

# Single-process in-memory cache only — not shared across uvicorn workers or replicas.
# Use Redis (or similar) if the app is ever deployed with multiple processes.
_portfolio_context_cache: dict[str, str | None] = {}


def format_portfolio_context(portfolio: UserPortfolio | None) -> str | None:
    """Format user portfolio into a system-prompt block for personalization."""
    if not portfolio:
        return None

    parts = []
    if portfolio.display_name:
        parts.append(f"Preferred name: {portfolio.display_name}")
    if portfolio.age:
        parts.append(f"Age: {portfolio.age}")
    if portfolio.pronouns:
        parts.append(f"Pronouns: {portfolio.pronouns}")
    if portfolio.bio:
        parts.append(f"About them: {portfolio.bio}")
    if portfolio.interests:
        parts.append(f"Interests: {portfolio.interests}")
    if portfolio.coping_strategies:
        parts.append(f"What helps them cope: {portfolio.coping_strategies}")
    if portfolio.current_struggles:
        parts.append(f"Current struggles: {portfolio.current_struggles}")
    if portfolio.goals:
        parts.append(f"Personal goals: {portfolio.goals}")
    if portfolio.preferred_tone:
        parts.append(f"Preferred tone: {portfolio.preferred_tone}")

    if not parts:
        return None

    return (
        "Use this personal context to tailor your responses — reference their "
        "interests, coping strategies, and goals naturally when relevant. "
        "Do not repeat the profile back verbatim.\n" + "\n".join(parts)
    )


def get_cached_portfolio_context(db, user_id) -> str | None:
    key = str(user_id)
    if key in _portfolio_context_cache:
        return _portfolio_context_cache[key]

    # Never let a portfolio lookup/format error 500 the whole /chat request —
    # personalization is optional, so degrade gracefully to no context.
    try:
        portfolio = (
            db.query(UserPortfolio).filter(UserPortfolio.user_id == user_id).first()
        )
        context = format_portfolio_context(portfolio)
    except Exception:
        logger.exception("Failed to load portfolio context for user %s", key)
        return None

    _portfolio_context_cache[key] = context
    return context


def invalidate_portfolio_cache(user_id) -> None:
    _portfolio_context_cache.pop(str(user_id), None)


def get_or_create_portfolio(db, user_id) -> UserPortfolio:
    portfolio = db.query(UserPortfolio).filter(UserPortfolio.user_id == user_id).first()
    if not portfolio:
        portfolio = UserPortfolio(user_id=user_id)
        db.add(portfolio)
        db.flush()
    return portfolio
