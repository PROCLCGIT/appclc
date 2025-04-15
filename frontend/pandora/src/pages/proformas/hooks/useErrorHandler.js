// src/pages/proformas/hooks/useErrorHandler.js

import { useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Hook para manejar errores de forma centralizada en el módulo de proformas
 * Proporciona funciones para registrar, clasificar y manejar errores
 */
export const useErrorHandler = () => {
  // Contador de errores por tipo
  const errorCounts = useRef({
    network: 0,
    rateLimit: 0,
    timeout: 0,
    notFound: 0,
    validation: 0,
    auth: 0,
    server: 0,
    unknown: 0
  });
  
  // Último error registrado
  const [lastError, setLastError] = useState(null);
  
  // Resetear contadores de errores
  const resetErrorCounts = useCallback(() => {
    Object.keys(errorCounts.current).forEach(key => {
      errorCounts.current[key] = 0;
    });
  }, []);
  
  // Clasificar un error en una de las categorías predefinidas
  const classifyError = useCallback((error) => {
    if (!error) return 'unknown';
    
    const statusCode = error.response?.status || error.status;
    const message = error.message || '';
    
    // Clasificar por código de estado HTTP
    if (statusCode === 429) return 'rateLimit';
    if (statusCode === 404) return 'notFound';
    if (statusCode === 400 || statusCode === 422) return 'validation';
    if (statusCode === 401 || statusCode === 403) return 'auth';
    if (statusCode >= 500) return 'server';
    
    // Clasificar por mensaje de error
    if (message.includes('Network Error') || message.includes('network')) return 'network';
    if (message.includes('timeout') || error.code === 'ECONNABORTED') return 'timeout';
    
    // Si no podemos clasificarlo, es desconocido
    return 'unknown';
  }, []);
  
  // Registrar un error y obtener su tipo
  const logError = useCallback((error, context = '') => {
    if (!error) return 'unknown';
    
    const errorType = classifyError(error);
    
    // Incrementar contador para este tipo de error
    errorCounts.current[errorType]++;
    
    // Guardar último error
    setLastError({
      type: errorType,
      error,
      context,
      time: Date.now()
    });
    
    // Loguear a consola
    console.error(`[${errorType.toUpperCase()}] ${context}:`, error);
    
    return errorType;
  }, [classifyError]);
  
  // Manejar un error y decidir cómo responder
  const handleError = useCallback((error, context = '', options = {}) => {
    const errorType = logError(error, context);
    const { 
      silent = false,
      suppressToast = false 
    } = options;
    
    if (silent) return errorType;
    
    // Generar mensaje de error para el usuario
    let errorMessage = 'Se produjo un error inesperado';
    let errorDescription = '';
    
    switch (errorType) {
      case 'network':
        errorMessage = 'Error de conexión';
        errorDescription = 'No se pudo conectar con el servidor. Verifique su conexión a Internet.';
        break;
      case 'rateLimit':
        errorMessage = 'Demasiadas solicitudes';
        errorDescription = 'El servidor está procesando muchas solicitudes. Intente nuevamente en unos segundos.';
        break;
      case 'timeout':
        errorMessage = 'Tiempo de espera agotado';
        errorDescription = 'La solicitud tardó demasiado tiempo. Intente nuevamente más tarde.';
        break;
      case 'notFound':
        errorMessage = 'Recurso no encontrado';
        errorDescription = 'El recurso solicitado no existe o fue eliminado.';
        break;
      case 'validation':
        errorMessage = 'Error de validación';
        errorDescription = error.response?.data?.detail || 'Los datos proporcionados no son válidos.';
        break;
      case 'auth':
        errorMessage = 'Error de autenticación';
        errorDescription = 'No tiene permisos para realizar esta acción o su sesión expiró.';
        break;
      case 'server':
        errorMessage = 'Error del servidor';
        errorDescription = 'Ocurrió un problema en el servidor. Intente nuevamente más tarde.';
        break;
      default:
        errorMessage = 'Error inesperado';
        errorDescription = error.message || 'Ocurrió un problema al procesar su solicitud.';
    }
    
    // Mostrar notificación toast si no está suprimida
    if (!suppressToast) {
      const toastFn = errorType === 'rateLimit' ? toast.warning : toast.error;
      toastFn(errorMessage, { description: errorDescription });
    }
    
    return errorType;
  }, [logError]);
  
  // Verificar si es seguro reintentar basado en el tipo y frecuencia de errores
  const canRetry = useCallback((errorType) => {
    if (!errorType || !errorCounts.current[errorType]) {
      return true;
    }
    
    // Estrategia de limitación de reintentos basada en el tipo y frecuencia de errores
    const count = errorCounts.current[errorType];
    
    // Limitar reintentos según el tipo de error
    if (errorType === 'rateLimit' && count >= 3) return false;
    if (errorType === 'network' && count >= 5) return false;
    if (errorType === 'timeout' && count >= 3) return false;
    if (errorType === 'server' && count >= 3) return false;
    
    // No reintentar errores de validación, auth o notFound
    if (['validation', 'auth', 'notFound'].includes(errorType)) {
      return false;
    }
    
    return true;
  }, []);
  
  // Exportar funciones y estado
  return {
    logError,
    handleError,
    canRetry,
    resetErrorCounts,
    errorCounts: errorCounts.current,
    lastError
  };
};

export default useErrorHandler;