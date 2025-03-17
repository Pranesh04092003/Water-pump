from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import joblib
import numpy as np
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load models
vibration_model = joblib.load('models/vibration_model.joblib')
cooling_model = joblib.load('models/cooling_model.joblib')

# Load cooling features
with open('models/cooling_features.txt', 'r') as f:
    cooling_features = f.read().splitlines()

# Initialize history
vibration_history = []
cooling_history = []
status_counts = {'Normal': 0, 'Overheating': 0, 'Failure': 0}
cooling_counts = {'Efficient': 0, 'Inefficient': 0}

@app.route('/')
def dashboard():
    return render_template('dashboard.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    vibration = float(data['vibration'])
    
    # Simulate cooling cycle data
    peak_vibration = vibration * 1.1  # Simulated peak
    stable_vibration = vibration * 0.7  # Simulated stable state
    cooling_duration = np.random.uniform(15, 30)  # Minutes
    vibration_reduction = (peak_vibration - stable_vibration) / peak_vibration
    avg_vibration = (peak_vibration + stable_vibration) / 2
    
    # Make predictions
    vibration_pred = int(vibration_model.predict([[vibration]])[0])
    cooling_features_values = [[vibration, peak_vibration, stable_vibration,
                              cooling_duration, vibration_reduction, avg_vibration]]
    cooling_pred = bool(cooling_model.predict(cooling_features_values)[0])
    
    # Convert predictions to labels
    status_map = {0: 'Normal', 1: 'Overheating', 2: 'Failure'}
    status = status_map[vibration_pred]
    
    # Determine cooling efficiency based on reduction percentage
    cooling_status = 'Efficient'
    if vibration_reduction < 0.25:  # If reduction is less than 25%
        cooling_status = 'Inefficient'
    elif status == 'Overheating' and vibration_reduction < 0.3:  # Higher threshold for overheating
        cooling_status = 'Inefficient'
    elif status == 'Failure':  # Always inefficient in failure state
        cooling_status = 'Inefficient'
    
    # Update counts
    status_counts[status] += 1
    cooling_counts[cooling_status] += 1
    
    # Calculate health score (0-100)
    health_score = max(0, min(100, 100 - (vibration / 100)))
    
    # Update history
    timestamp = datetime.now().strftime('%H:%M:%S')
    vibration_history.append({'time': timestamp, 'value': vibration, 'status': status})
    cooling_history.append({
        'time': timestamp,
        'status': cooling_status,
        'duration': round(cooling_duration, 1),
        'reduction': round(vibration_reduction * 100, 1)
    })
    
    # Keep only last 10 records
    if len(vibration_history) > 10:
        vibration_history.pop(0)
    if len(cooling_history) > 10:
        cooling_history.pop(0)
    
    return jsonify({
        'status': status,
        'cooling_status': cooling_status,
        'vibration': vibration,
        'health_score': round(health_score, 1),
        'cooling_metrics': {
            'duration': round(cooling_duration, 1),
            'reduction': round(vibration_reduction * 100, 1),
            'stable_vibration': round(stable_vibration, 1)
        },
        'history': {
            'vibration': vibration_history,
            'cooling': cooling_history[-3:]  # Last 3 cooling events
        },
        'counts': {
            'status': status_counts,
            'cooling': cooling_counts
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)
