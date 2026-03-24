"""Demand forecasting model for CNG pumps."""
from typing import List, Dict


class DemandForecaster:
    """Forecasts future demand at CNG pumps."""

    # Weekly demand multipliers (0=Monday ... 6=Sunday)
    WEEKLY_PATTERN = {0: 1.0, 1: 0.95, 2: 0.95, 3: 1.0, 4: 1.05, 5: 1.20, 6: 0.85}

    # Seasonal multipliers by month
    SEASONAL_FACTORS = {
        1: 0.95, 2: 0.95, 3: 1.0, 4: 1.05, 5: 1.05, 6: 0.90,
        7: 0.90, 8: 0.90, 9: 1.0, 10: 1.05, 11: 1.05, 12: 1.0,
    }

    # Hourly demand shape (0-23)
    HOURLY_SHAPE = [
        0.05, 0.03, 0.02, 0.02, 0.03, 0.08, 0.20, 0.55, 0.70, 0.65,
        0.55, 0.50, 0.60, 0.55, 0.45, 0.40, 0.55, 0.75, 0.80, 0.70,
        0.55, 0.40, 0.25, 0.10,
    ]

    def forecast_demand(self, pump_id: str, hours_ahead: int = 24) -> List[Dict]:
        """
        Forecast demand for the next N hours.
        Returns list of {hour_offset, predicted_demand 0-100, label}.
        """
        from datetime import datetime, timedelta
        now = datetime.utcnow()
        pump_base = 50 + (hash(str(pump_id)) % 20) - 10  # pump-specific base demand
        forecasts = []
        for i in range(hours_ahead):
            future = now + timedelta(hours=i)
            hour = future.hour
            dow = future.weekday()
            month = future.month
            demand = (
                pump_base
                * self.HOURLY_SHAPE[hour]
                * self.WEEKLY_PATTERN.get(dow, 1.0)
                * self.SEASONAL_FACTORS.get(month, 1.0)
            )
            forecasts.append(
                {
                    "hour_offset": i,
                    "datetime": future.strftime("%Y-%m-%d %H:00"),
                    "predicted_demand": round(min(100, max(0, demand)), 1),
                    "label": f"+{i}h",
                }
            )
        return forecasts

    def get_weekly_pattern(self) -> Dict:
        """Return demand multiplier for each day of the week."""
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        return {days[k]: v for k, v in self.WEEKLY_PATTERN.items()}

    def get_seasonal_factor(self, month: int) -> float:
        """Return the seasonal demand multiplier for a given month (1-12)."""
        return self.SEASONAL_FACTORS.get(month, 1.0)
