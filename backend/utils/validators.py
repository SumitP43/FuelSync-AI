"""Input validation utilities."""
import re
from typing import Optional


def validate_email(email: str) -> bool:
    """Validate email format."""
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def validate_phone(phone: str) -> bool:
    """Validate Indian phone number format."""
    pattern = r"^(\+91|91)?[6-9]\d{9}$"
    return bool(re.match(pattern, phone.replace(" ", "").replace("-", "")))


def validate_coordinates(lat: float, lng: float) -> bool:
    """Validate latitude/longitude for India."""
    return 6.0 <= lat <= 38.0 and 68.0 <= lng <= 98.0


def validate_rating(rating: int) -> bool:
    """Validate review rating 1-5."""
    return 1 <= rating <= 5


def validate_crowd_level(level: int) -> bool:
    """Validate crowd level 0-100."""
    return 0 <= level <= 100


def sanitize_string(value: str, max_length: int = 255) -> str:
    """Sanitize a string input."""
    return value.strip()[:max_length]
