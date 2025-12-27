import uuid
from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, Text, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base import Base


class RequestHistory(Base):
    """
    RequestHistory model - Audit trail for stage transitions.
    
    Logs every stage change in a maintenance request for tracking and reporting.
    """
    __tablename__ = "request_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Request Reference
    request_id = Column(UUID(as_uuid=True), ForeignKey("maintenance_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Stage Transition
    from_stage = Column(String(20))  # Previous stage (null for initial creation)
    to_stage = Column(String(20), nullable=False)  # New stage
    
    # Who made the change
    changed_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Additional Info
    comment = Column(Text)  # Optional comment about the transition
    duration_at_change = Column(Numeric(10, 2))  # Duration recorded at time of change
    
    # Timestamp
    changed_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    request = relationship("MaintenanceRequest", backref="history")
    changed_by_user = relationship("User", backref="request_changes")
