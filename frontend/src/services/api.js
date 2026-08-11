import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getImageStatus = async (processingId) => {
  const response = await api.get(`/images/${processingId}/status`);
  return response.data;
};

export const getImageResults = async (processingId) => {
  const response = await api.get(`/images/${processingId}/results`);
  return response.data;
};

export const retryImage = async (processingId) => {
  const response = await api.post(`/images/${processingId}/retry`);
  return response.data;
};

export default api;