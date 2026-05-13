// adminDashboardService.js

import api from './api';

const adminDashboardService = {
  // Get complete dashboard data
  getDashboardData: async () => {
    const response = await api.get('/dashboard/dashboard');
    return response.data;
  },

  // Get quick statistics
  getQuickStats: async () => {
    const response = await api.get('/dashboard/dashboard/quick-stats');
    return response.data;
  },

  // Get attendance trend
  getAttendanceTrend: async () => {
    const response = await api.get('/dashboard/dashboard/attendance-trend');
    return response.data;
  },

  // Get teacher performance report
  getTeacherPerformanceReport: async () => {
    const response = await api.get('/dashboard/dashboard/teacher-performance');
    return response.data;
  },

  // Export dashboard data
  exportDashboardData: async () => {
    const response = await api.get('/dashboard/dashboard/export', {
      responseType: 'blob',
    });

    return response.data;
  },
};

export default adminDashboardService;