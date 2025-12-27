from uuid import UUID
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.maintenance_request import (
    MaintenanceRequestCreate,
    MaintenanceRequestUpdate,
    MaintenanceRequestOut,
    StatusUpdate,
)
from app.services import maintenance_request as request_service

router = APIRouter(prefix="/requests", tags=["Maintenance Requests"])


@router.get("", response_model=List[MaintenanceRequestOut])
def list_requests(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    request_type: Optional[str] = None,
    team_id: Optional[UUID] = None,
    assigned_to: Optional[UUID] = None,
    db: Session = Depends(get_db),
):
    """List all maintenance requests with optional filters."""
    return request_service.get_requests(
        db,
        skip=skip,
        limit=limit,
        status=status_filter,
        request_type=request_type,
        team_id=team_id,
        assigned_to=assigned_to,
    )


@router.post("", response_model=MaintenanceRequestOut, status_code=status.HTTP_201_CREATED)
def create_request(
    request_in: MaintenanceRequestCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new maintenance request.
    
    If equipment_id is provided and maintenance_team_id is not,
    the team will be auto-filled from the equipment.
    """
    return request_service.create_request(db, request_in)


@router.get("/calendar", response_model=List[MaintenanceRequestOut])
def get_calendar_requests(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    """Get preventive maintenance requests for calendar view."""
    return request_service.get_calendar_requests(db, start_date, end_date)


@router.get("/{request_id}", response_model=MaintenanceRequestOut)
def get_request(
    request_id: UUID,
    db: Session = Depends(get_db),
):
    """Get a maintenance request by ID."""
    request = request_service.get_request(db, request_id)
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found.",
        )
    return request


@router.put("/{request_id}", response_model=MaintenanceRequestOut)
def update_request(
    request_id: UUID,
    request_in: MaintenanceRequestUpdate,
    db: Session = Depends(get_db),
):
    """Update a maintenance request."""
    request = request_service.update_request(db, request_id, request_in)
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found.",
        )
    return request


@router.patch("/{request_id}/status", response_model=MaintenanceRequestOut)
def update_request_status(
    request_id: UUID,
    status_update: StatusUpdate,
    db: Session = Depends(get_db),
):
    """
    Update the status of a maintenance request.
    
    Valid statuses: new, in_progress, repaired, scrap
    
    Note: If status is changed to 'scrap', the associated equipment
    will be marked as is_scrapped = True.
    """
    valid_statuses = ["new", "in_progress", "repaired", "scrap"]
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {valid_statuses}",
        )
    
    request = request_service.update_status(db, request_id, status_update.status)
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found.",
        )
    return request


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_request(
    request_id: UUID,
    db: Session = Depends(get_db),
):
    """Delete a maintenance request."""
    deleted = request_service.delete_request(db, request_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found.",
        )
    return None
