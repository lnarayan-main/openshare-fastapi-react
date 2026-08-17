import ollama
from app.core.config import settings
from app.core.qdrant_client import qdrant_manager
from qdrant_client.http.models import PointStruct
from typing import Optional, Dict, Any
import uuid


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
    
    # print("######### Results: ", results)
    # print("######### Points list: ", results.points)
    
    return [
        {"id": hit.id, "score": hit.score, "payload": hit.payload} 
        for hit in results.points
    ]



def insert_document(text: str, metadata: Dict[str, Any] = None) -> dict:
    """
    Insert a single document with a UUID as point id.
    Returns the created point id.
    """
    point_id = str(uuid.uuid4())
    vector = embed_text(text)
    payload = {"text": text, **(metadata or {})}
    point = PointStruct(
        id=point_id,
        vector=vector,
        payload=payload
    )
    qdrant_manager.client.upsert(
        collection_name=settings.QDRANT_COLLECTION,
        points=[point]
    )
    return {"id": point_id, "text": text, "payload": payload}

def get_document(point_id: str) -> Optional[dict]:
    """Retrieve a single document by its point ID."""
    result = qdrant_manager.client.retrieve(
        collection_name=settings.QDRANT_COLLECTION,
        ids=[point_id],
        with_payload=True,
        with_vectors=False
    )
    if not result:
        return None
    point = result[0]
    return {
        "id": point.id,
        "payload": point.payload
    }

def update_document(point_id: str, text: str, metadata: Dict[str, Any] = None) -> dict:
    """Update an existing document (replaces text and merges metadata)."""
    # First get existing to merge metadata if not fully replaced
    existing = get_document(point_id)
    if not existing:
        raise ValueError("Document not found")
    
    # Merge new metadata with existing, or replace entirely?
    # We'll do a full replace of payload (except we keep old metadata if not provided)
    if metadata is None:
        metadata = existing["payload"].copy()
        metadata.pop("text", None)  # remove text from metadata
    else:
        # merge with existing metadata? We'll just use the new metadata as provided.
        pass
    
    # Update payload
    new_payload = {"text": text, **metadata}
    vector = embed_text(text)
    point = PointStruct(
        id=point_id,
        vector=vector,
        payload=new_payload
    )
    qdrant_manager.client.upsert(
        collection_name=settings.QDRANT_COLLECTION,
        points=[point]
    )
    return {"id": point_id, "text": text, "payload": new_payload}

def delete_document(point_id: str) -> bool:
    """Delete a document by point ID."""
    result = qdrant_manager.client.delete(
        collection_name=settings.QDRANT_COLLECTION,
        points_selector=[point_id]
    )
    return result.status == "completed"

def list_documents(limit: int = 100, offset: int = 0) -> dict:
    """
    List all documents with pagination.
    Since Qdrant doesn't have a direct "list all" without vector, we use a dummy query.
    We'll use a zero vector and a large limit, but that's inefficient.
    Better: use scroll() which returns all points.
    """
    # Use scroll to get all points without scoring
    points, next_offset = qdrant_manager.client.scroll(
        collection_name=settings.QDRANT_COLLECTION,
        limit=limit,
        offset=offset,
        with_payload=True,
        with_vectors=False
    )
    docs = []
    for point in points:
        docs.append({
            "id": point.id,
            "payload": point.payload
        })
    return {
        "documents": docs,
        "next_offset": next_offset,
        "total": None  # Qdrant doesn't give total easily, we can count separately if needed
    }