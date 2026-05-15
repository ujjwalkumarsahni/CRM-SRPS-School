// models/Holiday.js
const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  isRecurring: {
    type: Boolean,
    default: false // For holidays like Republic Day, Independence Day
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster date queries
holidaySchema.index({ isRecurring: 1, isActive: 1 });

module.exports = mongoose.model('Holiday', holidaySchema);