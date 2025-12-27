from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.equipment import router as equipment_router
from app.api.teams import router as teams_router
from app.api.requests import router as requests_router
from app.api.stats import router as stats_router
from app.api.users import router as users_router

app = FastAPI(title="GearGuard API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(equipment_router, prefix="/equipment", tags=["Equipment"])
app.include_router(teams_router, prefix="/teams", tags=["Teams"])
app.include_router(requests_router, prefix="/requests", tags=["Requests"])
app.include_router(stats_router, prefix="/stats", tags=["Statistics"])


@app.get("/")
async def root():
    return {"message": "Welcome to GearGuard API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
