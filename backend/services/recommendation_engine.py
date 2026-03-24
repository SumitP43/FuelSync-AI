"""Smart CNG pump recommendation engine."""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.models.pump import CngPump, PumpStatus
from backend.utils.helpers import haversine_distance
from ml_models.queue_predictor import QueuePredictor
from ml_models.congestion_predictor import CongestionPredictor

_queue_predictor = QueuePredictor()
_congestion_predictor = CongestionPredictor()


def _crowd_score(crowd_level: int) -> float:
    """Score 0-40: lower crowd = higher score."""
    return max(0.0, 40.0 * (1 - crowd_level / 100))


def _wait_time_score(vehicle_count: int, crowd_level: int, hour: int) -> float:
    """Score 0-25: shorter wait = higher score."""
    wait_min = _queue_predictor.predict_wait_time(vehicle_count, crowd_level, hour)
    max_wait = 60.0
    return max(0.0, 25.0 * (1 - min(wait_min, max_wait) / max_wait))


def _distance_score(distance_km: float) -> float:
    """Score 0-15: closer = higher score (cap at 20 km)."""
    max_dist = 20.0
    return max(0.0, 15.0 * (1 - min(distance_km, max_dist) / max_dist))


def _rating_score(avg_rating: float) -> float:
    """Score 0-12: based on 1-5 star rating."""
    return max(0.0, 12.0 * (avg_rating - 1) / 4) if avg_rating >= 1 else 0.0


def _facilities_score(facilities: dict) -> float:
    """Score 0-8: based on number of available facilities."""
    if not facilities:
        return 0.0
    count = sum(1 for v in facilities.values() if v)
    total = max(len(facilities), 1)
    return 8.0 * count / total


def score_pump(pump: CngPump, distance_km: float, hour: int) -> float:
    """Calculate the total recommendation score (0-100) for a pump."""
    return (
        _crowd_score(pump.current_crowd_level)
        + _wait_time_score(pump.current_vehicles, pump.current_crowd_level, hour)
        + _distance_score(distance_km)
        + _rating_score(pump.avg_rating)
        + _facilities_score(pump.facilities or {})
    )


def get_recommendations(
    db: Session,
    lat: float,
    lng: float,
    hour: int,
    radius_km: float = 10.0,
    limit: int = 5,
    preferences: Optional[Dict[str, Any]] = None,
) -> List[dict]:
    """Return ranked pump recommendations for a given user location."""
    pumps = db.query(CngPump).filter(CngPump.status == PumpStatus.OPEN).all()
    scored = []
    for pump in pumps:
        dist = haversine_distance(lat, lng, pump.latitude, pump.longitude)
        if dist > radius_km:
            continue
        total_score = score_pump(pump, dist, hour)
        wait_min = _queue_predictor.predict_wait_time(
            pump.current_vehicles, pump.current_crowd_level, hour
        )
        scored.append(
            {
                "pump": pump,
                "score": round(total_score, 2),
                "distance_km": round(dist, 2),
                "estimated_wait_minutes": round(wait_min, 1),
                "crowd_level": pump.current_crowd_level,
            }
        )
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:limit]


def get_best_pick(db: Session, lat: float, lng: float, hour: int) -> Optional[dict]:
    """Return the single best pump right now."""
    results = get_recommendations(db, lat, lng, hour, radius_km=15.0, limit=1)
    return results[0] if results else None


def get_trending_pumps(db: Session, limit: int = 5) -> List[CngPump]:
    """Return pumps with high ratings and low crowd."""
    return (
        db.query(CngPump)
        .filter(CngPump.status == PumpStatus.OPEN, CngPump.avg_rating >= 4.0)
        .order_by(CngPump.current_crowd_level.asc(), CngPump.avg_rating.desc())
        .limit(limit)
        .all()
    )
