from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.db.models.user import User

router = APIRouter()

@router.get("")
def get_all_users(db: Session = Depends(get_db)):
    """Get all users"""
    users = db.query(User).all()
    return [
        {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
        for user in users
    ]

@router.get("/{user_id}")
def get_user(user_id: UUID, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "role": user.role
    }
