const express = require('express');
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const cors = require('cors');
const dotenv = require('dotenv');
const socketIo = require('socket.io');
const http = require('http');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/water-pump');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// MQTT Client Setup
const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883');

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe('sensors/#', (err) => {
    if (err) console.error('MQTT subscription error:', err);
  });
});

mqttClient.on('message', (topic, message) => {
  const data = JSON.parse(message.toString());
  // Emit sensor data to connected clients
  io.emit('sensorData', { topic, data });
});

// Routes
const authRoutes = require('./routes/auth');
const sensorRoutes = require('./routes/sensors');
const motorRoutes = require('./routes/motors');
const predictionRoutes = require('./routes/predictions');
const mlRoutes = require('./routes/mlRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/motors', motorRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/ml', mlRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
