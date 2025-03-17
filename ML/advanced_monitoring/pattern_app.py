from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import numpy as np
import tensorflow as tf
import joblib
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)  # Enable CORS

# Load all models
usage_model = tf.keras.models.load_model("models/usage_prediction_model.h5")
load_model = joblib.load("models/load_classification_model.pkl")
speed_model = joblib.load("models/speed_optimization_model.pkl")

@app.route('/')
def dashboard():
    return render_template('pattern_dashboard.html')

@app.route('/predict_usage', methods=['POST'])
def predict_usage():
    data = request.json
    
    # Extract features
    features = np.array([[
        float(data["Hour"]),
        float(data["Day"]),
        float(data["Vibration_Level"]),
        float(data["Usage_Frequency"])
    ]]).reshape(1, 1, 4)
    
    # Make prediction
    prediction = usage_model.predict(features)[0][0]
    result = "High Usage" if prediction > 0.5 else "Low Usage"
    
    return jsonify({
        "Usage_Pattern": result,
        "Confidence": float(prediction)
    })

@app.route('/predict_load', methods=['POST'])
def predict_load():
    data = request.json
    
    # Extract features
    features = np.array([[
        float(data["Vibration_Level"]),
        float(data["Motor_Current"]),
        float(data["Power_Consumption"])
    ]])
    
    # Make prediction
    prediction = load_model.predict(features)[0]
    proba = load_model.predict_proba(features)[0]
    
    return jsonify({
        "Load_Type": prediction,
        "Confidence": float(max(proba))
    })

@app.route('/predict_speed', methods=['POST'])
def predict_speed():
    data = request.json
    
    # Extract features
    features = np.array([[
        float(data["Required_Flow_Rate"]),
        float(data["System_Pressure"]),
        float(data["Power_Consumption"])
    ]])
    
    # Make prediction
    prediction = speed_model.predict(features)[0]
    
    return jsonify({
        "Optimal_Speed": float(prediction),
        "Unit": "RPM"
    })

@app.route('/analyze_start_stop', methods=['POST'])
def analyze_start_stop():
    data = request.json
    vibration_change = float(data["Vibration_Change"])
    
    # Analyze start/stop frequency
    if vibration_change > 50:
        recommendation = "Reduce cycling frequency"
        status = "High"
    else:
        recommendation = "Normal operation"
        status = "Normal"
    
    return jsonify({
        "Start_Stop_Status": status,
        "Recommendation": recommendation
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5051, debug=True)
