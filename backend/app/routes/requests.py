"""Maintenance Requests API routes."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime, date
from uuid import UUID
import uuid as uuid_lib

from app.db.session import get_db
from app.db.models import MaintenanceRequest, Equipment, RequestHistory, EquipmentScrapLog
from app.schemas.maintenance_request import (
    RequestCreate, RequestUpdate, RequestResponse, RequestList,
    RequestKanban, RequestKanbanColumn, RequestKanbanCard,
    RequestCalendar, RequestCalendarItem, RequestStageUpdate
)

router = APIRouter()

# Stage labels for Kanban
STAGE_LABELS = {
    'new': 'New',
    'in_progress': 'In Progress',
    'repaired': 'Repaired',
    'scrap': 'Scrap'
}

PRIORITY_LABELS = {1: "Low", 2: "Normal", 3: "High", 4: "Urgent", 5: "Critical"}


def generate_reference() -> str:
    """Generate a unique reference number."""
    year = datetime.now().year
    unique_id = str(uuid_lib.uuid4().int)[:5]
    return f"MR/{year}/{unique_id}"


def compute_is_overdue(scheduled_date: Optional[datetime], status: str) -> bool:
    """Compute if a request is overdue."""
    if scheduled_date is None:
        return False
    if status in ('repaired', 'scrap'):
        return False
    return scheduled_date < datetime.now()


@router.get("/", response_model=RequestList)
async def list_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = None,
    request_type: Optional[str] = None,
    equipment_id: Optional[UUID] = None,
    team_id: Optional[UUID] = None,
    assigned_to: Optional[UUID] = None,
    is_overdue: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List all maintenance requests with optional filtering."""
    query = select(MaintenanceRequest).options(
        selectinload(MaintenanceRequest.equipment),
        selectinload(MaintenanceRequest.maintenance_team),
        selectinload(MaintenanceRequest.technician),
        selectinload(MaintenanceRequest.creator)
    )
    
    # Apply filters
    if status:
        query = query.where(MaintenanceRequest.status == status)
    if request_type:
        query = query.where(MaintenanceRequest.request_type == request_type)
    if equipment_id:
        query = query.where(MaintenanceRequest.equipment_id == equipment_id)
    if team_id:
        query = query.where(MaintenanceRequest.maintenance_team_id == team_id)
    if assigned_to:
        query = query.where(MaintenanceRequest.assigned_to == assigned_to)
    if search:
        query = query.where(MaintenanceRequest.subject.ilike(f"%{search}%"))
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # Apply pagination
    query = query.order_by(MaintenanceRequest.created_at.desc())
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    requests = result.scalars().all()
    
    # Transform to response
    response_items = []
    for req in requests:
        is_overdue = compute_is_overdue(req.scheduled_date, req.status)
        response_items.append({
            **req.__dict__,
            'is_overdue': is_overdue,
            'priority_label': PRIORITY_LABELS.get(req.priority, "Normal")
        })
    
    return RequestList(items=response_items, total=total or 0, skip=skip, limit=limit)


@router.get("/kanban", response_model=RequestKanban)
async def get_kanban(
    team_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get requests grouped by status for Kanban board."""
    columns = []
    total = 0
    
    for stage in ['new', 'in_progress', 'repaired', 'scrap']:
        query = select(MaintenanceRequest).where(
            MaintenanceRequest.status == stage
        ).options(
            selectinload(MaintenanceRequest.equipment),
            selectinload(MaintenanceRequest.technician)
        )
        
        if team_id:
            query = query.where(MaintenanceRequest.maintenance_team_id == team_id)
        
        query = query.order_by(MaintenanceRequest.priority.desc(), MaintenanceRequest.created_at.desc())
        result = await db.execute(query)
        requests = result.scalars().all()
        
        cards = []
        for req in requests:
            is_overdue = compute_is_overdue(req.scheduled_date, req.status)
            cards.append(RequestKanbanCard(
                id=req.id,
                reference=req.reference,
                subject=req.subject,
                priority=req.priority,
                priority_label=PRIORITY_LABELS.get(req.priority, "Normal"),
                is_overdue=is_overdue,
                scheduled_date=req.scheduled_date,
                equipment_name=req.equipment.name if req.equipment else None,
                technician={
                    'id': req.technician.id,
                    'name': req.technician.name,
                    'email': req.technician.email,
                    'avatar_url': req.technician.avatar_url
                } if req.technician else None
            ))
        
        columns.append(RequestKanbanColumn(
            stage=stage,
            stage_label=STAGE_LABELS[stage],
            count=len(cards),
            cards=cards
        ))
        total += len(cards)
    
    return RequestKanban(columns=columns, total_requests=total)


@router.get("/calendar", response_model=RequestCalendar)
async def get_calendar(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2020, le=2100),
    db: AsyncSession = Depends(get_db)
):
    """Get preventive requests for calendar view."""
    # Get start and end of month
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)
    
    query = select(MaintenanceRequest).where(
        MaintenanceRequest.request_type == 'preventive',
        MaintenanceRequest.scheduled_date >= start_date,
        MaintenanceRequest.scheduled_date < end_date
    ).options(
        selectinload(MaintenanceRequest.equipment),
        selectinload(MaintenanceRequest.technician)
    ).order_by(MaintenanceRequest.scheduled_date)
    
    result = await db.execute(query)
    requests = result.scalars().all()
    
    items = []
    for req in requests:
        items.append(RequestCalendarItem(
            id=req.id,
            reference=req.reference,
            subject=req.subject,
            scheduled_date=req.scheduled_date,
            equipment_name=req.equipment.name if req.equipment else None,
            technician_name=req.technician.name if req.technician else None,
            status=req.status
        ))
    
    return RequestCalendar(items=items, month=month, year=year)


@router.get("/{request_id}", response_model=RequestResponse)
async def get_request(request_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get a single request by ID."""
    query = select(MaintenanceRequest).where(MaintenanceRequest.id == request_id).options(
        selectinload(MaintenanceRequest.equipment),
        selectinload(MaintenanceRequest.maintenance_team),
        selectinload(MaintenanceRequest.technician),
        selectinload(MaintenanceRequest.creator)
    )
    result = await db.execute(query)
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    is_overdue = compute_is_overdue(request.scheduled_date, request.status)
    
    return {
        **request.__dict__,
        'is_overdue': is_overdue,
        'priority_label': PRIORITY_LABELS.get(request.priority, "Normal")
    }


@router.post("/", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
async def create_request(
    request_data: RequestCreate,
    created_by: UUID = Query(..., description="User ID of creator"),
    db: AsyncSession = Depends(get_db)
):
    """Create a new maintenance request with auto-fill from equipment."""
    data = request_data.model_dump()
    data['created_by'] = created_by
    data['reference'] = generate_reference()
    
    # Auto-fill from equipment if provided
    if data.get('equipment_id'):
        eq_result = await db.execute(
            select(Equipment).where(Equipment.id == data['equipment_id'])
        )
        equipment = eq_result.scalar_one_or_none()
        
        if equipment:
            # Auto-fill category from equipment
            data['category'] = equipment.category
            
            # Auto-fill team from equipment if not provided
            if not data.get('maintenance_team_id') and equipment.maintenance_team_id:
                data['maintenance_team_id'] = equipment.maintenance_team_id
            
            # Auto-fill technician from equipment if not provided
            if not data.get('assigned_to') and equipment.default_technician_id:
                data['assigned_to'] = equipment.default_technician_id
    
    request = MaintenanceRequest(**data)
    db.add(request)
    
    # Log initial stage
    history = RequestHistory(
        request_id=request.id,
        from_stage=None,
        to_stage='new',
        changed_by=created_by,
        comment='Request created'
    )
    db.add(history)
    
    await db.commit()
    await db.refresh(request)
    
    return {
        **request.__dict__,
        'is_overdue': False,
        'priority_label': PRIORITY_LABELS.get(request.priority, "Normal")
    }


@router.patch("/{request_id}", response_model=RequestResponse)
async def update_request(
    request_id: UUID,
    request_data: RequestUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a request."""
    result = await db.execute(
        select(MaintenanceRequest).where(MaintenanceRequest.id == request_id)
    )
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Update only provided fields
    update_data = request_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(request, field, value)
    
    await db.commit()
    await db.refresh(request)
    
    is_overdue = compute_is_overdue(request.scheduled_date, request.status)
    
    return {
        **request.__dict__,
        'is_overdue': is_overdue,
        'priority_label': PRIORITY_LABELS.get(request.priority, "Normal")
    }


@router.patch("/{request_id}/stage", response_model=RequestResponse)
async def update_stage(
    request_id: UUID,
    stage_data: RequestStageUpdate,
    changed_by: UUID = Query(..., description="User ID making the change"),
    db: AsyncSession = Depends(get_db)
):
    """Update request stage (for Kanban drag-drop)."""
    result = await db.execute(
        select(MaintenanceRequest).where(MaintenanceRequest.id == request_id)
    )
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    old_stage = request.status
    new_stage = stage_data.status
    
    # Update stage
    request.status = new_stage
    
    # Update timestamps
    if new_stage == 'in_progress' and not request.started_at:
        request.started_at = datetime.now()
    elif new_stage in ('repaired', 'scrap') and not request.completed_at:
        request.completed_at = datetime.now()
    
    # Log stage change
    history = RequestHistory(
        request_id=request_id,
        from_stage=old_stage,
        to_stage=new_stage,
        changed_by=changed_by,
        comment=stage_data.comment,
        duration_at_change=request.duration_hours
    )
    db.add(history)
    
    # Handle scrap logic - update equipment status
    if new_stage == 'scrap' and request.equipment_id:
        eq_result = await db.execute(
            select(Equipment).where(Equipment.id == request.equipment_id)
        )
        equipment = eq_result.scalar_one_or_none()
        
        if equipment:
            equipment.status = 'scrapped'
            
            # Create scrap log
            scrap_log = EquipmentScrapLog(
                equipment_id=equipment.id,
                request_id=request_id,
                scrapped_by=changed_by,
                reason=f"Scrapped via maintenance request: {request.subject}"
            )
            db.add(scrap_log)
    
    await db.commit()
    await db.refresh(request)
    
    is_overdue = compute_is_overdue(request.scheduled_date, request.status)
    
    return {
        **request.__dict__,
        'is_overdue': is_overdue,
        'priority_label': PRIORITY_LABELS.get(request.priority, "Normal")
    }


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request(request_id: UUID, db: AsyncSession = Depends(get_db)):
    """Delete a request."""
    result = await db.execute(
        select(MaintenanceRequest).where(MaintenanceRequest.id == request_id)
    )
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    await db.delete(request)
    await db.commit()
    
    return None


@router.get("/{request_id}/history", response_model=List[dict])
async def get_request_history(request_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get stage change history for a request."""
    query = select(RequestHistory).where(
        RequestHistory.request_id == request_id
    ).order_by(RequestHistory.changed_at.desc())
    
    result = await db.execute(query)
    history = result.scalars().all()
    
    return [
        {
            'id': h.id,
            'from_stage': h.from_stage,
            'to_stage': h.to_stage,
            'comment': h.comment,
            'changed_at': h.changed_at
        }
        for h in history
    ]
