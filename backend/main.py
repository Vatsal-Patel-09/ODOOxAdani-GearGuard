from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import engine, Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (only if database is configured)
    if engine:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield
    # Cleanup on shutdown
    if engine:
        await engine.dispose()

app = FastAPI(
    title="GearGuard API",
    description="Backend API for GearGuard",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "GearGuard API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
