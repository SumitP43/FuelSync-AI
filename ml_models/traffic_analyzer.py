"""Traffic analysis model."""
import math
from datetime import datetime


class TrafficAnalyzer:
    """Analyzes traffic conditions near CNG pumps."""

    # Peak hours where traffic is heavy
    MORNING_PEAK = range(7, 11)
    EVENING_PEAK = range(17, 21)

    def analyze_traffic(self, lat: float, lng: float) -> float:
        """
        Return a traffic factor between 0.0 (clear) and 1.0 (severely congested).
        Uses time-of-day heuristic since no live API is configured.
        """
        hour = datetime.utcnow().hour
        if hour in self.MORNING_PEAK or hour in self.EVENING_PEAK:
            base_factor = 0.75
        elif 11 <= hour < 17:
            base_factor = 0.45
        elif 21 <= hour or hour < 6:
            base_factor = 0.15
        else:
            base_factor = 0.30

        # Add a small geographic variation (deterministic, not random)
        geo_variation = (math.sin(lat * lng) % 0.2) - 0.1
        return round(max(0.0, min(1.0, base_factor + geo_variation)), 2)

    def get_route_time(
        self, origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float
    ) -> float:
        """
        Estimate travel time in minutes using straight-line distance and traffic factor.
        """
        R = 6371.0
        phi1, phi2 = math.radians(origin_lat), math.radians(dest_lat)
        dphi = math.radians(dest_lat - origin_lat)
        dlambda = math.radians(dest_lng - origin_lng)
        a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
        distance_km = R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        traffic_factor = self.analyze_traffic(origin_lat, origin_lng)
        # Base speed 30 km/h in city, reduced by traffic
        speed_kmh = 30 * (1 - traffic_factor * 0.5)
        travel_time = (distance_km / speed_kmh) * 60
        return round(max(1.0, travel_time), 1)

    def check_peak_hour(self, hour: int) -> bool:
        """Return True if the given hour is a peak traffic hour."""
        return hour in self.MORNING_PEAK or hour in self.EVENING_PEAK
