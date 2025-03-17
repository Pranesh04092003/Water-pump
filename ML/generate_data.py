import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

# Set random seed for reproducibility
np.random.seed(42)

def generate_cooling_cycle(initial_vibration, duration_minutes=30, readings_per_minute=2):
    """Generate a cooling cycle with vibration readings"""
    total_readings = duration_minutes * readings_per_minute
    time_points = np.linspace(0, duration_minutes, total_readings)
    
    # Cooling effectiveness (random between 0.5 and 1.0)
    cooling_effectiveness = np.random.uniform(0.5, 1.0)
    
    # Generate vibration pattern during cooling
    cooling_curve = initial_vibration * np.exp(-cooling_effectiveness * time_points/duration_minutes)
    noise = np.random.normal(0, initial_vibration * 0.05, total_readings)
    vibrations = cooling_curve + noise
    
    # Calculate cooling metrics
    cooling_duration = duration_minutes * (1 - np.exp(-cooling_effectiveness))
    final_vibration = vibrations[-1]
    vibration_reduction = (initial_vibration - final_vibration) / initial_vibration
    
    return vibrations, cooling_duration, vibration_reduction

def generate_vibration_data(n_samples=1000):
    """Generate synthetic vibration and cooling data"""
    data = []
    current_time = datetime.now()
    
    for _ in range(n_samples // 3):  # Generate data for each condition
        for condition in ['Normal', 'Overheating', 'Failure']:
            # Base vibration levels
            if condition == 'Normal':
                initial_vibration = np.random.normal(2000, 300)
            elif condition == 'Overheating':
                initial_vibration = np.random.normal(6000, 500)
            else:  # Failure
                initial_vibration = np.random.normal(9000, 700)
            
            # Generate cooling cycle
            vibrations, cooling_duration, vibration_reduction = generate_cooling_cycle(initial_vibration)
            
            # Determine cooling efficiency
            if condition == 'Normal':
                cooling_efficiency = 'Efficient' if vibration_reduction > 0.3 else 'Inefficient'
            elif condition == 'Overheating':
                cooling_efficiency = 'Efficient' if vibration_reduction > 0.25 else 'Inefficient'
            else:  # Failure
                cooling_efficiency = 'Inefficient'
            
            # Add sample to dataset
            data.append({
                'timestamp': current_time,
                'vibration': initial_vibration,
                'label': 0 if condition == 'Normal' else 1 if condition == 'Overheating' else 2,
                'condition': condition,
                'cooling_duration': cooling_duration,
                'vibration_reduction': vibration_reduction,
                'cooling_efficiency': cooling_efficiency,
                'stable_vibration': vibrations[-1],
                'peak_vibration': max(vibrations),
                'avg_vibration': np.mean(vibrations)
            })
            
            current_time += timedelta(minutes=30)
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Add some noise and randomness
    df = df.sample(frac=1).reset_index(drop=True)
    
    return df

# Generate and save data
if __name__ == "__main__":
    data = generate_vibration_data()
    
    # Create directory if it doesn't exist
    os.makedirs('data', exist_ok=True)
    
    # Save to CSV
    data.to_csv('data/vibration_data.csv', index=False)
    print("✅ Generated synthetic vibration and cooling data and saved to 'data/vibration_data.csv'")
