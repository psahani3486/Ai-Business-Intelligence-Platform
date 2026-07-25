import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def send_slack_alert(message: str, severity: str = "medium"):
    """
    Mock implementation of a Slack webhook notifier.
    In production, this would use requests.post to a SLACK_WEBHOOK_URL.
    """
    icon = "🚨" if severity.lower() == "high" else "⚠️"
    slack_payload = {
        "text": f"{icon} *[{severity.upper()}] New Alert*\n{message}"
    }
    # Mocking the network call
    logger.info(f"[SLACK MOCK] Sending payload: {slack_payload}")
    return True

def send_email_alert(subject: str, body: str, recipients: list = None):
    """
    Mock implementation of an SMTP email notifier.
    In production, this would use smtplib or an email API like SendGrid.
    """
    if not recipients:
        recipients = ["admin@quantumbi.com"]
        
    email_payload = {
        "to": recipients,
        "subject": subject,
        "body": body
    }
    # Mocking the network call
    logger.info(f"[EMAIL MOCK] Sending email: {email_payload}")
    return True
