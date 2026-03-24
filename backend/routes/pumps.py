"""CNG Pump routes."""
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.models.pump import CngPump, PumpStatus, QueueHistory
from backend.models.review import Review
from backend.models.user import User
from backend.auth.decorators import get_current_active_user, require_admin
from backend.services.pump_service import (
    get_pumps, get_pump_by_id, create_pump, update_pump, delete_pump,
    get_nearby_pumps, get_pump_queue_history,
)
from backend.utils.helpers import crowd_level_label

router = APIRouter(prefix="/api/pumps", tags=["pumps"])


class PumpCreate(BaseModel):
    name: str
    area: str
    city: str
    address: str
    latitude: float
    longitude: float
    operating_hours: dict = {"open": "06:00", "close": "22:00"}
    is_24x7: bool = False
    facilities: dict = {}
    max_capacity: int = 50
    status: str = "open"


class PumpUpdate(BaseModel):
    name: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    operating_hours: Optional[dict] = None
    is_24x7: Optional[bool] = None
    facilities: Optional[dict] = None
    current_crowd_level: Optional[int] = None
    max_capacity: Optional[int] = None
    current_vehicles: Optional[int] = None
    status: Optional[str] = None


class ReviewCreate(BaseModel):
    rating: int
    text: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v: int) -> int:
        if not 1 <= v <= 5:
            raise ValueError("Rating must be between 1 and 5")
        return v


def pump_to_dict(pump: CngPump, distance_km: Optional[float] = None) -> dict:
    d = {
        "id": str(pump.id),
        "name": pump.name,
        "area": pump.area,
        "city": pump.city,
        "address": pump.address,
        "latitude": pump.latitude,
        "longitude": pump.longitude,
        "operating_hours": pump.operating_hours,
        "is_24x7": pump.is_24x7,
        "facilities": pump.facilities,
        "current_crowd_level": pump.current_crowd_level,
        "crowd_label": crowd_level_label(pump.current_crowd_level),
        "max_capacity": pump.max_capacity,
        "current_vehicles": pump.current_vehicles,
        "status": pump.status.value if pump.status else "open",
        "avg_rating": pump.avg_rating,
        "review_count": pump.review_count,
        "created_at": pump.created_at.isoformat() if pump.created_at else None,
    }
    if distance_km is not None:
        d["distance_km"] = distance_km
    return d


@router.get("/")
def list_pumps(
    city: Optional[str] = Query(None),
    area: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    pumps = get_pumps(db, city=city, area=area, status=status, limit=limit, offset=offset)
    return {"pumps": [pump_to_dict(p) for p in pumps], "count": len(pumps)}


@router.get("/nearby")
def nearby_pumps(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius: float = Query(5.0, description="Radius in km"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    results = get_nearby_pumps(db, lat, lng, radius_km=radius, limit=limit)
    return {
        "pumps": [
            {**pump_to_dict(r["pump"]), "distance_km": r["distance_km"]}
            for r in results
        ],
        "count": len(results),
    }


@router.get("/{pump_id}")
def get_pump(pump_id: UUID, db: Session = Depends(get_db)):
    pump = get_pump_by_id(db, pump_id)
    if not pump:
        raise HTTPException(status_code=404, detail="Pump not found")
    return pump_to_dict(pump)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_new_pump(
    payload: PumpCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    pump = create_pump(db, payload.model_dump())
    return pump_to_dict(pump)


@router.put("/{pump_id}")
def update_existing_pump(
    pump_id: UUID,
    payload: PumpUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    pump = update_pump(db, pump_id, data)
    if not pump:
        raise HTTPException(status_code=404, detail="Pump not found")
    return pump_to_dict(pump)


@router.delete("/{pump_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_pump(
    pump_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    if not delete_pump(db, pump_id):
        raise HTTPException(status_code=404, detail="Pump not found")


@router.get("/{pump_id}/queue-history")
def queue_history(pump_id: UUID, limit: int = Query(24, ge=1, le=168), db: Session = Depends(get_db)):
    history = get_pump_queue_history(db, pump_id, limit=limit)
    return {
        "pump_id": str(pump_id),
        "history": [
            {
                "id": str(h.id),
                "timestamp": h.timestamp.isoformat(),
                "vehicle_count": h.vehicle_count,
                "crowd_level": h.crowd_level,
                "wait_time_minutes": h.wait_time_minutes,
            }
            for h in history
        ],
    }


@router.get("/{pump_id}/reviews")
def get_reviews(pump_id: UUID, limit: int = Query(20, ge=1, le=100), db: Session = Depends(get_db)):
    reviews = (
        db.query(Review)
        .filter(Review.pump_id == pump_id)
        .order_by(Review.created_at.desc())
        .limit(limit)
        .all()
    )
    return {
        "pump_id": str(pump_id),
        "reviews": [
            {
                "id": str(r.id),
                "rating": r.rating,
                "text": r.text,
                "created_at": r.created_at.isoformat(),
            }
            for r in reviews
        ],
    }


@router.post("/{pump_id}/reviews", status_code=status.HTTP_201_CREATED)
def create_review(
    pump_id: UUID,
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    pump = get_pump_by_id(db, pump_id)
    if not pump:
        raise HTTPException(status_code=404, detail="Pump not found")
    review = Review(
        pump_id=pump_id,
        user_id=current_user.id,
        rating=payload.rating,
        text=payload.text,
    )
    # Fetch existing reviews before adding the new one to avoid double-counting
    all_reviews = db.query(Review).filter(Review.pump_id == pump_id).all()
    total = sum(r.rating for r in all_reviews) + payload.rating
    count = len(all_reviews) + 1
    db.add(review)
    pump.avg_rating = round(total / count, 2)
    pump.review_count = count
    db.commit()
    db.refresh(review)
    return {"id": str(review.id), "rating": review.rating, "text": review.text}
