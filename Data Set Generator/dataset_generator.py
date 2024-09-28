import pandas as pd
import random
from datetime import datetime, timedelta

def generate_data():
    sensors = ['s1', 's2', 's3', 's4']
    locations = ['Vijayawada', 'Hyderabad', 'Guntur', 'Khammam']
    data = []

    # Define water level ranges for each sensor
    water_level_ranges = {
        's1': (4, 8),
        's2': (10, 12),
        's3': (14, 15),
        's4': (11, 14)
    }

    start_date = datetime(2023, 9, 24)  # Set start date
    hours_delta = timedelta(hours=6)

    # Generate data for 30 days, 4 data points per day per sensor (every 6 hours)
    for sensor in sensors:
        current_date = start_date
        for _ in range(120):  # 4 data points per day for 30 days
            water_level_range = water_level_ranges[sensor]
            water_level = random.uniform(*water_level_range)

            # Determine if the water level is normal or anomalous
            if water_level < water_level_range[0] or water_level > water_level_range[1]:
                status = 'Anomalous'
            else:
                status = 'Normal'

            # Battery level for normal data should be between 20 and 100
            battery_level = random.uniform(20, 100) if status == 'Normal' else random.uniform(0, 19)

            data.append({
                'sensorId': sensor,
                'timestamp': current_date.strftime('%Y-%m-%d %H:%M'),
                'location': locations[sensors.index(sensor)],
                'waterLevel': round(water_level, 2),
                'batteryLevel': round(battery_level, 2),
                'status': status
            })

            current_date += hours_delta

    # Create a DataFrame and save as CSV
    df = pd.DataFrame(data)
    df.to_csv('enhanced_sensor_data.csv', index=False)
    print("Enhanced dataset saved to enhanced_sensor_data.csv")

generate_data()
