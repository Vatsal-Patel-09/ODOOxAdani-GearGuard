from uuid import UUID
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.equipment import EquipmentCreate, EquipmentUpdate, EquipmentOut
from app.schemas.maintenance_request import MaintenanceRequestOut
from app.services import equipment as equipment_service

router = APIRouter(prefix="/equipment", tags=["Equipment"])


@router.get("", response_model=List[EquipmentOut])
def list_equipment(
    skip: int = 0,
    limit: int = 100,
    department: Optional[str] = None,
    category: Optional[str] = None,
    is_scrapped: Optional[bool] = None,
    db: Session = Depends(get_db),
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
):
    """Create a new equipment."""
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
):
    """Update equipment."""
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
):
    """Delete equipment."""
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
