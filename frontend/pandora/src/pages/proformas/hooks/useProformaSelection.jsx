import React, { useCallback } from "react";
import useRateLimit from "./useRateLimit.jsx";
import useNotifications from "./useNotifications.jsx";

/**
 * Hook para manejar la selección y carga de proformas con manejo de errores
 * y rate limiting incluidos.
 *
 * @param {Object} params - Parámetros para configurar el comportamiento
 * @param {Array} params.proformas - Lista de proformas cargadas
 * @param {Function} params.setActiveProformaId - Función para cambiar la proforma activa
 * @param {Function} params.closeProformasDialog - Función para cerrar el diálogo
 * @param {Function} params.handleAction - Función para manejar acciones como "new"
 * @param {Function} params.loadSpecificProforma - Función para cargar una proforma específica
 * @param {Object} params.errorHandler - Manejador de errores
 * @param {Function} params.setLoading - Función para controlar el estado de carga
 * @returns {Object} Funciones para manejar la selección de proformas
 */
export default function useProformaSelection({
  proformas = [],
  setActiveProformaId,
  closeProformasDialog,
  handleAction,
  loadSpecificProforma,
  errorHandler,
  setLoading,
}) {
  // Inicializar hooks auxiliares
  const rateLimit = useRateLimit({ baseWaitTime: 3000 });
  const notify = useNotifications();

  /**
   * Valida el ID de una proforma
   * @param {string|number} proformaId - ID a validar
   * @returns {boolean} Verdadero si el ID es válido
   */
  const validateProformaId = useCallback(
    (proformaId) => {
      // Convertir a string para comparación consistente
      const proformaIdStr = proformaId?.toString();

      // Validar el ID básico
      if (
        !proformaIdStr ||
        proformaIdStr === "undefined" ||
        proformaIdStr === "null"
      ) {
        errorHandler.handleError(
          new Error("ID de proforma inválido: " + proformaId),
          "validateProformaId",
        );
        return false;
      }

      // Ya no soportamos proformas de demostración
      const isDemoProforma = proformaIdStr.startsWith("demo-");
      if (isDemoProforma) {
        notify.info(
          "Las proformas de demostración están deshabilitadas",
          "Cargando desde la base de datos.",
        );
        return false;
      }

      return true;
    },
    [errorHandler, notify],
  );

  /**
   * Crea una nueva proforma
   */
  const createNewProforma = useCallback(() => {
    // Cerrar el diálogo primero para evitar interacciones dobles
    if (typeof closeProformasDialog === "function") {
      closeProformasDialog();
    }

    // Pequeño delay para asegurar que el diálogo se cierre primero
    setTimeout(() => {
      handleAction("new");
    }, 300);
  }, [closeProformasDialog, handleAction]);

  /**
   * Selecciona una proforma de la lista ya cargada
   * @param {string|number} proformaId - ID de la proforma a seleccionar
   * @returns {boolean} Verdadero si se seleccionó correctamente
   */
  const selectLoadedProforma = useCallback(
    (proformaId) => {
      // Cerrar el diálogo primero
      if (typeof closeProformasDialog === "function") {
        closeProformasDialog();
      }

      // Buscar el índice de la proforma
      const proformaIndex = proformas.findIndex(
        (p) =>
          (p.savedId && p.savedId.toString() === proformaId.toString()) ||
          (p.id && p.id.toString() === proformaId.toString()),
      );

      if (proformaIndex === -1) {
        return false;
      }

      // Pequeño delay para asegurar que la UI responda bien
      setTimeout(() => {
        setActiveProformaId(proformas[proformaIndex].id);
        notify.success("Proforma cargada", { duration: 2000 });

        // Resetear contadores de error cuando hay una operación exitosa
        errorHandler.resetErrorCounts();
        rateLimit.resetErrorCount();
      }, 100);

      return true;
    },
    [
      closeProformasDialog,
      proformas,
      setActiveProformaId,
      errorHandler,
      notify,
      rateLimit,
    ],
  );

  /**
   * Carga una proforma desde el servidor
   * @param {string|number} proformaId - ID de la proforma a cargar
   * @returns {Promise<boolean>} Promesa que resuelve a verdadero si se cargó correctamente
   */
  const loadProformaFromServer = useCallback(
    async (proformaId) => {
      // Usar un flag para evitar múltiples notificaciones
      let isHandled = false;

      // Mostrar indicador de carga con retraso para evitar parpadeos en cargas rápidas
      const loadingId = setTimeout(() => {
        if (!isHandled) {
          notify.loading("Cargando proforma...", { id: "proforma-loading" });
        }
      }, 500);

      try {
        // Cerrar el diálogo de proformas antes de cargar para evitar múltiples interacciones
        if (typeof closeProformasDialog === "function") {
          closeProformasDialog();
        }

        // Intentar cargar la proforma
        const loadedProforma = await loadSpecificProforma(proformaId);

        // Marcar como manejado para evitar que se muestre el toast retrasado
        isHandled = true;
        clearTimeout(loadingId);

        // Ocultar el toast de carga si existe
        notify.dismiss("proforma-loading");

        if (!loadedProforma) {
          errorHandler.handleError(
            new Error(`No se pudo cargar la proforma ${proformaId}`),
            "loadProformaFromServer",
          );
          return false;
        } else {
          notify.success("Proforma cargada correctamente");

          // Resetear contadores de error cuando hay una operación exitosa
          errorHandler.resetErrorCounts();
          rateLimit.resetErrorCount();
          return true;
        }
      } catch (loadError) {
        // Marcar como manejado
        isHandled = true;
        clearTimeout(loadingId);

        // Ocultar el toast de carga si existe
        notify.dismiss("proforma-loading");

        // Usar el manejador centralizado de errores
        const errorType = errorHandler.handleError(
          loadError,
          "loadProformaFromServer",
        );

        // Acciones específicas según tipo de error
        if (errorType === "rateLimit") {
          // Registrar error de rate limiting
          rateLimit.registerError();
        }

        return false;
      }
    },
    [
      closeProformasDialog,
      loadSpecificProforma,
      errorHandler,
      notify,
      rateLimit,
    ],
  );

  /**
   * Función principal para manejar la selección de proformas
   * controlando rate limiting y dividiendo la lógica en pasos
   */
  const handleSelectProforma = useCallback(
    async (proformaId) => {
      try {
        // Verificar rate limiting antes de proceder
        if (rateLimit.shouldLimit("selección de proforma")) {
          return;
        }

        // Registrar la operación para control de rate limiting
        rateLimit.registerOperation();

        console.log(
          `handleSelectProforma: Seleccionada proforma con ID: ${proformaId}`,
        );

        // Caso especial: Nueva proforma
        if (proformaId === "new") {
          console.log("Solicitando crear nueva proforma");
          createNewProforma();
          return;
        }

        // Validar ID de proforma
        if (!validateProformaId(proformaId)) {
          return;
        }

        // Primero intentar seleccionar de las ya cargadas
        if (selectLoadedProforma(proformaId)) {
          console.log(
            `La proforma ${proformaId} ya estaba cargada, cambiada a activa`,
          );
          return;
        }

        // Si no está cargada, cargarla del servidor
        console.log(`Cargando proforma ${proformaId} desde el servidor`);
        await loadProformaFromServer(proformaId);
      } catch (error) {
        // Manejar errores generales no capturados
        errorHandler.handleError(error, "handleSelectProforma-general");
      } finally {
        setLoading(false);
      }
    },
    [
      rateLimit,
      createNewProforma,
      validateProformaId,
      selectLoadedProforma,
      loadProformaFromServer,
      errorHandler,
      setLoading,
    ],
  );

  return {
    handleSelectProforma,
    validateProformaId,
    createNewProforma,
    selectLoadedProforma,
    loadProformaFromServer,
  };
}
