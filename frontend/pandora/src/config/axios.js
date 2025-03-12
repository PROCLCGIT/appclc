// src/config/axios.js
import axios from 'axios';

// Si tienes VITE_API_URL apuntando a http://localhost:8000/api/v1, úsalo:
// El backend corre en el puerto 8000 por defecto
const BASE_URL = 'http://localhost:8000/api/v1/';

console.log('BASE_URL configurada:', BASE_URL);



// Creamos UNA única instancia
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// ============ Interceptores ============

// 1) Interceptor REQUEST: agrega Bearer token con más robustez
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    console.log('Interceptor de request ejecutándose. ¿Hay token?', !!token);
    
    if (token) {
      // Asegurar que el token está formateado correctamente
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token agregado a la petición:', config.url);
    } else {
      console.log('No hay token disponible para:', config.url);
      
      // Ya no redirigimos automáticamente - dejamos que los componentes de React manejen esto
      // Las redirecciones con window.location.href pueden causar problemas
      if (!config.url.includes('/auth/') && !window.location.pathname.includes('/login')) {
        console.log('Petición sin token a URL que requiere autenticación - NO redirigiendo automáticamente');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2) Manejo de Rate Limiting: si viene status 429, reintentamos con backoff exponencial
let retryDelay = 2000; // Comenzamos con 2 segundos
const maxRetries = 3;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Si la solicitud tiene _disableRetry, no intentamos el retry automático
    if (error.config?._disableRetry) {
      console.log('Retry automático desactivado para esta solicitud');
      return Promise.reject(error);
    }

    // Solo manejamos este interceptor para errores 429 (Too Many Requests)
    if (error.response?.status === 429) {
      // Si no existe la propiedad retryCount en la configuración, la inicializamos
      if (!error.config._retryCount) {
        error.config._retryCount = 0;
      }

      // Incrementamos el contador de reintentos
      error.config._retryCount += 1;
      
      // Si aún no alcanzamos el máximo de reintentos
      if (error.config._retryCount <= maxRetries) {
        // Calculamos un delay con backoff exponencial (2s, 4s, 8s, etc.)
        const delay = retryDelay * Math.pow(2, error.config._retryCount - 1);
        console.log(`Rate limit detectado. Intento ${error.config._retryCount}/${maxRetries}. Esperando ${delay/1000}s...`);
        
        // Esperamos antes de reintentar
        await new Promise((resolve) => setTimeout(resolve, delay));
        
        // Reintentamos la solicitud con la misma configuración
        return api(error.config);
      }
      
      // Si llegamos al máximo de reintentos, rechazamos con un mensaje claro
      console.log('Máximo de reintentos alcanzado para errores de rate limit');
      error.message = 'Demasiadas solicitudes en poco tiempo. Por favor, espere unos minutos e intente nuevamente.';
    }
    
    // Para cualquier otro error, simplemente lo rechazamos
    return Promise.reject(error);
  }
);

// 3) Manejo de 401: si no autorizado, intentamos refrescar el token primero
let isRefreshing = false;
let refreshSubscribers = [];

// Función para añadir callbacks a la lista de subscribers
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Función para notificar a todos los subscribers que el token se ha actualizado
const onTokenRefreshed = (newToken) => {
  refreshSubscribers.map(callback => callback(newToken));
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Solo manejamos errores 401 (No autorizado)
    if (error.response?.status === 401) {
      const originalRequest = error.config;
      
      // Evitar bucles infinitos
      if (originalRequest._retry) {
        console.log('Ya intentamos refreshear para esta petición, redirigiendo a login');
        // Limpiamos tokens y redirigimos a login
        localStorage.removeItem('auth-token');
        localStorage.removeItem('refresh-token');
        localStorage.removeItem('last-auth-prompt');
        
        // Ya no redirigimos usando window.location.href
        console.log('Token inválido detectado - manejando en componente React');
        return Promise.reject(error);
      }
      
      // Marcamos esta petición para evitar loops
      originalRequest._retry = true;
      
      // Si no estamos ya refresheando
      if (!isRefreshing) {
        isRefreshing = true;
        
        const refreshToken = localStorage.getItem('refresh-token');
        
        if (!refreshToken) {
          console.log('No hay refresh token - manejando en componente React');
          return Promise.reject(error);
        }
        
        try {
          console.log('Intentando refresh token...');
          const response = await api.post('auth/token/refresh/', { refresh: refreshToken });
          const newToken = response.data.access;
          
          // Guardar nuevo token
          localStorage.setItem('auth-token', newToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          
          // Notificar a todos los subscribers
          onTokenRefreshed(newToken);
          
          // Reintentar la petición original con el nuevo token
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Error al refrescar token:', refreshError);
          
          // Si falla el refresh, limpiamos todo y redirigimos
          localStorage.removeItem('auth-token');
          localStorage.removeItem('refresh-token');
          localStorage.removeItem('last-auth-prompt');
          
          // Ya no redirigimos usando window.location.href
          console.log('Error al refrescar token - manejando en componente React');
          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Si ya hay un refresh en progreso, subscribimos esta petición
        return new Promise(resolve => {
          subscribeTokenRefresh(newToken => {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }
    }
    
    return Promise.reject(error);
  }
);

// 4) Opción: refreshAuthToken() si quieres que se refresque automáticamente
//    Podrías implementarlo aquí, pero a menudo se maneja desde authStore.

export default api;
