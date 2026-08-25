import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db  # <-- Uses your existing PostgreSQL connection
from app.models import ChatMessage as ChatMessageModel
from app.schemas import ChatSendRequest, ChatSendResponse, ChatMessageResponse
from app.services.rag_service import rag_service
from app.auth import get_current_user
from datetime import datetime
from typing import List
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.get("/history", response_model=List[ChatMessageResponse])
def get_chat_history(
    db: Session = Depends(get_db),  # <-- Your existing SQLAlchemy session
    current_user = Depends(get_current_user)
):
    """Fetch last 100 messages for the logged-in user."""
    user_id = str(current_user.id)
    
    messages = db.query(ChatMessageModel).filter(
        ChatMessageModel.user_id == user_id
    ).order_by(ChatMessageModel.timestamp.asc()).limit(100).all()
    
    return [
        ChatMessageResponse(
            role=msg.role,
            content=msg.content,
            timestamp=msg.timestamp
        )
        for msg in messages
    ]

@router.post("/send", response_model=ChatSendResponse)
def send_message(
    request: ChatSendRequest,
    db: Session = Depends(get_db),  # <-- Reusing your existing session
    current_user = Depends(get_current_user)
):
    user_id = str(current_user.id)
    
    # 1. Save the user's message
    user_msg = ChatMessageModel(
        user_id=user_id,
        role="user",
        content=request.message
    )
    print("############ USER Message: ", user_msg)
    db.add(user_msg)
    db.commit()  # Commit early so it's saved even if AI fails later

    # 2. Call your RAG pipeline
    try:
        rag_result = rag_service.ask(request.message, limit=3)
        reply_text = rag_result["answer"]
        sources = rag_result.get("sources", [])
    except Exception as e:
        print(f"RAG Error: {e}")
        reply_text = "Sorry, I'm having trouble processing your request right now."
        sources = []

    # 3. Save the AI's reply
    ai_msg = ChatMessageModel(
        user_id=user_id,
        role="ai",
        content=reply_text,
        extra_data=sources if sources else None
    )
    db.add(ai_msg)
    db.commit()

    return ChatSendResponse(reply=reply_text, sources=sources)


@router.post("/send_stream_old")
async def send_stream_message_old(
    request: ChatSendRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user_id = str(current_user.id)
    
    # 1. Save the user's message immediately
    user_msg = ChatMessageModel(
        user_id=user_id,
        role="user",
        content=request.message
    )
    db.add(user_msg)
    db.commit()

    # 2. Retrieve relevant documents (this is fast and blocking, but acceptable)
    search_results = rag_service.retrieve(request.message, limit=3)

    # 3. Create the streaming generator
    async def generate_events():
        full_reply = ""
        sources = []
        
        # Send sources as the first event (optional, but useful for UI)
        for res in search_results:
            sources.append({
                "id": res.get("id"),
                "text": res.get("payload", {}).get("text", ""),
                "score": res.get("score")
            })
        
        yield f"data: {json.dumps({'type': 'sources', 'data': sources})}\n\n"

        # Stream tokens from Ollama
        for token in rag_service.generate_stream(request.message, search_results):
            full_reply += token
            # Send token event
            yield f"data: {json.dumps({'type': 'token', 'data': token})}\n\n"

        # 4. Save the FULL AI reply to the database after streaming finishes
        ai_msg = ChatMessageModel(
            user_id=user_id,
            role="ai",
            content=full_reply,
            extra_data=sources if sources else None
        )
        db.add(ai_msg)
        db.commit()

        # 5. Send a final "done" event
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(generate_events(), media_type="text/event-stream")



@router.post("/send_stream")
async def send_stream_message(
    request: ChatSendRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user_id = str(current_user.id)
    
    # 1. Save user message
    user_msg = ChatMessageModel(
        user_id=user_id,
        role="user",
        content=request.message
    )
    db.add(user_msg)
    db.commit()
    
     # We'll capture sources here
    captured_sources = None

    # 2. Streaming generator (uses cache internally)
    async def generate_events():
        nonlocal captured_sources
        full_reply = ""
        
        # ✅ Use stream_with_cache – it handles retrieval, cache, and sources internally
        # But we need sources for the frontend? If you want sources, you'll need to modify stream_with_cache
        # to yield sources as the first event. For now, we only stream tokens.
        for event_type, data in rag_service.stream_with_cache(request.message, limit=3):
            if event_type == "sources":
                captured_sources = data
                yield f"data: {json.dumps({'type': 'sources', 'data': data})}\n\n"
            elif event_type == "token":
                full_reply += data
                yield f"data: {json.dumps({'type': 'token', 'data': data})}\n\n"

        # Save AI message to DB
        ai_msg = ChatMessageModel(
            user_id=user_id,
            role="ai",
            content=full_reply,
            extra_data=captured_sources  # You'll need to capture sources from the event loop
        )
        db.add(ai_msg)
        db.commit()
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(generate_events(), media_type="text/event-stream")


@router.delete("/history", status_code=204)
def delete_chat_history(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete all chat history for the current user."""
    user_id = str(current_user.id)
    db.query(ChatMessageModel).filter(ChatMessageModel.user_id == user_id).delete()
    db.commit()
    return None

