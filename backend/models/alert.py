"""Alert database model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from backend.database.db import Base


class AlertThreshold(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    pump_id = Column(UUID(as_uuid=True), ForeignKey("cng_pumps.id"), nullable=False)
    threshold = Column(SAEnum(AlertThreshold), default=AlertThreshold.LOW)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_triggered = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="alerts")
    pump = relationship("CngPump", back_populates="alerts")

    def __repr__(self):
        return f"<Alert user={self.user_id} pump={self.pump_id} threshold={self.threshold}>"
