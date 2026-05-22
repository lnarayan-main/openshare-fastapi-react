from fastapi import APIRouter, Depends
from langchain_ollama import ChatOllama
from app.schemas import ChatRequest
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models import User, ChatHistory


router = APIRouter(prefix="/api/ai", tags=["chats"])


# Initialize local Llama 3.2 on your RTX 3050
llm = ChatOllama(model="llama3.2")


@router.post("/chat")
async def chat_with_ai(request: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_msg = ChatHistory(user_id=current_user.id, role="user", content=request.message)

    db.add(user_msg)

    response = llm.invoke(request.message)
    
    ai_msg = ChatHistory(user_id=current_user.id, role="ai", content=response.content)
    db.add(ai_msg)
    
    db.commit()
    return {"reply": response.content}


@router.get("/chat/history")
async def get_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    history = db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).order_by(ChatHistory.created_at.asc()).all()
    return history