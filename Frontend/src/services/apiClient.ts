import axios from 'axios';

// Get base URL from environment or default to deployed Render API
const rawApiUrl = (import.meta.env.VITE_API_URL || 'https://reachinbox-yvsm.onrender.com/api').trim();

// Normalize API_BASE_URL: ensure proper /api suffix for full URLs
export const API_BASE_URL = rawApiUrl.startsWith('http')
  ? (rawApiUrl.replace(/\/+$/, '').endsWith('/api') ? rawApiUrl.replace(/\/+$/, '') : `${rawApiUrl.replace(/\/+$/, '')}/api`)
  : (rawApiUrl.replace(/\/+$/, '') || '/api');

export const WORKER_URL = (import.meta.env.VITE_WORKER_URL || 'https://reachinbox-worker-qyhk.onrender.com').replace(/\/+$/, '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('reachinbox_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('reachinbox_token');
    }
    return Promise.reject(error);
  }
);
