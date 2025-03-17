import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  PowerSettingsNew as PowerIcon,
} from '@mui/icons-material';
import Chart from 'chart.js/auto';
import axios from 'axios';

const PumpMonitoring = () => {
  const [formData, setFormData] = useState({
    hours: '',
    load: '',
    speed: ''
  });
  const [usageData, setUsageData] = useState(null);
  const [loadData, setLoadData] = useState(null);
  const [speedData, setSpeedData] = useState(null);
  const [startStopData, setStartStopData] = useState(null);
  const [motorStatus, setMotorStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Chart refs
  const usageChartRef = useRef(null);
  const loadChartRef = useRef(null);
  const speedChartRef = useRef(null);
  const cycleChartRef = useRef(null);
  const chartInstances = useRef({});

  useEffect(() => {
    initializeCharts();
    fetchMotorStatus();
    
    // Poll motor status every 5 seconds
    const interval = setInterval(() => {
      fetchMotorStatus();
    }, 5000);

    return () => {
      clearInterval(interval);
      Object.values(chartInstances.current).forEach(chart => chart?.destroy());
    };
  }, []);

  const fetchMotorStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/motors/status');
      setMotorStatus(response.data);
      if (response.data) {
        updateStartStopChart(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch motor status:', err);
    }
  };

  const initializeCharts = () => {
    // Usage Pattern Chart
    if (usageChartRef.current) {
      chartInstances.current.usage = new Chart(usageChartRef.current, {
        type: 'line',
        data: {
          labels: Array.from({length: 24}, (_, i) => `${i}:00`),
          datasets: [{
            label: 'Usage Pattern',
            data: Array.from({length: 24}, () => null),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        }
      });
    }

    // Load Pattern Chart
    if (loadChartRef.current) {
      chartInstances.current.load = new Chart(loadChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Light Load', 'Normal Load', 'Peak Load'],
          datasets: [{
            data: [0, 0, 0],
            backgroundColor: [
              'rgb(75, 192, 192)',
              'rgb(255, 205, 86)',
              'rgb(255, 99, 132)'
            ]
          }]
        }
      });
    }

    // Speed Optimization Chart
    if (speedChartRef.current) {
      chartInstances.current.speed = new Chart(speedChartRef.current, {
        type: 'line',
        data: {
          labels: ['Current', 'Optimal'],
          datasets: [{
            label: 'Speed (RPM)',
            data: [0, 0],
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(75, 192, 192)'
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(75, 192, 192)'
            ]
          }]
        }
      });
    }

    // Start/Stop Chart
    if (cycleChartRef.current) {
      chartInstances.current.cycle = new Chart(cycleChartRef.current, {
        type: 'bar',
        data: {
          labels: ['Running', 'Stopped'],
          datasets: [{
            label: 'Motor Status',
            data: [0, 0],
            backgroundColor: [
              'rgb(75, 192, 192)',
              'rgb(255, 99, 132)'
            ]
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Status (%)'
              }
            }
          }
        }
      });
    }
  };

  const updateStartStopChart = (status) => {
    const chart = chartInstances.current.cycle;
    if (!chart) return;

    // Update the chart based on motor status
    chart.data.datasets[0].data = [
      status.isRunning ? 100 : 0,  // Running percentage
      status.isRunning ? 0 : 100   // Stopped percentage
    ];
    chart.update();
  };

  const updateChart = (type, data) => {
    const chart = chartInstances.current[type];
    if (!chart) return;

    switch(type) {
      case 'usage':
        const hour = new Date().getHours();
        const newData = [...chart.data.datasets[0].data];
        newData[hour] = data.Confidence;
        chart.data.datasets[0].data = newData;
        break;
      case 'load':
        let loadDistribution = [0, 0, 0];
        if (data.Load_Type === 'Light Load') loadDistribution = [1, 0, 0];
        else if (data.Load_Type === 'Normal Load') loadDistribution = [0, 1, 0];
        else loadDistribution = [0, 0, 1];
        chart.data.datasets[0].data = loadDistribution;
        break;
      case 'speed':
        chart.data.datasets[0].data = [Number(formData.speed), data.Optimal_Speed];
        break;
    }
    chart.update();
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const analyzeData = async (endpoint, data, setStateFunc, chartType) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/ml/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (response.ok) {
        setStateFunc(result);
        updateChart(chartType, result);
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (error) {
      setError('Failed to analyze data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (type) => async (e) => {
    e.preventDefault();
    switch(type) {
      case 'usage':
        if (formData.hours) {
          await analyzeData('predict-usage', { hours: Number(formData.hours) }, setUsageData, 'usage');
        }
        break;
      case 'load':
        if (formData.load) {
          await analyzeData('predict-load', { load: Number(formData.load) }, setLoadData, 'load');
        }
        break;
      case 'speed':
        if (formData.speed) {
          await analyzeData('predict-speed', { speed: Number(formData.speed) }, setSpeedData, 'speed');
        }
        break;
      case 'startStop':
        if (motorStatus) {
          const startStopResult = {
            Pattern: motorStatus.isRunning ? 'Running' : 'Stopped',
            Recommendations: getMotorRecommendations(motorStatus)
          };
          setStartStopData(startStopResult);
        }
        break;
      default:
        break;
    }
  };

  const getMotorRecommendations = (status) => {
    const recommendations = [];
    
    if (status.temperature > 70) {
      recommendations.push('High temperature detected. Consider reducing load or checking cooling system.');
    }
    
    if (status.current > 15) {
      recommendations.push('High current draw. Check for mechanical issues or excessive load.');
    }
    
    if (status.efficiency < 60) {
      recommendations.push('Low efficiency. Consider maintenance check or speed optimization.');
    }

    return recommendations.length > 0 ? recommendations.join(' ') : 'Normal operation. No action needed.';
  };

  const cardStyle = {
    p: 3,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: (theme) => theme.shadows[4],
      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    },
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Advanced Pump Monitoring
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Usage Pattern Analysis */}
        <Grid item xs={12} md={6}>
          <Paper sx={cardStyle} component="form" onSubmit={handleSubmit('usage')}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TimelineIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Usage Pattern Analysis</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Time Period (hours)"
                type="number"
                value={formData.hours}
                onChange={handleInputChange('hours')}
                InputProps={{ inputProps: { min: 1 } }}
              />
              <Button
                variant="contained"
                type="submit"
                sx={{ mt: 2 }}
                disabled={!formData.hours || loading}
              >
                Analyze Usage
              </Button>
            </Box>
            <Box sx={{ height: 200, mb: 2 }}>
              <canvas ref={usageChartRef}></canvas>
            </Box>
            {loading ? (
              <CircularProgress />
            ) : usageData && (
              <Box>
                <Typography variant="subtitle1">
                  Pattern: {usageData.Usage_Pattern}
                </Typography>
                <Typography variant="subtitle1">
                  Confidence: {(usageData.Confidence * 100).toFixed(2)}%
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Load Analysis */}
        <Grid item xs={12} md={6}>
          <Paper sx={cardStyle} component="form" onSubmit={handleSubmit('load')}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUpIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Load Analysis</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Current Load (kW)"
                type="number"
                value={formData.load}
                onChange={handleInputChange('load')}
                InputProps={{ inputProps: { min: 0 } }}
              />
              <Button
                variant="contained"
                type="submit"
                sx={{ mt: 2 }}
                disabled={!formData.load || loading}
              >
                Analyze Load
              </Button>
            </Box>
            <Box sx={{ height: 200, mb: 2 }}>
              <canvas ref={loadChartRef}></canvas>
            </Box>
            {loading ? (
              <CircularProgress />
            ) : loadData && (
              <Box>
                <Typography variant="subtitle1">
                  Load Type: {loadData.Load_Type}
                </Typography>
                <Typography variant="subtitle1">
                  Confidence: {(loadData.Confidence * 100).toFixed(2)}%
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Speed Optimization */}
        <Grid item xs={12} md={6}>
          <Paper sx={cardStyle} component="form" onSubmit={handleSubmit('speed')}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SpeedIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Speed Optimization</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Current Speed (RPM)"
                type="number"
                value={formData.speed}
                onChange={handleInputChange('speed')}
                InputProps={{ inputProps: { min: 0 } }}
              />
              <Button
                variant="contained"
                type="submit"
                sx={{ mt: 2 }}
                disabled={!formData.speed || loading}
              >
                Optimize Speed
              </Button>
            </Box>
            <Box sx={{ height: 200, mb: 2 }}>
              <canvas ref={speedChartRef}></canvas>
            </Box>
            {loading ? (
              <CircularProgress />
            ) : speedData && (
              <Box>
                <Typography variant="subtitle1">
                  Optimal Speed: {speedData.Optimal_Speed} RPM
                </Typography>
                <Typography variant="subtitle1">
                  Efficiency Gain: {((Number(formData.speed) - speedData.Optimal_Speed) / Number(formData.speed) * 100).toFixed(2)}%
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Start/Stop Analysis */}
        <Grid item xs={12} md={6}>
          <Paper sx={cardStyle}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PowerIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Start/Stop Analysis</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                onClick={handleSubmit('startStop')}
                disabled={loading || !motorStatus}
              >
                Analyze Pattern
              </Button>
            </Box>
            <Box sx={{ height: 200, mb: 2 }}>
              <canvas ref={cycleChartRef}></canvas>
            </Box>
            {loading ? (
              <CircularProgress />
            ) : startStopData && (
              <Box>
                <Typography variant="subtitle1">
                  Status: {startStopData.Pattern}
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                  Recommendations: {startStopData.Recommendations}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PumpMonitoring;
