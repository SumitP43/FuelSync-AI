"""CNG price service."""
from typing import List, Optional, Dict
from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.models.pump import PumpPrice, PriceTrend


def get_today_prices(db: Session) -> List[dict]:
    """Get today's average price per city."""
    today = date.today()
    results = (
        db.query(
            PumpPrice.city,
            func.avg(PumpPrice.price_per_kg).label("avg_price"),
            func.min(PumpPrice.price_per_kg).label("min_price"),
            func.max(PumpPrice.price_per_kg).label("max_price"),
        )
        .filter(PumpPrice.date == today)
        .group_by(PumpPrice.city)
        .all()
    )
    return [
        {
            "city": r.city,
            "avg_price": round(r.avg_price, 2),
            "min_price": round(r.min_price, 2),
            "max_price": round(r.max_price, 2),
            "date": today.isoformat(),
        }
        for r in results
    ]


def get_city_price(db: Session, city: str) -> Optional[dict]:
    """Get today's price for a specific city."""
    today = date.today()
    result = (
        db.query(
            func.avg(PumpPrice.price_per_kg).label("avg_price"),
            func.min(PumpPrice.price_per_kg).label("min_price"),
            func.max(PumpPrice.price_per_kg).label("max_price"),
        )
        .filter(PumpPrice.city.ilike(city), PumpPrice.date == today)
        .first()
    )
    if not result or result.avg_price is None:
        return None
    return {
        "city": city,
        "avg_price": round(result.avg_price, 2),
        "min_price": round(result.min_price, 2),
        "max_price": round(result.max_price, 2),
        "date": today.isoformat(),
    }


def get_price_history(db: Session, city: str, days: int = 30) -> List[dict]:
    """Get price history for a city over the past N days."""
    start_date = date.today() - timedelta(days=days)
    results = (
        db.query(
            PumpPrice.date,
            func.avg(PumpPrice.price_per_kg).label("avg_price"),
            PumpPrice.trend,
        )
        .filter(PumpPrice.city.ilike(city), PumpPrice.date >= start_date)
        .group_by(PumpPrice.date, PumpPrice.trend)
        .order_by(PumpPrice.date)
        .all()
    )
    return [
        {"date": r.date.isoformat(), "avg_price": round(r.avg_price, 2), "trend": r.trend}
        for r in results
    ]


def get_fuel_comparison(city: str = "Mumbai") -> dict:
    """Return CNG vs Petrol vs Diesel price comparison (static reference data)."""
    # Reference prices (can be made dynamic from DB later)
    data = {
        "Mumbai": {"cng": 79.0, "petrol": 106.31, "diesel": 94.27},
        "Delhi": {"cng": 74.09, "petrol": 96.72, "diesel": 89.62},
        "Pune": {"cng": 83.5, "petrol": 104.95, "diesel": 92.53},
        "Ahmedabad": {"cng": 75.0, "petrol": 96.63, "diesel": 89.87},
    }
    prices = data.get(city, data["Mumbai"])
    return {
        "city": city,
        "cng_per_kg": prices["cng"],
        "petrol_per_litre": prices["petrol"],
        "diesel_per_litre": prices["diesel"],
        "cng_savings_vs_petrol": round(((prices["petrol"] - prices["cng"]) / prices["petrol"]) * 100, 1),
        "cng_savings_vs_diesel": round(((prices["diesel"] - prices["cng"]) / prices["diesel"]) * 100, 1),
    }
