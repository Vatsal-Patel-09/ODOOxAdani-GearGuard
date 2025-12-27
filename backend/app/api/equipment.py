from uuid import UUID
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date

from app.api.deps import get_db, get_current_user, require_role
from app.schemas.maintenance_request import MaintenanceRequestOut
from app.schemas.equipment import EquipmentOut
from app.services import equipment as equipment_service
from app.db.models.user import User
from app.db.models.equipment import Equipment
from app.db.models.maintenance_request import MaintenanceRequest

router = APIRouter(prefix="/equipment", tags=["Equipment"])


class EquipmentCreate(BaseModel):
    name: str
    serial_number: str
    category: str
    department: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = "operational"
    purchase_date: Optional[date] = None
    warranty_expiry: Optional[date] = None


class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    serial_number: Optional[str] = None
    category: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    is_scrapped: Optional[bool] = None


@router.get("", response_model=List[EquipmentOut])
def list_equipment(
    skip: int = 0,
    limit: int = 100,
    department: Optional[str] = None,
    category: Optional[str] = None,
    is_scrapped: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # Any authenticated user
):
    """List all equipment with optional filters."""
    return equipment_service.get_equipments(
        db,
        skip=skip,
        limit=limit,
        department=department,
        category=category,
        is_scrapped=is_scrapped,
    )


@router.post("", response_model=EquipmentOut, status_code=status.HTTP_201_CREATED)
def create_equipment(
    equipment_in: EquipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager")),  # Manager/Admin only
):
    """Create a new equipment. Requires manager or admin role."""
    # Check if serial number already exists
    existing = equipment_service.get_equipment_by_serial(db, equipment_in.serial_number)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Equipment with this serial number already exists.",
        )
    return equipment_service.create_equipment(db, equipment_in)


@router.get("/{equipment_id}", response_model=EquipmentOut)
def get_equipment(
    equipment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # Any authenticated user
):
    """Get equipment by ID."""
    equipment = equipment_service.get_equipment(db, equipment_id)
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found.",
        )
    return equipment


@router.put("/{equipment_id}", response_model=EquipmentOut)
def update_equipment(
    equipment_id: UUID,
    equipment_in: EquipmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager")),  # Manager/Admin only
):
    """Update equipment. Requires manager or admin role."""
    equipment = equipment_service.update_equipment(db, equipment_id, equipment_in)
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found.",
        )
    return equipment


@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_equipment(
    equipment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),  # Admin only (scrap)
):
    """Delete/scrap equipment. Requires admin role."""
    deleted = equipment_service.delete_equipment(db, equipment_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found.",
        )
    return None


@router.get("/{equipment_id}/requests", response_model=List[MaintenanceRequestOut])
def get_equipment_requests(
    equipment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # Any authenticated user
):
    """Get all maintenance requests for a specific equipment (smart button)."""
    equipment = equipment_service.get_equipment(db, equipment_id)
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found.",
        )
    return equipment_service.get_equipment_requests(db, equipment_id)


@router.get("/{equipment_id}/request-count")
def get_equipment_request_count(
    equipment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # Any authenticated user
):
    """Get count of open maintenance requests for equipment (smart button badge)."""
    equipment = equipment_service.get_equipment(db, equipment_id)
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found.",
        )
    count = equipment_service.get_equipment_request_count(db, equipment_id)
    return {"equipment_id": equipment_id, "open_request_count": count}
