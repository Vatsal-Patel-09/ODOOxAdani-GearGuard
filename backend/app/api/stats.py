from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db
from app.db.models.equipment import Equipment
from app.db.models.maintenance_request import MaintenanceRequest
from app.db.models.maintenance_team import MaintenanceTeam

router = APIRouter(prefix="/stats", tags=["Statistics"])


@router.get("")
def get_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics."""
    
    # Total equipment (not scrapped)
    total_equipment = db.query(func.count(Equipment.id)).filter(
        Equipment.is_scrapped == False
    ).scalar()
    
    # Active requests (new or in_progress)
    active_requests = db.query(func.count(MaintenanceRequest.id)).filter(
        MaintenanceRequest.status.in_(["new", "in_progress"])
    ).scalar()
    
    # Total teams
    total_teams = db.query(func.count(MaintenanceTeam.id)).scalar()
    
    # Requests scheduled for today
    from datetime import date
    today = date.today()
    scheduled_today = db.query(func.count(MaintenanceRequest.id)).filter(
        func.date(MaintenanceRequest.scheduled_date) == today
    ).scalar()
    
    # Requests by status
    requests_by_status = {}
    for status in ["new", "in_progress", "repaired", "scrap"]:
        count = db.query(func.count(MaintenanceRequest.id)).filter(
            MaintenanceRequest.status == status
        ).scalar()
        requests_by_status[status] = count
    
    return {
        "total_equipment": total_equipment or 0,
        "active_requests": active_requests or 0,
        "total_teams": total_teams or 0,
        "scheduled_today": scheduled_today or 0,
        "requests_by_status": requests_by_status,
    }
