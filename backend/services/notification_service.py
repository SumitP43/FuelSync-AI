"""Notification and alert triggering service."""
from typing import List
from datetime import datetime
from sqlalchemy.orm import Session
from backend.models.alert import Alert, AlertThreshold
from backend.models.pump import CngPump


THRESHOLD_CROWD_MAP = {
    AlertThreshold.LOW: 30,
    AlertThreshold.MEDIUM: 60,
    AlertThreshold.HIGH: 80,
}


def check_and_trigger_alerts(db: Session, pump: CngPump) -> List[Alert]:
    """Check all active alerts for a pump and trigger those that meet threshold."""
    triggered = []
    alerts = db.query(Alert).filter(Alert.pump_id == pump.id, Alert.is_active == True).all()
    for alert in alerts:
        threshold_value = THRESHOLD_CROWD_MAP.get(alert.threshold, 30)
        if pump.current_crowd_level <= threshold_value:
            alert.last_triggered = datetime.utcnow()
            triggered.append(alert)
    if triggered:
        db.commit()
    return triggered


def get_user_triggered_alerts(db: Session, user_id: str) -> List[dict]:
    """Get recently triggered alerts for a user."""
    alerts = (
        db.query(Alert)
        .filter(Alert.user_id == user_id, Alert.is_active == True, Alert.last_triggered != None)
        .order_by(Alert.last_triggered.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": str(a.id),
            "pump_id": str(a.pump_id),
            "threshold": a.threshold,
            "last_triggered": a.last_triggered.isoformat() if a.last_triggered else None,
        }
        for a in alerts
    ]
