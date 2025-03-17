import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
import joblib
import os

def train_usage_pattern_model():
    """Train LSTM model for usage pattern prediction"""
    print("\nTraining Usage Pattern Model...")
    
    # Load data
    df = pd.read_csv("data/vibration_usage_patterns.csv")
    
    # Prepare features
    X = df[['Hour', 'Day', 'Vibration_Level', 'Usage_Frequency']].values
    y = (df['Usage_Label'] == 'High Usage').astype(int)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    
    # Reshape for LSTM
    X_train = X_train.reshape((X_train.shape[0], 1, X_train.shape[1]))
    X_test = X_test.reshape((X_test.shape[0], 1, X_test.shape[1]))
    
    # Create model
    model = Sequential([
        LSTM(50, activation='relu', input_shape=(1, X_train.shape[2])),
        Dense(1, activation='sigmoid')
    ])
    
    # Compile and train
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    history = model.fit(X_train, y_train, epochs=20, batch_size=32, validation_data=(X_test, y_test))
    
    # Save model
    model.save("models/usage_prediction_model.h5")
    
    # Evaluate
    _, accuracy = model.evaluate(X_test, y_test)
    print(f"Usage Pattern Model Accuracy: {accuracy:.2f}")

def train_load_pattern_model():
    """Train Random Forest for load classification"""
    print("\nTraining Load Pattern Model...")
    
    # Load data
    df = pd.read_csv("data/vibration_load_patterns.csv")
    
    # Prepare features
    X = df[['Vibration_Level', 'Motor_Current', 'Power_Consumption']].values
    y = df['Load_Type'].values
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    
    # Train model
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X_train, y_train)
    
    # Save model
    joblib.dump(model, "models/load_classification_model.pkl")
    
    # Evaluate
    accuracy = model.score(X_test, y_test)
    print(f"Load Pattern Model Accuracy: {accuracy:.2f}")

def train_speed_optimization_model():
    """Train Linear Regression for speed optimization"""
    print("\nTraining Speed Optimization Model...")
    
    # Load data
    df = pd.read_csv("data/motor_speed_data.csv")
    
    # Prepare features
    X = df[['Required_Flow_Rate', 'System_Pressure', 'Power_Consumption']].values
    y = df['Optimal_Speed'].values
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    
    # Train model
    model = LinearRegression()
    model.fit(X_train, y_train)
    
    # Save model
    joblib.dump(model, "models/speed_optimization_model.pkl")
    
    # Evaluate
    r2_score = model.score(X_test, y_test)
    print(f"Speed Optimization Model R² Score: {r2_score:.2f}")

if __name__ == "__main__":
    # Create models directory
    os.makedirs('models', exist_ok=True)
    
    print("Training all pattern analysis models...")
    
    # Train all models
    train_usage_pattern_model()
    train_load_pattern_model()
    train_speed_optimization_model()
    
    print("\n✅ All models trained and saved successfully!")
