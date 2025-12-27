import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Neon requires SSL, convert postgres:// to postgresql+asyncpg://
if DATABASE_URL and DATABASE_URL != "":
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://")
else:
    DATABASE_URL = None

engine = None
AsyncSessionLocal = None

if DATABASE_URL:
    engine = create_async_engine(
        DATABASE_URL,
        echo=True,
        pool_pre_ping=True,
    )
    
    AsyncSessionLocal = sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

Base = declarative_base()

async def get_db():
    if AsyncSessionLocal is None:
        raise Exception("Database not configured. Set DATABASE_URL in .env file.")
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
