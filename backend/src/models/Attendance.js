const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'half-day', 'leave'],
    default: 'absent'
  },
  inTime: {
    time: Date,
    location: {
      lat: Number,
      lng: Number,
      address: String
    }
  },
  outTime: {
    time: Date,
    location: {
      lat: Number,
      lng: Number,
      address: String
    }
  },
  workReport: {
    type: String,
    trim: true
  },
  isHoliday: {
    type: Boolean,
    default: false
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

attendanceSchema.index({ teacher: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);