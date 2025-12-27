import uuid
from sqlalchemy import Column, String, TIMESTAMP, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base import Base


class User(Base):
    """
    User model - System users who can create requests, be technicians, or managers.
    
    Supports different roles: user, technician, manager, admin
    """
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Basic Information
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)  # Nullable for existing users
    phone = Column(String(50))
    
    # Organizational
    department = Column(String(100))
    job_title = Column(String(255))
    
    # Access Control
    role = Column(String(50), nullable=False, default="user")  # 'user' | 'technician' | 'manager' | 'admin'
    is_technician = Column(Boolean, default=False, index=True)  # Can be assigned to requests
    is_active = Column(Boolean, default=True)
    
    # Profile
    avatar_url = Column(String(500))  # For Kanban card display
    
    # Metadata
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
