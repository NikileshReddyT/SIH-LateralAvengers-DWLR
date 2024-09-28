from flask import Flask, request, jsonify
from flask_cors import CORS  # Enable CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Define water level ranges for each sensor based on location
water_level_ranges = {
    's1': (4, 8),
    's2': (10, 12),
    's3': (14, 15),
    's4': (11, 14)
}

def get_quarter(timestamp):
    try:
        time = datetime.strptime(timestamp, '%Y-%m-%dT%H:%M')  # Adjust for ISO format
    except ValueError:
        return 'Quarter 1'  # Fallback in case of invalid timestamp

    hour = time.hour
    if 0 <= hour < 6:
        return 'Q1'  # Change to Q1
    elif 6 <= hour < 12:
        return 'Q2'  # Change to Q2
    elif 12 <= hour < 18:
        return 'Q3'  # Change to Q3
    else:
        return 'Q4'  # Change to Q4

def format_timestamp_and_quarter(timestamp):
    try:
        time = datetime.strptime(timestamp, '%Y-%m-%dT%H:%M')  # Adjust for ISO format
        formatted_time = time.strftime('%d-%m-%Y')  # Format the date as dd-mm-yyyy
    except ValueError:
        formatted_time = 'Invalid Date'
    
    quarter = get_quarter(timestamp)  # Get the quarter based on the time
    return formatted_time, quarter  # Return both formatted time and quarter

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json()
    results = []

    for entry in data:
        sensor_id = entry.get('sensorId', '').strip()
        location = entry.get('location', '').strip()
        timestamp = entry.get('timestamp', '').strip()
        water_level = entry.get('waterLevel')
        battery_level = entry.get('batteryLevel')

        # Ensure water_level and battery_level are numeric
        try:
            water_level = float(water_level)
        except (ValueError, TypeError):
            water_level = None
        
        try:
            battery_level = int(battery_level)
        except (ValueError, TypeError):
            battery_level = None

        # Format timestamp and include quarter
        formatted_timestamp, quarter = format_timestamp_and_quarter(timestamp)

        # Check for missing data in all fields
        status = []
        if not sensor_id or not location or not timestamp or water_level is None or battery_level is None:
            status.append("Sensor Data Anomaly")
        else:
            # Get the corresponding water level range for the sensor
            range_min, range_max = water_level_ranges.get(sensor_id, (None, None))
            if range_min is None or range_max is None:
                status.append("Invalid Sensor ID")
            else:
                # Check if the water level is within the specified range
                if water_level < range_min or water_level > range_max:
                    status.append("Water Anomaly")
            
            # Validate battery level
            if battery_level is not None and battery_level < 20:
                status.append("Battery Anomaly")
            
            if not status:
                status.append("Normal")

        # Join the status list into a single string for display
        results.append({
            "Sensor Id": sensor_id,
            "Timestamp": formatted_timestamp,  # Use the formatted timestamp here
            "Location": location,
            "Water Level": water_level,
            "Battery Level": battery_level,
            "Status": " & ".join(status),
            "Quarter": quarter  # Include the quarter in the response
        })

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
