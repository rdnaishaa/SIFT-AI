from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

# Request Models
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, example="john_doe")
    email: EmailStr = Field(..., example="john@example.com")
    password: str = Field(..., min_length=6, example="securepassword123")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., example="john@example.com")
    password: str = Field(..., example="securepassword123")

# Response Models
class UserResponse(BaseModel):
    user_id: str  # UUID
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class MessageResponse(BaseModel):
    message: str
