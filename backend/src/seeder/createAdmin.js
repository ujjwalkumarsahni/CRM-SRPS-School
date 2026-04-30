const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect('mongodb+srv://ujjwalkumar0514_db_user:KVqLqoKy0yv7b3bm@cluster0.1xfpsfq.mongodb.net/attendanceDB');
    
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'ujjwalkumar0514@gmail.com',
        password: 'Admin@123',
        designation: 'Principal',
        role: 'admin',
        isVerified: true,
        profileCompleted: true
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
    
    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();