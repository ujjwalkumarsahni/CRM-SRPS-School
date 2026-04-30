const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['verification', 'reset'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => Date.now() + 24 * 60 * 60 * 1000
  }
});

module.exports = mongoose.model('Token', tokenSchema);