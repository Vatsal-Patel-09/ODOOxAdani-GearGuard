import uuid
from sqlalchemy import (
    Column,
    String,
    Date,
    TIMESTAMP,
    Numeric,
    ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base import Base

class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    subject = Column(String, nullable=False)
    description = Column(String)

    request_type = Column(String, nullable=False)  # corrective | preventive
    status = Column(String, nullable=False, default="new")  
    # new | in_progress | repaired | scrap

    equipment_id = Column(UUID(as_uuid=True), ForeignKey("equipment.id"))
    maintenance_team_id = Column(UUID(as_uuid=True), ForeignKey("maintenance_teams.id"))

    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    scheduled_date = Column(Date)
    started_at = Column(TIMESTAMP)
    completed_at = Column(TIMESTAMP)
    duration_hours = Column(Numeric(5, 2))

    created_at = Column(TIMESTAMP, server_default=func.now())
