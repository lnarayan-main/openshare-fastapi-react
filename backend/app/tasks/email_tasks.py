from app.core.celery_app import celery_app
import smtplib
from email.message import EmailMessage
from app.core.config import settings
from app.utils.helpers import get_media_url 

@celery_app.task(name="send_new_post_notification")
def send_new_post_notification(post_id, user_emails, post_title, author_name, post_thumbnail=None):
    smtp_server = settings.MAIL_SERVER
    smtp_port = settings.MAIL_PORT
    smtp_user = settings.MAIL_USERNAME
    smtp_password = settings.MAIL_PASSWORD

    # Construct the Image URL
    thumbnail_url = get_media_url(post_thumbnail) if post_thumbnail else "https://via.placeholder.com/600x300"

    # Define a clean, modern HTML template
    html_content = f"""
    <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #eee;">
                <img src="{thumbnail_url}" alt="Post Thumbnail" style="width: 100%; height: 250px; object-cover: cover;">
                <div style="padding: 30px;">
                    <h2 style="color: #4f46e5; margin-top: 0;">New Post on {settings.APP_NAME}</h2>
                    <h1 style="font-size: 24px; color: #111; margin-bottom: 10px;">{post_title}</h1>
                    <p style="color: #666; font-size: 16px;">
                        Exciting news! <strong>{author_name}</strong> just shared a new story with the community.
                    </p>
                    <div style="margin-top: 30px;">
                        <a href="{settings.FRONTEND_URL}/posts/{post_id}" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Read Full Post</a>
                    </div>
                </div>
                <div style="background: #f4f4f7; padding: 15px; text-align: center; font-size: 12px; color: #999;">
                    You received this because you are a member of {settings.APP_NAME}.<br>
                    © 2026 {settings.APP_NAME}. All rights reserved.
                </div>
            </div>
        </body>
    </html>
    """

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)

            for email in user_emails:
                msg = EmailMessage()
                msg['Subject'] = f"🚀 New Post: {post_title}"
                msg['From'] = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM}>"
                msg["To"] = email
                
                # Set the HTML version
                msg.set_content("Check out the new post on our platform!") # Fallback for old apps
                msg.add_alternative(html_content, subtype='html')

                server.send_message(msg)
                print(f"Successfully sent styled notification to {email}")
                
    except Exception as e:
        print(f"SMTP Error: {e}")