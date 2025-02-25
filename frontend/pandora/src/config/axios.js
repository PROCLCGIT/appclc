// src/config/axios.js
import axios from 'axios';

// Si tienes VITE_API_URL apuntando a http://localhost:8000/api/v1, úsalo:
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1/';



// Creamos UNA única instancia
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// ============ Interceptores ============

// 1) Interceptor REQUEST: agrega Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2) Manejo de Rate Limiting: si viene status 429, reintentamos
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 429) {
      // Espera 2 seg. antes de reintentar
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return api(error.config);
    }
    return Promise.reject(error);
  }
);

// 3) Manejo de 401: si no autorizado, forzamos logout/redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('refresh-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 4) Opción: refreshAuthToken() si quieres que se refresque automáticamente
//    Podrías implementarlo aquí, pero a menudo se maneja desde authStore.

export default api;
