// src/axiosConfig.js
import axios from 'axios';

// Backend API base URL - Flask server
// This is the non-authenticated version for public endpoints
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
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
