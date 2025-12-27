from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse
from app.services import auth as auth_service
from app.core.jwt import create_access_token
from app.db.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    """Register a new user and return JWT token."""
    # Check if email already exists
    existing = auth_service.get_user_by_email(db, request.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )
    
    user = auth_service.create_user(
        db,
        name=request.name,
        email=request.email,
        password=request.password,
        role=request.role or "user",
    )
    
    # Create JWT token
    access_token = create_access_token(
        user_id=str(user.id),
        email=user.email,
        role=user.role,
    )
    
    return AuthResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
        access_token=access_token,
        token_type="bearer",
        message="Registration successful",
    )


@router.post("/login", response_model=AuthResponse)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    """Login with email and password, returns JWT token."""
    user = auth_service.authenticate_user(db, request.email, request.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    
    # Create JWT token
    access_token = create_access_token(
        user_id=str(user.id),
        email=user.email,
        role=user.role,
    )
    
    return AuthResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
        access_token=access_token,
        token_type="bearer",
        message="Login successful",
    )


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """
    Get the current authenticated user.
    
    This is a protected endpoint - requires valid JWT token.
    
    Example usage:
        Authorization: Bearer <token>
    """
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
    }
