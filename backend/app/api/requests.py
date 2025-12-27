from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from uuid import UUID
from datetime import date

from app.db.session import get_db
from app.db.models.maintenance_request import MaintenanceRequest
from app.db.models.equipment import Equipment
from app.db.models.maintenance_team import MaintenanceTeam

router = APIRouter()

class RequestCreate(BaseModel):
    subject: str
    description: Optional[str] = None
    request_type: str = "corrective"
    priority: Optional[str] = "medium"
    equipment_id: Optional[UUID] = None
    maintenance_team_id: Optional[UUID] = None
    scheduled_date: Optional[date] = None

class RequestUpdate(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    scheduled_date: Optional[date] = None
    maintenance_team_id: Optional[UUID] = None

@router.get("")
def get_all_requests(db: Session = Depends(get_db)):
    """Get all maintenance requests"""
    requests = db.query(MaintenanceRequest).all()
    result = []
    
    for req in requests:
        # Get equipment name
        equipment_name = None
        if req.equipment_id:
            equipment = db.query(Equipment).filter(Equipment.id == req.equipment_id).first()
            if equipment:
                equipment_name = equipment.name
        
        # Get team name
        team_name = None
        if req.maintenance_team_id:
            team = db.query(MaintenanceTeam).filter(MaintenanceTeam.id == req.maintenance_team_id).first()
            if team:
                team_name = team.name
        
        result.append({
            "id": str(req.id),
            "subject": req.subject,
            "title": req.subject,  # Alias for frontend compatibility
            "description": req.description,
            "request_type": req.request_type,
            "status": req.status,
            "priority": "medium",  # Default priority
            "equipment_id": str(req.equipment_id) if req.equipment_id else None,
            "equipment_name": equipment_name,
            "maintenance_team_id": str(req.maintenance_team_id) if req.maintenance_team_id else None,
            "team_name": team_name,
            "scheduled_date": str(req.scheduled_date) if req.scheduled_date else None,
            "created_at": str(req.created_at) if req.created_at else None,
        })
    
    return result

@router.get("/{request_id}")
def get_request(request_id: UUID, db: Session = Depends(get_db)):
    """Get request by ID"""
    req = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Get equipment name
    equipment_name = None
    if req.equipment_id:
        equipment = db.query(Equipment).filter(Equipment.id == req.equipment_id).first()
        if equipment:
            equipment_name = equipment.name
    
    return {
        "id": str(req.id),
        "subject": req.subject,
        "title": req.subject,
        "description": req.description,
        "request_type": req.request_type,
        "status": req.status,
        "equipment_id": str(req.equipment_id) if req.equipment_id else None,
        "equipment_name": equipment_name,
        "scheduled_date": str(req.scheduled_date) if req.scheduled_date else None,
        "created_at": str(req.created_at) if req.created_at else None,
    }

@router.post("")
def create_request(request: RequestCreate, db: Session = Depends(get_db)):
    """Create new maintenance request"""
    db_request = MaintenanceRequest(
        subject=request.subject,
        description=request.description,
        request_type=request.request_type,
        status="new",
        equipment_id=request.equipment_id,
        maintenance_team_id=request.maintenance_team_id,
        scheduled_date=request.scheduled_date
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return {
        "id": str(db_request.id),
        "subject": db_request.subject,
        "status": db_request.status
    }

@router.put("/{request_id}")
def update_request(request_id: UUID, request: RequestUpdate, db: Session = Depends(get_db)):
    """Update request"""
    db_request = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_request, key, value)
    
    db.commit()
    db.refresh(db_request)
    return {"id": str(db_request.id), "subject": db_request.subject}

@router.delete("/{request_id}")
def delete_request(request_id: UUID, db: Session = Depends(get_db)):
    """Delete request"""
    db_request = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    db.delete(db_request)
    db.commit()
    return {"message": "Request deleted successfully"}
