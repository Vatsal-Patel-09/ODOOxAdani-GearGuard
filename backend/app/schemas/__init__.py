"""
Pydantic schemas for GearGuard API.

These schemas define the request/response models for the API endpoints.
"""

from .user import UserCreate, UserUpdate, UserResponse, UserList, UserBrief
from .equipment import EquipmentCreate, EquipmentUpdate, EquipmentResponse, EquipmentList, EquipmentBrief
from .maintenance_team import TeamCreate, TeamUpdate, TeamResponse, TeamList
from .maintenance_request import RequestCreate, RequestUpdate, RequestResponse, RequestList, RequestKanban
from .dashboard import DashboardKPIs, ActivityItem

__all__ = [
    # User
    "UserCreate", "UserUpdate", "UserResponse", "UserList", "UserBrief",
    # Equipment
    "EquipmentCreate", "EquipmentUpdate", "EquipmentResponse", "EquipmentList", "EquipmentBrief",
    # Team
    "TeamCreate", "TeamUpdate", "TeamResponse", "TeamList",
    # Request
    "RequestCreate", "RequestUpdate", "RequestResponse", "RequestList", "RequestKanban",
    # Dashboard
    "DashboardKPIs", "ActivityItem",
]
