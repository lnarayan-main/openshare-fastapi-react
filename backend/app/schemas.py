from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    mobile_number: Optional[str] = None
    about_me: Optional[str] = None
    address: Optional[str] = None


class UserCreate(UserBase):
    password: str

    @validator("password")
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    mobile_number: Optional[str] = None
    about_me: Optional[str] = None
    address: Optional[str] = None
    email: Optional[EmailStr] = None


class UserResponse(UserBase):
    id: int
    profile_pic: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class PostCreate(BaseModel):
    title: str
    category: str
    status: str
    content: str

class UserData(BaseModel):
    id: int
    full_name: str
    email: str
    mobile_number: str
    profile_pic: str

class PostResponse(BaseModel):
    id: int
    title: str
    category: str
    status: str
    content: str
    is_active: bool
    created_at: datetime
    user: UserData

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
