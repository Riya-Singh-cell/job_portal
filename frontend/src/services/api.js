/**
 * @file services/api.js
 * @description Centralized Axios API service with interceptors.
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.post(`/auth/verify-email/${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.put('/users/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadResume: (formData) => api.put('/users/profile/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ─── Jobs API ─────────────────────────────────────────────────────────────────
export const jobsAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJob: (id) => api.get(`/jobs/${id}`),
  getMyJobs: (params) => api.get('/jobs/recruiter/my-jobs', { params }),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  duplicateJob: (id) => api.post(`/jobs/${id}/duplicate`),
  toggleStatus: (id) => api.patch(`/jobs/${id}/status`),
};

// ─── Applications API ─────────────────────────────────────────────────────────
export const applicationsAPI = {
  apply: (jobId, formData) => api.post(`/applications/${jobId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyApplications: (params) => api.get('/applications/my-applications', { params }),
  getApplication: (id) => api.get(`/applications/${id}`),
  withdraw: (id) => api.delete(`/applications/${id}/withdraw`),
  getJobApplications: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }),
  updateStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
  scheduleInterview: (id, data) => api.post(`/applications/${id}/interview`, data),
};

// ─── Saved Jobs API ───────────────────────────────────────────────────────────
export const savedJobsAPI = {
  toggle: (jobId) => api.post(`/saved-jobs/${jobId}`),
  getAll: (params) => api.get('/saved-jobs', { params }),
};

// ─── Notifications API ────────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ─── Companies API ────────────────────────────────────────────────────────────
export const companiesAPI = {
  create: (data) => api.post('/companies', data),
  getAll: (params) => api.get('/companies', { params }),
  getOne: (id) => api.get(`/companies/${id}`),
  update: (id, data) => api.put(`/companies/${id}`, data),
  uploadLogo: (id, formData) => api.put(`/companies/${id}/logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ─── Admin API ────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  getJobs: (params) => api.get('/admin/jobs', { params }),
  createReport: (data) => api.post('/admin/reports', data),
  getReports: (params) => api.get('/admin/reports', { params }),
  updateReportStatus: (id, status) => api.patch(`/admin/reports/${id}/status`, { status }),
  getRecruiterAnalytics: (id) => api.get(`/admin/recruiter/${id}/analytics`),
};

// ─── User API ─────────────────────────────────────────────────────────────────
export const userAPI = {
  getCandidateDashboard: () => api.get('/users/dashboard/candidate'),
  getRecommendations: () => api.get('/users/recommendations'),
};

export default api;
