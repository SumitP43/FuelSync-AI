"""Congestion prediction model using historical patterns."""
import math
from typing import List, Dict, Tuple

PUMP_VARIATION_RANGE = 20
PUMP_VARIATION_OFFSET = 10


class CongestionPredictor:
    """Predicts CNG pump congestion levels based on time patterns."""

    # Baseline hourly congestion pattern (0=midnight ... 23=11pm)
    HOURLY_BASE = [
        5, 3, 2, 2, 3, 10, 25, 55, 70, 65, 55, 50,
        60, 55, 45, 40, 55, 75, 80, 70, 55, 40, 25, 10,
    ]

    # Day-of-week multipliers (0=Monday ... 6=Sunday)
    DAY_MULTIPLIERS = [1.0, 0.95, 0.95, 1.0, 1.05, 1.15, 0.85]

    def predict_congestion(self, pump_id: str, hour: int, day_of_week: int) -> int:
        """Predict congestion level 0-100 for a pump at a given hour and day."""
        base = self.HOURLY_BASE[hour % 24]
        multiplier = self.DAY_MULTIPLIERS[day_of_week % 7]
        # Add a pump-specific variation based on pump_id hash
        pump_variation = (hash(str(pump_id)) % PUMP_VARIATION_RANGE) - PUMP_VARIATION_OFFSET
        congestion = int(base * multiplier) + pump_variation
        return max(0, min(100, congestion))

    def get_hourly_pattern(self, pump_id: str) -> List[Dict]:
        """Return 24-hour congestion pattern for a pump (using weekday average)."""
        avg_multiplier = sum(self.DAY_MULTIPLIERS) / len(self.DAY_MULTIPLIERS)
        pump_variation = (hash(str(pump_id)) % PUMP_VARIATION_RANGE) - PUMP_VARIATION_OFFSET
        return [
            {
                "hour": h,
                "congestion": max(0, min(100, int(self.HOURLY_BASE[h] * avg_multiplier) + pump_variation)),
                "label": f"{h:02d}:00",
            }
            for h in range(24)
        ]

    def analyze_peak_hours(self) -> Dict:
        """Return peak hour ranges based on the base pattern."""
        threshold = 60
        peak_hours = [h for h, c in enumerate(self.HOURLY_BASE) if c >= threshold]
        morning_peak = [h for h in peak_hours if 6 <= h <= 11]
        evening_peak = [h for h in peak_hours if 16 <= h <= 21]
        return {
            "morning_peak": {
                "start": min(morning_peak) if morning_peak else 7,
                "end": max(morning_peak) if morning_peak else 10,
            },
            "evening_peak": {
                "start": min(evening_peak) if evening_peak else 17,
                "end": max(evening_peak) if evening_peak else 20,
            },
            "peak_hours": peak_hours,
            "off_peak_hours": [h for h in range(24) if h not in peak_hours],
        }
