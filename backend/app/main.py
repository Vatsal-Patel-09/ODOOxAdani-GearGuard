"""
GearGuard API - Maintenance Management System
FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routes import api_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print(f"🚀 Starting {settings.APP_NAME}...")
    yield
    # Shutdown
    print(f"👋 Shutting down {settings.APP_NAME}...")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="The Ultimate Maintenance Tracker for Equipment and Work Centers",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
origins = settings.CORS_ORIGINS.split(",") if settings.CORS_ORIGINS != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint - API health check."""
    return {
        "name": settings.APP_NAME,
        "status": "healthy",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for deployment platforms."""
    return {"status": "healthy"}
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
