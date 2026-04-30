// models/AdminProfile.js
const mongoose = require('mongoose');

const adminProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  phone: {
    type: String,
    match: /^[0-9]{10}$/
  },
  address: {
    type: String
  },
  photo: {
    url: String,
    publicId: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AdminProfile', adminProfileSchema);