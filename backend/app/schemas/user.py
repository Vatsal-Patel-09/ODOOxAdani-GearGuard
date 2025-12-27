"""User Pydantic schemas."""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

from .base import BaseSchema, TimestampMixin, PaginatedResponse


class UserBase(BaseModel):
    """Base user schema with common fields."""
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)
    department: Optional[str] = Field(None, max_length=100)
    job_title: Optional[str] = Field(None, max_length=255)
    role: str = Field(default="user", pattern="^(user|technician|manager|admin)$")
    is_technician: bool = False
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a user."""
    pass


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    department: Optional[str] = Field(None, max_length=100)
    job_title: Optional[str] = Field(None, max_length=255)
    role: Optional[str] = Field(None, pattern="^(user|technician|manager|admin)$")
    is_technician: Optional[bool] = None
    is_active: Optional[bool] = None
    avatar_url: Optional[str] = None


class UserResponse(UserBase, TimestampMixin, BaseSchema):
    """Schema for user response."""
    id: UUID
    is_active: bool = True


class UserBrief(BaseSchema):
    """Brief user info for embedding in other responses."""
    id: UUID
    name: str
    email: str
    avatar_url: Optional[str] = None
    is_technician: bool = False


class UserList(PaginatedResponse):
    """Paginated list of users."""
    items: List[UserResponse]
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str  # user | technician | manager | admin
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    avatar_url: Optional[str] = None


class UserOut(UserBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
