"""Alert routes."""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.models.alert import Alert, AlertThreshold
from backend.models.user import User
from backend.auth.decorators import get_current_active_user
from backend.services.notification_service import get_user_triggered_alerts

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


class AlertCreate(BaseModel):
    pump_id: str
    threshold: AlertThreshold = AlertThreshold.LOW


class AlertUpdate(BaseModel):
    threshold: Optional[AlertThreshold] = None
    is_active: Optional[bool] = None


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_alert(
    payload: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    alert = Alert(
        user_id=current_user.id,
        pump_id=payload.pump_id,
        threshold=payload.threshold,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return {
        "id": str(alert.id),
        "pump_id": str(alert.pump_id),
        "threshold": alert.threshold,
        "is_active": alert.is_active,
        "created_at": alert.created_at.isoformat(),
    }


@router.get("/")
def list_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    alerts = db.query(Alert).filter(Alert.user_id == current_user.id).all()
    return {
        "alerts": [
            {
                "id": str(a.id),
                "pump_id": str(a.pump_id),
                "threshold": a.threshold,
                "is_active": a.is_active,
                "created_at": a.created_at.isoformat(),
                "last_triggered": a.last_triggered.isoformat() if a.last_triggered else None,
            }
            for a in alerts
        ]
    }


@router.put("/{alert_id}")
def update_alert(
    alert_id: UUID,
    payload: AlertUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    if payload.threshold is not None:
        alert.threshold = payload.threshold
    if payload.is_active is not None:
        alert.is_active = payload.is_active
    db.commit()
    return {"id": str(alert.id), "threshold": alert.threshold, "is_active": alert.is_active}


@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alert(
    alert_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(alert)
    db.commit()


@router.get("/notifications")
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return {"notifications": get_user_triggered_alerts(db, str(current_user.id))}
