import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
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
import { usePump } from '../../context/PumpContext';

const SensorMonitoring = () => {
  const { pumpData } = usePump();
  const [sensorData, setSensorData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('sensorData', (data) => {
      setSensorData(data);
      setHistoricalData(prev => [...prev, data].slice(-100));
    });

    const fetchData = async () => {
      try {
        const [sensorResponse, historicalResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/sensors/latest'),
          axios.get('http://localhost:5000/api/sensors/historical?limit=100')
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
      {/* Pump Health Status */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Pump Health Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle1">Vibration</Typography>
              <Typography variant="h4">
                {pumpData?.vibration || 0} Hz
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle1">Status</Typography>
              <Typography variant="h4" color={pumpData?.status === 'Normal' ? 'success.main' : 'error.main'}>
                {pumpData?.status || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle1">Cooling Status</Typography>
              <Typography variant="h4" color={pumpData?.cooling_status === 'Efficient' ? 'success.main' : 'error.main'}>
                {pumpData?.cooling_status || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle1">Health Score</Typography>
              <Typography variant="h4" color={pumpData?.health_score >= 70 ? 'success.main' : 'error.main'}>
                {pumpData?.health_score || 0}%
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Real-time Sensor Values */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Real-time Sensor Values
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle1">Inlet Flow Rate</Typography>
              <Typography variant="h4">
                {sensorData?.flowRate?.inlet || 0} L/min
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle1">Outlet Flow Rate</Typography>
              <Typography variant="h4">
                {sensorData?.flowRate?.outlet || 0} L/min
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle1">Voltage</Typography>
              <Typography variant="h4">
                {sensorData?.voltage?.value || 0} {sensorData?.voltage?.unit}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle1">Current</Typography>
              <Typography variant="h4">
                {sensorData?.current?.value || 0} {sensorData?.current?.unit}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Flow Rate Comparison Chart */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Flow Rate Comparison
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
                dataKey="flowRate.inlet"
                name="Inlet Flow"
                stroke="#8884d8"
              />
              <Line
                type="monotone"
                dataKey="flowRate.outlet"
                name="Outlet Flow"
                stroke="#82ca9d"
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Sensor Data Table */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Sensor Data History
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Inlet Flow (L/min)</TableCell>
                  <TableCell>Outlet Flow (L/min)</TableCell>
                  <TableCell>Voltage (V)</TableCell>
                  <TableCell>Current (A)</TableCell>
                  <TableCell>Power (W)</TableCell>
                  <TableCell>Temperature (°C)</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historicalData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(row.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{row.flowRate?.inlet}</TableCell>
                      <TableCell>{row.flowRate?.outlet}</TableCell>
                      <TableCell>{row.voltage?.value}</TableCell>
                      <TableCell>{row.current?.value}</TableCell>
                      <TableCell>{row.power?.value}</TableCell>
                      <TableCell>{row.temperature?.value}</TableCell>
                      <TableCell>
                        <Typography
                          color={row.leakDetected ? 'error' : 'success'}
                        >
                          {row.leakDetected ? 'Leak Detected' : 'Normal'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={historicalData.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default SensorMonitoring;
