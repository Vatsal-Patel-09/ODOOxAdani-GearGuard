import uuid
from sqlalchemy import Column, ForeignKey, UniqueConstraint, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class TeamMember(Base):
    """
    TeamMember model - Junction table for team-user many-to-many relationship.
    """
    __tablename__ = "team_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey("maintenance_teams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), default="member")  # 'lead', 'member', 'backup'

    __table_args__ = (
        UniqueConstraint("team_id", "user_id", name="uq_team_user"),
    )
    
    # Relationships
    team = relationship("MaintenanceTeam", backref="members")
    user = relationship("User", backref="team_memberships")

