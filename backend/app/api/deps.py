"""
Authentication dependencies for FastAPI.
"""
from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.db.models.user import User
from app.core.jwt import verify_token


# HTTP Bearer token security scheme
security = HTTPBearer()


def get_db() -> Generator:
    """Database session dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Get the current authenticated user from JWT token.
    
    Extracts JWT from Authorization: Bearer <token> header,
    validates the token, and returns the user from the database.
    
    Raises:
        HTTPException 401: If token is missing, invalid, or expired
        HTTPException 401: If user not found in database
    """
    token = credentials.credentials
    
    # Verify the token
    token_data = verify_token(token)
    
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Fetch user from database
    user = db.query(User).filter(User.id == token_data.user_id).first()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get the current active user (placeholder for future active/inactive check).
    """
    # Could add is_active check here in the future
    return current_user


# Role-based dependencies (for future use)
def require_role(*allowed_roles: str):
    """
    Create a dependency that requires the user to have one of the allowed roles.
    
    Usage:
        @router.get("/admin-only")
        def admin_endpoint(user: User = Depends(require_role("admin"))):
            ...
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}",
            )
        return current_user
    return role_checker


# Convenience dependencies for specific roles
get_admin_user = require_role("admin")
get_manager_user = require_role("admin", "manager")
get_technician_user = require_role("admin", "manager", "technician")
