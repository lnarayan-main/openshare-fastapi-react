from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import Optional

class Settings(BaseSettings):
    # App Settings
    BACKEND_URL: str
    FRONTEND_URL: str
    APP_NAME: str
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # File Uploads
    UPLOAD_DIR: str = "static/uploads"

    # Mail Settings (Gmail SMTP)
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_FROM_NAME: Optional[str] = None
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True

    #Cloudinary
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    # Redis Server
    REDIS_URL: Optional[str] = None
    
    # Qdrant VectorDB
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_COLLECTION: str = "my_test_collection"
    OLLAMA_HOST: str = "http://localhost:11434"
    EMBEDDING_MODEL: str = "mxbai-embed-large:latest"
    VECTOR_SIZE: int = 1024
    
    # Ollama model
    OLLAMA_GEN_MODEL: str = "qwen2.5:3b"
    OLLAMA_INTENT_MODEL: str = "qwen2.5:3b"
    
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL: int = 3600  # 1 hour
    
    CONTACT_EMAIL: str = "support@yourapp.com"
    CONTACT_PHONE: str = "+1-800-555-0199"

    @field_validator("MAIL_FROM_NAME", mode="before")
    @classmethod
    def set_mail_from_name(cls, v, info):
        if not v or "${APP_NAME}" in str(v):
            return info.data.get("APP_NAME", "OpenShare Platform")
        return v

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()