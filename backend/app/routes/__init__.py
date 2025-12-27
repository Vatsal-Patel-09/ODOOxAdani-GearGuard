"""API Routes for GearGuard."""

from fastapi import APIRouter

from .auth import router as auth_router
from .users import router as users_router
from .equipment import router as equipment_router
from .teams import router as teams_router
from .requests import router as requests_router
from .dashboard import router as dashboard_router

# Main API router
api_router = APIRouter()

# Include all routers
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(equipment_router, prefix="/equipment", tags=["Equipment"])
api_router.include_router(teams_router, prefix="/teams", tags=["Teams"])
api_router.include_router(requests_router, prefix="/requests", tags=["Maintenance Requests"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
