from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import users_router, equipment_router, teams_router, requests_router, auth_router, stats_router

app = FastAPI(
    title="GearGuard API",
    description="Maintenance Management System for tracking assets and maintenance requests",
    version="1.0.0",
)

# CORS middleware - allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(equipment_router)
app.include_router(teams_router)
app.include_router(requests_router)
app.include_router(stats_router)


@app.get("/")
def root():
    return {"message": "GearGuard API is running", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
