const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/configs/database');
const initializeCronJobs = require('./src/utils/cronJobs');

dotenv.config();

const app = express();

connectDB();

initializeCronJobs();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/dashboard', require('./src/routes/adminDashboardRoutes'));
app.use('/api/teacher', require('./src/routes/teacherRoutes'));
app.use('/api/attendance', require('./src/routes/attendanceRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Attendance Management System API' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});