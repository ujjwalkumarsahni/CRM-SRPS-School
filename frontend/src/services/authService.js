// authService.js
import api from './api';

const authService = {
  // ✅ LOGIN
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });

    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }

    return res.data;
  },

  // ✅ LOGOUT
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // ✅ CURRENT USER
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // ✅ TOKEN
  getToken: () => {
    return localStorage.getItem('token');
  },

  // ✅ FORGOT PASSWORD
  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  // ✅ RESET PASSWORD
  resetPassword: async (token, password) => {
    const res = await api.post(`/auth/reset-password/${token}`, {
      password,
    });
    return res.data;
  },
};

export default authService;