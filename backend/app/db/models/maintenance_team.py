import uuid
from sqlalchemy import Column, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base import Base

class MaintenanceTeam(Base):
    __tablename__ = "maintenance_teams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)

    created_at = Column(TIMESTAMP, server_default=func.now())
