from pydantic import BaseModel, EmailStr, validator, Field
from datetime import datetime
from typing import Optional
from typing import List


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    mobile_number: Optional[str] = None
    about_me: Optional[str] = None
    address: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: str = "user"

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
    password: Optional[str] = None
    role: Optional[str] = None


class UserResponse(UserBase):
    id: int
    profile_pic: Optional[str] = None
    role: str 
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
    profile_pic: Optional[str] = None

class PostResponse(BaseModel):
    id: int
    title: str
    category: str
    status: str
    content: str
    thumbnail: str = None
    is_active: bool
    created_at: datetime
    user: UserData

    class Config:
        from_attributes = True

class PostPaginatedResponse(BaseModel):
    posts: List[PostResponse]
    total_pages: int
    current_page: int
    total_records: int

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordSchema(BaseModel):
    new_password: str = Field(..., min_length=8, max_length=32, description="The new password for the user")

    

class ChatRequest(BaseModel):
    message: str
    
########## Chat #########3

class ChatMessageCreate(BaseModel):
    role: str
    content: str

class ChatMessageResponse(BaseModel):
    role: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True  # For SQLAlchemy ORM compatibility (Pydantic v2)

class ChatSendRequest(BaseModel):
    message: str

class ChatSendResponse(BaseModel):
    reply: str
    sources: Optional[List[dict]] = []
    
    
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


