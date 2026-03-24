"""Queue and wait-time prediction model."""
from typing import List


class QueuePredictor:
    """Predicts queue length and wait times at CNG pumps."""

    # Average service time per vehicle in minutes at various hours
    SERVICE_RATE_BY_HOUR = [
        3.0, 3.0, 3.0, 3.0, 3.5, 4.0, 5.0, 6.5, 7.0, 6.5, 6.0, 5.5,
        6.0, 5.5, 5.0, 5.0, 5.5, 7.0, 7.5, 7.0, 6.0, 5.0, 4.0, 3.5,
    ]

    def predict_wait_time(self, vehicle_count: int, crowd_level: int, hour: int) -> float:
        """Predict wait time in minutes given current vehicle count, crowd level, and hour."""
        service_time = self.get_service_rate(hour)  # minutes per vehicle
        # Estimate number of vehicles ahead (weighted average of count and crowd-level estimate)
        effective_vehicles = max(vehicle_count, crowd_level // 5)
        # Simple M/D/1 queue approximation
        utilization = min(0.95, crowd_level / 100.0)
        if utilization >= 0.95:
            return effective_vehicles * service_time * 2
        wait = (service_time * utilization) / (2 * (1 - utilization)) + service_time
        return round(max(1.0, min(wait * (effective_vehicles / max(effective_vehicles, 1)), 90.0)), 1)

    def estimate_queue_length(self, crowd_level: int, max_capacity: int) -> int:
        """Estimate number of vehicles in queue from crowd level and capacity."""
        return max(0, int(crowd_level / 100 * max_capacity))

    def get_service_rate(self, hour: int) -> float:
        """Return the average minutes per vehicle at the given hour."""
        return self.SERVICE_RATE_BY_HOUR[hour % 24]

    def get_hourly_wait_times(self, max_capacity: int = 50) -> List[dict]:
        """Return estimated wait times for each hour of the day."""
        results = []
        for hour in range(24):
            crowd = 50  # use median crowd for illustration
            vehicles = self.estimate_queue_length(crowd, max_capacity)
            wait = self.predict_wait_time(vehicles, crowd, hour)
            results.append({"hour": hour, "estimated_wait_minutes": wait, "label": f"{hour:02d}:00"})
        return results
