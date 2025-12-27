"""FastAPI dependencies for authentication and authorization."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from uuid import UUID

from app.db.session import get_db
from app.db.models import User
from .security import decode_access_token

# HTTP Bearer token scheme
security = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Get current user from token, returns None if not authenticated."""
    if not credentials:
        return None
    
    token = credentials.credentials
    user_id = decode_access_token(token)
    
    if not user_id:
        return None
    
    try:
        result = await db.execute(
            select(User).where(User.id == UUID(user_id), User.is_active == True)
        )
        return result.scalar_one_or_none()
    except Exception:
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current user from token, raises 401 if not authenticated."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    user_id = decode_access_token(token)
    
    if not user_id:
        raise credentials_exception
    
    try:
        result = await db.execute(
            select(User).where(User.id == UUID(user_id), User.is_active == True)
        )
        user = result.scalar_one_or_none()
    except Exception:
        raise credentials_exception
    
    if not user:
        raise credentials_exception
    
    return user


async def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Require admin role."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


async def get_current_manager_or_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Require manager or admin role."""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manager access required"
        )
    return current_user
