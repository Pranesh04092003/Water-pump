import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

def train_models():
    """Train both vibration and cooling efficiency models"""
    # Load data
    data = pd.read_csv('data/vibration_data.csv')
    
    # Prepare features for vibration model
    X_vibration = data[['vibration']].values
    y_vibration = data['label'].values
    
    # Prepare features for cooling model
    cooling_features = ['vibration', 'peak_vibration', 'stable_vibration', 
                       'cooling_duration', 'vibration_reduction', 'avg_vibration']
    X_cooling = data[cooling_features].values
    y_cooling = (data['cooling_efficiency'] == 'Efficient').astype(int)
    
    # Split data for both models
    X_vib_train, X_vib_test, y_vib_train, y_vib_test = train_test_split(
        X_vibration, y_vibration, test_size=0.2, random_state=42
    )
    
    X_cool_train, X_cool_test, y_cool_train, y_cool_test = train_test_split(
        X_cooling, y_cooling, test_size=0.2, random_state=42
    )
    
    # Train vibration model
    vibration_model = XGBClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=3,
        random_state=42
    )
    vibration_model.fit(X_vib_train, y_vib_train)
    
    # Train cooling efficiency model
    cooling_model = XGBClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=3,
        random_state=42
    )
    cooling_model.fit(X_cool_train, y_cool_train)
    
    # Evaluate vibration model
    vib_predictions = vibration_model.predict(X_vib_test)
    vib_accuracy = accuracy_score(y_vib_test, vib_predictions)
    print("\n Vibration Model Performance:")
    print(f"Accuracy: {vib_accuracy:.2%}")
    print("\nClassification Report:")
    print(classification_report(y_vib_test, vib_predictions, 
          target_names=['Normal', 'Overheating', 'Failure']))
    
    # Evaluate cooling model
    cool_predictions = cooling_model.predict(X_cool_test)
    cool_accuracy = accuracy_score(y_cool_test, cool_predictions)
    print("\n Cooling Efficiency Model Performance:")
    print(f"Accuracy: {cool_accuracy:.2%}")
    print("\nClassification Report:")
    print(classification_report(y_cool_test, cool_predictions,
          target_names=['Inefficient', 'Efficient']))
    
    # Save models
    os.makedirs('models', exist_ok=True)
    joblib.dump(vibration_model, 'models/vibration_model.joblib')
    joblib.dump(cooling_model, 'models/cooling_model.joblib')
    
    # Save feature names for reference
    with open('models/cooling_features.txt', 'w') as f:
        f.write('\n'.join(cooling_features))
    
    print("\n Models trained and saved successfully!")
    return vibration_model, cooling_model

if __name__ == "__main__":
    train_models()
