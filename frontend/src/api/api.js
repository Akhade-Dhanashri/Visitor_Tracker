import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Auth
export const login = async (credentials) => {
  const response = await apiClient.post('/login', credentials);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await apiClient.post('/change-password', data);
  return response.data;
};

// Settings
export const getSettings = async () => {
  const response = await apiClient.get('/settings');
  return response.data;
};

export const updateSettings = async (settings) => {
  const response = await apiClient.put('/settings', settings);
  return response.data;
};

// Visitors
export const getVisitors = async () => {
  const response = await apiClient.get('/visitors');
  return response.data;
};

export const addVisitor = async (data) => {
  const response = await apiClient.post('/visitors', data);
  return response.data;
};

export const checkoutVisitor = async (id, payload = {}) => {
  const response = await apiClient.post(`/visitors/${id}/checkout`, payload);
  return response.data;
};

export const deleteVisitor = async (id) => {
  const response = await apiClient.delete(`/visitors/${id}`);
  return response.data;
};

export const downloadVisitorReport = async (format = 'csv', startDate = null, endDate = null) => {
  let url = `/visitors/report?format=${format}`;
  if (startDate) url += `&start_date=${startDate}`;
  if (endDate) url += `&end_date=${endDate}`;

  const response = await apiClient.get(url, {
    responseType: 'blob',
  });
  return response.data;
};

// Users
export const getUsers = async () => {
  const response = await apiClient.get('/users');
  return response.data;
};

export const addUser = async (data) => {
  const response = await apiClient.post('/users', data);
  return response.data;
};

export const toggleUserStatus = async (id) => {
  const response = await apiClient.post(`/users/${id}/toggle-status`);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await apiClient.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
};

export default {
  getVisitors,
  addVisitor,
  checkoutVisitor,
  deleteVisitor,
  downloadVisitorReport,
  getUsers,
  addUser,
  toggleUserStatus,
  deleteUser,
  changePassword,
};

