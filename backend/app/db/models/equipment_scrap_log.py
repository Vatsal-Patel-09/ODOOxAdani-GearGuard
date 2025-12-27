import uuid
from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, Text, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base import Base


class EquipmentScrapLog(Base):
    """
    EquipmentScrapLog model - Records equipment decommissioning.
    
    Created when equipment is moved to 'scrapped' status via maintenance request.
    """
    __tablename__ = "equipment_scrap_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Equipment Reference
    equipment_id = Column(UUID(as_uuid=True), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Linked Request (if scrapped via maintenance request)
    request_id = Column(UUID(as_uuid=True), ForeignKey("maintenance_requests.id", ondelete="SET NULL"), nullable=True)
    
    # Who scrapped it
    scrapped_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Reason and Details
    reason = Column(Text, nullable=False)
    scrap_value = Column(Numeric(15, 2))  # Salvage value if any
    disposal_method = Column(String(100))  # How it was disposed
    
    # Timestamp
    scrapped_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    equipment = relationship("Equipment", backref="scrap_logs")
    request = relationship("MaintenanceRequest", backref="scrap_logs")
    scrapped_by_user = relationship("User", backref="equipment_scrapped")
