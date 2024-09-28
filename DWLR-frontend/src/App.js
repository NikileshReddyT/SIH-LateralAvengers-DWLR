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
  let error1 = "Some error occurred";

  // Load dataset from local storage on component mount
  useEffect(() => {
    const savedDataset = localStorage.getItem('dataset');
    if (savedDataset) {
      try {
        setDataset(JSON.parse(savedDataset));  // Parse and load dataset if it exists
      } catch (error) {
        console.error("Failed to load dataset from localStorage", error);
      }
    }
  }, []);

  // Save dataset to local storage whenever dataset changes
  useEffect(() => {
    if (dataset.length > 0) {
      localStorage.setItem('dataset', JSON.stringify(dataset));  // Save to local storage
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
                <th>Date</th>
                <th>Location</th>
                <th>Water Level</th>
                <th>Battery Level</th>
              </tr>
            </thead>
            <tbody>
              {dataset.map((item, index) => (
                <tr key={index}>
                  <td>{item.sensorId}</td>
                  <td>{item.timestamp}</td>
                  <td>{item.location}</td>
                  <td>{item.waterLevel}</td>
                  <td>{item.batteryLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={sendForPrediction}>Send Data for Prediction</button>
          {isError ? <span>{error1}</span> : <span></span>}
        </div>
      </div>

      <h3>Prediction Results</h3>
      <table>
        <thead>
          <tr>
            <th>Sensor ID</th>
            <th>Quarter</th>
            <th>Location</th>
            <th>Water Level</th>
            <th>Battery Level</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((result, index) => (
            <tr key={index}>
              <td>{result['Sensor Id']}</td>
              <td>{result.Quarter}</td>
              <td>{result.Location}</td>
              <td>{result['Water Level']}</td>
              <td>{result['Battery Level']}</td>
              <td className='result-td'>{result.Status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
