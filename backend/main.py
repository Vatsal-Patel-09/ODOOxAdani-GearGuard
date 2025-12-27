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
    print("🚀 GearGuard API starting up...")
    yield
    print("👋 GearGuard API shutting down...")
    if engine is not None:
        try:
            await engine.dispose()
        except Exception:
            pass


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
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "GearGuard API is running", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
