const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/predict', async (req, res) => {
  try {
    const response = await axios.post('http://localhost:5050/predict', req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Error communicating with ML service' });
  }
});


module.exports = router;
