from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.rag_service import rag_service


router = APIRouter(prefix="/rag", tags=["RAG / CHAT"])

class AskRequest(BaseModel):
    query: str
    limit: int = 3
    
class AskResponse(BaseModel):
    query: str
    answer: str
    sources: list = []
    intent: str
    
    
@router.post("/ask", response_model=AskResponse)
def ask_question(req: AskRequest):
    try:
        result = rag_service.ask(req.query, req.limit)
        return AskResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
