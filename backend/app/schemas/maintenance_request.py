from uuid import UUID
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel


class MaintenanceRequestBase(BaseModel):
    subject: str
    description: Optional[str] = None
    request_type: str  # corrective | preventive
    equipment_id: Optional[UUID] = None
    scheduled_date: Optional[date] = None


class MaintenanceRequestCreate(MaintenanceRequestBase):
    # Note: maintenance_team_id will be auto-filled from equipment
    maintenance_team_id: Optional[UUID] = None
    created_by: Optional[UUID] = None


class MaintenanceRequestUpdate(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    request_type: Optional[str] = None
    equipment_id: Optional[UUID] = None
    maintenance_team_id: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    scheduled_date: Optional[date] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_hours: Optional[Decimal] = None


class StatusUpdate(BaseModel):
    status: str  # new | in_progress | repaired | scrap


class MaintenanceRequestOut(BaseModel):
    id: UUID
    subject: str
    description: Optional[str]
    request_type: str
    status: str
    equipment_id: Optional[UUID]
    maintenance_team_id: Optional[UUID]
    assigned_to: Optional[UUID]
    created_by: Optional[UUID]
    scheduled_date: Optional[date]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_hours: Optional[Decimal]
    created_at: datetime

    class Config:
        from_attributes = True
