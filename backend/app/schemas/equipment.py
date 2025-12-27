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
