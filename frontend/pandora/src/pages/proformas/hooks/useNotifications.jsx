import React, { useCallback } from "react";
import { toast } from "sonner";

/**
 * Hook para centralizar y estandarizar todas las notificaciones del módulo de proformas.
 * Proporciona métodos para cada tipo de notificación con formato y duración consistente.
 *
 * @param {Object} options - Configuración de las notificaciones
 * @param {boolean} options.enabled - Si las notificaciones están habilitadas (default: true)
 * @param {boolean} options.showInDevelopment - Si mostrar logs en consola en desarrollo (default: true)
 * @returns {Object} Funciones para mostrar diferentes tipos de notificaciones
 */
export function useNotifications(options = {}) {
  const {
    enabled = true,
    showInDevelopment = process.env.NODE_ENV === "development",
  } = options;

  /**
   * Muestra una notificación de éxito
   * @param {string} title - Título de la notificación
   * @param {string} description - Descripción opcional
   * @param {Object} options - Opciones adicionales para el toast
   */
  const success = useCallback(
    (title, description = "", options = {}) => {
      if (!enabled) return;

      // Logs en desarrollo
      if (showInDevelopment) {
        console.log(`✅ ${title}${description ? `: ${description}` : ""}`);
      }

      toast.success(title, {
        description,
        duration: 3000,
        ...options,
      });
    },
    [enabled, showInDevelopment],
  );

  /**
   * Muestra una notificación de error
   * @param {string} title - Título de la notificación
   * @param {string} description - Descripción opcional
   * @param {Object} options - Opciones adicionales para el toast
   */
  const error = useCallback(
    (title, description = "", options = {}) => {
      if (!enabled) return;

      // Logs en desarrollo
      if (showInDevelopment) {
        console.error(`❌ ${title}${description ? `: ${description}` : ""}`);
      }

      toast.error(title, {
        description,
        duration: 5000, // Errores más tiempo visibles
        ...options,
      });
    },
    [enabled, showInDevelopment],
  );

  /**
   * Muestra una notificación de advertencia
   * @param {string} title - Título de la notificación
   * @param {string} description - Descripción opcional
   * @param {Object} options - Opciones adicionales para el toast
   */
  const warning = useCallback(
    (title, description = "", options = {}) => {
      if (!enabled) return;

      // Logs en desarrollo
      if (showInDevelopment) {
        console.warn(`⚠️ ${title}${description ? `: ${description}` : ""}`);
      }

      toast.warning(title, {
        description,
        duration: 4000,
        ...options,
      });
    },
    [enabled, showInDevelopment],
  );

  /**
   * Muestra una notificación informativa
   * @param {string} title - Título de la notificación
   * @param {string} description - Descripción opcional
   * @param {Object} options - Opciones adicionales para el toast
   */
  const info = useCallback(
    (title, description = "", options = {}) => {
      if (!enabled) return;

      // Logs en desarrollo
      if (showInDevelopment) {
        console.info(`ℹ️ ${title}${description ? `: ${description}` : ""}`);
      }

      toast.info(title, {
        description,
        duration: 3000,
        ...options,
      });
    },
    [enabled, showInDevelopment],
  );

  /**
   * Muestra una notificación de carga/progreso
   * @param {string} title - Título de la notificación
   * @param {string} description - Descripción opcional
   * @param {Object} options - Opciones adicionales para el toast
   * @returns {string} ID de la notificación para poder actualizarla o cerrarla
   */
  const loading = useCallback(
    (title, description = "", options = {}) => {
      if (!enabled) return "";

      // Logs en desarrollo
      if (showInDevelopment) {
        console.log(`⏳ ${title}${description ? `: ${description}` : ""}`);
      }

      const id = options.id || `loading-${Date.now()}`;

      toast.loading(title, {
        description,
        duration: 0, // Sin tiempo, hasta que se cierre manualmente
        id,
        ...options,
      });

      return id;
    },
    [enabled, showInDevelopment],
  );

  /**
   * Cierra una notificación específica por su ID
   * @param {string} id - ID de la notificación a cerrar
   */
  const dismiss = useCallback(
    (id) => {
      if (!enabled || !id) return;
      toast.dismiss(id);
    },
    [enabled],
  );

  /**
   * Actualiza una notificación existente a éxito
   * @param {string} id - ID de la notificación a actualizar
   * @param {string} title - Título de la notificación
   * @param {string} description - Descripción opcional
   */
  const updateToSuccess = useCallback(
    (id, title, description = "") => {
      if (!enabled || !id) return;

      // Logs en desarrollo
      if (showInDevelopment) {
        console.log(`✅ ${title}${description ? `: ${description}` : ""}`);
      }

      toast.success(title, {
        id,
        description,
        duration: 3000,
      });
    },
    [enabled, showInDevelopment],
  );

  /**
   * Actualiza una notificación existente a error
   * @param {string} id - ID de la notificación a actualizar
   * @param {string} title - Título de la notificación
   * @param {string} description - Descripción opcional
   */
  const updateToError = useCallback(
    (id, title, description = "") => {
      if (!enabled || !id) return;

      // Logs en desarrollo
      if (showInDevelopment) {
        console.error(`❌ ${title}${description ? `: ${description}` : ""}`);
      }

      toast.error(title, {
        id,
        description,
        duration: 5000,
      });
    },
    [enabled, showInDevelopment],
  );

  return {
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    updateToSuccess,
    updateToError,
  };
}

// También exportamos como default para mantener compatibilidad
export default useNotifications;
