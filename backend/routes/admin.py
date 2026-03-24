"""Admin routes."""
from typing import Optional
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database.db import get_db
from backend.models.user import User, UserRole
from backend.models.pump import CngPump, PumpPrice, PriceTrend, PumpStatus
from backend.models.alert import Alert
from backend.models.review import Review
from backend.auth.decorators import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


class PriceUpdate(BaseModel):
    city: str
    pump_id: str
    price_per_kg: float
    trend: PriceTrend = PriceTrend.STABLE


class UserUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None


@router.get("/stats")
def system_stats(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    total_users = db.query(func.count(User.id)).scalar()
    active_users = db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar()
    total_pumps = db.query(func.count(CngPump.id)).scalar()
    open_pumps = db.query(func.count(CngPump.id)).filter(CngPump.status == PumpStatus.OPEN).scalar()
    total_reviews = db.query(func.count(Review.id)).scalar()
    total_alerts = db.query(func.count(Alert.id)).scalar()
    return {
        "users": {"total": total_users, "active": active_users},
        "pumps": {"total": total_pumps, "open": open_pumps},
        "reviews": total_reviews,
        "alerts": total_alerts,
    }


@router.get("/users")
def list_users(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    users = db.query(User).offset(offset).limit(limit).all()
    return {
        "users": [
            {
                "id": str(u.id),
                "email": u.email,
                "name": u.name,
                "role": u.role.value,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat(),
                "last_login": u.last_login.isoformat() if u.last_login else None,
            }
            for u in users
        ]
    }


@router.put("/users/{user_id}")
def update_user(
    user_id: UUID,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if payload.name is not None:
        user.name = payload.name
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.role is not None:
        user.role = payload.role
    db.commit()
    return {"id": str(user.id), "name": user.name, "role": user.role.value, "is_active": user.is_active}


@router.get("/pumps/analytics")
def pump_analytics(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    by_city = (
        db.query(CngPump.city, func.count(CngPump.id).label("count"), func.avg(CngPump.avg_rating).label("avg_rating"))
        .group_by(CngPump.city)
        .all()
    )
    by_status = db.query(CngPump.status, func.count(CngPump.id).label("count")).group_by(CngPump.status).all()
    avg_crowd = db.query(func.avg(CngPump.current_crowd_level)).scalar()
    return {
        "by_city": [{"city": r.city, "count": r.count, "avg_rating": round(r.avg_rating or 0, 2)} for r in by_city],
        "by_status": [{"status": r.status.value, "count": r.count} for r in by_status],
        "avg_crowd_level": round(avg_crowd or 0, 1),
    }


@router.post("/prices")
def update_price(
    payload: PriceUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    price = PumpPrice(
        pump_id=payload.pump_id,
        city=payload.city,
        price_per_kg=payload.price_per_kg,
        trend=payload.trend,
        date=date.today(),
    )
    db.add(price)
    db.commit()
    db.refresh(price)
    return {"id": str(price.id), "city": price.city, "price_per_kg": price.price_per_kg, "trend": price.trend}


@router.get("/alerts/stats")
def alert_stats(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    total = db.query(func.count(Alert.id)).scalar()
    active = db.query(func.count(Alert.id)).filter(Alert.is_active.is_(True)).scalar()
    by_threshold = db.query(Alert.threshold, func.count(Alert.id).label("count")).group_by(Alert.threshold).all()
    return {
        "total": total,
        "active": active,
        "by_threshold": [{"threshold": r.threshold.value, "count": r.count} for r in by_threshold],
    }
