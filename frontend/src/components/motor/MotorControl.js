import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Slider,
  Box,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';

const MotorControl = () => {
  const [motorStatus, setMotorStatus] = useState(null);
  const [speed, setSpeed] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [faults, setFaults] = useState([]);

  useEffect(() => {
    fetchMotorStatus();
    fetchFaultHistory();
    
    // Poll motor status every 5 seconds
    const interval = setInterval(() => {
      fetchMotorStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchMotorStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/motors/status');
      setMotorStatus(response.data);
      setSpeed(response.data.speed);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch motor status');
      setLoading(false);
    }
  };

  const fetchFaultHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/motors/faults');
      setFaults(response.data);
    } catch (err) {
      console.error('Failed to fetch fault history:', err);
    }
  };

  const handleStart = async () => {
    try {
      await axios.post('http://localhost:5000/api/motors/start');
      fetchMotorStatus();
    } catch (err) {
      setError('Failed to start motor');
    }
  };

  const handleStop = async () => {
    try {
      await axios.post('http://localhost:5000/api/motors/stop');
      fetchMotorStatus();
    } catch (err) {
      setError('Failed to stop motor');
    }
  };

  const handleSpeedChange = async (event, newValue) => {
    setSpeed(newValue);
    try {
      await axios.post('http://localhost:5000/api/motors/speed', { speed: newValue });
      fetchMotorStatus();
    } catch (err) {
      setError('Failed to adjust motor speed');
    }
  };

  // Custom circular progress component
  const CircularProgressWithLabel = ({ value, size = 200 }) => {
    return (
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          width: size,
          height: size
        }}
      >
        <CircularProgress
          variant="determinate"
          value={value}
          size={size}
          thickness={4}
          sx={{
            color: value > 80 ? '#4caf50' : value > 40 ? '#ff9800' : '#f44336',
            transform: 'rotate(-90deg)'
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h4" component="div" color="text.primary">
            {`${Math.round(value)}%`}
          </Typography>
          <Typography variant="caption" component="div" color="text.secondary">
            Efficiency
          </Typography>
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {error && (
        <Grid item xs={12}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Grid>
      )}

      {/* Motor Status Panel */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Motor Status
          </Typography>
          <Box sx={{ position: 'relative', mt: 2, mb: 4 }}>
            <CircularProgressWithLabel value={motorStatus?.efficiency || 0} />
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" align="left">
                Voltage: {motorStatus?.voltage?.toFixed(1) || '0.0'} V
              </Typography>
              <Typography variant="body1" align="left">
                Current: {motorStatus?.current?.toFixed(1) || '0.0'} A
              </Typography>
              <Typography variant="body1" align="left">
                Temperature: {motorStatus?.temperature?.toFixed(1) || '0.0'}°C
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<StartIcon />}
              onClick={handleStart}
              disabled={motorStatus?.isRunning}
            >
              Start Motor
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={handleStop}
              disabled={!motorStatus?.isRunning}
            >
              Stop Motor
            </Button>
          </Box>
        </Paper>
      </Grid>

      {/* Speed Control and Fault History */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Speed Control
          </Typography>
          <Box sx={{ mb: 4 }}>
            <Slider
              value={speed}
              onChange={handleSpeedChange}
              aria-labelledby="speed-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={0}
              max={100}
              disabled={!motorStatus?.isRunning}
            />
          </Box>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Fault History
          </Typography>
          <List>
            {faults.length === 0 ? (
              <ListItem>
                <ListItemText primary="No faults recorded" />
              </ListItem>
            ) : (
              faults.map((fault, index) => (
                <React.Fragment key={fault.id}>
                  <ListItem>
                    <ListItemText
                      primary={fault.type}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {new Date(fault.timestamp).toLocaleString()}
                          </Typography>
                          <br />
                          {fault.description}
                        </>
                      }
                      primaryTypographyProps={{
                        color: 'error',
                        startIcon: <WarningIcon />
                      }}
                    />
                  </ListItem>
                  {index < faults.length - 1 && <Divider />}
                </React.Fragment>
              ))
            )}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default MotorControl;
