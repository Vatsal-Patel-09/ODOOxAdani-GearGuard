"""
GearGuard API - Backend for Maintenance Management System

This is the main FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Import from app package
from app.db.session import engine
from app.db.base import Base
from app.routes import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Note: Tables should be managed via Alembic migrations
    # The create_all is disabled to avoid conflicts with existing tables
    # Run `alembic upgrade head` to apply migrations
    print("🚀 GearGuard API starting up...")
    yield
    # Cleanup on shutdown
    if engine:
        await engine.dispose()
    print("👋 GearGuard API shutting down...")


app = FastAPI(
    title="GearGuard API",
    description="""
    🔧 **GearGuard** - The Ultimate Maintenance Tracker
    
    Backend API for the ERP-style maintenance management system.
    
    ## Features
    - Equipment Management with Health Tracking
    - Maintenance Teams with Member Management
    - Maintenance Requests with Kanban & Calendar Views
    - Dashboard with KPIs
    
    ## API Sections
    - **Users**: Manage system users and technicians
    - **Equipment**: Track assets with health monitoring
    - **Teams**: Organize maintenance teams
    - **Requests**: Handle maintenance work orders
    - **Dashboard**: Get KPIs and activity feed
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint - API status."""
    return {
        "message": "GearGuard API is running",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

