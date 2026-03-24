"""Traffic analysis service (uses ML model internally)."""
from ml_models.traffic_analyzer import TrafficAnalyzer

_analyzer = TrafficAnalyzer()


def get_traffic_factor(lat: float, lng: float) -> float:
    """Return a traffic congestion factor 0.0 (clear) to 1.0 (jammed)."""
    return _analyzer.analyze_traffic(lat, lng)


def get_route_time(origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float) -> float:
    """Return estimated travel time in minutes."""
    return _analyzer.get_route_time(origin_lat, origin_lng, dest_lat, dest_lng)


def is_peak_hour(hour: int) -> bool:
    return _analyzer.check_peak_hour(hour)
