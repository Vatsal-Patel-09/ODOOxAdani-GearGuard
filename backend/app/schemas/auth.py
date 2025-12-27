"""Authentication Pydantic schemas."""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from uuid import UUID
import re


class RegisterRequest(BaseModel):
    """Schema for user registration."""
    name: str = Field(..., min_length=1, max_length=255, description="Full name")
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=8, description="Password (min 8 chars)")
    
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Validate password meets requirements."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r"[A-Z]", v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r"[a-z]", v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r"[0-9]", v):
            raise ValueError('Password must contain at least one number')
        return v


class LoginRequest(BaseModel):
    """Schema for user login."""
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., description="Password")


class TokenResponse(BaseModel):
    """Schema for token response."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class AuthUserResponse(BaseModel):
    """Schema for authenticated user response."""
    id: UUID
    name: str
    email: str
    role: str
    is_technician: bool
    avatar_url: Optional[str] = None
    department: Optional[str] = None
    job_title: Optional[str] = None


class LoginResponse(BaseModel):
    """Schema for login response with user and token."""
    user: AuthUserResponse
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class MessageResponse(BaseModel):
    """Simple message response."""
    message: str
    success: bool = True
