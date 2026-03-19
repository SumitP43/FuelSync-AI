"""
FuelSync-AI - ML Prediction Flask API
Serves the trained wait-time prediction model over HTTP
"""

import os
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

from predict import predict_wait_time, predict_batch, predict_24h, get_model_info
from train import main as train_model_main

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    info = get_model_info()
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat(),
        'model': info
    })


# ---------------------------------------------------------------------------
# Single Prediction
# ---------------------------------------------------------------------------

@app.route('/predict', methods=['POST'])
def predict():
    """
    POST /predict
    Body: {
        "hour": 8,
        "day_of_week": 1,
        "historical_avg_wait": 20.5,
        "crowd_level": 3
    }
    """
    data = request.get_json(force=True)
    if not data:
        return jsonify({'error': 'Request body must be JSON'}), 400

    required = ['hour', 'day_of_week', 'historical_avg_wait', 'crowd_level']
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({'error': f"Missing fields: {missing}"}), 400

    try:
        result = predict_wait_time(
            hour=data['hour'],
            day_of_week=data['day_of_week'],
            historical_avg_wait=data['historical_avg_wait'],
            crowd_level=data['crowd_level']
        )
        return jsonify({'success': True, 'prediction': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ---------------------------------------------------------------------------
# Batch Prediction
# ---------------------------------------------------------------------------

@app.route('/predict/batch', methods=['POST'])
def predict_batch_endpoint():
    """
    POST /predict/batch
    Body: { "records": [ {hour, day_of_week, historical_avg_wait, crowd_level}, ... ] }
    """
    data = request.get_json(force=True)
    if not data or 'records' not in data:
        return jsonify({'error': 'Body must contain "records" array'}), 400

    records = data['records']
    if not isinstance(records, list) or len(records) == 0:
        return jsonify({'error': '"records" must be a non-empty array'}), 400

    if len(records) > 100:
        return jsonify({'error': 'Maximum 100 records per batch'}), 400

    try:
        results = predict_batch(records)
        return jsonify({'success': True, 'predictions': results, 'count': len(results)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ---------------------------------------------------------------------------
# 24-Hour Graph Data
# ---------------------------------------------------------------------------

@app.route('/predict/graph/<pump_id>', methods=['GET'])
def predict_graph(pump_id: str):
    """
    GET /predict/graph/<pump_id>?avg_wait=20&day_of_week=1
    Returns 24-hour prediction data for the prediction graph
    """
    try:
        avg_wait = float(request.args.get('avg_wait', 20.0))
        day_of_week = request.args.get('day_of_week')
        if day_of_week is not None:
            day_of_week = int(day_of_week)

        graph_data = predict_24h(pump_id, avg_wait, day_of_week)
        return jsonify({
            'success': True,
            'pump_id': pump_id,
            'graph_data': graph_data,
            'generated_at': datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ---------------------------------------------------------------------------
# Re-train Model
# ---------------------------------------------------------------------------

@app.route('/train', methods=['POST'])
def train():
    """
    POST /train
    Re-trains the model. Protected by a simple API key in production.
    """
    api_key = request.headers.get('X-API-Key', '')
    expected_key = os.environ.get('TRAIN_API_KEY', 'fuelsync-train-key')
    if api_key != expected_key:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        train_model_main()
        info = get_model_info()
        return jsonify({
            'success': True,
            'message': 'Model retrained successfully',
            'model': info
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ---------------------------------------------------------------------------
# Model Info
# ---------------------------------------------------------------------------

@app.route('/model/info', methods=['GET'])
def model_info():
    """GET /model/info - Returns model metadata"""
    info = get_model_info()
    return jsonify(info)


# ---------------------------------------------------------------------------
# Error Handlers
# ---------------------------------------------------------------------------

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({'error': 'Method not allowed'}), 405


@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    port = int(os.environ.get('ML_PORT', 5001))
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    print(f"🤖 FuelSync-AI ML Service starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
