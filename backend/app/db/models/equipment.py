import uuid
from sqlalchemy import Column, String, Date, Boolean, ForeignKey, TIMESTAMP, Integer, Text, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property

from app.db.base import Base


class Equipment(Base):
    """
    Equipment model - Central asset registry for maintenance management.
    
    Tracks all company assets including machines, vehicles, computers, etc.
    Includes health monitoring for critical equipment identification.
    """
    __tablename__ = "equipment"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Basic Information
    name = Column(String(255), nullable=False, index=True)
    serial_number = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)  # e.g., "Computers", "Monitors", "Vehicles"
    
    # Organizational Assignment
    department = Column(String(100), index=True)  # e.g., "Production", "IT", "Admin"
    assigned_employee_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Maintenance Assignment
    maintenance_team_id = Column(UUID(as_uuid=True), ForeignKey("maintenance_teams.id", ondelete="SET NULL"), nullable=True)
    default_technician_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Location
    location = Column(String(255))  # Physical location description
    
    # Financial & Warranty
    purchase_date = Column(Date)
    purchase_cost = Column(Numeric(15, 2))
    warranty_expiry = Column(Date)
    warranty_info = Column(Text)
    
    # Health & Status - CRITICAL for Dashboard KPIs
    health_percentage = Column(Integer, default=100, nullable=False)  # 0-100, Critical if < 30%
    status = Column(String(50), default="active", nullable=False)  # active, maintenance, scrapped, retired
    
    # Additional Info
    notes = Column(Text)
    
    # Metadata
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    assigned_employee = relationship("User", foreign_keys=[assigned_employee_id], backref="assigned_equipment")
    default_technician = relationship("User", foreign_keys=[default_technician_id], backref="default_equipment")
    maintenance_team = relationship("MaintenanceTeam", backref="equipment_list")
    
    @hybrid_property
    def is_critical(self) -> bool:
        """Equipment is critical if health is below 30%"""
        return self.health_percentage < 30
    
    @hybrid_property
    def is_scrapped(self) -> bool:
        """Check if equipment is scrapped"""
        return self.status == "scrapped"
