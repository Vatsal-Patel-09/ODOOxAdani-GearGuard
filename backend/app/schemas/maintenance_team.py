"""Maintenance Team Pydantic schemas."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

from .base import BaseSchema, TimestampMixin, PaginatedResponse
from .user import UserBrief


class TeamMemberBase(BaseModel):
    """Base team member schema."""
    user_id: UUID
    role: str = Field(default="member", pattern="^(lead|member|backup)$")


class TeamMemberCreate(TeamMemberBase):
    """Schema for adding a team member."""
    pass


class TeamMemberResponse(BaseSchema):
    """Schema for team member response."""
    id: UUID
    team_id: UUID
    user_id: UUID
    role: str = "member"
    user: Optional[UserBrief] = None


class TeamBase(BaseModel):
    """Base team schema with common fields."""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    color: str = Field(default="#3498db", max_length=20)


class TeamCreate(TeamBase):
    """Schema for creating a team."""
    team_lead_id: Optional[UUID] = None


class TeamUpdate(BaseModel):
    """Schema for updating a team."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    color: Optional[str] = Field(None, max_length=20)
    team_lead_id: Optional[UUID] = None


class TeamResponse(TeamBase, TimestampMixin, BaseSchema):
    """Schema for team response."""
    id: UUID
    team_lead_id: Optional[UUID] = None
    team_lead: Optional[UserBrief] = None
    member_count: int = 0


class TeamDetail(TeamResponse):
    """Detailed team response with members."""
    members: List[TeamMemberResponse] = []


class TeamList(PaginatedResponse):
    """Paginated list of teams."""
    items: List[TeamResponse]


class TeamBrief(BaseSchema):
    """Brief team info for embedding."""
    id: UUID
    name: str
    color: str = "#3498db"
