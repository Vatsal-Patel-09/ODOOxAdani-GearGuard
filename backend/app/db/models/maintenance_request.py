import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Date, TIMESTAMP, Numeric, ForeignKey, Integer, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property

from app.db.base import Base


class MaintenanceRequest(Base):
    """
    MaintenanceRequest model - Core transactional entity for repair jobs.
    
    Handles the lifecycle of maintenance work from creation to completion.
    Supports both Corrective (breakdown) and Preventive (scheduled) types.
    """
    __tablename__ = "maintenance_requests"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Reference number - auto-generated format: MR/YYYY/XXXXX
    reference = Column(String(50), unique=True, nullable=True, index=True)
    
    # Basic Information
    subject = Column(String(500), nullable=False)
    description = Column(Text)
    
    # Type Classification
    request_type = Column(String(20), nullable=False, index=True)  # 'corrective' | 'preventive'
    maintenance_for = Column(String(50), default="equipment")  # 'equipment' | 'facility' | 'other'
    
    # Workflow Status - Kanban stages
    status = Column(String(20), nullable=False, default="new", index=True)
    # Stages: 'new' | 'in_progress' | 'repaired' | 'scrap'
    
    # Priority (1-5 star rating in UI)
    priority = Column(Integer, default=2)  # 1=Low, 2=Normal, 3=High, 4=Urgent, 5=Critical
    
    # Equipment Link
    equipment_id = Column(UUID(as_uuid=True), ForeignKey("equipment.id", ondelete="SET NULL"), nullable=True)
    category = Column(String(100))  # Auto-filled from equipment
    
    # Team Assignment
    maintenance_team_id = Column(UUID(as_uuid=True), ForeignKey("maintenance_teams.id", ondelete="SET NULL"), nullable=True)
    
    # User Assignment
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    
    # Scheduling & Time Tracking
    request_date = Column(Date, server_default=func.current_date())
    scheduled_date = Column(TIMESTAMP)  # For preventive maintenance
    started_at = Column(TIMESTAMP)
    completed_at = Column(TIMESTAMP)
    duration_hours = Column(Numeric(10, 2), default=0)  # Hours spent on repair
    
    # Form Tabs Content
    notes = Column(Text)  # Notes tab
    instructions = Column(Text)  # Instructions tab
    
    # Metadata
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    equipment = relationship("Equipment", backref="maintenance_requests")
    maintenance_team = relationship("MaintenanceTeam", backref="maintenance_requests")
    technician = relationship("User", foreign_keys=[assigned_to], backref="assigned_requests")
    creator = relationship("User", foreign_keys=[created_by], backref="created_requests")
    
    @hybrid_property
    def is_overdue(self) -> bool:
        """
        Check if request is overdue.
        A request is overdue if:
        - Has a scheduled_date
        - scheduled_date is in the past
        - Status is not 'repaired' or 'scrap'
        """
        if self.scheduled_date is None:
            return False
        if self.status in ('repaired', 'scrap'):
            return False
        if isinstance(self.scheduled_date, datetime):
            return self.scheduled_date < datetime.now()
        return False
    
    @hybrid_property
    def priority_label(self) -> str:
        """Get human-readable priority label"""
        labels = {1: "Low", 2: "Normal", 3: "High", 4: "Urgent", 5: "Critical"}
        return labels.get(self.priority, "Normal")
