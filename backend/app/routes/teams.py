"""Maintenance Teams API routes."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID

from app.db.session import get_db
from app.db.models import MaintenanceTeam, TeamMember, User
from app.schemas.maintenance_team import (
    TeamCreate, TeamUpdate, TeamResponse, TeamDetail, TeamList,
    TeamMemberCreate, TeamMemberResponse
)

router = APIRouter()


@router.get("/", response_model=TeamList)
async def list_teams(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List all maintenance teams."""
    query = select(MaintenanceTeam).options(
        selectinload(MaintenanceTeam.team_lead)
    )
    
    if search:
        query = query.where(MaintenanceTeam.name.ilike(f"%{search}%"))
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    teams = result.scalars().all()
    
    # Add member count
    response_items = []
    for team in teams:
        member_count = await db.scalar(
            select(func.count()).where(TeamMember.team_id == team.id)
        )
        response_items.append({
            **team.__dict__,
            'member_count': member_count or 0
        })
    
    return TeamList(items=response_items, total=total or 0, skip=skip, limit=limit)


@router.get("/{team_id}", response_model=TeamDetail)
async def get_team(team_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get a single team with its members."""
    query = select(MaintenanceTeam).where(MaintenanceTeam.id == team_id).options(
        selectinload(MaintenanceTeam.team_lead)
    )
    result = await db.execute(query)
    team = result.scalar_one_or_none()
    
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Get members
    members_query = select(TeamMember).where(TeamMember.team_id == team_id).options(
        selectinload(TeamMember.user)
    )
    members_result = await db.execute(members_query)
    members = members_result.scalars().all()
    
    member_count = len(members)
    
    return {
        **team.__dict__,
        'member_count': member_count,
        'members': members
    }


@router.post("/", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
async def create_team(team_data: TeamCreate, db: AsyncSession = Depends(get_db)):
    """Create a new maintenance team."""
    # Check if name already exists
    existing = await db.execute(
        select(MaintenanceTeam).where(MaintenanceTeam.name == team_data.name)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Team name already exists")
    
    team = MaintenanceTeam(**team_data.model_dump())
    db.add(team)
    await db.commit()
    await db.refresh(team)
    
    return {**team.__dict__, 'member_count': 0}


@router.patch("/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: UUID,
    team_data: TeamUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a team."""
    result = await db.execute(select(MaintenanceTeam).where(MaintenanceTeam.id == team_id))
    team = result.scalar_one_or_none()
    
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Update only provided fields
    update_data = team_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(team, field, value)
    
    await db.commit()
    await db.refresh(team)
    
    member_count = await db.scalar(
        select(func.count()).where(TeamMember.team_id == team.id)
    )
    
    return {**team.__dict__, 'member_count': member_count or 0}


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team(team_id: UUID, db: AsyncSession = Depends(get_db)):
    """Delete a team."""
    result = await db.execute(select(MaintenanceTeam).where(MaintenanceTeam.id == team_id))
    team = result.scalar_one_or_none()
    
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    await db.delete(team)
    await db.commit()
    
    return None


# Team Members endpoints
@router.get("/{team_id}/members", response_model=List[TeamMemberResponse])
async def list_team_members(team_id: UUID, db: AsyncSession = Depends(get_db)):
    """List all members of a team."""
    # Verify team exists
    team_result = await db.execute(select(MaintenanceTeam).where(MaintenanceTeam.id == team_id))
    if not team_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Team not found")
    
    query = select(TeamMember).where(TeamMember.team_id == team_id).options(
        selectinload(TeamMember.user)
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/{team_id}/members", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_team_member(
    team_id: UUID,
    member_data: TeamMemberCreate,
    db: AsyncSession = Depends(get_db)
):
    """Add a member to a team."""
    # Verify team exists
    team_result = await db.execute(select(MaintenanceTeam).where(MaintenanceTeam.id == team_id))
    if not team_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Verify user exists
    user_result = await db.execute(select(User).where(User.id == member_data.user_id))
    if not user_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already a member
    existing = await db.execute(
        select(TeamMember).where(
            TeamMember.team_id == team_id,
            TeamMember.user_id == member_data.user_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User is already a team member")
    
    member = TeamMember(team_id=team_id, **member_data.model_dump())
    db.add(member)
    await db.commit()
    await db.refresh(member)
    
    return member


@router.delete("/{team_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_team_member(
    team_id: UUID,
    user_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Remove a member from a team."""
    result = await db.execute(
        select(TeamMember).where(
            TeamMember.team_id == team_id,
            TeamMember.user_id == user_id
        )
    )
    member = result.scalar_one_or_none()
    
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    await db.delete(member)
    await db.commit()
    
    return None
