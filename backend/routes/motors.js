const express = require('express');
const router = express.Router();
const mqtt = require('mqtt');

const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883');

// Store latest motor readings
let latestMotorData = {
  voltage: 0,
  current: 0,
  temperature: 0,
  efficiency: 0,
  isRunning: false,
  speed: 0,
  runtime: 0,
  faultStatus: null
};

// Subscribe to motor sensor topics
mqttClient.on('connect', () => {
  mqttClient.subscribe('motor/voltage', (err) => {
    if (err) console.error('MQTT subscription error:', err);
  });
  mqttClient.subscribe('motor/current', (err) => {
    if (err) console.error('MQTT subscription error:', err);
  });
  mqttClient.subscribe('motor/temperature', (err) => {
    if (err) console.error('MQTT subscription error:', err);
  });
});

// Handle incoming MQTT messages
mqttClient.on('message', (topic, message) => {
  const value = parseFloat(message.toString());
  switch (topic) {
    case 'motor/voltage':
      latestMotorData.voltage = value;
      break;
    case 'motor/current':
      latestMotorData.current = value;
      break;
    case 'motor/temperature':
      latestMotorData.temperature = value;
      break;
  }
  // Calculate efficiency based on current operating parameters
  latestMotorData.efficiency = calculateEfficiency(latestMotorData);
});

// Calculate motor efficiency
function calculateEfficiency(data) {
  // This is a simplified efficiency calculation
  // In a real system, this would be more complex based on motor specifications
  const nominalVoltage = 220;
  const nominalCurrent = 16;
  const maxTemp = 80;
  
  const voltageEfficiency = (1 - Math.abs(data.voltage - nominalVoltage) / nominalVoltage) * 100;
  const currentEfficiency = (1 - Math.abs(data.current - nominalCurrent) / nominalCurrent) * 100;
  const tempEfficiency = (1 - data.temperature / maxTemp) * 100;
  
  return (voltageEfficiency + currentEfficiency + tempEfficiency) / 3;
}

// Get motor status
router.get('/status', async (req, res) => {
  try {
    res.json(latestMotorData);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Start motor
router.post('/start', async (req, res) => {
  try {
    latestMotorData.isRunning = true;
    mqttClient.publish('motor/command', JSON.stringify({ action: 'start' }));
    res.json({ message: 'Start command sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Stop motor
router.post('/stop', async (req, res) => {
  try {
    latestMotorData.isRunning = false;
    mqttClient.publish('motor/command', JSON.stringify({ action: 'stop' }));
    res.json({ message: 'Stop command sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Set motor speed
router.post('/speed', async (req, res) => {
  try {
    const { speed } = req.body;
    if (speed < 0 || speed > 100) {
      return res.status(400).json({ error: 'Speed must be between 0 and 100' });
    }
    
    latestMotorData.speed = speed;
    mqttClient.publish('motor/command', JSON.stringify({ action: 'setSpeed', speed }));
    res.json({ message: 'Speed command sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get fault history
router.get('/faults', async (req, res) => {
  try {
    // This would typically come from your database
    const faults = [
      {
        id: 1,
        timestamp: new Date(),
        type: 'overcurrent',
        description: 'Motor current exceeded safe limits'
      }
    ];
    res.json(faults);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
