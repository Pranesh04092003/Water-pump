import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, classification_report, accuracy_score, r2_score
import tensorflow as tf
import joblib
from datetime import datetime, timedelta

# Set style for better visualizations
sns.set_theme(style="whitegrid")

def analyze_usage_patterns():
    """Analyze and visualize usage patterns"""
    print("\nAnalyzing Usage Patterns...")
    
    # Load data
    df = pd.read_csv("data/vibration_usage_patterns.csv")
    df['Timestamp'] = pd.to_datetime(df['Timestamp'])
    
    # Create figure with subplots
    fig = plt.figure(figsize=(20, 12))
    
    # 1. Usage by Hour
    plt.subplot(2, 2, 1)
    hourly_usage = df.groupby('Hour')['Usage_Frequency'].mean()
    sns.lineplot(x=hourly_usage.index, y=hourly_usage.values)
    plt.title('Average Usage by Hour')
    plt.xlabel('Hour of Day')
    plt.ylabel('Usage Frequency')
    
    # 2. Usage by Day
    plt.subplot(2, 2, 2)
    daily_usage = df.groupby('Day')['Usage_Frequency'].mean()
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    plt.bar(days, daily_usage)
    plt.title('Average Usage by Day')
    plt.xticks(rotation=45)
    plt.ylabel('Usage Frequency')
    
    # 3. Vibration vs Usage
    plt.subplot(2, 2, 3)
    sns.scatterplot(data=df, x='Vibration_Level', y='Usage_Frequency', hue='Usage_Label')
    plt.title('Vibration Level vs Usage Frequency')
    
    # 4. Temperature Impact
    plt.subplot(2, 2, 4)
    sns.scatterplot(data=df, x='Temperature', y='Usage_Frequency', hue='Hour')
    plt.title('Temperature vs Usage Frequency')
    
    plt.tight_layout()
    plt.savefig('plots/usage_patterns.png')
    plt.close()

def analyze_load_patterns():
    """Analyze and visualize load patterns"""
    print("Analyzing Load Patterns...")
    
    # Load data
    df = pd.read_csv("data/vibration_load_patterns.csv")
    
    # Create figure with subplots
    fig = plt.figure(figsize=(20, 12))
    
    # 1. Load Distribution
    plt.subplot(2, 2, 1)
    df['Load_Type'].value_counts().plot(kind='pie', autopct='%1.1f%%')
    plt.title('Distribution of Load Types')
    
    # 2. Vibration vs Current
    plt.subplot(2, 2, 2)
    sns.scatterplot(data=df, x='Vibration_Level', y='Motor_Current', hue='Load_Type')
    plt.title('Vibration Level vs Motor Current')
    
    # 3. Power Consumption by Load Type
    plt.subplot(2, 2, 3)
    sns.boxplot(data=df, x='Load_Type', y='Power_Consumption')
    plt.title('Power Consumption by Load Type')
    plt.xticks(rotation=45)
    
    # 4. Correlation Heatmap
    plt.subplot(2, 2, 4)
    numeric_cols = ['Vibration_Level', 'Motor_Current', 'Power_Consumption']
    sns.heatmap(df[numeric_cols].corr(), annot=True, cmap='coolwarm')
    plt.title('Feature Correlation Matrix')
    
    plt.tight_layout()
    plt.savefig('plots/load_patterns.png')
    plt.close()

def analyze_speed_optimization():
    """Analyze and visualize speed optimization patterns"""
    print("Analyzing Speed Optimization...")
    
    # Load data
    df = pd.read_csv("data/motor_speed_data.csv")
    
    # Create figure with subplots
    fig = plt.figure(figsize=(20, 12))
    
    # 1. Flow Rate vs Optimal Speed
    plt.subplot(2, 2, 1)
    sns.scatterplot(data=df, x='Required_Flow_Rate', y='Optimal_Speed', 
                    hue='Power_Consumption', size='System_Pressure')
    plt.title('Flow Rate vs Optimal Speed')
    
    # 2. Pressure vs Power Consumption
    plt.subplot(2, 2, 2)
    sns.scatterplot(data=df, x='System_Pressure', y='Power_Consumption', 
                    hue='Optimal_Speed', size='Required_Flow_Rate')
    plt.title('System Pressure vs Power Consumption')
    
    # 3. Speed Distribution
    plt.subplot(2, 2, 3)
    sns.histplot(data=df, x='Optimal_Speed', bins=30)
    plt.title('Distribution of Optimal Speeds')
    
    # 4. Correlation Heatmap
    plt.subplot(2, 2, 4)
    sns.heatmap(df.corr(), annot=True, cmap='coolwarm')
    plt.title('Feature Correlation Matrix')
    
    plt.tight_layout()
    plt.savefig('plots/speed_optimization.png')
    plt.close()

def analyze_model_performance():
    """Analyze and visualize model performance"""
    print("Analyzing Model Performance...")
    
    # Load test data
    usage_df = pd.read_csv("data/vibration_usage_patterns.csv")
    load_df = pd.read_csv("data/vibration_load_patterns.csv")
    speed_df = pd.read_csv("data/motor_speed_data.csv")
    
    # Load models
    usage_model = tf.keras.models.load_model("models/usage_prediction_model.h5")
    load_model = joblib.load("models/load_classification_model.pkl")
    speed_model = joblib.load("models/speed_optimization_model.pkl")
    
    # Create figure with subplots
    fig = plt.figure(figsize=(20, 15))
    
    # 1. Usage Model Confusion Matrix
    plt.subplot(2, 2, 1)
    X_usage = usage_df[['Hour', 'Day', 'Vibration_Level', 'Usage_Frequency']].values
    X_usage = X_usage.reshape((X_usage.shape[0], 1, X_usage.shape[1]))
    y_usage = (usage_df['Usage_Label'] == 'High Usage').astype(int)
    y_pred_usage = (usage_model.predict(X_usage) > 0.5).astype(int)
    cm_usage = confusion_matrix(y_usage, y_pred_usage)
    sns.heatmap(cm_usage, annot=True, fmt='d', cmap='Blues')
    plt.title('Usage Prediction Confusion Matrix')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    
    # 2. Load Model Confusion Matrix
    plt.subplot(2, 2, 2)
    X_load = load_df[['Vibration_Level', 'Motor_Current', 'Power_Consumption']]
    y_load = load_df['Load_Type']
    y_pred_load = load_model.predict(X_load)
    cm_load = confusion_matrix(y_load, y_pred_load)
    sns.heatmap(cm_load, annot=True, fmt='d', cmap='Blues')
    plt.title('Load Classification Confusion Matrix')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    
    # 3. Speed Model Residuals
    plt.subplot(2, 2, 3)
    X_speed = speed_df[['Required_Flow_Rate', 'System_Pressure', 'Power_Consumption']]
    y_speed = speed_df['Optimal_Speed']
    y_pred_speed = speed_model.predict(X_speed)
    residuals = y_speed - y_pred_speed
    sns.scatterplot(x=y_pred_speed, y=residuals)
    plt.axhline(y=0, color='r', linestyle='--')
    plt.title('Speed Optimization Residuals')
    plt.xlabel('Predicted Speed')
    plt.ylabel('Residuals')
    
    # 4. Model Performance Metrics
    plt.subplot(2, 2, 4)
    metrics = {
        'Usage Model Accuracy': accuracy_score(y_usage, y_pred_usage),
        'Load Model Accuracy': accuracy_score(y_load, y_pred_load),
        'Speed Model R²': r2_score(y_speed, y_pred_speed)
    }
    plt.bar(metrics.keys(), metrics.values())
    plt.title('Model Performance Metrics')
    plt.xticks(rotation=45)
    plt.ylim(0, 1)
    
    plt.tight_layout()
    plt.savefig('plots/model_performance.png')
    plt.close()

def generate_html_report():
    """Generate an HTML report with all visualizations"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Motor Pattern Analysis Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .section { margin-bottom: 40px; }
            img { max-width: 100%; height: auto; }
            h1 { color: #2c3e50; }
            h2 { color: #34495e; }
            .description { color: #7f8c8d; }
        </style>
    </head>
    <body>
        <h1>Motor Pattern Analysis Report</h1>
        <div class="section">
            <h2>1. Usage Patterns</h2>
            <p class="description">Analysis of motor usage patterns across different times and conditions.</p>
            <img src="plots/usage_patterns.png" alt="Usage Patterns">
        </div>
        
        <div class="section">
            <h2>2. Load Patterns</h2>
            <p class="description">Distribution and relationships between different load types and motor parameters.</p>
            <img src="plots/load_patterns.png" alt="Load Patterns">
        </div>
        
        <div class="section">
            <h2>3. Speed Optimization</h2>
            <p class="description">Analysis of optimal speed settings under different conditions.</p>
            <img src="plots/speed_optimization.png" alt="Speed Optimization">
        </div>
        
        <div class="section">
            <h2>4. Model Performance</h2>
            <p class="description">Evaluation metrics and performance analysis of the ML models.</p>
            <img src="plots/model_performance.png" alt="Model Performance">
        </div>
    </body>
    </html>
    """
    
    with open('plots/analysis_report.html', 'w') as f:
        f.write(html_content)

if __name__ == "__main__":
    # Create plots directory
    import os
    os.makedirs('plots', exist_ok=True)
    
    print("Generating comprehensive analysis plots...")
    
    # Generate all plots
    analyze_usage_patterns()
    analyze_load_patterns()
    analyze_speed_optimization()
    analyze_model_performance()
    
    # Generate HTML report
    generate_html_report()
    
    print("\n✅ Analysis complete! Check the 'plots' directory for visualizations.")
    print("📊 Open 'plots/analysis_report.html' to view the complete report.")
