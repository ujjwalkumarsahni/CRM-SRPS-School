const mongoose = require('mongoose');

const teacherProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dob: {
    type: Date,
    required: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  mobileNumber: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/
  },
  address: {
    type: String,
    required: true
  },
  highestQualification: {
    type: String,
    required: true
  },
  photo: {
    url: String,
    publicId: String
  },
  documents: {
    aadharCard: {
      url: String,
      publicId: String
    },
    panCard: {
      url: String,
      publicId: String
    },
    qualificationCertificate: {
      url: String,
      publicId: String
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TeacherProfile', teacherProfileSchema);