// // adminService.js
// import api from './api';

// const adminService = {
//   // POST /api/admin/teachers
//   createTeacher: async (teacherData) => {
//     const response = await api.post('/admin/teachers', teacherData);
//     return response.data;
//   },

//   // PUT /api/admin/teachers/:id/verify
//   verifyTeacher: async (teacherId) => {
//     const response = await api.put(`/admin/teachers/${teacherId}/verify`);
//     return response.data;
//   },

//   // GET /api/admin/teachers
//   getAllTeachers: async () => {
//     const response = await api.get('/admin/teachers');
//     return response.data;
//   },

//   // PUT /api/admin/attendance/:attendanceId
//   modifyTeacherAttendance: async (attendanceId, attendanceData) => {
//     const response = await api.put(`/admin/attendance/${attendanceId}`, attendanceData);
//     return response.data;
//   },

//   // GET /api/admin/leaves
//   getAllLeaveRequests: async () => {
//     const response = await api.get('/admin/leaves');
//     return response.data;
//   },

//   // PUT /api/admin/leaves/:id
//   processLeaveRequest: async (leaveId, processData) => {
//     const response = await api.put(`/admin/leaves/${leaveId}`, processData);
//     return response.data;
//   }
// };

// export default adminService;


// adminService.js
import api from './api';

const adminService = {
  createTeacher: async (teacherData) => {
    const response = await api.post('/admin/teachers', teacherData);
    return response.data;
  },

  verifyTeacher: async (teacherId) => {
    const response = await api.put(`/admin/teachers/${teacherId}/verify`);
    return response.data;
  },

  rejectTeacher: async (teacherId, reason) => {
    const response = await api.put(`/admin/teachers/${teacherId}/reject`, { rejectionReason: reason });
    return response.data;
  },

  deactivateTeacher: async (teacherId, reason) => {
    const response = await api.put(`/admin/teachers/${teacherId}/deactivate`, { reason });
    return response.data;
  },

  activateTeacher: async (teacherId) => {
    const response = await api.put(`/admin/teachers/${teacherId}/activate`);
    return response.data;
  },

  getAllTeachers: async () => {
    const response = await api.get('/admin/teachers');
    return response.data;
  },

  getTeacherById: async (teacherId) => {
    const response = await api.get(`/admin/teachers/${teacherId}`);
    return response.data;
  },

  modifyTeacherAttendance: async (attendanceId, attendanceData) => {
    const response = await api.put(`/admin/attendance/${attendanceId}`, attendanceData);
    return response.data;
  },

  getAllLeaveRequests: async () => {
    const response = await api.get('/admin/leaves');
    return response.data;
  },

  processLeaveRequest: async (leaveId, processData) => {
    const response = await api.put(`/admin/leaves/${leaveId}`, processData);
    return response.data;
  },

  // Admin Profile Management
  getAdminProfile: async () => {
    const response = await api.get('/admin/profile');
    return response.data;
  },

  updateAdminProfile: async (formData) => {
    const response = await api.put('/admin/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.post('/admin/change-password', passwordData);
    return response.data;
  }
};

export default adminService;