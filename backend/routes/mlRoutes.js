const express = require('express');
const router = express.Router();
const axios = require('axios');

const ML_SERVICE_URL = 'http://localhost:5051';

// Usage Pattern Prediction
router.post('/predict-usage', async (req, res) => {
  try {
    const { hours } = req.body;
    console.log('Received usage pattern request:', { hours });
    
    // Convert hours to appropriate features
    const currentDate = new Date();
    const data = {
      Hour: currentDate.getHours(),
      Day: currentDate.getDay(),
      Vibration_Level: 2000, // Default value, can be adjusted
      Usage_Frequency: hours // Using input hours as frequency
    };

    console.log('Sending request to ML service:', `${ML_SERVICE_URL}/predict_usage`, data);
    const response = await axios.post(`${ML_SERVICE_URL}/predict_usage`, data);
    console.log('ML service response:', response.data);
    
    res.json(response.data);
  } catch (error) {
    console.error('Usage Pattern Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({ error: 'ML service is not available' });
    } else {
      res.status(500).json({ error: 'Error predicting usage pattern' });
    }
  }
});

// Load Prediction
router.post('/predict-load', async (req, res) => {
  try {
    const { load } = req.body;
    console.log('Received load prediction request:', { load });

    const data = {
      Vibration_Level: 2000, // Default value, can be adjusted
      Motor_Current: load, // Using input load as current
      Power_Consumption: load * 0.746 // Converting to power consumption (kW to HP)
    };

    console.log('Sending request to ML service:', `${ML_SERVICE_URL}/predict_load`, data);
    const response = await axios.post(`${ML_SERVICE_URL}/predict_load`, data);
    console.log('ML service response:', response.data);

    res.json(response.data);
  } catch (error) {
    console.error('Load Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({ error: 'ML service is not available' });
    } else {
      res.status(500).json({ error: 'Error predicting load' });
    }
  }
});

// Speed Optimization
router.post('/predict-speed', async (req, res) => {
  try {
    const { speed } = req.body;
    console.log('Received speed optimization request:', { speed });

    const data = {
      Required_Flow_Rate: speed * 0.1, // Converting speed to flow rate
      System_Pressure: 50, // Default system pressure
      Power_Consumption: speed * 0.02 // Estimated power consumption based on speed
    };

    console.log('Sending request to ML service:', `${ML_SERVICE_URL}/predict_speed`, data);
    const response = await axios.post(`${ML_SERVICE_URL}/predict_speed`, data);
    console.log('ML service response:', response.data);

    res.json(response.data);
  } catch (error) {
    console.error('Speed Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({ error: 'ML service is not available' });
    } else {
      res.status(500).json({ error: 'Error predicting optimal speed' });
    }
  }
});

// Start/Stop Analysis
router.post('/analyze-start-stop', async (req, res) => {
  try {
    const { timestamp } = req.body;
    console.log('Received start/stop analysis request:', { timestamp });

    const data = {
      Vibration_Change: 30 + Math.random() * 40 // Simulated vibration change
    };

    console.log('Sending request to ML service:', `${ML_SERVICE_URL}/analyze_start_stop`, data);
    const response = await axios.post(`${ML_SERVICE_URL}/analyze_start_stop`, data);
    console.log('ML service response:', response.data);

    res.json({
      Pattern: response.data.Start_Stop_Status,
      Recommendations: response.data.Recommendation
    });
  } catch (error) {
    console.error('Start/Stop Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({ error: 'ML service is not available' });
    } else {
      res.status(500).json({ error: 'Error analyzing start/stop pattern' });
    }
  }
});

module.exports = router;
