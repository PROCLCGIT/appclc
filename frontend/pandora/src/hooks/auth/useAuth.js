// src/hooks/auth/useAuth.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/config/axios';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';

// Constantes
const AUTH_TOKEN_KEY = 'auth-token';
const REFRESH_TOKEN_KEY = 'refresh-token';
const LAST_AUTH_PROMPT_KEY = 'last-auth-prompt';
const TWO_HOURS = 2 * 60 * 60 * 1000; // 2 horas en milisegundos

/**
 * Hook personalizado para gestionar la autenticación con React Query
 * @returns {Object} Funciones y estado de autenticación
 */
export default function useAuth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState(null);

  // Verificar token
  const verifyToken = async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    console.log('Verificando token:', token ? 'Disponible' : 'No disponible');
    
    if (!token) return false;

    // Verificar si han pasado más de 2 horas desde la última autenticación
    const lastAuthPrompt = localStorage.getItem(LAST_AUTH_PROMPT_KEY);
    if (lastAuthPrompt) {
      const now = Date.now();
      const diff = now - parseInt(lastAuthPrompt, 10);
      if (diff > TWO_HOURS) {
        console.log('Token expirado por tiempo (más de 2 horas)');
        throw new Error('Token expirado por tiempo');
      }
    }

    // Verificar token con el backend
    try {
      console.log('Validando token con el backend...');
      await api.post('auth/token/verify/', { token });
      console.log('Token verificado correctamente');
      return true;
    } catch (error) {
      console.log('Error en verificación de token:', error.message);
      
      // Intentar refresh si el token es inválido
      if (error.response?.status === 401) {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          console.log('No hay refresh token disponible');
          throw new Error('No hay refresh token');
        }

        console.log('Intentando refresh de token...');
        const response = await api.post('auth/token/refresh/', { refresh: refreshToken });
        const newToken = response.data.access;

        console.log('Token refrescado exitosamente');
        localStorage.setItem(AUTH_TOKEN_KEY, newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return true;
      }
      throw error;
    }
  };

  // Efecto para asegurar que el token se establece en axios después de la carga inicial
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      console.log('Estableciendo token en headers de axios desde useEffect');
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Query de autenticación (verifica el estado actual)
  const authQuery = useQuery({
    queryKey: ['auth', 'status'],
    queryFn: verifyToken,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    onError: (error) => {
      // Establecer error para UI
      setAuthError(error.message || 'Error de autenticación');
      
      // Limpiar tokens si hay error
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(LAST_AUTH_PROMPT_KEY);
      
      // Eliminar el token de los headers de axios
      delete api.defaults.headers.common['Authorization'];
      
      // Redirigir a login si no estamos ya ahí
      if (window.location.pathname !== '/login') {
        console.log('Redirigiendo a login debido a error de autenticación');
        navigate('/login');
      }
    }
  });

  // Mutación para login
  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      // Normalizar credenciales
      const loginData = {
        username: String(credentials.username).trim(),
        password: String(credentials.password),
      };

      console.log('Enviando solicitud de login al backend...');
      // Llamada a API para login
      const response = await api.post('auth/token/', loginData);
      console.log('Respuesta de login recibida:', response.status);
      return response.data;
    },
    onSuccess: (data) => {
      const { access, refresh } = data;
      console.log('Login exitoso, guardando tokens...');
      
      // Guardar tokens
      localStorage.setItem(AUTH_TOKEN_KEY, access);
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
      localStorage.setItem(LAST_AUTH_PROMPT_KEY, Date.now().toString());
      
      // Actualizar headers para todas las solicitudes
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      console.log('Token establecido en headers de axios');
      
      // Invalidar consultas para forzar actualización del estado
      queryClient.invalidateQueries({ queryKey: ['auth', 'status'] });
      
      // Notificar éxito
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema",
        variant: "default",
      });
      
      // Redirigir al dashboard
      console.log('Redirigiendo al dashboard...');
      navigate('/');
    },
    onError: (error) => {
      console.log('Error en login:', error.message);
      
      // Preparar mensaje de error amigable
      let errorMessage = 'Error al iniciar sesión';
      
      if (!error.response) {
        errorMessage = 'No se pudo conectar con el servidor. Revisa tu conexión.';
      } else if (error.response.status === 429) {
        errorMessage = 'Demasiados intentos. Por favor, espere unos minutos.';
      } else if (error.response.status === 401) {
        errorMessage = 'Usuario o contraseña incorrectos';
      } else if (error.response.status === 400) {
        errorMessage = 'Datos de inicio de sesión inválidos';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      // Establecer error para UI
      setAuthError(errorMessage);
      
      // Notificar error
      toast({
        title: "Error de autenticación",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  // Mutación para logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Aquí podríamos llamar a un endpoint de logout si el backend lo requiere
      console.log('Cerrando sesión...');
      return true;
    },
    onSuccess: () => {
      // Limpiar tokens
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(LAST_AUTH_PROMPT_KEY);
      
      // Limpiar headers
      delete api.defaults.headers.common['Authorization'];
      console.log('Token eliminado de headers de axios');
      
      // Resetear caché de autenticación
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      
      // Resetear todas las queries al hacer logout (limpieza completa)
      queryClient.clear();
      
      // Notificar
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      
      // Redirigir a login
      navigate('/login');
    }
  });

  // Función para limpiar errores de autenticación
  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  return {
    // Estado
    isAuthenticated: authQuery.data === true,
    isAuthLoading: authQuery.isLoading || loginMutation.isPending || logoutMutation.isPending,
    authError,
    
    // Acciones
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    clearAuthError,
    
    // Estado detallado (para debugging)
    authQueryStatus: authQuery.status,
    loginMutationStatus: loginMutation.status,
    logoutMutationStatus: logoutMutation.status,
  };
}