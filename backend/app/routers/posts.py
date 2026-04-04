from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas import PostCreate, PostResponse
from app.auth import get_current_user
from app.models import User, Post

router = APIRouter(prefix="/api/posts", tags=["posts"])


@router.post("/create-post", response_model=PostResponse)
def create_post(
    data: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    print("Data: ", data)
    post = Post(
        user_id=current_user.id,
        title=data.title,
        category=data.category,
        status=data.status,
        content=data.content,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.get("/get-posts", response_model=List[PostResponse])
def get_posts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Get messages between current user and specified user
    posts = (
        db.query(Post)
        .filter((Post.user_id == current_user.id))
        .order_by(Post.created_at.desc())
        .all()
    )

    db.commit()
    return posts[::-1]


@router.get("/all-posts", response_model=List[PostResponse])
def get_posts(
    db: Session = Depends(get_db),
):
    # Get messages between current user and specified user
    posts = (
        db.query(Post)
        .order_by(Post.created_at.desc())
        .all()
    )

    db.commit()
    return posts[::-1]


@router.get("/post-by-id/{post_id}", response_model=PostResponse)
def get_posts(
    post_id: int,
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


