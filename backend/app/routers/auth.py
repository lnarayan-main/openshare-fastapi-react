from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Any

from app.database import get_db
from app.schemas import UserCreate, UserResponse, Token, LoginRequest, ForgotPasswordRequest, ResetPasswordSchema
from app.auth import (
    authenticate_user,
    create_access_token,
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user,
)
from app.models import User
from app.utils.email import send_forgot_password_email
import secrets

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    if user.mobile_number:
        db_user = (
            db.query(User).filter(User.mobile_number == user.mobile_number).first()
        )
        if db_user:
            raise HTTPException(
                status_code=400, detail="Mobile number already registered"
            )

    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        full_name=user.full_name,
        mobile_number=user.mobile_number,
        about_me=user.about_me,
        address=user.address,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    print("FormData: ", form_data.username, form_data.password)
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if user:
        # 1. Generate a secure random token
        token = secrets.token_urlsafe(32)

        expiry = datetime.utcnow() + timedelta(minutes=30)
        
        # 2. Store token in DB (You should add 'reset_token' & 'token_expiry' columns to User model)
        user.reset_token = token
        user.reset_token_expiry = expiry

        db.commit()
        
        await send_forgot_password_email(user.email, token)
        
    return {"detail": "If this email is registered, instructions have been sent."}


@router.post("/reset-password/{token}")
async def reset_password(token: str, request: ResetPasswordSchema, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.reset_token == token).first()
    
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid or used token.")

    if datetime.utcnow() > db_user.reset_token_expiry:
        db_user.reset_token = None
        db_user.reset_token_expiry = None
        db.commit()
        raise HTTPException(status_code=400, detail="Reset link has expired.")

    db_user.hashed_password = get_password_hash(request.new_password)
    
    db_user.reset_token = None
    db_user.reset_token_expiry = None
    
    db.commit()
    db.refresh(db_user)
    
    return {"message": "Password has been reset successfully. You can now login."}


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    # For JWT, logout is handled client-side by removing token
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
