"""Dashboard API routes."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime
from typing import List

from app.db.session import get_db
from app.db.models import Equipment, MaintenanceRequest, User, TeamMember
from app.schemas.dashboard import (
    DashboardKPIs, CriticalEquipmentKPI, TechnicianLoadKPI, OpenRequestsKPI,
    ActivityItem, DashboardSummary, EquipmentHealthSummary,
    RequestsByType, RequestsByStatus
)

router = APIRouter()


@router.get("/kpis", response_model=DashboardKPIs)
async def get_kpis(db: AsyncSession = Depends(get_db)):
    """Get dashboard KPIs."""
    
    # Critical Equipment (health < 30%)
    critical_count = await db.scalar(
        select(func.count()).where(
            Equipment.health_percentage < 30,
            Equipment.status != 'scrapped'
        )
    )
    
    # Technician Load
    total_technicians = await db.scalar(
        select(func.count()).where(
            User.is_technician == True,
            User.is_active == True
        )
    )
    
    # Technicians with active requests
    active_technicians = await db.scalar(
        select(func.count(func.distinct(MaintenanceRequest.assigned_to))).where(
            MaintenanceRequest.status == 'in_progress'
        )
    )
    
    utilization = 0.0
    if total_technicians and total_technicians > 0:
        utilization = (active_technicians or 0) / total_technicians * 100
    
    # Open Requests
    pending_count = await db.scalar(
        select(func.count()).where(MaintenanceRequest.status == 'new')
    )
    
    in_progress_count = await db.scalar(
        select(func.count()).where(MaintenanceRequest.status == 'in_progress')
    )
    
    # Overdue count (scheduled_date in past, not completed)
    overdue_count = await db.scalar(
        select(func.count()).where(
            MaintenanceRequest.scheduled_date < datetime.now(),
            MaintenanceRequest.status.in_(['new', 'in_progress'])
        )
    )
    
    return DashboardKPIs(
        critical_equipment=CriticalEquipmentKPI(
            count=critical_count or 0,
            threshold=30,
            label="Critical Equipment",
            description=f"{critical_count or 0} Units (Health < 30%)"
        ),
        technician_load=TechnicianLoadKPI(
            utilization_percentage=round(utilization, 1),
            active_technicians=active_technicians or 0,
            total_technicians=total_technicians or 0,
            label="Technician Load",
            description=f"{round(utilization, 0)}% Utilized (Assign Carefully)"
        ),
        open_requests=OpenRequestsKPI(
            pending_count=pending_count or 0,
            overdue_count=overdue_count or 0,
            in_progress_count=in_progress_count or 0,
            label="Open Requests",
            description=f"{pending_count or 0} Pending, {overdue_count or 0} Overdue"
        ),
        last_updated=datetime.now()
    )


@router.get("/activity", response_model=List[ActivityItem])
async def get_recent_activity(
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    """Get recent activity feed."""
    # Get recent requests
    query = select(MaintenanceRequest).order_by(
        MaintenanceRequest.updated_at.desc()
    ).limit(limit)
    
    result = await db.execute(query)
    requests = result.scalars().all()
    
    activities = []
    for req in requests:
        # Get creator name
        creator = None
        if req.created_by:
            creator_result = await db.execute(
                select(User).where(User.id == req.created_by)
            )
            creator = creator_result.scalar_one_or_none()
        
        # Get equipment name
        equipment = None
        if req.equipment_id:
            eq_result = await db.execute(
                select(Equipment).where(Equipment.id == req.equipment_id)
            )
            equipment = eq_result.scalar_one_or_none()
        
        activities.append(ActivityItem(
            id=req.id,
            type='request_updated',
            title=req.subject,
            description=f"Status: {req.status}",
            user_name=creator.name if creator else None,
            user_avatar=creator.avatar_url if creator else None,
            equipment_name=equipment.name if equipment else None,
            status=req.status,
            timestamp=req.updated_at or req.created_at
        ))
    
    return activities


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(db: AsyncSession = Depends(get_db)):
    """Get complete dashboard summary."""
    
    # Get KPIs
    kpis = await get_kpis(db)
    
    # Equipment Health Distribution
    critical = await db.scalar(
        select(func.count()).where(Equipment.health_percentage < 30)
    )
    poor = await db.scalar(
        select(func.count()).where(
            Equipment.health_percentage >= 30,
            Equipment.health_percentage < 50
        )
    )
    fair = await db.scalar(
        select(func.count()).where(
            Equipment.health_percentage >= 50,
            Equipment.health_percentage < 70
        )
    )
    good = await db.scalar(
        select(func.count()).where(
            Equipment.health_percentage >= 70,
            Equipment.health_percentage < 90
        )
    )
    excellent = await db.scalar(
        select(func.count()).where(Equipment.health_percentage >= 90)
    )
    
    # Requests by Type
    corrective = await db.scalar(
        select(func.count()).where(MaintenanceRequest.request_type == 'corrective')
    )
    preventive = await db.scalar(
        select(func.count()).where(MaintenanceRequest.request_type == 'preventive')
    )
    
    # Requests by Status
    new_count = await db.scalar(
        select(func.count()).where(MaintenanceRequest.status == 'new')
    )
    in_progress = await db.scalar(
        select(func.count()).where(MaintenanceRequest.status == 'in_progress')
    )
    repaired = await db.scalar(
        select(func.count()).where(MaintenanceRequest.status == 'repaired')
    )
    scrap = await db.scalar(
        select(func.count()).where(MaintenanceRequest.status == 'scrap')
    )
    
    # Recent Activity
    activity = await get_recent_activity(limit=5, db=db)
    
    return DashboardSummary(
        kpis=kpis,
        equipment_health=EquipmentHealthSummary(
            critical=critical or 0,
            poor=poor or 0,
            fair=fair or 0,
            good=good or 0,
            excellent=excellent or 0
        ),
        requests_by_type=RequestsByType(
            corrective=corrective or 0,
            preventive=preventive or 0
        ),
        requests_by_status=RequestsByStatus(
            new=new_count or 0,
            in_progress=in_progress or 0,
            repaired=repaired or 0,
            scrap=scrap or 0
        ),
        recent_activity=activity
    )
