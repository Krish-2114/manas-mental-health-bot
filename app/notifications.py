import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from sqlalchemy.orm import Session

from app.models import EmergencyContact, SosAlertLog, User, UserPortfolio

logger = logging.getLogger(__name__)

def _smtp_configured() -> bool:
    return bool(os.getenv("SMTP_USER") and os.getenv("SMTP_PASSWORD"))


def _twilio_configured() -> bool:
    return bool(
        os.getenv("TWILIO_ACCOUNT_SID")
        and os.getenv("TWILIO_AUTH_TOKEN")
        and os.getenv("TWILIO_PHONE_NUMBER")
    )


def _send_email(to_email: str, subject: str, body: str) -> bool:
    if not _smtp_configured():
        logger.warning("[SOS] SMTP not configured — email to %s skipped (logged only)", to_email)
        logger.info("[SOS EMAIL preview]\nTo: %s\nSubject: %s\n%s", to_email, subject, body)
        return False

    try:
        msg = MIMEMultipart()
        msg["From"] = os.getenv("SMTP_FROM", os.getenv("SMTP_USER"))
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(os.getenv("SMTP_HOST", "smtp.gmail.com"), int(os.getenv("SMTP_PORT", "587"))) as server:
            server.starttls()
            server.login(os.getenv("SMTP_USER"), os.getenv("SMTP_PASSWORD"))
            server.send_message(msg)
        logger.info("[SOS] Email sent to %s", to_email)
        return True
    except Exception as exc:
        logger.error("[SOS] Email failed to %s: %s", to_email, exc)
        return False


def _send_sms(to_phone: str, body: str) -> bool:
    if not _twilio_configured():
        logger.warning("[SOS] Twilio not configured — SMS to %s skipped (logged only)", to_phone)
        logger.info("[SOS SMS preview]\nTo: %s\n%s", to_phone, body)
        return False

    try:
        from twilio.rest import Client

        client = Client(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN"))
        client.messages.create(
            body=body,
            from_=os.getenv("TWILIO_PHONE_NUMBER"),
            to=to_phone,
        )
        logger.info("[SOS] SMS sent to %s", to_phone)
        return True
    except Exception as exc:
        logger.error("[SOS] SMS failed to %s: %s", to_phone, exc)
        return False


def notify_emergency_contacts(db: Session, user: User) -> int:
    """
    Notify trusted contacts when a genuine crisis is detected.
    Does NOT include message content — only a check-in alert.
    Returns number of contacts successfully notified.
    """
    portfolio = db.query(UserPortfolio).filter(UserPortfolio.user_id == user.id).first()
    if not portfolio or not portfolio.sos_enabled:
        logger.info("[SOS] Disabled for user %s", user.username)
        return 0

    contacts = db.query(EmergencyContact).filter(EmergencyContact.user_id == user.id).all()
    if not contacts:
        logger.info("[SOS] No emergency contacts for user %s", user.username)
        return 0

    display = portfolio.display_name or user.username
    email_subject = f"Manas SOS Alert — please check on {display}"
    email_body = (
        f"Hello,\n\n"
        f"This is an automated alert from Manas, a mental health support app.\n\n"
        f"{display} may be going through a very difficult time and could use your support right now.\n\n"
        f"Please reach out to them as soon as you can. A simple message or call can make a real difference.\n\n"
        f"Crisis helplines (India):\n"
        f"  iCall: 9152987821\n"
        f"  Vandrevala Foundation: 1860-2662-345\n\n"
        f"This alert was sent because {display} enabled SOS notifications in Manas "
        f"and our system detected a potential crisis. No message content is shared.\n\n"
        f"— Manas Safety System"
    )
    sms_body = (
        f"Manas SOS: {display} may need support right now. "
        f"Please check in on them. Crisis line: 9152987821"
    )

    notified = 0
    for contact in contacts:
        sent = False
        if contact.email:
            sent = _send_email(contact.email, email_subject, email_body) or sent
        if contact.phone:
            sent = _send_sms(contact.phone, sms_body) or sent
        if sent:
            notified += 1

    log = SosAlertLog(user_id=user.id, contacts_notified=notified)
    db.add(log)
    db.commit()

    logger.info("[SOS] Notified %d contact(s) for user %s", notified, user.username)
    return notified
