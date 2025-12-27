from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    """Register a new user."""
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
    
    return AuthResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
        message="Registration successful",
    )


@router.post("/login", response_model=AuthResponse)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    """Login with email and password."""
    user = auth_service.authenticate_user(db, request.email, request.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    
    return AuthResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
        message="Login successful",
    )
