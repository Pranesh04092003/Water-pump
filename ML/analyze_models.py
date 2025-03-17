import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, roc_curve, auc
import joblib
from sklearn.model_selection import train_test_split
import os

# Create directories for plots
os.makedirs('plots', exist_ok=True)
os.makedirs('plots/vibration', exist_ok=True)
os.makedirs('plots/cooling', exist_ok=True)

# Set style
sns.set_theme(style="whitegrid")

# Load data and models
print("Loading data and models...")
data = pd.read_csv('data/vibration_data.csv')
vibration_model = joblib.load('models/vibration_model.joblib')
cooling_model = joblib.load('models/cooling_model.joblib')

# Prepare features
X_vibration = data[['vibration']].values
y_vibration = data['label'].values

cooling_features = ['vibration', 'peak_vibration', 'stable_vibration', 
                   'cooling_duration', 'vibration_reduction', 'avg_vibration']
X_cooling = data[cooling_features].values
y_cooling = (data['cooling_efficiency'] == 'Efficient').astype(int)

# Split data
X_vib_train, X_vib_test, y_vib_train, y_vib_test = train_test_split(
    X_vibration, y_vibration, test_size=0.2, random_state=42
)
X_cool_train, X_cool_test, y_cool_train, y_cool_test = train_test_split(
    X_cooling, y_cooling, test_size=0.2, random_state=42
)

def plot_vibration_distribution():
    """Plot vibration distribution by motor status"""
    plt.figure(figsize=(12, 6))
    sns.boxplot(x='condition', y='vibration', data=data)
    plt.title('Vibration Distribution by Motor Status')
    plt.xlabel('Motor Status')
    plt.ylabel('Vibration Level')
    plt.savefig('plots/vibration/vibration_distribution.png')
    plt.close()

def plot_cooling_efficiency():
    """Plot cooling efficiency metrics"""
    fig, axes = plt.subplots(2, 1, figsize=(12, 12))
    
    # Reduction percentage by condition
    sns.boxplot(x='condition', y='vibration_reduction', data=data, ax=axes[0])
    axes[0].set_title('Vibration Reduction by Motor Status')
    axes[0].set_xlabel('Motor Status')
    axes[0].set_ylabel('Reduction Percentage')
    
    # Cooling duration by condition
    sns.boxplot(x='condition', y='cooling_duration', data=data, ax=axes[1])
    axes[1].set_title('Cooling Duration by Motor Status')
    axes[1].set_xlabel('Motor Status')
    axes[1].set_ylabel('Duration (minutes)')
    
    plt.tight_layout()
    plt.savefig('plots/cooling/cooling_metrics.png')
    plt.close()

def plot_vibration_confusion_matrix():
    """Plot confusion matrix for vibration model"""
    y_pred = vibration_model.predict(X_vib_test)
    cm = confusion_matrix(y_vib_test, y_pred)
    
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=['Normal', 'Overheating', 'Failure'],
                yticklabels=['Normal', 'Overheating', 'Failure'])
    plt.title('Vibration Model - Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.savefig('plots/vibration/confusion_matrix.png')
    plt.close()

def plot_cooling_confusion_matrix():
    """Plot confusion matrix for cooling model"""
    y_pred = cooling_model.predict(X_cool_test)
    cm = confusion_matrix(y_cool_test, y_pred)
    
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=['Inefficient', 'Efficient'],
                yticklabels=['Inefficient', 'Efficient'])
    plt.title('Cooling Model - Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.savefig('plots/cooling/confusion_matrix.png')
    plt.close()

def plot_feature_importance():
    """Plot feature importance for both models"""
    fig, axes = plt.subplots(2, 1, figsize=(12, 12))
    
    # Vibration model
    importances_vib = vibration_model.feature_importances_
    axes[0].bar(['Vibration'], importances_vib)
    axes[0].set_title('Vibration Model - Feature Importance')
    
    # Cooling model
    importances_cool = cooling_model.feature_importances_
    axes[1].bar(cooling_features, importances_cool)
    axes[1].set_title('Cooling Model - Feature Importance')
    axes[1].tick_params(axis='x', rotation=45)
    
    plt.tight_layout()
    plt.savefig('plots/feature_importance.png')
    plt.close()

def plot_cooling_correlation():
    """Plot correlation matrix for cooling features"""
    # Convert cooling efficiency to numeric
    cooling_data = data[cooling_features].copy()
    cooling_data['efficiency_numeric'] = (data['cooling_efficiency'] == 'Efficient').astype(int)
    
    corr = cooling_data.corr()
    
    plt.figure(figsize=(10, 8))
    sns.heatmap(corr, annot=True, cmap='coolwarm', center=0)
    plt.title('Correlation Matrix - Cooling Features')
    plt.tight_layout()
    plt.savefig('plots/cooling/correlation_matrix.png')
    plt.close()

def plot_time_series():
    """Plot simulated time series data"""
    sample_data = data.head(50)
    
    fig, axes = plt.subplots(2, 1, figsize=(15, 10))
    
    # Vibration over time
    axes[0].plot(sample_data.index, sample_data['vibration'], label='Vibration')
    axes[0].set_title('Vibration Level Over Time')
    axes[0].set_xlabel('Time Points')
    axes[0].set_ylabel('Vibration Level')
    axes[0].legend()
    
    # Cooling efficiency over time
    axes[1].plot(sample_data.index, sample_data['vibration_reduction'], 
                 label='Cooling Efficiency')
    axes[1].set_title('Cooling Efficiency Over Time')
    axes[1].set_xlabel('Time Points')
    axes[1].set_ylabel('Reduction Percentage')
    axes[1].legend()
    
    plt.tight_layout()
    plt.savefig('plots/time_series.png')
    plt.close()

def plot_roc_curves():
    """Plot ROC curves for both models"""
    fig, axes = plt.subplots(1, 2, figsize=(15, 6))
    
    # Vibration model (multi-class)
    y_pred_proba = vibration_model.predict_proba(X_vib_test)
    for i in range(3):
        fpr, tpr, _ = roc_curve(y_vib_test == i, y_pred_proba[:, i])
        roc_auc = auc(fpr, tpr)
        axes[0].plot(fpr, tpr, label=f'Class {i} (AUC = {roc_auc:.2f})')
    
    axes[0].plot([0, 1], [0, 1], 'k--')
    axes[0].set_title('ROC Curve - Vibration Model')
    axes[0].set_xlabel('False Positive Rate')
    axes[0].set_ylabel('True Positive Rate')
    axes[0].legend()
    
    # Cooling model (binary)
    y_pred_proba = cooling_model.predict_proba(X_cool_test)[:, 1]
    fpr, tpr, _ = roc_curve(y_cool_test, y_pred_proba)
    roc_auc = auc(fpr, tpr)
    axes[1].plot(fpr, tpr, label=f'AUC = {roc_auc:.2f}')
    axes[1].plot([0, 1], [0, 1], 'k--')
    axes[1].set_title('ROC Curve - Cooling Model')
    axes[1].set_xlabel('False Positive Rate')
    axes[1].set_ylabel('True Positive Rate')
    axes[1].legend()
    
    plt.tight_layout()
    plt.savefig('plots/roc_curves.png')
    plt.close()

if __name__ == "__main__":
    print("Generating plots...")
    
    try:
        # Generate all plots
        print("1. Plotting vibration distribution...")
        plot_vibration_distribution()
        
        print("2. Plotting cooling efficiency metrics...")
        plot_cooling_efficiency()
        
        print("3. Plotting vibration confusion matrix...")
        plot_vibration_confusion_matrix()
        
        print("4. Plotting cooling confusion matrix...")
        plot_cooling_confusion_matrix()
        
        print("5. Plotting feature importance...")
        plot_feature_importance()
        
        print("6. Plotting cooling correlation...")
        plot_cooling_correlation()
        
        print("7. Plotting time series...")
        plot_time_series()
        
        print("8. Plotting ROC curves...")
        plot_roc_curves()
        
        print("\n✅ Successfully generated all plots!")
        print("Plots are saved in the following directories:")
        print("- plots/vibration/")
        print("- plots/cooling/")
        print("- plots/")
        
    except Exception as e:
        print(f"\n❌ Error generating plots: {str(e)}")
