import ollama
from app.core.config import settings
from app.core.qdrant_client import qdrant_manager
from qdrant_client.http.models import PointStruct


def embed_text(text: str) -> list[float]:
    response = ollama.embeddings(
        model=settings.EMBEDDING_MODEL,
        prompt=text
    )
    return response["embedding"]

def insert_text(text: str, metadata: dict = None) -> dict:
    """Embed and upsert a single docuement"""
    vector = embed_text(text)
    point = PointStruct(
        id=hash(text) % 10**9,
        vector=vector,
        payload={
            "text":text,
            **(metadata or {})
        }
    )
    
    qdrant_manager.client.upsert(
        collection_name=settings.QDRANT_COLLECTION,
        points = [point]
    )
    
    return {"id": point.id, "text": text}

def search_query(query: str, limit: int = 5) -> list:
    """Embed the query and search."""
    vector = embed_text(query)
    results =  qdrant_manager.client.query_points(
        collection_name = settings.QDRANT_COLLECTION,
        query=vector,
        limit=limit,
        with_payload=True,
    )
    
    print("######### Results: ", results)
    print("######### Points list: ", results.points)
    
    return [
        {"id": hit.id, "score": hit.score, "payload": hit.payload} 
        for hit in results.points
    ]

