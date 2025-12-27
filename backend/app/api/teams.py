from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, require_role
from app.schemas.team import (
    MaintenanceTeamCreate,
    MaintenanceTeamUpdate,
    MaintenanceTeamOut,
    MaintenanceTeamWithMembers,
    TeamMemberCreate,
    TeamMemberOut,
)
from app.services import team as team_service
from app.db.models.user import User

router = APIRouter(prefix="/teams", tags=["Maintenance Teams"])


@router.get("", response_model=List[MaintenanceTeamOut])
def list_teams(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # Any authenticated user
):
    """List all maintenance teams."""
    return team_service.get_teams(db, skip=skip, limit=limit)


@router.post("", response_model=MaintenanceTeamOut, status_code=status.HTTP_201_CREATED)
def create_team(
    team_in: MaintenanceTeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),  # Admin only
):
    """Create a new maintenance team. Requires admin role."""
    # Check if name already exists
    existing = team_service.get_team_by_name(db, team_in.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A team with this name already exists.",
        )
    return team_service.create_team(db, team_in)


@router.get("/{team_id}", response_model=MaintenanceTeamWithMembers)
def get_team(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # Any authenticated user
):
    """Get a team with its members."""
    team = team_service.get_team(db, team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found.",
        )
    
    members = team_service.get_team_members(db, team_id)
    return MaintenanceTeamWithMembers(
        id=team.id,
        name=team.name,
        description=team.description,
        created_at=team.created_at,
        members=members,
    )


@router.put("/{team_id}", response_model=MaintenanceTeamOut)
def update_team(
    team_id: UUID,
    team_in: MaintenanceTeamUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),  # Admin only
):
    """Update a team. Requires admin role."""
    team = team_service.update_team(db, team_id, team_in)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found.",
        )
    return team


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),  # Admin only
):
    """Delete a team. Requires admin role."""
    deleted = team_service.delete_team(db, team_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found.",
        )
    return None


# Team Members
@router.post("/{team_id}/members", response_model=TeamMemberOut, status_code=status.HTTP_201_CREATED)
def add_team_member(
    team_id: UUID,
    member_in: TeamMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),  # Admin only
):
    """Add a user to the team. Requires admin role."""
    team = team_service.get_team(db, team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found.",
        )
    
    member = team_service.add_team_member(db, team_id, member_in.user_id)
    return member


@router.delete("/{team_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_team_member(
    team_id: UUID,
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),  # Admin only
):
    """Remove a user from the team. Requires admin role."""
    removed = team_service.remove_team_member(db, team_id, user_id)
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found.",
        )
    return None


@router.get("/{team_id}/members", response_model=List[TeamMemberOut])
def list_team_members(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # Any authenticated user
):
    """List all members of a team."""
    team = team_service.get_team(db, team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found.",
        )
    return team_service.get_team_members(db, team_id)
