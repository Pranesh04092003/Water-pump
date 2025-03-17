import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import MotorControl from './components/motor/MotorControl';
import SensorMonitoring from './components/sensor/SensorMonitoring';
import MotorVibrationAnalytics from './components/analytics/MotorVibrationAnalytics';
import PumpMonitoring from './components/monitoring/PumpMonitoring';
import Layout from './components/layout/Layout';

// Context
import { AuthProvider } from './context/AuthContext';
import { PumpProvider } from './context/PumpContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#10b981',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#ef4444',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <PumpProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="motor-control" element={<MotorControl />} />
                <Route path="sensor-monitoring" element={<SensorMonitoring />} />
                <Route path="motor-analytics" element={<MotorVibrationAnalytics />} />
                <Route path="pump-monitoring" element={<PumpMonitoring />} />
              </Route>
            </Routes>
          </Router>
        </PumpProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
