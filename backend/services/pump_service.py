"""Pump business logic service."""
import math
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_
from backend.models.pump import CngPump, PumpStatus, QueueHistory
from backend.utils.helpers import haversine_distance


def get_pumps(
    db: Session,
    city: Optional[str] = None,
    area: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
) -> List[CngPump]:
    query = db.query(CngPump)
    if city:
        query = query.filter(CngPump.city.ilike(f"%{city}%"))
    if area:
        query = query.filter(CngPump.area.ilike(f"%{area}%"))
    if status:
        query = query.filter(CngPump.status == status)
    return query.offset(offset).limit(limit).all()


def get_pump_by_id(db: Session, pump_id: UUID) -> Optional[CngPump]:
    return db.query(CngPump).filter(CngPump.id == pump_id).first()


def create_pump(db: Session, pump_data: dict) -> CngPump:
    pump = CngPump(**pump_data)
    db.add(pump)
    db.commit()
    db.refresh(pump)
    return pump


def update_pump(db: Session, pump_id: UUID, pump_data: dict) -> Optional[CngPump]:
    pump = get_pump_by_id(db, pump_id)
    if not pump:
        return None
    for key, value in pump_data.items():
        setattr(pump, key, value)
    db.commit()
    db.refresh(pump)
    return pump


def delete_pump(db: Session, pump_id: UUID) -> bool:
    pump = get_pump_by_id(db, pump_id)
    if not pump:
        return False
    db.delete(pump)
    db.commit()
    return True


def get_nearby_pumps(
    db: Session,
    lat: float,
    lng: float,
    radius_km: float = 5.0,
    limit: int = 10,
) -> List[dict]:
    # Bounding box pre-filter (1 degree latitude ≈ 111 km)
    lat_delta = radius_km / 111.0
    lng_delta = radius_km / (111.0 * math.cos(math.radians(lat)))
    pumps = (
        db.query(CngPump)
        .filter(
            CngPump.status == PumpStatus.OPEN,
            CngPump.latitude.between(lat - lat_delta, lat + lat_delta),
            CngPump.longitude.between(lng - lng_delta, lng + lng_delta),
        )
        .all()
    )
    results = []
    for pump in pumps:
        dist = haversine_distance(lat, lng, pump.latitude, pump.longitude)
        if dist <= radius_km:
            results.append({"pump": pump, "distance_km": round(dist, 2)})
    results.sort(key=lambda x: x["distance_km"])
    return results[:limit]


def get_pump_queue_history(db: Session, pump_id: UUID, limit: int = 24) -> List[QueueHistory]:
    return (
        db.query(QueueHistory)
        .filter(QueueHistory.pump_id == pump_id)
        .order_by(QueueHistory.timestamp.desc())
        .limit(limit)
        .all()
    )
