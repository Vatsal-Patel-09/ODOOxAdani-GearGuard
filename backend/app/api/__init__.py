from app.api.auth import router as auth_router
from app.api.equipment import router as equipment_router
from app.api.teams import router as teams_router
from app.api.requests import router as requests_router
from app.api.stats import router as stats_router
from app.api.users import router as users_router

__all__ = [
    "auth_router",
    "equipment_router",
    "teams_router",
    "requests_router",
    "stats_router",
    "users_router",
]
