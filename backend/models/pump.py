"""CNG Pump database models."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Float, Integer, JSON, Enum as SAEnum, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from backend.database.db import Base


class PumpStatus(str, enum.Enum):
    OPEN = "open"
    CLOSED = "closed"
    MAINTENANCE = "maintenance"


class PriceTrend(str, enum.Enum):
    UP = "up"
    DOWN = "down"
    STABLE = "stable"


class CngPump(Base):
    __tablename__ = "cng_pumps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    area = Column(String(255), nullable=False, index=True)
    city = Column(String(100), nullable=False, index=True)
    address = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    operating_hours = Column(JSON, default={"open": "06:00", "close": "22:00"})
    is_24x7 = Column(Boolean, default=False)
    facilities = Column(JSON, default={"air": False, "water": False, "restroom": False, "shop": False, "ev_charger": False})
    current_crowd_level = Column(Integer, default=0)  # 0-100
    max_capacity = Column(Integer, default=50)
    current_vehicles = Column(Integer, default=0)
    status = Column(SAEnum(PumpStatus), default=PumpStatus.OPEN)
    avg_rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    prices = relationship("PumpPrice", back_populates="pump", cascade="all, delete-orphan")
    queue_history = relationship("QueueHistory", back_populates="pump", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="pump", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="pump", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<CngPump {self.name} - {self.city}>"


class PumpPrice(Base):
    __tablename__ = "pump_prices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pump_id = Column(UUID(as_uuid=True), ForeignKey("cng_pumps.id"), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    price_per_kg = Column(Float, nullable=False)
    date = Column(Date, default=datetime.utcnow().date)
    trend = Column(SAEnum(PriceTrend), default=PriceTrend.STABLE)
    created_at = Column(DateTime, default=datetime.utcnow)

    pump = relationship("CngPump", back_populates="prices")

    def __repr__(self):
        return f"<PumpPrice {self.city} - ₹{self.price_per_kg}/kg>"


class QueueHistory(Base):
    __tablename__ = "queue_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pump_id = Column(UUID(as_uuid=True), ForeignKey("cng_pumps.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    vehicle_count = Column(Integer, default=0)
    crowd_level = Column(Integer, default=0)  # 0-100
    wait_time_minutes = Column(Float, default=0.0)

    pump = relationship("CngPump", back_populates="queue_history")

    def __repr__(self):
        return f"<QueueHistory pump={self.pump_id} count={self.vehicle_count}>"
