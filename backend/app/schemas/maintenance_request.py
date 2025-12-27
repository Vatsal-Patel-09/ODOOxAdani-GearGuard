"""Maintenance Request Pydantic schemas."""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from .base import BaseSchema, TimestampMixin, PaginatedResponse
from .user import UserBrief
from .equipment import EquipmentBrief


class TeamBrief(BaseSchema):
    """Brief team info for embedding."""
    id: UUID
    name: str
    color: str = "#3498db"


class RequestBase(BaseModel):
    """Base request schema with common fields."""
    subject: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    request_type: str = Field(..., pattern="^(corrective|preventive)$")
    maintenance_for: str = Field(default="equipment", pattern="^(equipment|facility|other)$")
    priority: int = Field(default=2, ge=1, le=5)  # 1=Low, 2=Normal, 3=High, 4=Urgent, 5=Critical
    notes: Optional[str] = None
    instructions: Optional[str] = None


class RequestCreate(RequestBase):
    """Schema for creating a request."""
    equipment_id: Optional[UUID] = None
    maintenance_team_id: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    scheduled_date: Optional[datetime] = None


class RequestUpdate(BaseModel):
    """Schema for updating a request."""
    subject: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    request_type: Optional[str] = Field(None, pattern="^(corrective|preventive)$")
    maintenance_for: Optional[str] = Field(None, pattern="^(equipment|facility|other)$")
    priority: Optional[int] = Field(None, ge=1, le=5)
    status: Optional[str] = Field(None, pattern="^(new|in_progress|repaired|scrap)$")
    equipment_id: Optional[UUID] = None
    maintenance_team_id: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    scheduled_date: Optional[datetime] = None
    duration_hours: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = None
    instructions: Optional[str] = None


class RequestStageUpdate(BaseModel):
    """Schema for updating just the stage (for Kanban drag-drop)."""
    status: str = Field(..., pattern="^(new|in_progress|repaired|scrap)$")
    comment: Optional[str] = None


class RequestResponse(RequestBase, TimestampMixin, BaseSchema):
    """Schema for request response."""
    id: UUID
    reference: Optional[str] = None
    status: str = "new"
    category: Optional[str] = None
    
    # Foreign keys
    equipment_id: Optional[UUID] = None
    maintenance_team_id: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    created_by: UUID
    
    # Time tracking
    request_date: Optional[date] = None
    scheduled_date: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_hours: Decimal = Decimal("0")
    
    # Computed
    is_overdue: bool = False
    priority_label: str = "Normal"
    
    # Nested objects
    equipment: Optional[EquipmentBrief] = None
    maintenance_team: Optional[TeamBrief] = None
    technician: Optional[UserBrief] = None
    creator: Optional[UserBrief] = None


class RequestList(PaginatedResponse):
    """Paginated list of requests."""
    items: List[RequestResponse]


class RequestKanbanCard(BaseSchema):
    """Simplified request for Kanban card display."""
    id: UUID
    reference: Optional[str] = None
    subject: str
    priority: int = 2
    priority_label: str = "Normal"
    is_overdue: bool = False
    scheduled_date: Optional[datetime] = None
    equipment_name: Optional[str] = None
    technician: Optional[UserBrief] = None


class RequestKanbanColumn(BaseModel):
    """A single Kanban column."""
    stage: str
    stage_label: str
    count: int
    cards: List[RequestKanbanCard]


class RequestKanban(BaseModel):
    """Kanban board data structure."""
    columns: List[RequestKanbanColumn]
    total_requests: int


class RequestCalendarItem(BaseSchema):
    """Request item for calendar display."""
    id: UUID
    reference: Optional[str] = None
    subject: str
    scheduled_date: datetime
    equipment_name: Optional[str] = None
    technician_name: Optional[str] = None
    status: str


class RequestCalendar(BaseModel):
    """Calendar view data."""
    items: List[RequestCalendarItem]
    month: int
    year: int
