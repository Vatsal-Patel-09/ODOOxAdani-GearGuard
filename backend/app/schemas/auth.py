from typing import Optional
from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    """Response for login/register with JWT token."""
    id: str
    name: str
    email: str
    role: str
    access_token: str
    token_type: str = "bearer"
    message: str
