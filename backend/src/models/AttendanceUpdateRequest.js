// const mongoose = require('mongoose');

// const attendanceUpdateRequestSchema = new mongoose.Schema({
//   teacher: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   attendance: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Attendance',
//     required: true
//   },
//   requestedChanges: {
//     status: { type: String, enum: ['present', 'absent', 'half-day', 'leave'] },
//     workReport: { type: String },
//     inTime: { type: Date },
//     outTime: { type: Date }
//   },
//   reason: {
//     type: String,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'approved', 'rejected'],
//     default: 'pending'
//   },
//   adminRemarks: {
//     type: String,
//     default: null
//   },
//   reviewedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   reviewedAt: Date
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('AttendanceUpdateRequest', attendanceUpdateRequestSchema);


// models/AttendanceUpdateRequest.js
const mongoose = require('mongoose');

const attendanceUpdateRequestSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance',
    required: true
  },
  requestedChanges: {
    status: { type: String, enum: ['present', 'absent', 'half-day', 'leave'] },
    workReport: { type: String },
    inTime: { type: Date },
    outTime: { type: Date }
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminRemarks: {
    type: String,
    default: null
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('AttendanceUpdateRequest', attendanceUpdateRequestSchema);