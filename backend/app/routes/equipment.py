"""Equipment API routes."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID

from app.db.session import get_db
from app.db.models import Equipment, MaintenanceRequest
from app.schemas.equipment import (
    EquipmentCreate, EquipmentUpdate, EquipmentResponse, 
    EquipmentList, EquipmentHealth
)

router = APIRouter()


@router.get("/", response_model=EquipmentList)
async def list_equipment(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    category: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[str] = None,
    is_critical: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List all equipment with optional filtering."""
    query = select(Equipment).options(
        selectinload(Equipment.assigned_employee),
        selectinload(Equipment.maintenance_team),
        selectinload(Equipment.default_technician)
    )
    
    # Apply filters
    if category:
        query = query.where(Equipment.category == category)
    if department:
        query = query.where(Equipment.department == department)
    if status:
        query = query.where(Equipment.status == status)
    if is_critical:
        query = query.where(Equipment.health_percentage < 30)
    if search:
        query = query.where(Equipment.name.ilike(f"%{search}%"))
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    equipment_list = result.scalars().all()
    
    # Add open request count to each equipment
    response_items = []
    for eq in equipment_list:
        # Get open request count
        open_count_query = select(func.count()).where(
            MaintenanceRequest.equipment_id == eq.id,
            MaintenanceRequest.status.in_(['new', 'in_progress'])
        )
        open_count = await db.scalar(open_count_query)
        
        eq_dict = {
            **eq.__dict__,
            'is_critical': eq.health_percentage < 30,
            'open_request_count': open_count or 0
        }
        response_items.append(eq_dict)
    
    return EquipmentList(items=response_items, total=total or 0, skip=skip, limit=limit)


@router.get("/categories", response_model=List[str])
async def list_categories(db: AsyncSession = Depends(get_db)):
    """List all unique equipment categories."""
    query = select(Equipment.category).distinct()
    result = await db.execute(query)
    categories = result.scalars().all()
    return [c for c in categories if c]


@router.get("/departments", response_model=List[str])
async def list_departments(db: AsyncSession = Depends(get_db)):
    """List all unique departments."""
    query = select(Equipment.department).distinct()
    result = await db.execute(query)
    departments = result.scalars().all()
    return [d for d in departments if d]


@router.get("/health-summary", response_model=EquipmentHealth)
async def get_health_summary(db: AsyncSession = Depends(get_db)):
    """Get equipment health summary for dashboard."""
    total = await db.scalar(select(func.count()).select_from(Equipment))
    critical = await db.scalar(
        select(func.count()).where(Equipment.health_percentage < 30)
    )
    maintenance = await db.scalar(
        select(func.count()).where(Equipment.status == 'maintenance')
    )
    healthy = await db.scalar(
        select(func.count()).where(Equipment.health_percentage >= 70)
    )
    avg_health = await db.scalar(
        select(func.avg(Equipment.health_percentage))
    )
    
    return EquipmentHealth(
        total_equipment=total or 0,
        critical_count=critical or 0,
        maintenance_count=maintenance or 0,
        healthy_count=healthy or 0,
        average_health=float(avg_health or 0)
    )


@router.get("/{equipment_id}", response_model=EquipmentResponse)
async def get_equipment(equipment_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get a single equipment by ID."""
    query = select(Equipment).where(Equipment.id == equipment_id).options(
        selectinload(Equipment.assigned_employee),
        selectinload(Equipment.maintenance_team),
        selectinload(Equipment.default_technician)
    )
    result = await db.execute(query)
    equipment = result.scalar_one_or_none()
    
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    # Get open request count
    open_count_query = select(func.count()).where(
        MaintenanceRequest.equipment_id == equipment.id,
        MaintenanceRequest.status.in_(['new', 'in_progress'])
    )
    open_count = await db.scalar(open_count_query)
    
    return {
        **equipment.__dict__,
        'is_critical': equipment.health_percentage < 30,
        'open_request_count': open_count or 0
    }


@router.post("/", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
async def create_equipment(
    equipment_data: EquipmentCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create new equipment."""
    # Check if serial number already exists
    existing = await db.execute(
        select(Equipment).where(Equipment.serial_number == equipment_data.serial_number)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Serial number already exists")
    
    equipment = Equipment(**equipment_data.model_dump())
    db.add(equipment)
    await db.commit()
    await db.refresh(equipment)
    
    return {
        **equipment.__dict__,
        'is_critical': equipment.health_percentage < 30,
        'open_request_count': 0
    }


@router.patch("/{equipment_id}", response_model=EquipmentResponse)
async def update_equipment(
    equipment_id: UUID,
    equipment_data: EquipmentUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update equipment."""
    result = await db.execute(select(Equipment).where(Equipment.id == equipment_id))
    equipment = result.scalar_one_or_none()
    
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    # Update only provided fields
    update_data = equipment_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(equipment, field, value)
    
    await db.commit()
    await db.refresh(equipment)
    
    return {
        **equipment.__dict__,
        'is_critical': equipment.health_percentage < 30,
        'open_request_count': 0
    }


@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipment(equipment_id: UUID, db: AsyncSession = Depends(get_db)):
    """Delete equipment (set status to retired)."""
    result = await db.execute(select(Equipment).where(Equipment.id == equipment_id))
    equipment = result.scalar_one_or_none()
    
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    equipment.status = "retired"
    await db.commit()
    
    return None
