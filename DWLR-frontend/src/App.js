import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState({
    sensorId: '',
    timestamp: '',
    location: '',
    waterLevel: '',
    batteryLevel: '',
  });

  const [dataset, setDataset] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [isError, setIsError] = useState(false);
  const error1 = "Some error occurred";

  // Load dataset from local storage on component mount
  useEffect(() => {
    const savedDataset = localStorage.getItem('dataset');
    if (savedDataset) {
      try {
        setDataset(JSON.parse(savedDataset));
      } catch (error) {
        console.error("Failed to load dataset from localStorage", error);
      }
    }
  }, []);

  // Save dataset to local storage whenever dataset changes
  useEffect(() => {
    if (dataset.length > 0) {
      localStorage.setItem('dataset', JSON.stringify(dataset));
    }
  }, [dataset]);

  // Handle input changes including sensor ID dropdown
  const handleInputChange = (e) => {
    if (e.target.name === "batteryLevel") {
      if (e.target.value < 100 && e.target.value >= 0) {
        setInput({
          ...input,
          [e.target.name]: e.target.value,
        });
      }
    } else {
      setInput({
        ...input,
        [e.target.name]: e.target.value,
      });
    }
  };

  // Add the current input to the dataset
  const addToDataset = () => {
    const updatedDataset = [...dataset, input];
    setDataset(updatedDataset);
    setInput({
      sensorId: '',
      timestamp: '',
      location: '',
      waterLevel: '',
      batteryLevel: '',
    });
  };

  // Send the dataset for predictions
  const sendForPrediction = () => {
    fetch('http://127.0.0.1:5000/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataset),
    })
      .then((response) => response.json())
      .then((data) => {
        setPredictions(data);
      })
      .catch((e) => {
        setIsError(true);
        alert(e.message);
      });
  };

  // Check for alerts on predictions with anomalies
  useEffect(() => {
    const alerts = [];
    let res = "";

    predictions.forEach((e) => {
      if (e.Status !== "Normal") {
        alerts.push(e);
      }
    });

    if (alerts.length > 0) {
      alerts.forEach((e) => {
        res += e['Sensor Id'] + " " + e.Status + "\n";
      });

      window.alert(res);
    }
  }, [predictions]);

  // Function to convert timestamp to dd-mm-yyyy with hour and minute
  const formatDateTime = (timestamp) => {
    const dateObj = new Date(timestamp);
    if (isNaN(dateObj)) return "Invalid Date"; // Handle invalid date

    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1; // Months are 0-based
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');

    // Format the date as dd-mm-yyyy with time
    return `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year} ${hours}:${minutes}`;
  };

  return (
    <div className="App">
      <h2>Sensor Management</h2>
      <div className="container">
        <div className="form-container">
          <h3>Add Sensor Data</h3>
          <div>
            <select name="sensorId" value={input.sensorId} onChange={handleInputChange} required>
              <option value="">Select Sensor ID</option>
              <option value="s1">Sensor1</option>
              <option value="s2">Sensor2</option>
              <option value="s3">Sensor3</option>
              <option value="s4">Sensor4</option>
            </select>
            <input
              type="datetime-local"
              name="timestamp"
              value={input.timestamp}
              onChange={handleInputChange}
              required
            />
            <select name="location" value={input.location} onChange={handleInputChange} required>
              <option value="">Select Location</option>
              <option value="Vijayawada">Vijayawada</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Guntur">Guntur</option>
              <option value="Khammam">Khammam</option>
            </select>
            <input
              type="number"
              name="waterLevel"
              placeholder="Water Level"
              value={input.waterLevel}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="batteryLevel"
              placeholder="Battery Level"
              value={input.batteryLevel}
              onChange={handleInputChange}
              required
            />
            <button onClick={addToDataset}>Add to Dataset</button>
          </div>
        </div>

        <div className="data-container">
          <h3>Current Dataset</h3>
          <table>
            <thead>
              <tr>
                <th>Sensor ID</th>
                <th>Date and Time</th>
                <th>Location</th>
                <th>Water Level</th>
                <th>Battery Level</th>
              </tr>
            </thead>
            <tbody>
              {dataset.map((item, index) => (
                <tr key={index}>
                  <td>{item.sensorId}</td>
                  <td>{formatDateTime(item.timestamp)}</td> {/* Use the format function */}
                  <td>{item.location}</td>
                  <td>{item.waterLevel}</td>
                  <td>{item.batteryLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={sendForPrediction}>Send Data for Prediction</button>
          {isError && <span>{error1}</span>}
        </div>
      </div>

      <h3>Prediction Results</h3>
<table>
  <thead>
    <tr>
      <th>Sensor ID</th>
      <th>Date and Quarter</th>
      <th>Location</th>
      <th>Water Level</th>
      <th>Battery Level</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {predictions.map((result, index) => {
      // Find the corresponding dataset entry based on sensorId
      const datasetEntry = dataset.find(item => item.sensorId === result['Sensor Id']);
      
      // Initialize formattedDate and quarter variables
      let formattedDate = 'Invalid Date';
      let quarter = '';

      if (datasetEntry) {
        const timestamp = new Date(datasetEntry.timestamp);  // Use timestamp from the dataset
        const isValidDate = !isNaN(timestamp.getTime()); // Check if timestamp is valid

        if (isValidDate) {
          const day = timestamp.getDate().toString().padStart(2, '0');
          const month = (timestamp.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
          const year = timestamp.getFullYear();

          // Determine quarter based on the hour
          const hour = timestamp.getHours();
          if (hour < 6) {
            quarter = 'Q1'; // 00:00 - 05:59
          } else if (hour < 12) {
            quarter = 'Q2'; // 06:00 - 11:59
          } else if (hour < 18) {
            quarter = 'Q3'; // 12:00 - 17:59
          } else {
            quarter = 'Q4'; // 18:00 - 23:59
          }

          // Format the date as dd-mm-yyyy
          formattedDate = `${day}-${month}-${year}`;
        }
      }

      return (
        <tr key={index}>
          <td>{result['Sensor Id']}</td>
          <td>{`${formattedDate} (${quarter})`}</td> {/* Use the formatted date and quarter here */}
          <td>{result.Location}</td>
          <td>{result['Water Level']}</td>
          <td>{result['Battery Level']}</td>
          <td className={result.Status !== "Normal" ? 'error-result-td' : 'result-td'}>{result.Status}</td>
        </tr>
      );
    })}
  </tbody>
</table>
    </div>
  );
}

export default App;
