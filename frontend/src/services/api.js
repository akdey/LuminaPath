import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const generatePath = async (topic) => {
  const response = await api.post('/learning/generate-path', { topic });
  return response.data;
};

export const getPath = async (roadmapId) => {
  const response = await api.get(`/learning/path/${roadmapId}`);
  return response.data;
};

export const getDashboardData = async () => {
  const response = await api.get('/learning/dashboard');
  return response.data;
};

export const completeTask = async (taskId) => {
  const response = await api.put(`/learning/task/${taskId}/complete`);
  return response.data;
};

export const generateAssessment = async (taskId) => {
  const response = await api.post('/assessment/generate-quiz', { task_id: taskId });
  return response.data;
};

export const getAssessment = async (assessmentId) => {
  const response = await api.get(`/assessment/quiz/${assessmentId}`);
  return response.data;
};

export const analyzeGaps = async (assessmentId, answers = {}) => {
  const response = await api.post('/assessment/analyze-gaps', { assessment_id: assessmentId, answers });
  return response.data;
};

export const getGapAnalysis = async (assessmentId) => {
  const response = await api.get(`/assessment/gaps/${assessmentId}`);
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
  }
  return response.data;
};

export const register = async (email, password) => {
  const response = await api.post('/auth/register', { email, password });
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
};

// Auto-inject token if exists
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default api;
