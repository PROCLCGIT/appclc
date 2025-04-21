import React, { useState, useCallback } from "react";
import { toast } from "sonner";

/**
 * Hook personalizado para implementar limitación de frecuencia (rate limiting)
 * en operaciones que pueden ser llamadas muchas veces seguidas.
 *
 * @param {Object} options - Configuración del rate limiting
 * @param {number} options.baseWaitTime - Tiempo base en ms entre operaciones permitidas (default: 3000ms)
 * @param {boolean} options.showToasts - Si debe mostrar notificaciones toast al usuario (default: true)
 * @param {boolean} options.enableBackoff - Si debe aumentar el tiempo de espera tras errores (default: true)
 * @returns {Object} Objeto con funciones y estado para controlar rate limiting
 */
export default function useRateLimit(options = {}) {
  const {
    baseWaitTime = 3000,
    showToasts = true,
    enableBackoff = true,
  } = options;

  // Estado para almacenar el timestamp de la última operación y contador de errores
  const [lastOperationTime, setLastOperationTime] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  /**
   * Comprueba si una operación debe ser limitada basándose en el tiempo transcurrido
   * desde la última operación y el contador de errores.
   *
   * @param {string} operationName - Nombre de la operación (para logs/toasts)
   * @returns {boolean} true si la operación debe ser bloqueada, false si puede proceder
   */
  const shouldLimit = useCallback(
    (operationName = "operación") => {
      const now = Date.now();
      const timeSinceLastOperation = now - lastOperationTime;

      // Calcular tiempo de espera ajustado según el número de errores (backoff exponencial)
      const waitMultiplier = enableBackoff
        ? Math.max(1, 1 + errorCount * 0.5)
        : 1; // 1x, 1.5x, 2x, etc.
      const adjustedWaitTime = baseWaitTime * waitMultiplier;

      // Comprobar si ha pasado suficiente tiempo
      if (timeSinceLastOperation < adjustedWaitTime) {
        const remainingTime = Math.ceil(
          (adjustedWaitTime - timeSinceLastOperation) / 1000,
        );

        // Log para desarrollo
        console.log(
          `Rate limit: ${operationName} bloqueada. Espere ${remainingTime}s más`,
        );

        // Notificar solo si es una solicitud muy rápida (menos de la mitad del tiempo requerido)
        if (showToasts && timeSinceLastOperation < adjustedWaitTime / 2) {
          toast.warning(`Por favor, espere ${remainingTime} segundos`, {
            description: `Procesando la ${operationName} anterior...`,
            duration: 3000,
          });
        }

        return true; // Debe limitar
      }

      return false; // Puede proceder
    },
    [lastOperationTime, errorCount, baseWaitTime, enableBackoff, showToasts],
  );

  /**
   * Registra que se ha realizado una operación
   */
  const registerOperation = useCallback(() => {
    setLastOperationTime(Date.now());
  }, []);

  /**
   * Registra un error, incrementando el contador para aumentar el tiempo de espera
   */
  const registerError = useCallback(() => {
    setErrorCount((prev) => prev + 1);

    // Actualizar también el tiempo para forzar un tiempo de espera más largo
    setLastOperationTime(Date.now());
  }, []);

  /**
   * Resetea el contador de errores (útil tras operaciones exitosas)
   */
  const resetErrorCount = useCallback(() => {
    setErrorCount(0);
  }, []);

  /**
   * Envuelve una función con protección de rate limiting
   *
   * @param {Function} fn - Función a ejecutar si no hay limitación
   * @param {string} operationName - Nombre de la operación para mensajes
   * @returns {Function} Función envuelta que respeta rate limiting
   */
  const withRateLimit = useCallback(
    (fn, operationName = "operación") => {
      return (...args) => {
        if (shouldLimit(operationName)) {
          return; // No ejecutar si debe ser limitado
        }

        // Registrar operación y ejecutar función
        registerOperation();
        return fn(...args);
      };
    },
    [shouldLimit, registerOperation],
  );

  return {
    shouldLimit,
    registerOperation,
    registerError,
    resetErrorCount,
    withRateLimit,
    errorCount,
  };
}
