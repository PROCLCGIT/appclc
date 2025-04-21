// src/config/constants.js

// API base URL (asegurarnos de no tener barra al final)
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '');

// Configuración API paths (asegurarnos de que empiezan con barra)
export const API_PATHS = {
  RELACIONES_BLUE: '/relacionesblue',
  CLIENTES: '/clientes',
  CONTACTOS: '/contactos',
  PROVEEDORES: '/proveedores',
  VENDEDORES: '/vendedores',
};

// Formatos de fecha
export const DATE_FORMATS = {
  DEFAULT: 'DD/MM/YYYY',
  TIME: 'HH:mm:ss',
  DATETIME: 'DD/MM/YYYY HH:mm:ss',
};

// Límites de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// Valores por defecto
export const DEFAULTS = {
  NIVEL_MIN: 1,
  NIVEL_MAX: 9,
  NIVEL_DEFAULT: 5,
};

// Tipos de notificación
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Tiempos de debounce
export const DEBOUNCE_TIMES = {
  SEARCH: 500, // ms
  FORM: 300, // ms
};

export default {
  API_BASE_URL,
  API_PATHS,
  DATE_FORMATS,
  PAGINATION,
  DEFAULTS,
  NOTIFICATION_TYPES,
  DEBOUNCE_TIMES,
}; 