"""Authentication and user management routes."""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy.orm import Session
import bcrypt

from backend.database.db import get_db
from backend.models.user import User, UserRole
from backend.auth.jwt_handler import create_access_token, create_refresh_token, verify_token
from backend.auth.decorators import get_current_active_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    city: Optional[str] = None
    language: str = "en"

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenRefresh(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    phone: Optional[str]
    city: Optional[str]
    language: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = bcrypt.hashpw(payload.password.encode(), bcrypt.gensalt()).decode()
    user = User(
        email=payload.email,
        password_hash=hashed,
        name=payload.name,
        phone=payload.phone,
        city=payload.city,
        language=payload.language,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    refresh = create_refresh_token({"sub": str(user.id)})
    return {"access_token": token, "refresh_token": refresh, "token_type": "bearer", "user": UserOut.model_validate(user).model_dump()}


@router.post("/login")
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not bcrypt.checkpw(payload.password.encode(), user.password_hash.encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    user.last_login = datetime.utcnow()
    db.commit()
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    refresh = create_refresh_token({"sub": str(user.id)})
    return {"access_token": token, "refresh_token": refresh, "token_type": "bearer", "user": UserOut.model_validate(user).model_dump()}


@router.post("/logout")
def logout(current_user: User = Depends(get_current_active_user)):
    # JWT is stateless; client should discard the token
    return {"message": "Logged out successfully"}


@router.post("/refresh")
def refresh_token(payload: TokenRefresh, db: Session = Depends(get_db)):
    data = verify_token(payload.refresh_token, token_type="refresh")
    if not data:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    user_id = data.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user
