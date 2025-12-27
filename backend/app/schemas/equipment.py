"""Equipment Pydantic schemas."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from .base import BaseSchema, TimestampMixin, PaginatedResponse
from .user import UserBrief


class EquipmentBase(BaseModel):
    """Base equipment schema with common fields."""
    name: str = Field(..., min_length=1, max_length=255)
    serial_number: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=255)
    purchase_date: Optional[date] = None
    purchase_cost: Optional[Decimal] = Field(None, ge=0)
    warranty_expiry: Optional[date] = None
    warranty_info: Optional[str] = None
    health_percentage: int = Field(default=100, ge=0, le=100)
    status: str = Field(default="active", pattern="^(active|maintenance|scrapped|retired)$")
    notes: Optional[str] = None


class EquipmentCreate(EquipmentBase):
    """Schema for creating equipment."""
    assigned_employee_id: Optional[UUID] = None
    maintenance_team_id: Optional[UUID] = None
    default_technician_id: Optional[UUID] = None


class EquipmentUpdate(BaseModel):
    """Schema for updating equipment."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    serial_number: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=255)
    purchase_date: Optional[date] = None
    purchase_cost: Optional[Decimal] = Field(None, ge=0)
    warranty_expiry: Optional[date] = None
    warranty_info: Optional[str] = None
    health_percentage: Optional[int] = Field(None, ge=0, le=100)
    status: Optional[str] = Field(None, pattern="^(active|maintenance|scrapped|retired)$")
    notes: Optional[str] = None
    assigned_employee_id: Optional[UUID] = None
    maintenance_team_id: Optional[UUID] = None
    default_technician_id: Optional[UUID] = None


class TeamBrief(BaseSchema):
    """Brief team info for embedding."""
    id: UUID
    name: str
    color: Optional[str] = "#3498db"


class EquipmentResponse(EquipmentBase, TimestampMixin, BaseSchema):
    """Schema for equipment response."""
    id: UUID
    assigned_employee_id: Optional[UUID] = None
    maintenance_team_id: Optional[UUID] = None
    default_technician_id: Optional[UUID] = None
    
    # Computed properties
    is_critical: bool = False
    
    # Nested objects (optional, for detailed views)
    assigned_employee: Optional[UserBrief] = None
    maintenance_team: Optional[TeamBrief] = None
    default_technician: Optional[UserBrief] = None
    
    # Count of open requests
    open_request_count: int = 0


class EquipmentBrief(BaseSchema):
    """Brief equipment info for embedding in other responses."""
    id: UUID
    name: str
    serial_number: str
    category: str
    health_percentage: int = 100
    is_critical: bool = False


class EquipmentList(PaginatedResponse):
    """Paginated list of equipment."""
    items: List[EquipmentResponse]


class EquipmentHealth(BaseSchema):
    """Equipment health summary for dashboard."""
    total_equipment: int
    critical_count: int  # health < 30%
    maintenance_count: int  # status = maintenance
    healthy_count: int  # health >= 70%
    average_health: float
from uuid import UUID
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class EquipmentBase(BaseModel):
    name: str
    serial_number: str
    category: str
    department: Optional[str] = None
    assigned_employee_id: Optional[UUID] = None
    maintenance_team_id: Optional[UUID] = None
    purchase_date: Optional[date] = None
    warranty_expiry: Optional[date] = None
    location: Optional[str] = None


class EquipmentCreate(EquipmentBase):
    pass


class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    serial_number: Optional[str] = None
    category: Optional[str] = None
    department: Optional[str] = None
    assigned_employee_id: Optional[UUID] = None
    maintenance_team_id: Optional[UUID] = None
    purchase_date: Optional[date] = None
    warranty_expiry: Optional[date] = None
    location: Optional[str] = None
    is_scrapped: Optional[bool] = None


class EquipmentOut(EquipmentBase):
    id: UUID
    is_scrapped: bool
    created_at: datetime

    class Config:
        from_attributes = True
