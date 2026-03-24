"""Recommendation routes."""
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.auth.decorators import get_current_active_user
from backend.models.user import User
from backend.services.recommendation_engine import get_recommendations, get_best_pick, get_trending_pumps
from backend.utils.helpers import current_hour

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


class RecommendationRequest(BaseModel):
    lat: float
    lng: float
    radius_km: float = 10.0
    preferences: Optional[Dict[str, Any]] = None


def _pump_summary(entry: dict) -> dict:
    p = entry["pump"]
    return {
        "id": str(p.id),
        "name": p.name,
        "area": p.area,
        "city": p.city,
        "address": p.address,
        "latitude": p.latitude,
        "longitude": p.longitude,
        "status": p.status.value if p.status else "open",
        "current_crowd_level": p.current_crowd_level,
        "avg_rating": p.avg_rating,
        "facilities": p.facilities,
        "score": entry.get("score"),
        "distance_km": entry.get("distance_km"),
        "estimated_wait_minutes": entry.get("estimated_wait_minutes"),
    }


@router.post("/")
def recommend(
    payload: RecommendationRequest,
    db: Session = Depends(get_db),
):
    hour = current_hour()
    results = get_recommendations(
        db, payload.lat, payload.lng, hour,
        radius_km=payload.radius_km,
        preferences=payload.preferences,
    )
    return {"recommendations": [_pump_summary(r) for r in results]}


@router.get("/best-pick")
def best_pick(
    lat: float = Query(...),
    lng: float = Query(...),
    db: Session = Depends(get_db),
):
    hour = current_hour()
    result = get_best_pick(db, lat, lng, hour)
    if not result:
        return {"best_pick": None, "message": "No open pumps found nearby"}
    return {"best_pick": _pump_summary(result)}


@router.get("/trending")
def trending(limit: int = Query(5, ge=1, le=20), db: Session = Depends(get_db)):
    pumps = get_trending_pumps(db, limit=limit)
    return {
        "trending": [
            {
                "id": str(p.id),
                "name": p.name,
                "area": p.area,
                "city": p.city,
                "current_crowd_level": p.current_crowd_level,
                "avg_rating": p.avg_rating,
                "status": p.status.value if p.status else "open",
            }
            for p in pumps
        ]
    }
