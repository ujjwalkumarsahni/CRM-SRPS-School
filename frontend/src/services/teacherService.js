import api from './api';

const teacherService = {
  // POST /api/teacher/profile/complete
  completeProfile: async (formData) => {
    const response = await api.post('/teacher/profile/complete', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // GET /api/teacher/profile
  getMyProfile: async () => {
    const response = await api.get('/teacher/profile');
    return response.data;
  },

  // PUT /api/teacher/profile/update
  updateProfile: async (formData) => {
    const response = await api.put('/teacher/profile/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // GET /api/teacher/attendance
  getMyAttendance: async (month, year) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get('/teacher/attendance', { params });
    return response.data;
  },

  // POST /api/teacher/leaves
  createLeaveRequest: async (leaveData) => {
    const response = await api.post('/teacher/leaves', leaveData);
    return response.data;
  },

  // GET /api/teacher/leaves
  getMyLeaves: async () => {
    const response = await api.get('/teacher/leaves');
    return response.data;
  },

  // DELETE /api/teacher/leaves/:leaveId - Cancel pending leave
  cancelLeaveRequest: async (leaveId) => {
    const response = await api.delete(`/teacher/leaves/${leaveId}`);
    return response.data;
  }
};

export default teacherService;