import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import io from 'socket.io-client';

const Dashboard = () => {
  const [sensorData, setSensorData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const socket = io('http://localhost:5000');

    // Listen for real-time sensor updates
    socket.on('sensorData', (data) => {
      setSensorData(data);
      setHistoricalData(prev => [...prev, data].slice(-50)); // Keep last 50 readings
    });

    // Fetch initial data
    const fetchData = async () => {
      try {
        const [sensorResponse, historicalResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/sensors/latest'),
          axios.get('http://localhost:5000/api/sensors/historical?limit=50')
        ]);

        setSensorData(sensorResponse.data);
        setHistoricalData(historicalResponse.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch sensor data');
        setLoading(false);
      }
    };

    fetchData();

    return () => socket.disconnect();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Grid container spacing={3}>
      {/* Current Status */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            System Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle1">Flow Rate</Typography>
              <Typography variant="h4">
                {sensorData?.flowRate?.outlet || 0} L/min
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle1">Power Consumption</Typography>
              <Typography variant="h4">
                {sensorData?.power?.value || 0} W
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle1">Motor Status</Typography>
              <Typography variant="h4">
                {sensorData?.motorStatus || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle1">System Health</Typography>
              <Typography
                variant="h4"
                color={sensorData?.leakDetected ? 'error' : 'success'}
              >
                {sensorData?.leakDetected ? 'Leak Detected' : 'Normal'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Flow Rate Chart */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Flow Rate History
          </Typography>
          <ResponsiveContainer>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleString()}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="flowRate.outlet"
                name="Flow Rate"
                stroke="#8884d8"
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Power Consumption Chart */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Power Consumption History
          </Typography>
          <ResponsiveContainer>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleString()}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="power.value"
                name="Power"
                stroke="#82ca9d"
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
