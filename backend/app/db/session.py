"""Database session configuration."""

import os
import ssl
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Convert to async driver format (postgresql+asyncpg://)
if DATABASE_URL:
    # Parse the URL to handle query parameters
    parsed = urlparse(DATABASE_URL)
    
    # Handle various postgres URL formats
    scheme = parsed.scheme
    if scheme == "postgres":
        scheme = "postgresql+asyncpg"
    elif scheme == "postgresql":
        scheme = "postgresql+asyncpg"
    elif scheme != "postgresql+asyncpg":
        print(f"Warning: DATABASE_URL scheme may not be compatible: {scheme}")
        scheme = "postgresql+asyncpg"
    
    # Parse query params and remove ones not supported by asyncpg
    query_params = parse_qs(parsed.query)
    
    # Remove sslmode and channel_binding from URL (we'll handle SSL separately)
    ssl_mode = query_params.pop('sslmode', ['disable'])[0]
    query_params.pop('channel_binding', None)
    
    # Rebuild URL without problematic params
    new_query = urlencode(query_params, doseq=True)
    DATABASE_URL = urlunparse((
        scheme,
        parsed.netloc,
        parsed.path,
        parsed.params,
        new_query,
        parsed.fragment
    ))
    
    # Determine if SSL is required
    USE_SSL = ssl_mode in ('require', 'verify-ca', 'verify-full', 'prefer')
else:
    raise ValueError("DATABASE_URL environment variable is required")

# Create SSL context if needed
connect_args = {}
if USE_SSL:
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    connect_args["ssl"] = ssl_context

engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True,
    connect_args=connect_args,
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db():
    """Dependency for getting database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
