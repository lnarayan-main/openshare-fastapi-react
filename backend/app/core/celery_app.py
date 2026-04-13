from celery import Celery
from app.core.config import settings

redis_url = settings.REDIS_URL or "redis://localhost:6379"

celery_app = Celery(
    "worker",
    broker=redis_url,
    backend=redis_url,
    include=['app.tasks.email_tasks']
)

celery_app.conf.update(
    task_track_started = True,
    task_name_idempotent=True
)


