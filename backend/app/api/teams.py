from uuid import UUID
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.db.models.maintenance_team import MaintenanceTeam
from app.db.models.team_member import TeamMember
from app.db.models.user import User

router = APIRouter()


class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None


class TeamUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


@router.get("")
def get_all_teams(db: Session = Depends(get_db)):
    """Get all teams with members"""
    teams = db.query(MaintenanceTeam).all()
    result = []
    
    for team in teams:
        # Get team members
        team_members = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
        members = []
        for tm in team_members:
            user = db.query(User).filter(User.id == tm.user_id).first()
            if user:
                members.append({
                    "id": str(user.id),
                    "name": user.name,
                    "email": user.email,
                    "role": user.role
                })
        
        result.append({
            "id": str(team.id),
            "name": team.name,
            "description": team.description,
            "members": members,
            "created_at": str(team.created_at) if team.created_at else None
        })
    
    return result


@router.get("/{team_id}")
def get_team(team_id: UUID, db: Session = Depends(get_db)):
    """Get team by ID"""
    team = db.query(MaintenanceTeam).filter(MaintenanceTeam.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Get team members
    team_members = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
    members = []
    for tm in team_members:
        user = db.query(User).filter(User.id == tm.user_id).first()
        if user:
            members.append({
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": user.role
            })
    
    return {
        "id": str(team.id),
        "name": team.name,
        "description": team.description,
        "members": members
    }


@router.post("")
def create_team(team: TeamCreate, db: Session = Depends(get_db)):
    """Create new team"""
    db_team = MaintenanceTeam(
        name=team.name,
        description=team.description
    )
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return {
        "id": str(db_team.id),
        "name": db_team.name,
        "description": db_team.description,
        "members": []
    }


@router.put("/{team_id}")
def update_team(team_id: UUID, team: TeamUpdate, db: Session = Depends(get_db)):
    """Update team"""
    db_team = db.query(MaintenanceTeam).filter(MaintenanceTeam.id == team_id).first()
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    update_data = team.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_team, key, value)
    
    db.commit()
    db.refresh(db_team)
    return {"id": str(db_team.id), "name": db_team.name}


@router.delete("/{team_id}")
def delete_team(team_id: UUID, db: Session = Depends(get_db)):
    """Delete team"""
    db_team = db.query(MaintenanceTeam).filter(MaintenanceTeam.id == team_id).first()
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    db.delete(db_team)
    db.commit()
    return {"message": "Team deleted successfully"}
