import os
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic import EmailStr
from pathlib import Path

# Load config from environment
conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD"),
    MAIL_FROM = os.getenv("MAIL_FROM"),
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER = os.getenv("MAIL_SERVER"),
    MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME"),
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

async def send_forgot_password_email(email: EmailStr, token: str):
    reset_link = f"http://localhost:5173/reset-password/{token}"
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #4f46e5;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <a href="{reset_link}" style="background-color: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Link expires in 30 minutes.</p>
    </div>
    """

    message = MessageSchema(
        subject="Password Reset Instructions",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)