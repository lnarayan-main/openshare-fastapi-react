import shutil
import os
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas import PostCreate, PostResponse
from app.auth import get_current_user
from app.models import User, Post
from decouple import config

router = APIRouter(prefix="/api/posts", tags=["posts"])

BASE_UPLOAD_DIR = config("UPLOAD_DIR", default="static/uploads")

# @router.post("/create-post", response_model=PostResponse)
# def create_post(
#     data: PostCreate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     print("Data: ", data)
#     post = Post(
#         user_id=current_user.id,
#         title=data.title,
#         category=data.category,
#         status=data.status,
#         content=data.content,
#     )
#     db.add(post)
#     db.commit()
#     db.refresh(post)
#     return post


@router.post("/create-post", response_model=PostResponse)
def create_post(
    title: str = Form(...),
    category: str = Form("General"),
    status: str = Form("Draft"),
    content: str = Form(...),
    thumbnail: UploadFile = File(None), # Optional file
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    thumbnail_path = None

    if thumbnail:
        sub_folder = "post_thumbnails"
        target_dir = os.path.join(BASE_UPLOAD_DIR, sub_folder)
        if not os.path.exists(target_dir):
            os.makedirs(target_dir, exist_ok=True)
        
        file_extension = os.path.splitext(thumbnail.filename)[1]
        unique_filename = f"{uuid4()}{file_extension}"

        file_save_path = os.path.join(target_dir, unique_filename)
        
        with open(file_save_path, "wb") as buffer:
            shutil.copyfileobj(thumbnail.file, buffer)

        thumbnail_url = f"/{BASE_UPLOAD_DIR}/{sub_folder}/{unique_filename}".replace("\\", "/")

    post = Post(
        user_id=current_user.id,
        title=title,
        category=category,
        status=status,
        content=content,
        thumbnail=thumbnail_url 
    )

    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.put("/update-post/{post_id}", response_model=PostResponse)
def update_post(
    post_id: int, 
    post_update: PostCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_post = db.query(Post).filter(Post.id == post_id, Post.user_id == current_user.id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found or unauthorized")
    
    for key, value in post_update.dict().items():
        setattr(db_post, key, value)
    
    db.commit()
    db.refresh(db_post)
    return db_post


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


