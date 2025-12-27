from uuid import UUID
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


# Maintenance Team schemas
class MaintenanceTeamBase(BaseModel):
    name: str
    description: Optional[str] = None


class MaintenanceTeamCreate(MaintenanceTeamBase):
    pass


class MaintenanceTeamUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class MaintenanceTeamOut(MaintenanceTeamBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# Team Member schemas
class TeamMemberCreate(BaseModel):
    user_id: UUID


class TeamMemberOut(BaseModel):
    id: UUID
    team_id: UUID
    user_id: UUID

    class Config:
        from_attributes = True


# Team with members
class MaintenanceTeamWithMembers(MaintenanceTeamOut):
    members: List[TeamMemberOut] = []
