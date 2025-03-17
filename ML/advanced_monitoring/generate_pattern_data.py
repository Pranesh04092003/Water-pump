import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_usage_pattern_data(days=30):
    """Generate synthetic data for usage pattern analysis"""
    # Generate timestamps
    base_date = datetime.now() - timedelta(days=days)
    dates = [base_date + timedelta(minutes=30*i) for i in range(48*days)]
    
    data = []
    for current_date in dates:
        hour = current_date.hour
        day = current_date.weekday()
        
        # Base vibration level from existing model
        base_vibration = 2000 + np.random.normal(0, 200)
        
        # Add time-based patterns
        if 6 <= hour <= 9:  # Morning peak
            usage_freq = np.random.uniform(0.7, 1.0)
            base_vibration *= 1.3
        elif 17 <= hour <= 20:  # Evening peak
            usage_freq = np.random.uniform(0.6, 0.9)
            base_vibration *= 1.2
        else:  # Normal hours
            usage_freq = np.random.uniform(0.2, 0.5)
        
        # Weekend vs Weekday patterns
        if day >= 5:  # Weekend
            usage_freq *= 0.7
            
        # Temperature variation (simulated)
        temperature = 25 + 5 * np.sin(2 * np.pi * hour / 24) + np.random.normal(0, 2)
        
        data.append({
            'Timestamp': current_date,
            'Hour': hour,
            'Day': day,
            'Vibration_Level': base_vibration,
            'Usage_Frequency': usage_freq,
            'Temperature': temperature,
            'Usage_Label': 'High Usage' if usage_freq > 0.6 else 'Low Usage'
        })
    
    return pd.DataFrame(data)

def generate_load_pattern_data(n_samples=1000):
    """Generate synthetic data for load pattern analysis"""
    data = []
    for _ in range(n_samples):
        # Base vibration from existing model
        vibration = np.random.choice([2000, 6000, 9000]) + np.random.normal(0, 200)
        
        # Correlate current and power with vibration
        base_current = vibration / 1000  # Scale to reasonable amp values
        base_power = vibration * 1.5  # Scale to reasonable watt values
        
        # Add noise
        current = base_current + np.random.normal(0, 0.5)
        power = base_power + np.random.normal(0, 100)
        
        # Determine load type
        if vibration < 4000:
            load_type = 'Light Load'
        elif vibration < 7000:
            load_type = 'Normal Load'
        else:
            load_type = 'Peak Load'
            
        data.append({
            'Vibration_Level': vibration,
            'Motor_Current': current,
            'Power_Consumption': power,
            'Load_Type': load_type
        })
    
    return pd.DataFrame(data)

def generate_start_stop_data(n_samples=1000):
    """Generate synthetic data for start/stop analysis"""
    data = []
    prev_vibration = 0
    
    for _ in range(n_samples):
        # Simulate motor state changes
        if np.random.random() < 0.1:  # 10% chance of state change
            vibration = np.random.choice([0, 2000, 6000])  # Off, Normal, High
        else:
            vibration = prev_vibration + np.random.normal(0, 100)
        
        vibration_change = abs(vibration - prev_vibration)
        prev_vibration = vibration
        
        data.append({
            'Timestamp': datetime.now() + timedelta(minutes=_),
            'Vibration_Level': vibration,
            'Vibration_Change': vibration_change,
            'Motor_State': 'Running' if vibration > 100 else 'Stopped'
        })
    
    return pd.DataFrame(data)

def generate_speed_optimization_data(n_samples=1000):
    """Generate synthetic data for speed optimization"""
    data = []
    for _ in range(n_samples):
        # Base parameters
        flow_rate = np.random.uniform(10, 100)  # L/min
        pressure = np.random.uniform(1, 10)  # Bar
        
        # Correlate power with flow and pressure
        base_power = flow_rate * pressure * 10
        power = base_power + np.random.normal(0, 100)
        
        # Calculate optimal speed based on system demands
        optimal_speed = (flow_rate + pressure * 5) * 10  # RPM
        
        data.append({
            'Required_Flow_Rate': flow_rate,
            'System_Pressure': pressure,
            'Power_Consumption': power,
            'Optimal_Speed': optimal_speed
        })
    
    return pd.DataFrame(data)

if __name__ == "__main__":
    print("Generating synthetic data for pattern analysis...")
    
    # Create data directory
    import os
    os.makedirs('data', exist_ok=True)
    
    # Generate and save all datasets
    usage_df = generate_usage_pattern_data()
    usage_df.to_csv('data/vibration_usage_patterns.csv', index=False)
    print("✅ Usage pattern data generated")
    
    load_df = generate_load_pattern_data()
    load_df.to_csv('data/vibration_load_patterns.csv', index=False)
    print("✅ Load pattern data generated")
    
    start_stop_df = generate_start_stop_data()
    start_stop_df.to_csv('data/motor_start_stop.csv', index=False)
    print("✅ Start/Stop pattern data generated")
    
    speed_df = generate_speed_optimization_data()
    speed_df.to_csv('data/motor_speed_data.csv', index=False)
    print("✅ Speed optimization data generated")
    
    print("\nAll datasets have been generated successfully!")
