"""
FuelSync-AI - Prediction Logic Module
Handles loading the trained model and generating predictions
"""

import os
import json
import joblib
import numpy as np

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'wait_time_model.pkl')
SCALER_PATH = os.path.join(MODEL_DIR, 'scaler.pkl')
METADATA_PATH = os.path.join(MODEL_DIR, 'model_metadata.json')

_model = None
_scaler = None
_metadata = None


def _load_artifacts():
    """Load model artifacts (lazy loading with caching)"""
    global _model, _scaler, _metadata

    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                "Model not found. Run 'python train.py' first."
            )
        _model = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)

        if os.path.exists(METADATA_PATH):
            with open(METADATA_PATH) as f:
                _metadata = json.load(f)
        else:
            _metadata = {}

    return _model, _scaler, _metadata


def predict_wait_time(
    hour: int,
    day_of_week: int,
    historical_avg_wait: float,
    crowd_level: int
) -> dict:
    """
    Predict wait time for a CNG pump.

    Args:
        hour: Hour of day (0-23)
        day_of_week: Day of week (0=Monday, 6=Sunday)
        historical_avg_wait: Historical average wait time in minutes
        crowd_level: Current crowd level (1-5)

    Returns:
        dict with predicted_wait, confidence, crowd_status
    """
    model, scaler, metadata = _load_artifacts()

    # Validate inputs
    hour = max(0, min(23, int(hour)))
    day_of_week = max(0, min(6, int(day_of_week)))
    historical_avg_wait = max(1.0, float(historical_avg_wait))
    crowd_level = max(1, min(5, int(crowd_level)))

    features = np.array([[hour, day_of_week, historical_avg_wait, crowd_level]])
    features_scaled = scaler.transform(features)
    raw_prediction = float(model.predict(features_scaled)[0])

    # Ensure non-negative prediction
    predicted_wait = max(1.0, round(raw_prediction, 1))

    # Compute confidence based on model R² and input ranges
    base_confidence = 0.85
    r2 = metadata.get('metrics', {}).get('r2', 0.8)
    confidence = round(min(0.98, max(0.50, base_confidence * r2 + 0.1)), 2)

    # Crowd status
    crowd_status = _crowd_status(crowd_level, predicted_wait)

    return {
        'predicted_wait': predicted_wait,
        'confidence': confidence,
        'crowd_status': crowd_status,
        'hour': hour,
        'day_of_week': day_of_week
    }


def predict_batch(records: list) -> list:
    """
    Batch prediction for multiple records.

    Args:
        records: list of dicts with keys: hour, day_of_week,
                 historical_avg_wait, crowd_level

    Returns:
        list of prediction dicts
    """
    return [predict_wait_time(**r) for r in records]


def predict_24h(pump_id: str, historical_avg_wait: float, day_of_week: int = None) -> list:
    """
    Generate 24-hour prediction graph data for a pump.

    Args:
        pump_id: Pump identifier (used for labeling)
        historical_avg_wait: Historical average wait time
        day_of_week: Day of week (default: use current day)

    Returns:
        list of hourly predictions
    """
    from datetime import datetime

    if day_of_week is None:
        day_of_week = datetime.now().weekday()

    results = []
    for hour in range(24):
        # Estimate crowd level from hour patterns
        if 6 <= hour <= 9 or 17 <= hour <= 19:
            crowd_level = 4
        elif 10 <= hour <= 16:
            crowd_level = 3
        elif 20 <= hour <= 22:
            crowd_level = 2
        else:
            crowd_level = 1

        pred = predict_wait_time(hour, day_of_week, historical_avg_wait, crowd_level)
        results.append({
            'hour': hour,
            'predicted_wait': pred['predicted_wait'],
            'confidence': pred['confidence'],
            'crowd_status': pred['crowd_status'],
            'label': f"{hour:02d}:00"
        })

    return results


def _crowd_status(crowd_level: int, wait_time: float) -> str:
    """Derive crowd status label from level and wait time"""
    if crowd_level <= 2 and wait_time < 15:
        return 'low'
    elif crowd_level <= 3 and wait_time < 30:
        return 'medium'
    else:
        return 'high'


def get_model_info() -> dict:
    """Return model metadata and health status"""
    try:
        _, _, metadata = _load_artifacts()
        return {
            'status': 'ready',
            'model_type': metadata.get('model_type', 'Unknown'),
            'version': metadata.get('version', '1.0.0'),
            'trained_at': metadata.get('trained_at'),
            'metrics': metadata.get('metrics', {}),
            'features': metadata.get('feature_columns', [])
        }
    except FileNotFoundError as e:
        return {'status': 'not_trained', 'error': str(e)}
