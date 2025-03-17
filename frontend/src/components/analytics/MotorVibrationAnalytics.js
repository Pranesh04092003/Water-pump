import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Slider,
  Button,
  useTheme,
} from '@mui/material';
import {
  Info as InfoIcon,
  Favorite as HeartIcon,
  AcUnit as SnowflakeIcon,
  NotificationsActive as BellIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  LocalFireDepartment as FireIcon
} from '@mui/icons-material';
import Chart from 'react-apexcharts';
import { usePump } from '../../context/PumpContext';

const MotorVibrationAnalytics = () => {
  const theme = useTheme();
  const { pumpData, setPumpData } = usePump();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [vibrationLevel, setVibrationLevel] = useState(2000);
  const [vibrationHistory, setVibrationHistory] = useState([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const healthGaugeOptions = {
    chart: {
      type: 'radialBar',
      height: 200,
      fontFamily: theme.typography.fontFamily,
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '70%',
        },
        track: {
          background: theme.palette.grey[200],
        },
        dataLabels: {
          show: true,
          name: {
            show: true,
            fontSize: '16px',
            fontWeight: 600,
            offsetY: -10,
            color: theme.palette.text.primary,
          },
          value: {
            show: true,
            fontSize: '30px',
            fontWeight: 700,
            offsetY: 5,
            color: theme.palette.primary.main,
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: [theme.palette.success.main],
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: 'round'
    },
    labels: ['Health']
  };

  const statusDistributionOptions = {
    chart: {
      type: 'donut',
      height: '100%',
      fontFamily: theme.typography.fontFamily,
    },
    labels: ['Normal', 'Overheating', 'Failure'],
    colors: [theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main],
    legend: {
      position: 'bottom',
      offsetY: -5,
      labels: {
        colors: theme.palette.text.primary,
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Events',
              color: theme.palette.text.primary,
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => Math.round(val) + '%'
    },
    theme: {
      mode: theme.palette.mode
    }
  };

  const vibrationChartOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: 1000
        }
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2,
      colors: ['#2196f3']
    },
    markers: {
      size: 3,
      colors: ['#2196f3'],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 5
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false,
        style: {
          colors: '#666',
          fontSize: '10px'
        },
        datetimeFormatter: {
          year: 'yyyy',
          month: 'MMM \'yy',
          day: 'dd MMM',
          hour: 'HH:mm:ss'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      min: 0,
      max: 10000,
      tickAmount: 10,
      labels: {
        style: {
          colors: '#666',
          fontSize: '12px'
        },
        formatter: function(val) {
          return val.toFixed(0);
        }
      },
      axisTicks: {
        show: true,
        color: '#f1f1f1'
      }
    },
    grid: {
      borderColor: '#f1f1f1',
      strokeDashArray: 0,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100]
      }
    },
    tooltip: {
      x: {
        format: 'HH:mm:ss'
      },
      fixed: {
        enabled: false,
        position: 'topRight'
      }
    },
    dataLabels: {
      enabled: false
    }
  };

  const sendVibration = async () => {
    try {
      const now = new Date().getTime();
      
      // Only allow updates every 2 seconds to prevent flooding
      if (lastUpdateTime && now - lastUpdateTime < 2000) {
        return;
      }

      const response = await fetch('http://localhost:5000/api/predictions/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vibration: vibrationLevel })
      });
      const data = await response.json();
      
      // Add new vibration data point with current timestamp
      const newDataPoint = {
        time: now,
        value: vibrationLevel
      };
      
      setVibrationHistory(prev => {
        // Keep last 30 seconds of data
        const cutoffTime = now - (30 * 1000);
        const filteredHistory = prev.filter(point => point.time > cutoffTime);
        return [...filteredHistory, newDataPoint];
      });

      setLastUpdateTime(now);

      setPumpData(prevData => ({
        ...prevData,
        ...data
      }));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'text.primary';
    
    switch (status.toLowerCase()) {
      case 'normal':
        return 'success.main';
      case 'overheating':
        return 'warning.main';
      case 'failure':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };

  const cardStyle = {
    height: '100%',
    p: 2,
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[4],
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...cardStyle }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SettingsIcon sx={{ fontSize: 30, color: 'primary.main' }} />
          <Typography variant="h5" component="h1">Motor Vibration Analytics</Typography>
        </Box>
        <Typography color="text.secondary">{currentTime}</Typography>
      </Paper>

      {/* Status Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Current Status */}
        <Grid item xs={12} md={3}>
          <Paper sx={cardStyle}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Current Status</Typography>
              <InfoIcon color="primary" />
            </Box>
            <Typography variant="h4" color={getStatusColor(pumpData?.status)} sx={{ mb: 1 }}>
              {pumpData?.status || 'N/A'}
            </Typography>
            <Typography color="text.secondary">
              Vibration Level: {pumpData?.vibration || 0}
            </Typography>
          </Paper>
        </Grid>

        {/* Health Score */}
        <Grid item xs={12} md={3}>
          <Paper sx={cardStyle}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Health Score</Typography>
              <HeartIcon color="error" />
            </Box>
            <Chart
              options={healthGaugeOptions}
              series={[pumpData?.health_score || 0]}
              type="radialBar"
              height={150}
            />
          </Paper>
        </Grid>

        {/* Cooling Status */}
        <Grid item xs={12} md={3}>
          <Paper sx={cardStyle}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Cooling Status</Typography>
              <SnowflakeIcon color="primary" />
            </Box>
            <Typography variant="h4" color={pumpData?.cooling_status === 'Efficient' ? 'success.main' : 'error.main'} sx={{ mb: 1 }}>
              {pumpData?.cooling_status || 'N/A'}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Duration: {pumpData?.cooling_metrics?.duration || 0}min
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Reduction: {pumpData?.cooling_metrics?.reduction || 0}%
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* System Alerts */}
        <Grid item xs={12} md={3}>
          <Paper sx={cardStyle}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">System Alerts</Typography>
              <BellIcon color="warning" />
            </Box>
            <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
              {(pumpData?.history?.cooling || []).slice(-3).map((alert, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    p: 1.5, 
                    mb: 1, 
                    bgcolor: 'background.default', 
                    borderRadius: 1,
                    border: 1,
                    borderColor: alert?.status === 'Efficient' ? 'success.light' : 'error.light',
                  }}
                >
                  <Typography variant="body2" color={alert?.status === 'Efficient' ? 'success.main' : 'error.main'}>
                    {alert?.status || 'N/A'} Cooling
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Duration: {alert?.duration || 0}min | Reduction: {alert?.reduction || 0}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Vibration History */}
        <Grid item xs={12} md={6}>
          <Paper sx={cardStyle}>
            <Typography variant="h6" gutterBottom>Vibration History</Typography>
            <Box sx={{ height: 350, position: 'relative' }}>
              <Chart
                options={vibrationChartOptions}
                series={[{
                  name: 'Vibration',
                  data: vibrationHistory.map(v => [v.time, v.value])
                }]}
                type="area"
                height="100%"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Status Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={cardStyle}>
            <Typography variant="h6" gutterBottom>Status Distribution</Typography>
            <Chart
              options={statusDistributionOptions}
              series={[
                pumpData?.counts?.status?.Normal || 0,
                pumpData?.counts?.status?.Overheating || 0,
                pumpData?.counts?.status?.Failure || 0
              ]}
              type="donut"
              height={300}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={2.4}>
          <Paper sx={cardStyle}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Normal Events</Typography>
              <CheckIcon color="success" />
            </Box>
            <Typography variant="h4">{pumpData?.counts?.status?.Normal || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Paper sx={cardStyle}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Overheat Events</Typography>
              <WarningIcon color="warning" />
            </Box>
            <Typography variant="h4">{pumpData?.counts?.status?.Overheating || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Paper sx={cardStyle}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Failure Events</Typography>
              <ErrorIcon color="error" />
            </Box>
            <Typography variant="h4">{pumpData?.counts?.status?.Failure || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Paper sx={cardStyle}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Efficient Cooling</Typography>
              <SnowflakeIcon color="primary" />
            </Box>
            <Typography variant="h4">{pumpData?.counts?.cooling?.Efficient || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Paper sx={cardStyle}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Inefficient Cooling</Typography>
              <FireIcon color="error" />
            </Box>
            <Typography variant="h4">{pumpData?.counts?.cooling?.Inefficient || 0}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Control Panel */}
      <Paper sx={cardStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Control Panel</Typography>
          <SettingsIcon color="primary" />
        </Box>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography gutterBottom>Vibration Level</Typography>
            <Slider
              value={vibrationLevel}
              onChange={(e, newValue) => setVibrationLevel(newValue)}
              min={1000}
              max={10000}
              valueLabelDisplay="auto"
              sx={{
                color: theme.palette.primary.main,
                '& .MuiSlider-thumb': {
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: `0px 0px 0px 8px ${theme.palette.primary.main}20`,
                  },
                },
                '& .MuiSlider-rail': {
                  opacity: 0.5,
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" color="text.secondary">1000</Typography>
              <Typography variant="caption" color="text.secondary">{vibrationLevel}</Typography>
              <Typography variant="caption" color="text.secondary">10000</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              fullWidth
              onClick={sendVibration}
              size="large"
              sx={{
                height: '48px',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4],
                },
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              }}
            >
              Send Data
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default MotorVibrationAnalytics;
