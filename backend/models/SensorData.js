const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  flowRate: {
    inlet: Number,
    outlet: Number
  },
  voltage: {
    value: Number,
    unit: {
      type: String,
      default: 'V'
    }
  },
  current: {
    value: Number,
    unit: {
      type: String,
      default: 'A'
    }
  },
  power: {
    value: Number,
    unit: {
      type: String,
      default: 'W'
    }
  },
  temperature: {
    value: Number,
    unit: {
      type: String,
      default: '°C'
    }
  },
  leakDetected: {
    type: Boolean,
    default: false
  },
  motorStatus: {
    type: String,
    enum: ['running', 'stopped', 'fault'],
    default: 'stopped'
  }
});

// Index for efficient time-series queries
sensorDataSchema.index({ timestamp: -1 });

module.exports = mongoose.model('SensorData', sensorDataSchema);
