from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.qdrant_service import insert_text, search_query

router = APIRouter(prefix="/qdrant", tags=["Qdrant Test"])


class InsertRequest(BaseModel):
    text: str
    metadata: dict = {}
    
    
class SearchRequest(BaseModel):
    query: str
    limit: int = 5
    

@router.post("/insert")
def insert_document(req: InsertRequest):
    try:
        result = insert_text(req.text, req.metadata)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search")
def search_document(req: SearchRequest):
    try:
        results = search_query(req.query, req.limit)
        return {"query": req.query, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
