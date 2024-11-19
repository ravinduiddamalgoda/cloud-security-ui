// src/axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3500',
});

// Interceptor for handling responses
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
