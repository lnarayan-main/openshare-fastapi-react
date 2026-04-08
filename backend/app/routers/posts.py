import shutil
import os
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas import PostCreate, PostResponse, PostPaginatedResponse
from app.auth import get_current_user
from app.models import User, Post
from decouple import config
from math import ceil
from app.tasks.email_tasks import send_new_post_notification

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
    
    # Sending new post creation email notification to other users
    other_users = db.query(User).filter(User.id != current_user.id).all()
    email_list = [u.email for u in other_users]

    if email_list:
        send_new_post_notification.delay(email_list, post.title, current_user.full_name)

    return post


@router.put("/update-post/{post_id}", response_model=PostResponse)
def update_post(
    post_id: int,
    title: str = Form(...),
    category: str = Form("General"),
    status: str = Form("Draft"),
    content: str = Form(...),
    thumbnail: UploadFile = File(None), # New file if user wants to change it
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Find the post and ensure the user owns it
    db_post = db.query(Post).filter(Post.id == post_id, Post.user_id == current_user.id).first()
    
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found or unauthorized")

    # 2. Handle Thumbnail Update
    if thumbnail:
        sub_folder = "post_thumbnails"
        target_dir = os.path.join(BASE_UPLOAD_DIR, sub_folder)
        os.makedirs(target_dir, exist_ok=True)

        # DELETE OLD FILE: If a new file is uploaded, remove the previous one from disk
        if db_post.thumbnail:
            # strip the leading "/" for local OS path
            old_file_path = db_post.thumbnail.lstrip("/")
            if os.path.exists(old_file_path):
                try:
                    os.remove(old_file_path)
                except Exception as e:
                    print(f"Log: Failed to delete {old_file_path}: {e}")

        # SAVE NEW FILE
        file_extension = os.path.splitext(thumbnail.filename)[1]
        unique_filename = f"{uuid4()}{file_extension}"
        file_save_path = os.path.join(target_dir, unique_filename)

        with open(file_save_path, "wb") as buffer:
            shutil.copyfileobj(thumbnail.file, buffer)

        # Update the database path
        db_post.thumbnail = f"/{BASE_UPLOAD_DIR}/{sub_folder}/{unique_filename}".replace("\\", "/")

    # 3. Update Text Fields
    db_post.title = title
    db_post.category = category
    db_post.status = status
    db_post.content = content

    db.commit()
    db.refresh(db_post)
    return db_post


@router.get("/get-posts", response_model=PostPaginatedResponse)
def get_posts(
    page: int = 1,
    page_size: int = 10,
    search: str = None,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Post).filter(Post.user_id == current_user.id)

    if search:
        query = query.filter(Post.title.ilike(f"%{search}%"))
    if status:
        query = query.filter(Post.status == status)

    total_count = query.count()
    total_pages = ceil(total_count / page_size)

    skip = (page - 1) * page_size
    posts = query.order_by(Post.created_at.desc()).offset(skip).limit(page_size).all()
    
    return {
        "posts": posts,
        "total_pages": total_pages,
        "current_page": page,
        "total_records": total_count 
    }


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

@router.delete("/delete-post/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id, Post.user_id == current_user.id).first()

    if post.thumbnail:
        file_path = post.thumbnail.lstrip("/")
        if os.path.exists(file_path):
            os.remove(file_path)

    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully."}
