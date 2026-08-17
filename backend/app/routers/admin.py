# app/routers/admin.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.services.qdrant_service import (
    insert_document, get_document, update_document, delete_document, list_documents
)
from app.auth import get_current_admin_user
from app.models import User

router = APIRouter(prefix="/api/admin/documents", tags=["Admin Documents"])

class DocumentCreate(BaseModel):
    text: str
    metadata: Optional[Dict[str, Any]] = None

class DocumentUpdate(BaseModel):
    text: str
    metadata: Optional[Dict[str, Any]] = None

class DocumentResponse(BaseModel):
    id: str
    payload: dict

class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]
    next_offset: Optional[int] = None

@router.post("/", response_model=DocumentResponse)
def create_document(
    doc: DocumentCreate,
    admin: User = Depends(get_current_admin_user)
):
    result = insert_document(doc.text, doc.metadata)
    return DocumentResponse(id=result["id"], payload=result["payload"])

@router.get("/", response_model=DocumentListResponse)
def list_docs(
    limit: int = 100,
    offset: int = 0,
    admin: User = Depends(get_current_admin_user)
):
    result = list_documents(limit, offset)
    return DocumentListResponse(
        documents=[DocumentResponse(id=str(d["id"]), payload=d["payload"]) for d in result["documents"]],
        next_offset=result["next_offset"]
    )

@router.get("/{doc_id}", response_model=DocumentResponse)
def get_doc(
    doc_id: str,
    admin: User = Depends(get_current_admin_user)
):
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentResponse(id=doc["id"], payload=doc["payload"])

@router.put("/{doc_id}", response_model=DocumentResponse)
def update_doc(
    doc_id: str,
    doc: DocumentUpdate,
    admin: User = Depends(get_current_admin_user)
):
    try:
        result = update_document(doc_id, doc.text, doc.metadata)
        return DocumentResponse(id=result["id"], payload=result["payload"])
    except ValueError:
        raise HTTPException(status_code=404, detail="Document not found")

@router.delete("/{doc_id}", status_code=204)
def delete_doc(
    doc_id: str,
    admin: User = Depends(get_current_admin_user)
):
    success = delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return None