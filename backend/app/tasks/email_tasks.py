from app.core.celery_app import celery_app
import smtplib
from email.message import EmailMessage
from app.core.config import settings

@celery_app.task(name="send_new_post_notification")
def send_new_post_notification(user_emails, post_title, author_name):
    smtp_server = settings.MAIL_SERVER
    smtp_port = settings.MAIL_PORT
    smtp_user = settings.MAIL_USERNAME
    smtp_password = settings.MAIL_PASSWORD

    for email in user_emails:
        msg = EmailMessage()
        msg.set_content(f"Hi! {author_name} just posted a new blog: {post_title}")
        msg['Subject'] = f"New post on {settings.APP_NAME}: {post_title} created!"
        msg['From'] = f"{settings.MAIL_FROM_NAME} <noreply@example.com>"
        msg["To"] = email

        try:
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
                print(f"Successfully sent notification to {email}")
        except Exception as e:
            print(f"Failed to send to {email}: {e}")


