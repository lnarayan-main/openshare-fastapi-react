from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from app.core.config import settings


class QdrantManager:
    def __init__(self):
        self.client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
        self._ensure_collection()
        
    def _ensure_collection(self):
        collections = self.client.get_collections().collections
        if not any(c.name == settings.QDRANT_COLLECTION for c in collections):
            self.client.create_collection(
                collection_name=settings.QDRANT_COLLECTION,
                vectors_config=VectorParams(
                    size=settings.VECTOR_SIZE,
                    distance=Distance.COSINE,
                ),
            )
            
            
qdrant_manager = QdrantManager()

