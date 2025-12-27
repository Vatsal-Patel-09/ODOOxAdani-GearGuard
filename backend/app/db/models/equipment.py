import uuid
from sqlalchemy import Column, String, Date, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base import Base

class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    serial_number = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=False)

    department = Column(String)
    assigned_employee_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    maintenance_team_id = Column(UUID(as_uuid=True), ForeignKey("maintenance_teams.id"))

    purchase_date = Column(Date)
    warranty_expiry = Column(Date)
    location = Column(String)

    is_scrapped = Column(Boolean, default=False)

    created_at = Column(TIMESTAMP, server_default=func.now())
