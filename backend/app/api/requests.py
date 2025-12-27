from uuid import UUID
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, require_role
from app.schemas.maintenance_request import (
    MaintenanceRequestCreate,
    MaintenanceRequestUpdate,
    MaintenanceRequestOut,
    StatusUpdate,
)
from app.services import maintenance_request as request_service
from app.services import team as team_service
from app.db.models.user import User

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
    current_user: User = Depends(get_current_user),
):
    """
    List maintenance requests.
    
    - Technicians: Only see requests assigned to their teams
    - Managers/Admins: Can see all requests
    - Users: Can see requests they created
    """
    # Get user's team IDs for scoped access
    user_team_ids = None
    created_by_filter = None
    
    if current_user.role == "technician":
        # Technicians only see requests for their teams
        user_team_ids = team_service.get_user_team_ids(db, current_user.id)
        if not user_team_ids:
            # Technician not in any team - return empty
            return []
    elif current_user.role == "user":
        # Regular users only see their own requests
        created_by_filter = str(current_user.id)
    # Managers and admins see all (no filter)
    
    return request_service.get_requests(
        db,
        skip=skip,
        limit=limit,
        status=status_filter,
        request_type=request_type,
        team_id=team_id,
        assigned_to=assigned_to,
        team_ids=user_team_ids,  # Team scope filter
        created_by=created_by_filter,  # User filter
    )


@router.post("", response_model=MaintenanceRequestOut, status_code=status.HTTP_201_CREATED)
def create_request(
    request_in: MaintenanceRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new maintenance request.
    
    - Corrective (breakdown): Any user can create
    - Preventive (scheduled): Only manager/admin can create
    """
    # Check if preventive - only manager/admin can create preventive requests
    if request_in.request_type == "preventive":
        if current_user.role not in ("admin", "manager"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only managers and admins can create preventive maintenance requests.",
            )
    
    return request_service.create_request(db, request_in, created_by=str(current_user.id))


@router.get("/calendar", response_model=List[MaintenanceRequestOut])
def get_calendar_requests(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get preventive maintenance requests for calendar view.
    
    Technicians only see calendar items for their teams.
    """
    # Team scope for technicians
    team_ids = None
    if current_user.role == "technician":
        team_ids = team_service.get_user_team_ids(db, current_user.id)
        if not team_ids:
            return []
    
    return request_service.get_calendar_requests(db, start_date, end_date, team_ids=team_ids)


@router.get("/{request_id}", response_model=MaintenanceRequestOut)
def get_request(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a maintenance request by ID with team-scope check for technicians."""
    request = request_service.get_request(db, request_id)
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found.",
        )
    
    # Team scope check for technicians
    if current_user.role == "technician":
        user_team_ids = team_service.get_user_team_ids(db, current_user.id)
        if request.maintenance_team_id not in user_team_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view requests assigned to your team.",
            )
    # User can only view their own requests
    elif current_user.role == "user":
        if str(request.created_by) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own requests.",
            )
    
    return request


@router.put("/{request_id}", response_model=MaintenanceRequestOut)
def update_request(
    request_id: UUID,
    request_in: MaintenanceRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update a maintenance request.
    
    - Technicians can only update requests from their teams and assign to themselves
    - Managers/Admins can assign to anyone
    """
    existing_request = request_service.get_request(db, request_id)
    if not existing_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found.",
        )
    
    # Team scope check for technicians
    if current_user.role == "technician":
        user_team_ids = team_service.get_user_team_ids(db, current_user.id)
        if existing_request.maintenance_team_id not in user_team_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only modify requests assigned to your team.",
            )
    
    # Check if trying to assign to someone
    if request_in.assigned_to:
        assigned_user_id = str(request_in.assigned_to)
        current_user_id = str(current_user.id)
        
        # Technicians can only assign to themselves
        if current_user.role == "technician":
            if assigned_user_id != current_user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Technicians can only assign requests to themselves.",
                )
        # Users cannot assign at all
        elif current_user.role == "user":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Regular users cannot assign requests.",
            )
    
    request = request_service.update_request(db, request_id, request_in)
    return request


@router.patch("/{request_id}/status", response_model=MaintenanceRequestOut)
def update_request_status(
    request_id: UUID,
    status_update: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager", "technician")),
):
    """
    Update the status of a maintenance request.
    
    Allowed transitions:
    - new → in_progress
    - in_progress → repaired (or back to new)
    - repaired → scrap (admin only)
    
    Invalid transitions return 400 Bad Request.
    """
    from app.core.workflow import validate_status_transition, VALID_STATUSES
    
    # Validate new status is valid
    if status_update.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {VALID_STATUSES}",
        )
    
    existing_request = request_service.get_request(db, request_id)
    if not existing_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found.",
        )
    
    # Validate status transition using state machine
    current_status = existing_request.status
    new_status = status_update.status
    
    is_valid, error_msg = validate_status_transition(current_status, new_status)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg,
        )
    
    # Team scope check for technicians
    if current_user.role == "technician":
        user_team_ids = team_service.get_user_team_ids(db, current_user.id)
        if existing_request.maintenance_team_id not in user_team_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update status for requests assigned to your team.",
            )
    
    # Only admin can move to scrap status
    if status_update.status == "scrap" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can move requests to scrap status.",
        )
    
    request = request_service.update_status(db, request_id, status_update.status)
    return request


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_request(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Delete a maintenance request. Requires admin role."""
    deleted = request_service.delete_request(db, request_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found.",
        )
    return None
