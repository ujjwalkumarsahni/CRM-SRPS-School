// import api from "./api";

// const attendanceService = {
//   // Teacher APIs
//   markInTime: async (attendanceData) => {
//     const response = await api.post("/attendance/in", attendanceData);
//     return response.data;
//   },
//   markOutTime: async (attendanceData) => {
//     const response = await api.post("/attendance/out", attendanceData);
//     return response.data;
//   },
//   getTodayAttendance: async () => {
//     const response = await api.get("/attendance/today");
//     return response.data;
//   },
//   getMyMonthlyAttendance: async (month, year) => {
//     const response = await api.get("/attendance/my-monthly", {
//       params: { month, year },
//     });
//     return response.data;
//   },
//   requestAttendanceUpdate: async (requestData) => {
//     const response = await api.post("/attendance/request-update", requestData);
//     return response.data;
//   },

//   // Admin APIs
//   getAllTeachersForAttendance: async () => {
//     const response = await api.get("/attendance/teachers");
//     return response.data;
//   },
//   getTeacherMonthlyAttendance: async (teacherId, month, year) => {
//     const response = await api.get(`/attendance/monthly/${teacherId}`, {
//       params: { month, year },
//     });
//     return response.data;
//   },
//   getAttendanceById: async (attendanceId) => {
//     const response = await api.get(`/attendance/${attendanceId}`);
//     return response.data;
//   },
//   updateAttendanceByAdmin: async (attendanceId, updateData) => {
//     const response = await api.put(
//       `/attendance/update/${attendanceId}`,
//       updateData,
//     );
//     return response.data;
//   },
//   createAttendanceByAdmin: async (attendanceData) => {
//     const response = await api.post("/attendance/create", attendanceData);
//     return response.data;
//   },
//   deleteAttendance: async (attendanceId) => {
//     const response = await api.delete(`/attendance/${attendanceId}`);
//     return response.data;
//   },

//   // Add these to attendanceService.js
//   // Admin APIs for update requests
//   getPendingUpdateRequests: async () => {
//     const response = await api.get("/attendance/update-requests/pending");
//     return response.data;
//   },
//   getAllUpdateRequests: async (status, teacherId) => {
//     const params = {};
//     if (status) params.status = status;
//     if (teacherId) params.teacherId = teacherId;
//     const response = await api.get("/attendance/update-requests/all", {
//       params,
//     });
//     return response.data;
//   },
//   approveUpdateRequest: async (requestId, adminRemarks) => {
//     const response = await api.put(
//       `/attendance/update-requests/${requestId}/approve`,
//       { adminRemarks },
//     );
//     return response.data;
//   },
//   rejectUpdateRequest: async (requestId, adminRemarks) => {
//     const response = await api.put(
//       `/attendance/update-requests/${requestId}/reject`,
//       { adminRemarks },
//     );
//     return response.data;
//   },
//   markHoliday: async (holidayData) => {
//   const response = await api.post('/attendance/mark-holiday', holidayData);
//   return response.data;
// },
// };

// export default attendanceService;


// services/attendanceService.js
import api from "./api";

const attendanceService = {
  // Teacher APIs
  markInTime: async (attendanceData) => {
    const response = await api.post("/attendance/in", attendanceData);
    return response.data;
  },
  markOutTime: async (attendanceData) => {
    const response = await api.post("/attendance/out", attendanceData);
    return response.data;
  },
  getTodayAttendance: async () => {
    const response = await api.get("/attendance/today");
    return response.data;
  },
  getMyMonthlyAttendance: async (month, year) => {
    const response = await api.get("/attendance/my-monthly", {
      params: { month, year },
    });
    return response.data;
  },
  requestAttendanceUpdate: async (requestData) => {
    const response = await api.post("/attendance/request-update", requestData);
    return response.data;
  },

  // Admin Holiday APIs
  createHoliday: async (holidayData) => {
    const response = await api.post("/attendance/holidays", holidayData);
    return response.data;
  },
  getAllHolidays: async (year, month) => {
    const params = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const response = await api.get("/attendance/holidays", { params });
    return response.data;
  },
  updateHoliday: async (holidayId, holidayData) => {
    const response = await api.put(`/attendance/holidays/${holidayId}`, holidayData);
    return response.data;
  },
  deleteHoliday: async (holidayId) => {
    const response = await api.delete(`/attendance/holidays/${holidayId}`);
    return response.data;
  },

  // Admin Attendance APIs
  getAllTeachersForAttendance: async () => {
    const response = await api.get("/attendance/teachers");
    return response.data;
  },
  getTeacherMonthlyAttendance: async (teacherId, month, year) => {
    const response = await api.get(`/attendance/monthly/${teacherId}`, {
      params: { month, year },
    });
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
    const response = await api.post("/attendance/create", attendanceData);
    return response.data;
  },
  deleteAttendance: async (attendanceId) => {
    const response = await api.delete(`/attendance/${attendanceId}`);
    return response.data;
  },

  // Admin Update Request APIs
  getPendingUpdateRequests: async () => {
    const response = await api.get("/attendance/update-requests/pending");
    return response.data;
  },
  getAllUpdateRequests: async (status, teacherId) => {
    const params = {};
    if (status) params.status = status;
    if (teacherId) params.teacherId = teacherId;
    const response = await api.get("/attendance/update-requests/all", { params });
    return response.data;
  },
  approveUpdateRequest: async (requestId, adminRemarks) => {
    const response = await api.put(`/attendance/update-requests/${requestId}/approve`, { adminRemarks });
    return response.data;
  },
  rejectUpdateRequest: async (requestId, adminRemarks) => {
    const response = await api.put(`/attendance/update-requests/${requestId}/reject`, { adminRemarks });
    return response.data;
  },


  // Admin Leave APIs
  approveOrRejectLeave: async (leaveId, leaveData) => {
    const response = await api.put(
      `/attendance/leave/${leaveId}`,
      leaveData
    );
    return response.data;
  },


downloadTeacherAttendanceExcel: async (teacherId, month, year) => {
  const response = await api.get(`/attendance/export/teacher/${teacherId}`, {
    params: { month, year },
    responseType: 'blob'
  });
  return response.data;
},

// Download all teachers attendance
downloadAllTeachersAttendanceExcel: async (month, year) => {
  const response = await api.get('/attendance/export/all-teachers', {
    params: { month, year },
    responseType: 'blob'
  });
  return response.data;
},
};

export default attendanceService;
