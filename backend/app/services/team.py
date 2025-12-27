from uuid import UUID
from typing import List, Optional
from sqlalchemy.orm import Session

from app.db.models.maintenance_team import MaintenanceTeam
from app.db.models.team_member import TeamMember
from app.schemas.team import MaintenanceTeamCreate, MaintenanceTeamUpdate


# Team CRUD
def get_teams(db: Session, skip: int = 0, limit: int = 100) -> List[MaintenanceTeam]:
    return db.query(MaintenanceTeam).offset(skip).limit(limit).all()


def get_team(db: Session, team_id: UUID) -> Optional[MaintenanceTeam]:
    return db.query(MaintenanceTeam).filter(MaintenanceTeam.id == team_id).first()


def get_team_by_name(db: Session, name: str) -> Optional[MaintenanceTeam]:
    return db.query(MaintenanceTeam).filter(MaintenanceTeam.name == name).first()


def create_team(db: Session, team_in: MaintenanceTeamCreate) -> MaintenanceTeam:
    db_team = MaintenanceTeam(
        name=team_in.name,
        description=team_in.description,
    )
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team


def update_team(
    db: Session, team_id: UUID, team_in: MaintenanceTeamUpdate
) -> Optional[MaintenanceTeam]:
    db_team = get_team(db, team_id)
    if not db_team:
        return None
    
    update_data = team_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_team, field, value)
    
    db.commit()
    db.refresh(db_team)
    return db_team


def delete_team(db: Session, team_id: UUID) -> bool:
    db_team = get_team(db, team_id)
    if not db_team:
        return False
    
    db.delete(db_team)
    db.commit()
    return True


# Team Members
def get_team_members(db: Session, team_id: UUID) -> List[TeamMember]:
    return db.query(TeamMember).filter(TeamMember.team_id == team_id).all()


def add_team_member(db: Session, team_id: UUID, user_id: UUID) -> Optional[TeamMember]:
    # Check if already a member
    existing = (
        db.query(TeamMember)
        .filter(TeamMember.team_id == team_id, TeamMember.user_id == user_id)
        .first()
    )
    if existing:
        return existing
    
    db_member = TeamMember(team_id=team_id, user_id=user_id)
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member


def remove_team_member(db: Session, team_id: UUID, user_id: UUID) -> bool:
    db_member = (
        db.query(TeamMember)
        .filter(TeamMember.team_id == team_id, TeamMember.user_id == user_id)
        .first()
    )
    if not db_member:
        return False
    
    db.delete(db_member)
    db.commit()
    return True


def get_user_team_ids(db: Session, user_id: UUID) -> List[UUID]:
    """
    Get all team IDs that a user belongs to.
    Used for team-scoped access control.
    """
    memberships = db.query(TeamMember).filter(TeamMember.user_id == user_id).all()
    return [m.team_id for m in memberships]


def is_user_in_team(db: Session, user_id: UUID, team_id: UUID) -> bool:
    """Check if a user is a member of a specific team."""
    return (
        db.query(TeamMember)
        .filter(TeamMember.team_id == team_id, TeamMember.user_id == user_id)
        .first()
    ) is not None
