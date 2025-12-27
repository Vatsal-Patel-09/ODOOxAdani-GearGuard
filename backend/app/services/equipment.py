from uuid import UUID
from typing import List, Optional
from sqlalchemy.orm import Session

from app.db.models.equipment import Equipment
from app.db.models.maintenance_request import MaintenanceRequest
from app.schemas.equipment import EquipmentCreate, EquipmentUpdate


def get_equipments(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    department: Optional[str] = None,
    category: Optional[str] = None,
    is_scrapped: Optional[bool] = None,
) -> List[Equipment]:
    query = db.query(Equipment)
    
    if department:
        query = query.filter(Equipment.department == department)
    if category:
        query = query.filter(Equipment.category == category)
    if is_scrapped is not None:
        query = query.filter(Equipment.is_scrapped == is_scrapped)
    
    return query.offset(skip).limit(limit).all()


def get_equipment(db: Session, equipment_id: UUID) -> Optional[Equipment]:
    return db.query(Equipment).filter(Equipment.id == equipment_id).first()


def get_equipment_by_serial(db: Session, serial_number: str) -> Optional[Equipment]:
    return db.query(Equipment).filter(Equipment.serial_number == serial_number).first()


def create_equipment(db: Session, equipment_in: EquipmentCreate) -> Equipment:
    db_equipment = Equipment(
        name=equipment_in.name,
        serial_number=equipment_in.serial_number,
        category=equipment_in.category,
        department=equipment_in.department,
        assigned_employee_id=equipment_in.assigned_employee_id,
        maintenance_team_id=equipment_in.maintenance_team_id,
        purchase_date=equipment_in.purchase_date,
        warranty_expiry=equipment_in.warranty_expiry,
        location=equipment_in.location,
    )
    db.add(db_equipment)
    db.commit()
    db.refresh(db_equipment)
    return db_equipment


def update_equipment(
    db: Session, equipment_id: UUID, equipment_in: EquipmentUpdate
) -> Optional[Equipment]:
    db_equipment = get_equipment(db, equipment_id)
    if not db_equipment:
        return None
    
    update_data = equipment_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_equipment, field, value)
    
    db.commit()
    db.refresh(db_equipment)
    return db_equipment


def delete_equipment(db: Session, equipment_id: UUID) -> bool:
    db_equipment = get_equipment(db, equipment_id)
    if not db_equipment:
        return False
    
    db.delete(db_equipment)
    db.commit()
    return True


def get_equipment_request_count(db: Session, equipment_id: UUID) -> int:
    """Get count of open maintenance requests for an equipment (for smart button badge)."""
    return (
        db.query(MaintenanceRequest)
        .filter(
            MaintenanceRequest.equipment_id == equipment_id,
            MaintenanceRequest.status.in_(["new", "in_progress"]),
        )
        .count()
    )


def get_equipment_requests(
    db: Session, equipment_id: UUID
) -> List[MaintenanceRequest]:
    """Get all maintenance requests for a specific equipment."""
    return (
        db.query(MaintenanceRequest)
        .filter(MaintenanceRequest.equipment_id == equipment_id)
        .all()
    )
