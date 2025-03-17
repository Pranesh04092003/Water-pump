const express = require('express');
const router = express.Router();
const SensorData = require('../models/SensorData');

// Get latest sensor readings
router.get('/latest', async (req, res) => {
  try {
    const latestData = await SensorData.findOne()
      .sort({ timestamp: -1 });
    res.json(latestData);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get historical sensor data with pagination
router.get('/historical', async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 100 } = req.query;
    const query = {};
    
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const data = await SensorData.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
      
    const total = await SensorData.countDocuments(query);
    
    res.json({
      data,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get leak detection status
router.get('/leaks', async (req, res) => {
  try {
    const leaks = await SensorData.find({ leakDetected: true })
      .sort({ timestamp: -1 })
      .limit(10);
    res.json(leaks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get motor efficiency metrics
router.get('/efficiency', async (req, res) => {
  try {
    const latestData = await SensorData.findOne()
      .sort({ timestamp: -1 });
    
    if (!latestData) {
      return res.status(404).json({ error: 'No sensor data available' });
    }
    
    const efficiency = {
      powerConsumption: latestData.power.value,
      flowRate: latestData.flowRate.outlet,
      efficiency: (latestData.flowRate.outlet / latestData.power.value).toFixed(2)
    };
    
    res.json(efficiency);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
