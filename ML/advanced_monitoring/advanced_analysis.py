import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, classification_report, accuracy_score, r2_score
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import learning_curve
import tensorflow as tf
import joblib
from datetime import datetime, timedelta

def analyze_feature_importance():
    """Analyze and visualize feature importance for load classification"""
    print("Analyzing Feature Importance...")
    
    # Load data and model
    df = pd.read_csv("data/vibration_load_patterns.csv")
    load_model = joblib.load("models/load_classification_model.pkl")
    
    # Get feature importance
    features = ['Vibration_Level', 'Motor_Current', 'Power_Consumption']
    importance = load_model.feature_importances_
    
    plt.figure(figsize=(10, 6))
    sns.barplot(x=importance, y=features)
    plt.title('Feature Importance in Load Classification')
    plt.xlabel('Importance Score')
    plt.tight_layout()
    plt.savefig('plots/feature_importance.png')
    plt.close()

def analyze_learning_curves():
    """Generate learning curves for all models"""
    print("Analyzing Learning Curves...")
    
    # Load data
    load_df = pd.read_csv("data/vibration_load_patterns.csv")
    speed_df = pd.read_csv("data/motor_speed_data.csv")
    
    # Prepare data for load classification
    X_load = load_df[['Vibration_Level', 'Motor_Current', 'Power_Consumption']]
    y_load = load_df['Load_Type']
    
    # Prepare data for speed optimization
    X_speed = speed_df[['Required_Flow_Rate', 'System_Pressure', 'Power_Consumption']]
    y_speed = speed_df['Optimal_Speed']
    
    # Load models
    load_model = joblib.load("models/load_classification_model.pkl")
    speed_model = joblib.load("models/speed_optimization_model.pkl")
    
    # Generate learning curves for load classification
    plt.figure(figsize=(12, 5))
    plt.subplot(1, 2, 1)
    train_sizes, train_scores, test_scores = learning_curve(
        load_model, X_load, y_load, cv=5, n_jobs=-1, 
        train_sizes=np.linspace(0.1, 1.0, 10))
    
    train_mean = np.mean(train_scores, axis=1)
    train_std = np.std(train_scores, axis=1)
    test_mean = np.mean(test_scores, axis=1)
    test_std = np.std(test_scores, axis=1)
    
    plt.plot(train_sizes, train_mean, label='Training Score')
    plt.plot(train_sizes, test_mean, label='Cross-validation Score')
    plt.fill_between(train_sizes, train_mean - train_std, train_mean + train_std, alpha=0.1)
    plt.fill_between(train_sizes, test_mean - test_std, test_mean + test_std, alpha=0.1)
    plt.title('Learning Curve - Load Classification')
    plt.xlabel('Training Examples')
    plt.ylabel('Score')
    plt.legend(loc='best')
    
    # Generate learning curves for speed optimization
    plt.subplot(1, 2, 2)
    train_sizes, train_scores, test_scores = learning_curve(
        speed_model, X_speed, y_speed, cv=5, n_jobs=-1,
        train_sizes=np.linspace(0.1, 1.0, 10))
    
    train_mean = np.mean(train_scores, axis=1)
    train_std = np.std(train_scores, axis=1)
    test_mean = np.mean(test_scores, axis=1)
    test_std = np.std(test_scores, axis=1)
    
    plt.plot(train_sizes, train_mean, label='Training Score')
    plt.plot(train_sizes, test_mean, label='Cross-validation Score')
    plt.fill_between(train_sizes, train_mean - train_std, train_mean + train_std, alpha=0.1)
    plt.fill_between(train_sizes, test_mean - test_std, test_mean + test_std, alpha=0.1)
    plt.title('Learning Curve - Speed Optimization')
    plt.xlabel('Training Examples')
    plt.ylabel('Score')
    plt.legend(loc='best')
    
    plt.tight_layout()
    plt.savefig('plots/learning_curves.png')
    plt.close()

def analyze_error_distribution():
    """Analyze error distribution in predictions"""
    print("Analyzing Error Distribution...")
    
    # Load data
    speed_df = pd.read_csv("data/motor_speed_data.csv")
    
    # Load model
    speed_model = joblib.load("models/speed_optimization_model.pkl")
    
    # Get predictions
    X = speed_df[['Required_Flow_Rate', 'System_Pressure', 'Power_Consumption']]
    y_true = speed_df['Optimal_Speed']
    y_pred = speed_model.predict(X)
    
    # Calculate errors
    errors = y_true - y_pred
    
    # Plot error distribution
    plt.figure(figsize=(12, 5))
    plt.subplot(1, 2, 1)
    sns.histplot(errors, kde=True)
    plt.title('Error Distribution in Speed Prediction')
    plt.xlabel('Prediction Error (RPM)')
    plt.ylabel('Count')
    
    # Plot actual vs predicted
    plt.subplot(1, 2, 2)
    plt.scatter(y_true, y_pred, alpha=0.5)
    plt.plot([y_true.min(), y_true.max()], [y_true.min(), y_true.max()], 'r--', lw=2)
    plt.title('Actual vs Predicted Speed')
    plt.xlabel('Actual Speed (RPM)')
    plt.ylabel('Predicted Speed (RPM)')
    
    plt.tight_layout()
    plt.savefig('plots/error_analysis.png')
    plt.close()

def analyze_temporal_patterns():
    """Analyze temporal patterns in the data"""
    print("Analyzing Temporal Patterns...")
    
    # Load data
    df = pd.read_csv("data/vibration_usage_patterns.csv")
    df['Timestamp'] = pd.to_datetime(df['Timestamp'])
    
    # Create figure
    plt.figure(figsize=(15, 10))
    
    # 1. Weekly pattern
    plt.subplot(2, 2, 1)
    weekly_avg = df.groupby([df['Timestamp'].dt.dayofweek, df['Hour']])['Usage_Frequency'].mean().unstack()
    sns.heatmap(weekly_avg, cmap='YlOrRd')
    plt.title('Weekly Usage Pattern')
    plt.xlabel('Hour of Day')
    plt.ylabel('Day of Week')
    
    # 2. Hourly vibration levels
    plt.subplot(2, 2, 2)
    hourly_vib = df.groupby('Hour')['Vibration_Level'].agg(['mean', 'std'])
    plt.errorbar(hourly_vib.index, hourly_vib['mean'], yerr=hourly_vib['std'], capsize=5)
    plt.title('Hourly Vibration Levels')
    plt.xlabel('Hour of Day')
    plt.ylabel('Vibration Level')
    
    # 3. Temperature vs Vibration
    plt.subplot(2, 2, 3)
    sns.scatterplot(data=df, x='Temperature', y='Vibration_Level', hue='Usage_Label', alpha=0.5)
    plt.title('Temperature vs Vibration')
    plt.xlabel('Temperature (°C)')
    plt.ylabel('Vibration Level')
    
    # 4. Usage frequency distribution
    plt.subplot(2, 2, 4)
    sns.violinplot(data=df, x='Day', y='Usage_Frequency')
    plt.title('Usage Frequency Distribution by Day')
    plt.xlabel('Day of Week')
    plt.ylabel('Usage Frequency')
    
    plt.tight_layout()
    plt.savefig('plots/temporal_patterns.png')
    plt.close()

if __name__ == "__main__":
    print("Generating advanced analysis plots...")
    
    # Generate all plots
    analyze_feature_importance()
    analyze_learning_curves()
    analyze_error_distribution()
    analyze_temporal_patterns()
    
    print("\n✅ Advanced analysis complete! New visualizations available in plots directory.")
