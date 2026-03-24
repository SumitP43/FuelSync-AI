import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fuelsync_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('fuelsync_token');
    }
    return Promise.reject(err);
  }
);

export const pumpsApi = {
  getNearby: (lat, lng, radius = 10) =>
    api.get('/pumps/nearby', { params: { lat, lng, radius } }),
  getById: (id) => api.get(`/pumps/${id}`),
  getAll: (params = {}) => api.get('/pumps', { params }),
};

export const predictionsApi = {
  getPrediction: (pumpId, hour, dayOfWeek) =>
    api.get(`/predictions/${pumpId}`, { params: { hour, day_of_week: dayOfWeek } }),
  getGraph: (pumpId) => api.get(`/prediction-graph/graph/${pumpId}`),
};

export const recommendationsApi = {
  get: (lat, lng, radius = 15) =>
    api.get('/recommendations', { params: { lat, lng, radius } }),
};

export const feedbackApi = {
  submit: (data) => api.post('/feedback', data),
  getByPump: (pumpId, page = 1) =>
    api.get(`/feedback/${pumpId}`, { params: { page } }),
  vote: (id, helpful) => api.post(`/feedback/${id}/vote`, { helpful }),
};

export const crowdReportApi = {
  submit: (data) => api.post('/crowd-report', data),
  getByPump: (pumpId) => api.get(`/crowd-report/${pumpId}`),
};

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export default api;
