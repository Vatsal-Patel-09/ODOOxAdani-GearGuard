"""
JWT Token utilities for authentication.
"""
import os
from datetime import datetime, timedelta
from typing import Optional

import jwt
from pydantic import BaseModel

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "gearguard-super-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24


class TokenData(BaseModel):
    """Token payload data."""
    user_id: str
    email: str
    role: str
    exp: Optional[datetime] = None


def create_access_token(user_id: str, email: str, role: str) -> str:
    """
    Create a JWT access token.
    
    Args:
        user_id: User's unique ID
        email: User's email
        role: User's role (admin, manager, technician, user)
    
    Returns:
        Encoded JWT token string
    """
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    
    payload = {
        "sub": user_id,  # subject (user id)
        "email": email,
        "role": role,
        "exp": expire,
        "iat": datetime.utcnow(),  # issued at
    }
    
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> Optional[TokenData]:
    """
    Verify and decode a JWT token.
    
    Args:
        token: JWT token string
    
    Returns:
        TokenData if valid, None if invalid
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        
        return TokenData(
            user_id=payload.get("sub"),
            email=payload.get("email"),
            role=payload.get("role"),
            exp=datetime.fromtimestamp(payload.get("exp")),
        )
    except jwt.ExpiredSignatureError:
        # Token has expired
        return None
    except jwt.InvalidTokenError:
        # Token is invalid
        return None
