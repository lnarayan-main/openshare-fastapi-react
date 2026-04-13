from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
import os
import shutil
from datetime import datetime
from PIL import Image

from app.database import get_db
from app.schemas import UserResponse, UserUpdate
from app.auth import get_current_user
from app.models import User
from decouple import config
from uuid import uuid4
from app.core.cloudinary_config import cloudinary

router = APIRouter(prefix="/api/users", tags=["users"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

BASE_UPLOAD_DIR = config("UPLOAD_DIR", default="static/uploads")


@router.get("/", response_model=list[UserResponse])
def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    users = (
        db.query(User)
        .filter(User.id != current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return users


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/profile", response_model=UserResponse)
def update_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check if email is being changed and if it's already taken
    if user_update.email and user_update.email != current_user.email:
        existing_user = db.query(User).filter(User.email == user_update.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already taken")
        current_user.email = user_update.email

    # Check if mobile number is being changed and if it's already taken
    if (
        user_update.mobile_number
        and user_update.mobile_number != current_user.mobile_number
    ):
        existing_user = (
            db.query(User)
            .filter(User.mobile_number == user_update.mobile_number)
            .first()
        )
        if existing_user:
            raise HTTPException(status_code=400, detail="Mobile number already taken")
        current_user.mobile_number = user_update.mobile_number

    # Update other fields
    if user_update.full_name:
        current_user.full_name = user_update.full_name
    if user_update.about_me is not None:
        current_user.about_me = user_update.about_me
    if user_update.address is not None:
        current_user.address = user_update.address

    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    return current_user


# @router.post("/profile-pic", response_model=UserResponse)
# async def upload_profile_pic(
#     profile_pic: UploadFile = File(...),
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     if not profile_pic.content_type.startswith("image/"):
#         raise HTTPException(status_code=400, detail="File must be an image")
    
#     sub_folder = "profile_pics"
#     target_dir = os.path.join(BASE_UPLOAD_DIR, sub_folder)
#     os.makedirs(target_dir, exist_ok=True)

#     if current_user.profile_pic:
#         old_file_path = current_user.profile_pic.lstrip("/")
#         if os.path.exists(old_file_path):
#             try:
#                 os.remove(old_file_path)
#             except Exception as e:
#                 print(f"Log: Could not delete old file {old_file_path}: {e}")

#     file_extension = ".jpg" # We are forcing JPEG in optimization
#     unique_name = f"user_{current_user.id}_{uuid4().hex[:8]}{file_extension}"
#     file_save_path = os.path.join(target_dir, unique_name)

#     try:
#         with Image.open(profile_pic.file) as img:
#             if img.mode in ("RGBA", "P"):
#                 img = img.convert("RGB")
            
#             img.thumbnail((500, 500))
            
#             img.save(file_save_path, "JPEG", quality=85)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Image processing failed: {e}")
    
#     relative_web_path = f"/{BASE_UPLOAD_DIR}/{sub_folder}/{unique_name}".replace("\\", "/")

#     current_user.profile_pic = relative_web_path
#     db.commit()
#     db.refresh(current_user)

#     return current_user



@router.post("/profile-pic", response_model=UserResponse)
async def upload_profile_pic(
    profile_pic: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not profile_pic.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    if profile_pic:
        try:
            if current_user.profile_pic_public_id:
                try:
                    cloudinary.uploader.destroy(current_user.profile_pic_public_id)
                except Exception as delete_error:
                    print(f"⚠️ Failed to delete old profile pic: {delete_error}")

            res = cloudinary.uploader.upload(
                profile_pic.file,
                folder=f"open_share/profile_pics/{current_user.id}",
                transformation=[{"width": 600, "height": 600, "crop": "limit"}],  
                overwrite=True
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


        current_user.profile_pic = res.get("secure_url")
        current_user.profile_pic_public_id = res.get("public_id")

    db.commit()
    db.refresh(current_user)

    return current_user


@router.delete("/profile-pic", response_model=UserResponse)
def delete_profile_pic(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.profile_pic:
        # Delete file from system
        file_path = os.path.join(".", current_user.profile_pic.lstrip("/"))
        if os.path.exists(file_path):
            os.remove(file_path)

        current_user.profile_pic = None
        db.commit()
        db.refresh(current_user)

    return current_user
