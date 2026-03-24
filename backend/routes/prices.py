"""Price routes."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.services.price_service import (
    get_today_prices, get_city_price, get_price_history, get_fuel_comparison,
)

router = APIRouter(prefix="/api/prices", tags=["prices"])


@router.get("/today")
def today_prices(db: Session = Depends(get_db)):
    return {"prices": get_today_prices(db)}


@router.get("/city/{city}")
def city_price(city: str, db: Session = Depends(get_db)):
    data = get_city_price(db, city)
    if not data:
        return {"city": city, "message": "No price data available for today"}
    return data


@router.get("/history/{city}")
def price_history(city: str, days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db)):
    return {"city": city, "history": get_price_history(db, city, days=days)}


@router.get("/comparison")
def fuel_comparison(city: str = Query("Mumbai")):
    return get_fuel_comparison(city)
