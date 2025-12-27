from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date

from app.db.session import get_db
from app.db.models.equipment import Equipment
from app.db.models.maintenance_request import MaintenanceRequest
from app.db.models.maintenance_team import MaintenanceTeam

router = APIRouter()

@router.get("")
def get_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    
    # Total equipment count
    total_equipment = db.query(func.count(Equipment.id)).scalar() or 0
    
    # Active requests (new or in_progress)
    active_requests = db.query(func.count(MaintenanceRequest.id)).filter(
        MaintenanceRequest.status.in_(["new", "in_progress"])
    ).scalar() or 0
    
    # Total teams
    total_teams = db.query(func.count(MaintenanceTeam.id)).scalar() or 0
    
    # Scheduled today
    today = date.today()
    scheduled_today = db.query(func.count(MaintenanceRequest.id)).filter(
        func.date(MaintenanceRequest.scheduled_date) == today
    ).scalar() or 0
    
    # Requests by status
    requests_by_status = {
        "new": db.query(func.count(MaintenanceRequest.id)).filter(
            MaintenanceRequest.status == "new"
        ).scalar() or 0,
        "in_progress": db.query(func.count(MaintenanceRequest.id)).filter(
            MaintenanceRequest.status == "in_progress"
        ).scalar() or 0,
        "repaired": db.query(func.count(MaintenanceRequest.id)).filter(
            MaintenanceRequest.status == "repaired"
        ).scalar() or 0,
        "scrap": db.query(func.count(MaintenanceRequest.id)).filter(
            MaintenanceRequest.status == "scrap"
        ).scalar() or 0,
    }
    
    return {
        "total_equipment": total_equipment,
        "active_requests": active_requests,
        "total_teams": total_teams,
        "scheduled_today": scheduled_today,
        "requests_by_status": requests_by_status,
    }
