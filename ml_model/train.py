"""
FuelSync-AI - Wait Time Prediction Model Training Script
Trains a Linear Regression model on historical CNG pump data
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Paths
DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'training_data.csv')
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'wait_time_model.pkl')
SCALER_PATH = os.path.join(MODEL_DIR, 'scaler.pkl')
METADATA_PATH = os.path.join(MODEL_DIR, 'model_metadata.json')


def load_data(path: str) -> pd.DataFrame:
    """Load training data from CSV"""
    if not os.path.exists(path):
        raise FileNotFoundError(f"Training data not found at: {path}")
    df = pd.read_csv(path)
    print(f"Loaded {len(df)} records from {path}")
    return df


def prepare_features(df: pd.DataFrame):
    """Prepare feature matrix and target vector"""
    feature_cols = ['hour', 'day_of_week', 'historical_avg_wait', 'crowd_level']
    target_col = 'wait_time'

    # Validate columns
    for col in feature_cols + [target_col]:
        if col not in df.columns:
            raise ValueError(f"Column '{col}' not found in training data")

    X = df[feature_cols].values
    y = df[target_col].values
    return X, y, feature_cols


def train_model(X_train, y_train):
    """Train Linear Regression model with feature scaling"""
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)

    model = LinearRegression()
    model.fit(X_train_scaled, y_train)
    return model, scaler


def evaluate_model(model, scaler, X_test, y_test):
    """Evaluate model performance"""
    X_test_scaled = scaler.transform(X_test)
    y_pred = model.predict(X_test_scaled)

    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print(f"\n=== Model Evaluation ===")
    print(f"MAE  (Mean Absolute Error): {mae:.2f} minutes")
    print(f"RMSE (Root Mean Sq Error) : {rmse:.2f} minutes")
    print(f"R²   (R-squared Score)    : {r2:.4f}")
    return {'mae': mae, 'rmse': rmse, 'r2': r2}


def save_model(model, scaler, feature_cols, metrics):
    """Save trained model, scaler, and metadata"""
    import json
    from datetime import datetime

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    metadata = {
        'trained_at': datetime.utcnow().isoformat(),
        'feature_columns': feature_cols,
        'model_type': 'LinearRegression',
        'metrics': {k: round(v, 4) for k, v in metrics.items()},
        'version': '1.0.0'
    }
    with open(METADATA_PATH, 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"\n=== Model Saved ===")
    print(f"Model  : {MODEL_PATH}")
    print(f"Scaler : {SCALER_PATH}")
    print(f"Meta   : {METADATA_PATH}")


def generate_synthetic_data(n_samples: int = 2000) -> pd.DataFrame:
    """Generate synthetic training data if CSV is not available"""
    np.random.seed(42)
    hours = np.random.randint(0, 24, n_samples)
    days = np.random.randint(0, 7, n_samples)
    pump_ids = np.random.randint(1, 4, n_samples)
    historical_avg = np.random.uniform(5, 35, n_samples)
    crowd_levels = np.random.randint(1, 6, n_samples)

    # Simulate realistic wait times
    base_wait = historical_avg * 0.8
    hour_factor = np.where((hours >= 6) & (hours <= 9), 1.8,
                  np.where((hours >= 17) & (hours <= 19), 2.0,
                  np.where((hours >= 12) & (hours <= 13), 1.4, 1.0)))
    day_factor = np.where(days <= 4, 1.2, 0.9)  # weekdays busier
    crowd_factor = crowd_levels / 3.0
    noise = np.random.normal(0, 2, n_samples)

    wait_times = base_wait * hour_factor * day_factor * crowd_factor + noise
    wait_times = np.clip(wait_times, 1, 90)

    return pd.DataFrame({
        'hour': hours,
        'day_of_week': days,
        'pump_id': pump_ids,
        'historical_avg_wait': historical_avg,
        'crowd_level': crowd_levels,
        'wait_time': wait_times
    })


def main():
    print("=== FuelSync-AI Wait Time Model Training ===\n")

    # Load or generate data
    try:
        df = load_data(DATA_PATH)
        if len(df) < 50:
            print("Insufficient data in CSV, augmenting with synthetic data...")
            synthetic_df = generate_synthetic_data(500)
            df = pd.concat([df, synthetic_df], ignore_index=True)
    except FileNotFoundError:
        print("CSV not found, generating synthetic training data...")
        df = generate_synthetic_data(1000)

    # Prepare features
    X, y, feature_cols = prepare_features(df)
    print(f"\nFeatures : {feature_cols}")
    print(f"Samples  : {len(X)}")

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"Train    : {len(X_train)} | Test: {len(X_test)}")

    # Train
    print("\nTraining Linear Regression model...")
    model, scaler = train_model(X_train, y_train)

    # Evaluate
    metrics = evaluate_model(model, scaler, X_test, y_test)

    # Save
    save_model(model, scaler, feature_cols, metrics)
    print("\n✅ Training complete!")


if __name__ == '__main__':
    main()
