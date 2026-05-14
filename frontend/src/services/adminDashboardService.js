// adminDashboardService.js

import api from './api';

const adminDashboardService = {
  // Get complete dashboard data
  getDashboardData: async () => {
    const response = await api.get('/dashboard/dashboard');
    return response.data;
  },

  getTodaySummary: async () => {
  try {
    const response = await api.get('/admin/dashboard/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching today summary:', error);
    throw error.response?.data || { message: 'Failed to fetch summary' };
  }
}
};

export default adminDashboardService;