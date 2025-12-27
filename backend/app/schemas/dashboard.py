"""Dashboard Pydantic schemas."""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

from .base import BaseSchema


class CriticalEquipmentKPI(BaseModel):
    """Critical equipment KPI data."""
    count: int
    threshold: int = 30  # Health percentage threshold
    label: str = "Critical Equipment"
    description: str = "Units with health < 30%"


class TechnicianLoadKPI(BaseModel):
    """Technician load KPI data."""
    utilization_percentage: float
    active_technicians: int
    total_technicians: int
    label: str = "Technician Load"
    description: str = "Current utilization"


class OpenRequestsKPI(BaseModel):
    """Open requests KPI data."""
    pending_count: int
    overdue_count: int
    in_progress_count: int
    label: str = "Open Requests"
    description: str = "Pending and overdue"


class DashboardKPIs(BaseModel):
    """All dashboard KPIs."""
    critical_equipment: CriticalEquipmentKPI
    technician_load: TechnicianLoadKPI
    open_requests: OpenRequestsKPI
    last_updated: datetime


class ActivityItem(BaseSchema):
    """Single activity item for dashboard."""
    id: UUID
    type: str  # 'request_created', 'request_updated', 'equipment_added', etc.
    title: str
    description: Optional[str] = None
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None
    equipment_name: Optional[str] = None
    status: Optional[str] = None
    timestamp: datetime


class ActivityFeed(BaseModel):
    """Activity feed for dashboard."""
    items: List[ActivityItem]
    total: int


class EquipmentHealthSummary(BaseModel):
    """Equipment health distribution."""
    critical: int  # 0-29%
    poor: int  # 30-49%
    fair: int  # 50-69%
    good: int  # 70-89%
    excellent: int  # 90-100%


class RequestsByType(BaseModel):
    """Request counts by type."""
    corrective: int
    preventive: int


class RequestsByStatus(BaseModel):
    """Request counts by status."""
    new: int
    in_progress: int
    repaired: int
    scrap: int


class DashboardSummary(BaseModel):
    """Complete dashboard summary."""
    kpis: DashboardKPIs
    equipment_health: EquipmentHealthSummary
    requests_by_type: RequestsByType
    requests_by_status: RequestsByStatus
    recent_activity: List[ActivityItem]
