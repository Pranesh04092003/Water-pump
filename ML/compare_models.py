import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import matplotlib.pyplot as plt
import seaborn as sns

def train_and_evaluate(X_train, X_test, y_train, y_test, model, model_name):
    # Train model
    model.fit(X_train, y_train)
    
    # Make predictions
    y_pred = model.predict(X_test)
    
    # Get metrics
    accuracy = accuracy_score(y_test, y_pred)
    class_report = classification_report(y_test, y_pred, 
                                      target_names=['Normal', 'Overheating', 'Failure'],
                                      output_dict=True)
    
    return accuracy, class_report, y_pred

# Load data
print("Loading data...")
df = pd.read_csv('data/vibration_data.csv')

# Prepare features and target
X = df[['vibration']].values
y = df['label'].values

# Split the data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Initialize models
rf_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
xgb_model = XGBClassifier(
    n_estimators=100,
    max_depth=3,
    learning_rate=0.1,
    objective='multi:softmax',
    num_class=3,
    random_state=42
)

# Train and evaluate both models
print("\nTraining and evaluating models...")
rf_accuracy, rf_report, rf_pred = train_and_evaluate(
    X_train, X_test, y_train, y_test, rf_model, "Random Forest"
)
xgb_accuracy, xgb_report, xgb_pred = train_and_evaluate(
    X_train, X_test, y_train, y_test, xgb_model, "XGBoost"
)

# Create directory for plots
os.makedirs('plots', exist_ok=True)

# 1. Accuracy Comparison
plt.figure(figsize=(10, 6))
accuracies = [rf_accuracy, xgb_accuracy]
plt.bar(['Random Forest', 'XGBoost'], accuracies, color=['#2ecc71', '#3498db'])
plt.title('Model Accuracy Comparison')
plt.ylabel('Accuracy Score')
for i, v in enumerate(accuracies):
    plt.text(i, v + 0.001, f'{v:.3f}', ha='center')
plt.ylim(0.95, 1.0)  # Adjust y-axis for better visualization
plt.savefig('plots/accuracy_comparison.png')
plt.close()

# 2. Class-wise Performance Comparison
metrics = ['precision', 'recall', 'f1-score']
classes = ['Normal', 'Overheating', 'Failure']

fig, axes = plt.subplots(1, 3, figsize=(15, 5))
fig.suptitle('Class-wise Performance Metrics Comparison')

for i, metric in enumerate(metrics):
    rf_scores = [rf_report[cls][metric] for cls in classes]
    xgb_scores = [xgb_report[cls][metric] for cls in classes]
    
    x = np.arange(len(classes))
    width = 0.35
    
    axes[i].bar(x - width/2, rf_scores, width, label='Random Forest', color='#2ecc71')
    axes[i].bar(x + width/2, xgb_scores, width, label='XGBoost', color='#3498db')
    axes[i].set_title(metric.capitalize())
    axes[i].set_xticks(x)
    axes[i].set_xticklabels(classes, rotation=45)
    axes[i].legend()
    axes[i].set_ylim(0.9, 1.0)  # Adjust y-axis for better visualization

plt.tight_layout()
plt.savefig('plots/class_wise_comparison.png')
plt.close()

# 3. Confusion Matrix Comparison
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

# Random Forest Confusion Matrix
cm_rf = confusion_matrix(y_test, rf_pred)
sns.heatmap(cm_rf, annot=True, fmt='d', cmap='Blues', ax=ax1,
            xticklabels=['Normal', 'Overheating', 'Failure'],
            yticklabels=['Normal', 'Overheating', 'Failure'])
ax1.set_title('Random Forest Confusion Matrix')
ax1.set_ylabel('True Label')
ax1.set_xlabel('Predicted Label')

# XGBoost Confusion Matrix
cm_xgb = confusion_matrix(y_test, xgb_pred)
sns.heatmap(cm_xgb, annot=True, fmt='d', cmap='Blues', ax=ax2,
            xticklabels=['Normal', 'Overheating', 'Failure'],
            yticklabels=['Normal', 'Overheating', 'Failure'])
ax2.set_title('XGBoost Confusion Matrix')
ax2.set_ylabel('True Label')
ax2.set_xlabel('Predicted Label')

plt.tight_layout()
plt.savefig('plots/confusion_matrix_comparison.png')
plt.close()

print("\nResults:")
print(f"Random Forest Accuracy: {rf_accuracy:.3f}")
print(f"XGBoost Accuracy: {xgb_accuracy:.3f}")
print("\nComparative visualizations have been saved in the 'plots' directory:")
