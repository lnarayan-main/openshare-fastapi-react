from app.core.config import settings

def get_media_url(file_path: str) -> str:
    """
    Converts a database file path into a fully qualified URL.
    """
    if not file_path:
        return "https://via.placeholder.com/600x300" # Fallback image

    # If the path is already a full URL (like from Cloudinary/S3), return it
    if file_path.startswith(("http://", "https://")):
        return file_path

    # Otherwise, build the URL pointing to your FastAPI static folder
    # Example: http://localhost:8000/static/uploads/my_image.jpg
    base_url = settings.BACKEND_URL.rstrip('/')
    return f"{base_url}/{file_path.lstrip('/')}"