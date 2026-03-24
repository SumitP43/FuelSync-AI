"""Helper utility functions."""
import math
from typing import List, Tuple, Optional
from datetime import datetime


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate the great-circle distance in km between two GPS points."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def crowd_level_label(level: int) -> str:
    """Return human-readable crowd label for a 0-100 level."""
    if level < 30:
        return "Low"
    elif level < 60:
        return "Medium"
    elif level < 80:
        return "High"
    return "Very High"


def paginate(query, page: int = 1, page_size: int = 20):
    """Apply SQLAlchemy pagination to a query."""
    offset = (page - 1) * page_size
    return query.offset(offset).limit(page_size)


def format_operating_hours(hours: dict) -> str:
    """Format operating hours dict to human-readable string."""
    if not hours:
        return "Hours not available"
    return f"{hours.get('open', 'N/A')} - {hours.get('close', 'N/A')}"


def current_hour() -> int:
    """Return the current hour (0-23)."""
    return datetime.utcnow().hour


def day_of_week() -> int:
    """Return the current day of week (0=Monday, 6=Sunday)."""
    return datetime.utcnow().weekday()
