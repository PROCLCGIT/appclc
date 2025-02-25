// src/store/authStore.js

import { create } from 'zustand';
import api from '@/config/axios';

let loginAttemptInProgress = false;
const TWO_HOURS = 2 * 60 * 60 * 1000; // 2 horas en milisegundos

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  loading: false,

  // 1. LOGIN
  login: async (credentials) => {
    if (loginAttemptInProgress) {
      console.log('Login attempt already in progress');
      return false;
    }

    try {
      loginAttemptInProgress = true;
      set({ loading: true, error: null });

      const loginData = {
        username: String(credentials.username).trim(),
        password: String(credentials.password),
      };

      // Llamada a /auth/token/
      const response = await api.post('auth/token/', loginData, {
        headers: { 'Content-Type': 'application/json' },
      });

      const { access, refresh } = response.data;
      localStorage.setItem('auth-token', access);
      localStorage.setItem('refresh-token', refresh);

      // (1) Guardar timestamp de la autenticación
      localStorage.setItem('last-auth-prompt', Date.now().toString());

      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      set({
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      return true;
    } catch (error) {
      let errorMessage = 'Error al iniciar sesión';
      // Manejo de mensajes
      if (!error.response) {
        errorMessage = 'No se pudo conectar con el servidor. Revisa tu conexión.';
      } else if (error.response.status === 429) {
        errorMessage = 'Demasiados intentos. Por favor, espere unos segundos.';
      } else if (error.response.status === 401) {
        errorMessage = 'Usuario o contraseña incorrectos';
      } else if (error.response.status === 400) {
        errorMessage = 'Datos de inicio de sesión inválidos';
      } else if (error.response.data?.detail) {
        errorMessage = error.response.data.detail;
      }

      set({
        error: errorMessage,
        loading: false,
        isAuthenticated: false,
      });
      return false;
    } finally {
      loginAttemptInProgress = false;
      set({ loading: false });
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
  checkAuth: async () => {
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
      await api.post('token/verify/', { token });

      // Token válido => usuario autenticado
      set({ isAuthenticated: true, loading: false });
      return true;

    } catch (error) {
      // Intentar refrescar
      if (error.response?.status === 401) {
        try {
          const response = await api.post('token/refresh/', { refresh: refreshToken });
          const newToken = response.data.access;

          localStorage.setItem('auth-token', newToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

          set({ isAuthenticated: true, loading: false });
          return true;
        } catch {
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
