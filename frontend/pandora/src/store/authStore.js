// src/store/authStore.js

import { create } from 'zustand';
import api from '@/config/axios';

let loginAttemptInProgress = false;
let authCheckInProgress = false;
const TWO_HOURS = 2 * 60 * 60 * 1000; // 2 horas en milisegundos
const RATE_LIMIT_RETRY_DELAY = 3000; // 3 segundos de espera antes de reintentar

// Función para esperar un tiempo específico
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  loading: false,

  // 1. LOGIN
  login: async (credentials) => {
    // Si ya hay un intento de login en progreso, salimos
    if (loginAttemptInProgress) {
      console.log('Login attempt already in progress');
      return false;
    }

    try {
      loginAttemptInProgress = true;
      set({ loading: true, error: null });
      console.log('Iniciando intento de login...');

      const loginData = {
        username: String(credentials.username).trim(),
        password: String(credentials.password),
      };

      try {
        // Llamada al endpoint correcto de autenticación
        console.log('Enviando solicitud de autenticación al endpoint token...');
        const response = await api.post('auth/token/', loginData, {
          headers: { 'Content-Type': 'application/json' },
          // Desactivamos el retry automático para este endpoint
          _disableRetry: true
        });

        console.log('Respuesta de autenticación recibida');
        const { access, refresh } = response.data;
        
        // Guardar tokens en localStorage con más información de depuración
        console.log('Guardando token en localStorage:', access.substring(0, 10) + '...');
        localStorage.setItem('auth-token', access);
        localStorage.setItem('refresh-token', refresh);
        localStorage.setItem('last-auth-prompt', Date.now().toString());
        
        // Para asegurarnos que se guardó correctamente
        const savedToken = localStorage.getItem('auth-token');
        console.log('Token guardado correctamente:', savedToken ? 'Sí' : 'No');

        // Configurar token en axios
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        // Actualizar estado
        set({
          isAuthenticated: true,
          loading: false,
          error: null,
        });

        console.log('Login exitoso');
        return true;
      } catch (error) {
        console.error('Error durante el login:', error);
        
        // Preparamos mensaje de error
        let errorMessage = 'Error al iniciar sesión';
        
        if (!error.response) {
          console.log('Error de conexión al servidor');
          errorMessage = 'No se pudo conectar con el servidor. Revisa tu conexión.';
        } else if (error.response.status === 429) {
          console.log('Error de rate limit (429)');
          errorMessage = 'Demasiados intentos. Por favor, espere unos minutos y vuelva a intentarlo.';
        } else if (error.response.status === 401) {
          console.log('Error de credenciales (401)');
          errorMessage = 'Usuario o contraseña incorrectos';
        } else if (error.response.status === 400) {
          console.log('Error en datos de login (400)');
          errorMessage = 'Datos de inicio de sesión inválidos';
        } else if (error.response?.data?.detail) {
          console.log('Error con detalle:', error.response.data.detail);
          errorMessage = error.response.data.detail;
        }

        // Actualizar estado con el error
        set({
          error: errorMessage,
          loading: false,
          isAuthenticated: false,
        });
        return false;
      }
    } finally {
      // Siempre liberamos el flag de intento en progreso
      loginAttemptInProgress = false;
      console.log('Login attempt finalizado');
    }
  },

  // 2. LOGOUT
  logout: () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('refresh-token');
    localStorage.removeItem('last-auth-prompt');  // Limpia también el timestamp

    api.defaults.headers.common['Authorization'] = null;

    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  // 3. CHECK AUTH
  checkAuth: async (retryCount = 0) => {
    // Evitar verificaciones simultáneas
    if (authCheckInProgress) {
      console.log('Auth check already in progress, skipping');
      return false;
    }
    
    try {
      authCheckInProgress = true;
      set({ loading: true });
  
      const token = localStorage.getItem('auth-token');
      const refreshToken = localStorage.getItem('refresh-token');
      const lastAuthPrompt = localStorage.getItem('last-auth-prompt');
  
      // Si no hay token, no estamos autenticados
      if (!token || !refreshToken) {
        set({ isAuthenticated: false, loading: false });
        return false;
      }
  
      // Verificar si han pasado más de 2 horas desde que se guardó la última autenticación real
      if (lastAuthPrompt) {
        const now = Date.now();
        const diff = now - parseInt(lastAuthPrompt, 10);
        if (diff > TWO_HOURS) {
          // Pasaron más de 2 horas, forzamos re-login
          localStorage.removeItem('auth-token');
          localStorage.removeItem('refresh-token');
          localStorage.removeItem('last-auth-prompt');
          set({ isAuthenticated: false, loading: false });
          return false;
        }
      }
  
      try {
        // Token actual: ¿sigue siendo válido?
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await api.post('auth/token/verify/', { token });
  
        // Token válido => usuario autenticado
        set({ isAuthenticated: true, loading: false, error: null });
        return true;
  
      } catch (error) {
        // Si llegamos al límite de rate, esperamos y reintentamos
        if (error.response?.status === 429 && retryCount < 3) {
          const delayMs = RATE_LIMIT_RETRY_DELAY * Math.pow(2, retryCount);
          console.log(`Rate limit hit. Retrying in ${delayMs/1000} seconds...`);
          
          // Esperamos antes de reintentar
          await wait(delayMs);
          
          // Resetear estado y reintentar
          authCheckInProgress = false;
          return await useAuthStore.checkAuth(retryCount + 1);
        }
        
        // Intentar refrescar token si está expirado
        if (error.response?.status === 401) {
          try {
            console.log('Token expirado, intentando refresh...');
            const response = await api.post('auth/token/refresh/', { refresh: refreshToken });
            const newToken = response.data.access;
  
            localStorage.setItem('auth-token', newToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  
            set({ isAuthenticated: true, loading: false, error: null });
            return true;
          } catch (refreshError) {
            // Si el refresh también da rate limit, esperar y reintentar
            if (refreshError.response?.status === 429 && retryCount < 3) {
              const delayMs = RATE_LIMIT_RETRY_DELAY * Math.pow(2, retryCount);
              console.log(`Rate limit on refresh. Retrying in ${delayMs/1000} seconds...`);
              
              await wait(delayMs);
              
              authCheckInProgress = false;
              return await useAuthStore.checkAuth(retryCount + 1);
            }
            
            // Falla el refresh => forzamos logout
            localStorage.removeItem('auth-token');
            localStorage.removeItem('refresh-token');
            localStorage.removeItem('last-auth-prompt');
  
            set({
              isAuthenticated: false,
              loading: false,
              user: null,
              error: 'Sesión expirada, por favor inicie sesión nuevamente',
            });
            return false;
          }
        }
  
        // Errores varios
        let errorMessage = 'Error al verificar la autenticación';
        if (!error.response) {
          errorMessage = 'No se pudo conectar con el servidor';
        } else if (error.response.status === 429) {
          errorMessage = 'Demasiados intentos. Por favor, espere unos segundos.';
        }
  
        set({
          isAuthenticated: false,
          loading: false,
          error: errorMessage,
        });
        return false;
      }
    } finally {
      authCheckInProgress = false;
      set({ loading: false });
    }
  },

  // 4. LIMPIAR ERRORES
  clearError: () => set({ error: null }),

  // 5. PERFIL DE USUARIO (opcional)
  fetchUserProfile: async () => {
    // ...
  },
  updateUserProfile: async (userData) => {
    // ...
  },
}));

export default useAuthStore;
