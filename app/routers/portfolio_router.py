from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import EmergencyContact, User
from app.portfolio import get_or_create_portfolio, invalidate_portfolio_cache
from app.schemas import (
    EmergencyContactCreate,
    EmergencyContactOut,
    PortfolioOut,
    PortfolioUpdate,
)

router = APIRouter(prefix="/user", tags=["portfolio"])

MAX_CONTACTS = 3


@router.get("/portfolio", response_model=PortfolioOut)
def get_portfolio(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    portfolio = get_or_create_portfolio(db, user.id)
    db.commit()
    return portfolio


@router.put("/portfolio", response_model=PortfolioOut)
def update_portfolio(
    body: PortfolioUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    portfolio = get_or_create_portfolio(db, user.id)

    if body.sos_enabled is True:
        contacts = db.query(EmergencyContact).filter(EmergencyContact.user_id == user.id).count()
        if contacts == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Add at least one emergency contact before enabling SOS.",
            )
        portfolio.sos_consent_at = datetime.utcnow()
    elif body.sos_enabled is False:
        portfolio.sos_consent_at = None

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(portfolio, field, value)

    portfolio.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(portfolio)
    invalidate_portfolio_cache(user.id)
    return portfolio


@router.get("/emergency-contacts", response_model=list[EmergencyContactOut])
def list_contacts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(EmergencyContact)
        .filter(EmergencyContact.user_id == user.id)
        .order_by(EmergencyContact.created_at.asc())
        .all()
    )


@router.post("/emergency-contacts", response_model=EmergencyContactOut, status_code=status.HTTP_201_CREATED)
def add_contact(
    body: EmergencyContactCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not body.email and not body.phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide at least an email or phone number.",
        )

    count = db.query(EmergencyContact).filter(EmergencyContact.user_id == user.id).count()
    if count >= MAX_CONTACTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {MAX_CONTACTS} emergency contacts allowed.",
        )

    contact = EmergencyContact(
        user_id=user.id,
        name=body.name,
        relationship_type=body.relationship_type,
        email=body.email,
        phone=body.phone,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@router.delete("/emergency-contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(
    contact_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    contact = (
        db.query(EmergencyContact)
        .filter(EmergencyContact.id == contact_id, EmergencyContact.user_id == user.id)
        .first()
    )
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    db.delete(contact)
    db.commit()
