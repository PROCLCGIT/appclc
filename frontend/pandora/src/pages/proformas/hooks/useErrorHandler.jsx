// src/pages/proformas/hooks/useErrorHandler.jsx

import React, { useRef, useState, useCallback } from "react";
import { toast } from "sonner";

/**
 * Hook para manejar errores de forma centralizada en el módulo de proformas
 * Proporciona funciones para registrar, clasificar y manejar errores
 */
export default function useErrorHandler() {
  // Contador de errores por tipo
  const errorCounts = useRef({
    network: 0,
    rateLimit: 0,
    timeout: 0,
    notFound: 0,
    validation: 0,
    auth: 0,
    server: 0,
    unknown: 0,
  });

  // Último error registrado
  const [lastError, setLastError] = useState(null);

  // Resetear contadores de errores
  const resetErrorCounts = useCallback(() => {
    Object.keys(errorCounts.current).forEach((key) => {
      errorCounts.current[key] = 0;
    });
  }, []);

  // Clasificar un error en una de las categorías predefinidas con análisis mejorado
  const classifyError = useCallback((error) => {
    if (!error) return "unknown";

    const statusCode = error.response?.status || error.status;
    const message = (error.message || "").toLowerCase();
    const responseData = error.response?.data || {};

    // Clasificación más detallada basada en código de estado HTTP
    if (statusCode === 429) return "rateLimit";
    if (statusCode === 404) return "notFound";
    if (statusCode === 400) {
      // Verificar si es un error de validación de campo específico
      if (
        responseData.detail ||
        responseData.non_field_errors ||
        Object.keys(responseData).some(
          (k) => k !== "detail" && k !== "non_field_errors",
        )
      ) {
        return "validation";
      }
      return "badRequest";
    }
    if (statusCode === 422) return "validation";
    if (statusCode === 401) return "unauthorized";
    if (statusCode === 403) return "forbidden";
    if (statusCode >= 500 && statusCode < 600) return "server";

    // Clasificación mejorada por mensajes de error
    if (
      message.includes("network error") ||
      message.includes("failed to fetch") ||
      message.includes("network") ||
      message.includes("net::err")
    ) {
      return "network";
    }
    if (
      message.includes("timeout") ||
      message.includes("time out") ||
      message.includes("timed out") ||
      error.code === "ECONNABORTED"
    ) {
      return "timeout";
    }
    if (message.includes("cors") || message.includes("cross-origin")) {
      return "cors";
    }
    if (message.includes("abort") || error.code === "ECONNABORTED") {
      return "aborted";
    }
    if (
      message.includes("memory") ||
      message.includes("stack") ||
      message.includes("overflow")
    ) {
      return "memory";
    }

    // Si no podemos clasificarlo, es desconocido
    return "unknown";
  }, []);

  // Registrar un error y obtener su tipo
  const logError = useCallback(
    (error, context = "") => {
      if (!error) return "unknown";

      const errorType = classifyError(error);

      // Incrementar contador para este tipo de error
      errorCounts.current[errorType]++;

      // Guardar último error
      setLastError({
        type: errorType,
        error,
        context,
        time: Date.now(),
      });

      // Loguear a consola
      console.error(`[${errorType.toUpperCase()}] ${context}:`, error);

      return errorType;
    },
    [classifyError],
  );

  // Manejar un error y decidir cómo responder con mensajes mejorados
  const handleError = useCallback(
    (error, context = "", options = {}) => {
      const errorType = logError(error, context);
      const {
        silent = false,
        suppressToast = false,
        prefixMessage = "",
        customMessages = {},
      } = options;

      if (silent) return errorType;

      // Extraer datos de respuesta para mensajes más específicos
      const responseData = error.response?.data || {};
      const statusCode = error.response?.status || error.status || 0;

      // Generar mensaje de error para el usuario
      let errorMessage = "Se produjo un error inesperado";
      let errorDescription = "";

      // Usar mensajes personalizados si existen
      if (customMessages[errorType]) {
        errorMessage = customMessages[errorType].message || errorMessage;
        errorDescription =
          customMessages[errorType].description || errorDescription;
      } else {
        // Mensajes predeterminados mejorados
        switch (errorType) {
          case "network":
            errorMessage = "Error de conexión";
            errorDescription =
              "No se pudo conectar con el servidor. Verifique su conexión a Internet y reintente.";
            break;
          case "rateLimit":
            errorMessage = "Demasiadas solicitudes";
            errorDescription =
              "Estamos procesando muchas solicitudes. Por favor, espere unos segundos antes de reintentar.";
            break;
          case "timeout":
            errorMessage = "Tiempo de espera agotado";
            errorDescription =
              "La operación está tardando demasiado. Verifique su conexión e inténtelo nuevamente.";
            break;
          case "notFound":
            errorMessage = "Recurso no encontrado";
            errorDescription = context.includes("proforma")
              ? "La proforma solicitada no existe o fue eliminada."
              : "El recurso solicitado no existe o fue eliminado.";
            break;
          case "validation":
            errorMessage = "Error de validación";
            // Obtener primer mensaje de error de validación
            if (typeof responseData === "object") {
              const firstErrorField = Object.keys(responseData).find(
                (k) =>
                  k !== "detail" && k !== "non_field_errors" && responseData[k],
              );
              if (firstErrorField) {
                const fieldMessage = Array.isArray(
                  responseData[firstErrorField],
                )
                  ? responseData[firstErrorField][0]
                  : responseData[firstErrorField];
                errorDescription = `${firstErrorField}: ${fieldMessage}`;
              } else if (responseData.detail) {
                errorDescription = responseData.detail;
              } else if (responseData.non_field_errors) {
                errorDescription = Array.isArray(responseData.non_field_errors)
                  ? responseData.non_field_errors[0]
                  : responseData.non_field_errors;
              } else {
                errorDescription = "Los datos proporcionados no son válidos.";
              }
            } else {
              errorDescription = "Los datos proporcionados no son válidos.";
            }
            break;
          case "unauthorized":
            errorMessage = "Sesión expirada";
            errorDescription =
              "Su sesión ha expirado. Por favor, vuelva a iniciar sesión.";
            break;
          case "forbidden":
            errorMessage = "Acceso denegado";
            errorDescription = "No tiene permisos para realizar esta acción.";
            break;
          case "server":
            errorMessage = `Error del servidor${statusCode ? ` (${statusCode})` : ""}`;
            errorDescription =
              responseData.detail ||
              "Ocurrió un problema en el servidor. Inténtelo nuevamente más tarde.";
            break;
          case "cors":
            errorMessage = "Error de acceso cruzado";
            errorDescription =
              "Error de seguridad al acceder al servidor. Contacte al administrador.";
            break;
          case "memory":
            errorMessage = "Error de memoria";
            errorDescription =
              "La aplicación ha agotado los recursos. Intente recargar la página.";
            break;
          case "aborted":
            errorMessage = "Operación cancelada";
            errorDescription =
              "La acción fue cancelada. Puede intentarlo nuevamente.";
            break;
          default:
            errorMessage = "Error inesperado";
            errorDescription =
              error.message || "Ocurrió un problema al procesar su solicitud.";
        }
      }

      // Mostrar notificación toast si no está suprimida
      if (!suppressToast) {
        const toastFn = errorType === "rateLimit" ? toast.warning : toast.error;
        toastFn(errorMessage, { description: errorDescription });
      }

      return errorType;
    },
    [logError],
  );

  // Verificar si es seguro reintentar con estrategia mejorada
  const canRetry = useCallback((errorType, customOptions = {}) => {
    if (!errorType || !errorCounts.current[errorType]) {
      return true;
    }

    // Estrategia de limitación de reintentos mejorada
    const count = errorCounts.current[errorType];

    // Opciones personalizadas
    const { maxRetries = null, forceRetry = false } = customOptions;

    // Si se fuerza el reintento, siempre permitimos
    if (forceRetry) return true;

    // Si hay un límite personalizado de reintentos
    if (maxRetries !== null && count >= maxRetries) {
      return false;
    }

    // Estrategia adaptativa por tipo de error
    const retryLimits = {
      rateLimit: 2, // Más estricto con rate limiting
      network: 5, // Más permisivo con problemas de red
      timeout: 3, // Moderado con timeouts
      server: 2, // Limitado con errores de servidor
      memory: 1, // Solo un reintento para problemas de memoria
      aborted: 3, // Moderado para operaciones canceladas
      cors: 1, // Un solo intento para errores CORS
      // Nunca reintentar estos errores:
      validation: 0,
      unauthorized: 0,
      forbidden: 0,
      notFound: 0,
    };

    // Verificar límite usando la tabla
    const limit =
      retryLimits[errorType] !== undefined ? retryLimits[errorType] : 2;

    // Si el número de errores supera el límite, no reintentamos
    if (count > limit) {
      return false;
    }

    // Calcular probabilidad de reintento con backoff exponencial
    // (menos probabilidad a medida que aumentan los errores)
    if (count > 1) {
      const randomFactor = Math.random();
      const backoffFactor = 1 / Math.pow(2, count - 1);

      // Si el factor aleatorio es mayor que el factor de backoff, no reintentamos
      if (randomFactor > backoffFactor) {
        return false;
      }
    }

    return true;
  }, []);

  // Calcular retraso para reintentos con estrategia de backoff exponencial
  const getRetryDelay = useCallback(
    (errorType, attempt = 1, baseDelay = 1000) => {
      if (!errorType) return baseDelay;

      // Factores de multiplicación por tipo de error
      const factors = {
        rateLimit: 2.5, // Esperar más tiempo para rate limiting
        network: 1.5, // Moderado para problemas de red
        timeout: 2.0, // Esperar más para timeouts
        server: 2.0, // Esperar más para errores de servidor
        default: 1.5, // Factor predeterminado
      };

      // Obtener el factor adecuado
      const factor = factors[errorType] || factors.default;

      // Calcular retraso con backoff exponencial y factor aleatorio
      // para evitar que múltiples clientes reintentan al mismo tiempo
      const exponentialDelay = baseDelay * Math.pow(factor, attempt - 1);
      const jitter = 0.2 * exponentialDelay * (Math.random() - 0.5);

      // Asegurar que el retraso no exceda un máximo razonable (15 segundos)
      return Math.min(15000, exponentialDelay + jitter);
    },
    [],
  );

  // Exportar funciones y estado con capacidades ampliadas
  return {
    logError,
    handleError,
    canRetry,
    getRetryDelay,
    resetErrorCounts,
    errorCounts: errorCounts.current,
    lastError,
    // Nuevas utilidades para manejo más específico
    getErrorMessage: (error) => {
      const errorType = classifyError(error);
      return {
        type: errorType,
        title:
          error.response?.data?.detail || error.message || "Error desconocido",
      };
    },
    isNetworkError: (error) => classifyError(error) === "network",
    shouldShowToUser: (errorType) =>
      !["aborted", "unauthorized"].includes(errorType),
  };
}
