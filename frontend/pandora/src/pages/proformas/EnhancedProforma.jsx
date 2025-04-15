// src/pages/proformas/EnhancedProforma.jsx

import React, { useState, useEffect, useCallback } from "react"; // Added useEffect, useCallback
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

// Servicios API
import { proformasService } from "@/services/api";

// Componentes UI
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

// Componentes personalizados
import ProformaTabs from "./components/ProformaTabs";
import ProformaTemplate from "./components/ProformaTemplate";
import ProformaHeader from "./components/ProformaHeader";
import ProformaActions from "./components/ProformaActions";
import ProformaDialogs from "./components/ProformaDialogs";

// Custom hooks
import useEnhancedProforma from "./hooks/useEnhancedProforma";
import useClientSearch from "./hooks/useClientSearch";
import useProductSearch from "./hooks/useProductSearch";
import useDialogControl from "./hooks/useDialogControl";
import useTotalsCalculation from "./hooks/useTotalsCalculation";
import useProformaActions from "./hooks/useProformaActions";
import { useItemsHandlers } from "./handlers/itemsHandlers";
import { useClientHandlers } from "./handlers/clientHandlers";
import useProformaTemplate from "./hooks/useProformaTemplate";
import useProformaSync from "./hooks/useProformaSync";
import useProformaInitialization from "./hooks/useProformaInitialization";
import useErrorHandler from "./hooks/useErrorHandler";

/**
 * Este componente principal:
 * - Usa múltiples custom hooks para manejar diferentes aspectos de la funcionalidad
 * - Controla el estado de preview (vista previa / edición)
 * - Sincroniza los datos (quote, client, items) de la proforma activa
 * - Renderiza las pestañas y, dentro, el ProformaTemplate para la proforma seleccionada
 */
export default function EnhancedProforma() {
  // Obtener parámetros de la URL
  const [searchParams] = useSearchParams();
  const isNewProforma = searchParams.get('new') === 'true';

  // Inicializar el manejador centralizado de errores
  const errorHandler = useErrorHandler();

  // Inicializar hook principal de proformas
  const {
    proformas,
    activeProformaId,
    setActiveProformaId,
    updateProforma,
    addNewProforma,
    closeProforma,
    loadExisting,
    setLoadExisting,
    loadProforma,
    loadSavedProformas,
    loading,
    setLoading // Added setLoading
  } = useEnhancedProforma();

  // Inicializar hook para la plantilla y configuración
  const {
    config,
    company,
    previewMode,
    setPreviewMode
  } = useProformaTemplate();

  // Inicializar hook para sincronización de datos
  const {
    items,
    setItems,
    client,
    setClient
  } = useProformaSync({
    activeProformaId,
    proformas,
    updateProforma,
    loading
  });

  // Inicializar hooks para búsqueda primero
  const {
    clientes,
    loadingClientes,
    loadClientes
  } = useClientSearch();

  const {
    searchTerm,
    setSearchTerm,
    searchSource,
    setSearchSource,
    searchResults,
    setSearchResults,
    showSearchResults,
    setShowSearchResults,
    loadingProducts,
    viewType,
    setViewType,
    searchProducts,
    loadInitialProducts
  } = useProductSearch(proformasService);

  // Inicializar hook para inicialización de proformas luego de tener loadClientes y loadInitialProducts
  // Evitamos pasar loadSavedProformas directamente para evitar problemas de referencias circulares
  const {
    loadSpecificProforma
  } = useProformaInitialization({
    isNewProforma,
    setLoadExisting,
    addNewProforma,
    loadProforma,
    loadClientes,
    loadInitialProducts
  });

  // Inicializar hooks para diálogos
  const {
    showClientSearch,
    showProformasDialog,
    showSaveDialog,
    saveDialogType,
    saveDialogTitle,
    saveDialogMessage,
    saveDialogDetails,
    savedProformaId,
    openClientSearch,
    closeClientSearch,
    openProformasDialog,
    closeProformasDialog,
    showErrorDialog,
    showWarningDialog,
    showSuccessDialog,
    closeSaveDialog
  } = useDialogControl({ loadSavedProformas }); // Pass loadSavedProformas

  // Inicializar hooks para cálculos y acciones
  const {
    formatCurrency,
    recalculateTotals
  } = useTotalsCalculation({
    activeProformaId,
    proformas,
    updateProforma,
    config,
    items
  });

  const {
    handleAction
  } = useProformaActions({
    proformas,
    activeProformaId,
    updateProforma,
    addNewProforma,
    closeProforma,
    loadProforma,
    formatCurrency,
    showSuccessDialog,
    showErrorDialog,
    showWarningDialog
  });

  // Inicializar hooks para gestión de items y clientes
  const {
    addItem,
    updateItem,
    removeItem,
    addProductFromSearch
  } = useItemsHandlers({
    activeProformaId,
    proformas,
    updateProforma,
    setItems,
    recalculateTotals
  });

  const {
    handleSelectClient
  } = useClientHandlers({
    activeProformaId,
    updateProforma,
    setClient
  });

  // Función para manejar la selección de un cliente incorporando la acción de cerrar el diálogo
  const handleClientSelection = (selectedClient) => {
    const success = handleSelectClient(selectedClient);
    if (success) {
      closeClientSearch();
    }
  };

  // Control de rate limiting
  const [lastProformaSelectionTime, setLastProformaSelectionTime] = useState(0);

  // Función para manejar la selección de una proforma con control de rate limiting mejorado y manejo centralizado de errores
  const handleSelectProforma = useCallback(async (proformaId) => { // Added useCallback
    try {
      console.log(`handleSelectProforma: Seleccionada proforma con ID: ${proformaId}`);

      // Control de rate limiting más estricto con backoff exponencial
      const now = Date.now();
      const timeSinceLastSelection = now - lastProformaSelectionTime;
      const minWaitTime = 3000; // Tiempo mínimo base entre selecciones

      // Tiempo de espera aumenta según la cantidad de errores de tipo rateLimit
      const rateLimitCount = errorHandler.errorCounts.rateLimit || 0;
      const waitMultiplier = Math.max(1, 1 + (rateLimitCount * 0.5)); // 1x, 1.5x, 2x, etc.
      const adjustedWaitTime = minWaitTime * waitMultiplier;

      if (timeSinceLastSelection < adjustedWaitTime) {
        const remainingTime = Math.ceil((adjustedWaitTime - timeSinceLastSelection) / 1000);
        console.log(`Ignorando selección rápida de proforma (debounce). Espere ${remainingTime}s más`);

        // Notificar al usuario solo si es muy rápido (menos de la mitad del tiempo requerido)
        if (timeSinceLastSelection < (adjustedWaitTime / 2)) {
          toast.warning(`Por favor, espere ${remainingTime} segundos entre acciones`, {
            description: "Procesando la solicitud anterior...",
            duration: 3000
          });
        }
        return;
      }

      // Registrar el momento de esta selección
      setLastProformaSelectionTime(now);

      // Si es una nueva proforma
      if (proformaId === "new") {
        console.log("Solicitando crear nueva proforma");

        // Cerrar el diálogo primero para evitar interacciones dobles
        if (typeof closeProformasDialog === 'function') {
          closeProformasDialog();
        }

        // Pequeño delay para asegurar que el diálogo se cierre primero
        setTimeout(() => {
          handleAction("new");
        }, 300);
        return;
      }

      // Convertir a string para comparación consistente
      const proformaIdStr = proformaId?.toString();

      // Validar el ID antes de continuar
      if (!proformaIdStr || proformaIdStr === 'undefined' || proformaIdStr === 'null') {
        errorHandler.handleError(
          new Error('ID de proforma inválido: ' + proformaId),
          'handleSelectProforma'
        );
        return;
      }

      // Ya no soportamos proformas de demostración
      const isDemoProforma = proformaIdStr.startsWith('demo-');
      if (isDemoProforma) {
        toast.info("Las proformas de demostración están deshabilitadas. Cargando desde la base de datos.");
        return;
      }

      // Comprobar si la proforma ya está cargada por su ID en la base de datos
      const proformaIndex = proformas.findIndex(p =>
        (p.savedId && p.savedId.toString() === proformaIdStr) ||
        (p.id && p.id.toString() === proformaIdStr)
      );

      if (proformaIndex !== -1) {
        // Si ya está cargada, solo cambiar la activa
        console.log(`La proforma ${proformaId} ya está cargada, cambiando a activa`);

        // Cerrar el diálogo primero
        if (typeof closeProformasDialog === 'function') {
          closeProformasDialog();
        }

        // Pequeño delay para asegurar que la UI responda bien
        setTimeout(() => {
          setActiveProformaId(proformas[proformaIndex].id);
          toast.success("Proforma cargada", { duration: 2000 });

          // Resetear contadores de error cuando hay una operación exitosa
          errorHandler.resetErrorCounts();
        }, 100);
      } else {
        // Si no está cargada, cargarla con manejo de bloqueo mejorado
        console.log(`Cargando proforma ${proformaId} desde el servidor`);

        // Usar un flag para evitar múltiples notificaciones
        let isHandled = false;

        // Mostrar indicador de carga con retraso para evitar parpadeos en cargas rápidas
        const loadToastTimeoutId = setTimeout(() => {
          if (!isHandled) {
            toast.loading("Cargando proforma...", { id: "proforma-loading" });
          }
        }, 500);

        try {
          // Cerrar el diálogo de proformas antes de cargar para evitar múltiples interacciones
          if (typeof closeProformasDialog === 'function') {
            closeProformasDialog();
          }

          // Intentar cargar la proforma
          const loadedProforma = await loadSpecificProforma(proformaId);

          // Marcar como manejado para evitar que se muestre el toast retrasado
          isHandled = true;
          clearTimeout(loadToastTimeoutId);

          // Ocultar el toast de carga si existe
          toast.dismiss("proforma-loading");

          if (!loadedProforma) {
            errorHandler.handleError(
              new Error(`No se pudo cargar la proforma ${proformaId}`),
              'handleSelectProforma'
            );
          } else {
            toast.success("Proforma cargada correctamente");

            // Resetear contadores de error cuando hay una operación exitosa
            errorHandler.resetErrorCounts();
          }
        } catch (loadError) {
          // Marcar como manejado
          isHandled = true;
          clearTimeout(loadToastTimeoutId);

          // Ocultar el toast de carga si existe
          toast.dismiss("proforma-loading");

          // Usar el manejador centralizado de errores
          const errorType = errorHandler.handleError(loadError, 'loadSpecificProforma');

          // Acciones específicas según tipo de error
          if (errorType === 'rateLimit') {
            // Actualizar el tiempo de la última selección para forzar un tiempo de espera más largo
            setLastProformaSelectionTime(now + (10000 * (errorHandler.errorCounts.rateLimit || 1)));
          }
        }
      }
    } catch (error) {
      // Manejar errores generales no capturados
      errorHandler.handleError(error, 'handleSelectProforma-general');
    } finally {
      setLoading(false);
    }
  }, [proformas, setActiveProformaId, closeProformasDialog, handleAction, loadSpecificProforma, errorHandler, loadSavedProformas]); // Added dependencies

  // Función para cargar proformas, independiente del efecto para que pueda ser pasada a ProformasDialog
  const handleLoadProformas = useCallback(async () => {
    console.log("handleLoadProformas: Solicitando carga de proformas guardadas");
    try {
      setLoading(true);
      // Usar opciones específicas para este contexto
      const options = {
        showToasts: true,
        itemsLimit: 10,
        forceRefresh: true // Forzar actualización desde el servidor
      };
      
      const loadedProformas = await loadSavedProformas(options);
      console.log(`handleLoadProformas: ${loadedProformas?.length || 0} proformas cargadas`);
      return loadedProformas || [];
    } catch (error) {
      console.error("Error en handleLoadProformas:", error);
      errorHandler.handleError(error, 'handleLoadProformas');
      return []; // Devolver array vacío en caso de error
    } finally {
      setLoading(false);
    }
  }, [loadSavedProformas, errorHandler, setLoading]);
  
  // Load saved proformas when the dialog is opened - simplificado
  useEffect(() => {
    if (showProformasDialog) {
      handleLoadProformas().catch(e => {
        console.error("Error al cargar proformas en efecto:", e);
      });
    }
  }, [showProformasDialog, handleLoadProformas]);
  
  // Efecto para recalcular totales cuando cambia la proforma activa
  useEffect(() => {
    if (activeProformaId && !loading) {
      // Pequeño retraso para asegurar que todos los datos están cargados
      const recalcTimer = setTimeout(() => {
        // Obtener la proforma activa actual
        const currentProforma = proformas.find(p => p.id === activeProformaId);
        // Solo recalcular si hay items
        if (currentProforma && currentProforma.items && currentProforma.items.length > 0) {
          console.log(`Forzando recálculo de totales para proforma activa: ${activeProformaId}`);
          recalculateTotals();
        }
      }, 300);
      
      return () => clearTimeout(recalcTimer);
    }
  }, [activeProformaId, loading, recalculateTotals, proformas]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Encabezado de la página */}
      <ProformaHeader
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        openProformasDialog={openProformasDialog}
        handleNew={() => handleAction("new")}
      />

      {/* Pestañas (Tabs) */}
      <ProformaTabs
        proformas={proformas}
        activeProformaId={activeProformaId}
        setActiveProformaId={setActiveProformaId}
        closeProforma={closeProforma}
        addNewProforma={addNewProforma}
      >
        {proformas.map((proforma) => (
          <TabsContent key={proforma.id} value={proforma.id.toString()}>
            <Card className="border rounded-lg shadow-sm overflow-hidden transition-all">
              <CardContent className="p-0">
                <div className={`p-6 ${previewMode ? "bg-gray-50 bg-opacity-50" : ""}`}>
                  <ProformaTemplate
                    previewMode={previewMode}
                    quote={proforma.quote}
                    setQuote={(newQuote) => updateProforma(proforma.id, { quote: newQuote })}
                    client={proforma.client}
                    setClient={(newClient) => updateProforma(proforma.id, { client: newClient })}
                    items={proforma.items || []}
                    setItems={(newItems) => updateProforma(proforma.id, { items: newItems })}
                    company={company}
                    config={config}
                    handleClientSearch={openClientSearch}
                    addItem={addItem}
                    updateItem={updateItem}
                    removeItem={removeItem}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    searchSource={searchSource}
                    setSearchSource={setSearchSource}
                    showSearchResults={showSearchResults}
                    setShowSearchResults={setShowSearchResults}
                    searchResults={searchResults}
                    addProductFromSearch={addProductFromSearch}
                    searchProducts={searchProducts}
                    viewType={viewType}
                    setViewType={setViewType}
                    loadingProducts={loadingProducts}
                    formatCurrency={value => formatCurrency(value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </ProformaTabs>

      {/* Botones de acción */}
      <ProformaActions handleAction={handleAction} />

      {/* Diálogos */}
      <ProformaDialogs
        // Diálogo de búsqueda de clientes
        showClientSearch={showClientSearch}
        closeClientSearch={closeClientSearch}
        handleClientSelection={handleClientSelection}
        clientes={clientes}
        loadingClientes={loadingClientes}

        // Diálogo de proformas guardadas
        showProformasDialog={showProformasDialog}
        closeProformasDialog={closeProformasDialog}
        handleSelectProforma={handleSelectProforma}
        onLoadProformas={handleLoadProformas} // Pasar la función para cargar proformas
        proformas={proformas}
        loading={loading} // Pass the loading state
        errorHandler={errorHandler} // Pass the errorHandler

        // Diálogo de confirmación/guardado
        showSaveDialog={showSaveDialog}
        saveDialogType={saveDialogType}
        saveDialogTitle={saveDialogTitle}
        saveDialogMessage={saveDialogMessage}
        saveDialogDetails={saveDialogDetails}
        savedProformaId={savedProformaId}
        closeSaveDialog={closeSaveDialog}
        activeProformaId={activeProformaId}
        handleAction={handleAction}
      />
    </div>
  );
}
