import api from './api';

const attendanceService = {
  // Teacher APIs
  markInTime: async (attendanceData) => {
    const response = await api.post('/attendance/in', attendanceData);
    return response.data;
  },
  markOutTime: async (attendanceData) => {
    const response = await api.post('/attendance/out', attendanceData);
    return response.data;
  },
  getTodayAttendance: async () => {
    const response = await api.get('/attendance/today');
    return response.data;
  },
  getMyMonthlyAttendance: async (month, year) => {
    const response = await api.get('/attendance/my-monthly', { params: { month, year } });
    return response.data;
  },
  
  // Admin APIs
  getAllTeachersForAttendance: async () => {
    const response = await api.get('/attendance/teachers');
    return response.data;
  },
  getTeacherMonthlyAttendance: async (teacherId, month, year) => {
    const response = await api.get(`/attendance/monthly/${teacherId}`, { params: { month, year } });
    return response.data;
  },
  getAttendanceById: async (attendanceId) => {
    const response = await api.get(`/attendance/${attendanceId}`);
    return response.data;
  },
  updateAttendanceByAdmin: async (attendanceId, updateData) => {
    const response = await api.put(`/attendance/update/${attendanceId}`, updateData);
    return response.data;
  },
  createAttendanceByAdmin: async (attendanceData) => {
    const response = await api.post('/attendance/create', attendanceData);
    return response.data;
  },
  deleteAttendance: async (attendanceId) => {
    const response = await api.delete(`/attendance/${attendanceId}`);
    return response.data;
  }
};

export default attendanceService;