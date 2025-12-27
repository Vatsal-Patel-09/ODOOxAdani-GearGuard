from uuid import UUID
from datetime import date
from typing import List, Optional
from decimal import Decimal
from sqlalchemy.orm import Session

from app.db.models.maintenance_request import MaintenanceRequest
from app.db.models.equipment import Equipment
from app.schemas.maintenance_request import (
    MaintenanceRequestCreate,
    MaintenanceRequestUpdate,
)


def get_requests(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    request_type: Optional[str] = None,
    team_id: Optional[UUID] = None,
    assigned_to: Optional[UUID] = None,
    team_ids: Optional[List[UUID]] = None,  # For team-scoped access
    created_by: Optional[str] = None,  # For user-scoped access
) -> List[MaintenanceRequest]:
    """
    Get maintenance requests with optional filters.
    
    Args:
        team_ids: If provided, only return requests from these teams (team-scoped access)
        created_by: If provided, only return requests created by this user
    """
    query = db.query(MaintenanceRequest)
    
    if status:
        query = query.filter(MaintenanceRequest.status == status)
    if request_type:
        query = query.filter(MaintenanceRequest.request_type == request_type)
    if team_id:
        query = query.filter(MaintenanceRequest.maintenance_team_id == team_id)
    if assigned_to:
        query = query.filter(MaintenanceRequest.assigned_to == assigned_to)
    
    # Team-scoped access: filter by user's teams
    if team_ids is not None:
        query = query.filter(MaintenanceRequest.maintenance_team_id.in_(team_ids))
    
    # User-scoped access: filter by creator
    if created_by:
        query = query.filter(MaintenanceRequest.created_by == created_by)
    
    return query.order_by(MaintenanceRequest.created_at.desc()).offset(skip).limit(limit).all()


def get_request(db: Session, request_id: UUID) -> Optional[MaintenanceRequest]:
    return db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()


def create_request(db: Session, request_in: MaintenanceRequestCreate, created_by: Optional[str] = None) -> MaintenanceRequest:
    # Auto-fill maintenance_team_id from equipment if not provided
    team_id = request_in.maintenance_team_id
    if request_in.equipment_id and not team_id:
        equipment = db.query(Equipment).filter(Equipment.id == request_in.equipment_id).first()
        if equipment and equipment.maintenance_team_id:
            team_id = equipment.maintenance_team_id
    
    db_request = MaintenanceRequest(
        subject=request_in.subject,
        description=request_in.description,
        request_type=request_in.request_type,
        status="new",
        equipment_id=request_in.equipment_id,
        maintenance_team_id=team_id,
        created_by=created_by or request_in.created_by,
        scheduled_date=request_in.scheduled_date,
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request


def update_request(
    db: Session, request_id: UUID, request_in: MaintenanceRequestUpdate
) -> Optional[MaintenanceRequest]:
    db_request = get_request(db, request_id)
    if not db_request:
        return None
    
    update_data = request_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_request, field, value)
    
    # Calculate duration if both started_at and completed_at are set
    if db_request.started_at and db_request.completed_at:
        duration = db_request.completed_at - db_request.started_at
        db_request.duration_hours = Decimal(str(round(duration.total_seconds() / 3600, 2)))
    
    db.commit()
    db.refresh(db_request)
    return db_request


def update_status(db: Session, request_id: UUID, new_status: str) -> Optional[MaintenanceRequest]:
    """
    Update status with business logic:
    - If status is 'scrap', mark the equipment as is_scrapped = True
    """
    db_request = get_request(db, request_id)
    if not db_request:
        return None
    
    db_request.status = new_status
    
    # Scrap logic: mark equipment as scrapped
    if new_status == "scrap" and db_request.equipment_id:
        equipment = db.query(Equipment).filter(Equipment.id == db_request.equipment_id).first()
        if equipment:
            equipment.is_scrapped = True
    
    db.commit()
    db.refresh(db_request)
    return db_request


def delete_request(db: Session, request_id: UUID) -> bool:
    db_request = get_request(db, request_id)
    if not db_request:
        return False
    
    db.delete(db_request)
    db.commit()
    return True


def get_calendar_requests(
    db: Session,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    team_ids: Optional[List[UUID]] = None,  # For team-scoped access
) -> List[MaintenanceRequest]:
    """Get preventive maintenance requests for calendar view with optional team scope."""
    query = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.request_type == "preventive",
        MaintenanceRequest.scheduled_date.isnot(None),
    )
    
    if start_date:
        query = query.filter(MaintenanceRequest.scheduled_date >= start_date)
    if end_date:
        query = query.filter(MaintenanceRequest.scheduled_date <= end_date)
    
    # Team-scoped access
    if team_ids is not None:
        query = query.filter(MaintenanceRequest.maintenance_team_id.in_(team_ids))
    
    return query.order_by(MaintenanceRequest.scheduled_date).all()
