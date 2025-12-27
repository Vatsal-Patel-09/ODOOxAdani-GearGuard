import uuid
from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base import Base


class MaintenanceTeam(Base):
    """
    MaintenanceTeam model - Specialized repair groups.
    
    Organizes technicians into teams responsible for equipment maintenance.
    Examples: Internal Maintenance, Metrology, Subcontractor
    """
    __tablename__ = "maintenance_teams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Basic Information
    name = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text)
    
    # Team Leadership
    team_lead_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # UI Customization
    color = Column(String(20), default="#3498db")  # Team color for Kanban/UI
    
    # Metadata
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    team_lead = relationship("User", foreign_keys=[team_lead_id], backref="led_teams")
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
