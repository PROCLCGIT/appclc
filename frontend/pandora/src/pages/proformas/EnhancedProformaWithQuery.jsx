// src/pages/proformas/EnhancedProformaWithQuery.jsx

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

// Componentes UI
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

// Utilidad de atajos de teclado
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from "./utils/keyboardShortcuts";
import KeyboardShortcutsHelp from "./components/KeyboardShortcutsHelp";

// Componentes personalizados
import ProformaTabs from "./components/ProformaTabs";
import ProformaTemplate from "./components/ProformaTemplate";
import ProformaHeader from "./components/ProformaHeader";
import ProformaActions from "./components/ProformaActions";
import ProformaDialogs from "./components/ProformaDialogs";
import ProformaContent from "./components/ProformaContent";

// Contexto y hooks con React Query
import {
  ProformaProvider,
  useProformaContextQuery,
} from "./hooks/useProformaContextQuery";
import useClientSearchQuery from "./hooks/useClientSearchQuery";
import useProductSearchQuery from "./hooks/useProductSearchQuery";
import useDialogControl from "./hooks/useDialogControl";
import useTotalsCalculation from "./hooks/useTotalsCalculation";
import useProformaActions from "./hooks/useProformaActions";
import { useItemsHandlers } from "./handlers/itemsHandlers";
import { useClientHandlers } from "./handlers/clientHandlers";
import useProformaTemplate from "./hooks/useProformaTemplate";
import useProformaInitialization from "./hooks/useProformaInitialization";
import useErrorHandler from "./hooks/useErrorHandler.jsx";
// import useNotifications from "./hooks/useNotifications.jsx"; // No usado
import useProformaSelection from "./hooks/useProformaSelection.jsx";
import useDelayedFlag from "@/hooks/useDelayedFlag";
import { SkeletonProforma } from "@/components/SkeletonList";

/**
 * Componente principal que implementa el contexto y la lógica de proformas con React Query
 */
const EnhancedProformaContent = () => {
  // --- INICIO: Llamadas a Hooks movidas al principio ---

  // Obtener parámetros de la URL
  const [searchParams] = useSearchParams();
  const isNewProforma = searchParams.get("new") === "true";

  // Estado para capturar errores específicos
  const [contentError, setContentError] = useState(null);

  // Hooks para notificaciones y errores
  // const notify = useNotifications(); // No usado
  const errorHandler = useErrorHandler();

  // Acceder al contexto de proformas con React Query
  const { state, actions } = useProformaContextQuery();
  const {
    proformas = [],
    activeProformaId = null,
    loading = false,
    // client = null, // No usado directamente aquí
    // items = [], // Obtenido de proforma activa
    previewMode = false,
    config = {},
    searchState = {}, // Recuperar searchState del contexto
  } = state || {};
  
  // Desestructurar solo las acciones que necesitamos para romper el ciclo de dependencias
  const { 
    updateSearchState, 
    setLoading, 
    addNewProforma, 
    loadSavedProformas,
    updateProforma,
    setActiveProformaId,
    setPreviewMode,
    closeProforma
  } = actions;

  // Usar delayed flag para evitar flash de loading
  const showSkeletons = useDelayedFlag(loading, 300);

  // Inicializar hook para la plantilla y configuración
  const { company } = useProformaTemplate();

  // Inicializar hooks para búsqueda con React Query
  const { 
    clientes, 
    loadingClientes, 
    loadClientes,
    searchCliente // Usamos esta función para la búsqueda manual
  } = useClientSearchQuery();

  const { 
    searchTerm,
    setSearchTerm,
    searchSource, 
    setSearchSource,
    viewType,
    setViewType,
    searchResults,
    loadingProducts,
    searchProducts,
    loadInitialProducts
  } = useProductSearchQuery();

  // Inicializar hook para inicialización de proformas
  const { loadSpecificProforma } = useProformaInitialization({
    isNewProforma,
    setLoadExisting: setLoading, // Usar setLoading como equivalente a setLoadExisting
    addNewProforma,
    loadProforma: actions.loadProforma,
    loadClientes,
    loadInitialProducts,
    errorHandler, // Pasar errorHandler si es necesario
  });
  
  // Configura los atajos de teclado globales de la aplicación
  const globalShortcuts = [
    {
      ...COMMON_SHORTCUTS.SAVE,
      action: () => {
        if (activeProformaId) {
          handleAction("save");
          toast.success("Proforma guardada con atajo de teclado");
        }
      }
    },
    {
      ...COMMON_SHORTCUTS.NEW,
      action: () => {
        handleAction("new");
        toast.success("Nueva proforma creada con atajo de teclado");
      }
    },
    {
      ...COMMON_SHORTCUTS.PREVIEW,
      action: () => {
        setPreviewMode(!previewMode);
        toast.success(previewMode 
          ? "Modo edición activado con atajo de teclado" 
          : "Vista previa activada con atajo de teclado"
        );
      }
    },
    {
      ...COMMON_SHORTCUTS.HELP,
      action: () => {
        // Abrir el panel de ayuda de atajos de teclado
        // Se implementará a través del ref del componente KeyboardShortcutsHelp
        document.getElementById('keyboard-shortcuts-help-trigger')?.click();
      }
    }
  ];
  
  // Registra los atajos de teclado
  useKeyboardShortcuts(globalShortcuts, {
    scope: 'global',
    enabled: true,
    dependencies: [activeProformaId, previewMode]
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
    closeSaveDialog,
    showErrorDialog,
    showWarningDialog,
    showSuccessDialog,
  } = useDialogControl({ 
    loadSavedProformas: actions.loadSavedProformas 
  });
  
  // Obtener items de la proforma activa (si existe)
  const activeProforma = useMemo(() => proformas.find(p => p.id === activeProformaId), [proformas, activeProformaId]);
  const items = activeProforma?.items || [];
  
  // Inicializar hooks para cálculos y acciones
  const { formatCurrency, recalculateTotals } = useTotalsCalculation({
    activeProformaId,
    proformas,
    updateProforma: actions.updateProforma,
    config,
    items, // Pasar los items actuales
  });

  const { handleAction } = useProformaActions({
    proformas,
    activeProformaId,
    updateProforma,
    addNewProforma,
    closeProforma,
    loadProforma: actions.loadProforma,
    saveProforma: actions.saveProforma,
    changeProformaState: actions.changeProformaState,
    duplicateProforma: actions.duplicateProforma,
    formatCurrency,
    showSuccessDialog,
    showErrorDialog,
    showWarningDialog,
    errorHandler, // Pasar errorHandler
  });

  // Hook para la selección de proformas
  const { handleSelectProforma } = useProformaSelection({
    proformas,
    setActiveProformaId,
    closeProformasDialog,
    handleAction,
    loadSpecificProforma,
    errorHandler,
    setLoading,
  });

  // Inicializar hooks para gestión de items y clientes
  const { 
    addItem, 
    updateItem, 
    removeItem, 
    addProductFromSearch,
    reorderItems // Obtener la nueva función para reordenar ítems
  } = useItemsHandlers({
      activeProformaId,
      proformas,
      updateProforma,
      setItems: actions.setItems, // Asegúrate que actions.setItems exista y sea correcto
      recalculateTotals,
      errorHandler, // Pasar errorHandler
    });

  const { handleSelectClient } = useClientHandlers({
    activeProformaId,
    updateProforma,
    setClient: actions.setClient, // Asegúrate que actions.setClient exista
    errorHandler, // Pasar errorHandler
  });

  // Función para manejar la selección de un cliente
  const handleClientSelection = useCallback((selectedClient) => {
    const success = handleSelectClient(selectedClient);
    if (success) {
      closeClientSearch();
    }
  }, [handleSelectClient, closeClientSearch]);

  // Función para cargar proformas guardadas
  const handleLoadProformas = useCallback(async () => {
    try {
      setLoading(true);

      const options = {
        showToasts: true,
        itemsLimit: 10,
        forceRefresh: true,
      };

      const loadedProformas = await loadSavedProformas(options);
      return loadedProformas || [];
    } catch (error) {
      errorHandler.handleError(error, "handleLoadProformas");
      return [];
    } finally {
      setLoading(false);
    }
  }, [loadSavedProformas, setLoading, errorHandler]);

  // Cargar proformas cuando se abre el diálogo
  useEffect(() => {
    console.log('Efecto de diálogo proformas', showProformasDialog);
    if (showProformasDialog) {
      handleLoadProformas().catch((e) => {
        errorHandler.handleError(e, "loadProformasEffect");
      });
    }
  }, [showProformasDialog, handleLoadProformas, errorHandler]);

  // Actualizar estado de búsqueda en el contexto global
  useEffect(() => {
    console.log('Efecto updateSearchState', searchTerm, searchSource, viewType);
    // Solo actualizar searchState en contexto cuando cambien criterios principales
    updateSearchState({
      searchTerm,
      searchSource,
      viewType,
      showSearchResults: searchTerm.length >= 2,
    });
  }, [searchTerm, searchSource, viewType, updateSearchState]);

  // Manejador de errores para capturar errores asíncronos o de eventos
  useEffect(() => {
    const handleError = (event) => {
      console.error("Error capturado en EnhancedProformaContent (evento):", event.error);
      if (!contentError) { // Evitar sobreescribir un error ya existente
          setContentError(event.error);
      }
      event.preventDefault();
    };
    window.addEventListener("error", handleError);
    // Listener para promesas rechazadas no controladas
    const handleRejection = (event) => {
        console.error("Promesa rechazada no controlada:", event.reason);
        if (!contentError) { 
            setContentError(event.reason instanceof Error ? event.reason : new Error(JSON.stringify(event.reason)));
        }
        event.preventDefault();
    };
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
        window.removeEventListener("error", handleError);
        window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, [contentError]); // Volver a adjuntar si contentError cambia (aunque podría no ser necesario)

  // Componentes separados para reducir dependencias en memoización

  // Memoizar la función para actualizar una proforma
  const handleUpdateProforma = useCallback((proformaId, updates) => {
    updateProforma(proformaId, updates);
  }, [updateProforma]);

  // Memoizar la función para actualizar el estado de búsqueda
  const handleSearchStateUpdate = useCallback((show) => {
    updateSearchState({ showSearchResults: show });
  }, [updateSearchState]);

  // Memoizar la función para crear nueva proforma
  const handleAddNewProforma = useCallback(() => {
    handleAction("new");
  }, [handleAction]);

  // Las props para el componente ProformaContent están ya preparadas
  const proformaContentProps = {
    previewMode,
    updateProforma: handleUpdateProforma,
    company,
    config,
    openClientSearch,
    addItem,
    updateItem,
    removeItem,
    reorderItems,
    searchTerm,
    setSearchTerm,
    searchSource,
    setSearchSource,
    searchState,
    updateSearchState: handleSearchStateUpdate,
    searchResults,
    addProductFromSearch,
    searchProducts,
    viewType,
    setViewType,
    loadingProducts,
    formatCurrency
  };

  // Memoizar las pestañas para evitar re-renders innecesarios
  const proformaTabs = useMemo(
    () => (
      <ProformaTabs
        proformas={proformas}
        activeProformaId={activeProformaId}
        setActiveProformaId={setActiveProformaId}
        closeProforma={closeProforma}
        addNewProforma={handleAddNewProforma}
      >
        {proformas.map((proforma) => (
          <TabsContent key={proforma.id} value={proforma.id.toString()}>
            <Card className="border rounded-lg shadow-sm overflow-hidden transition-all">
              <ProformaContent 
                proforma={proforma}
                {...proformaContentProps} 
              />
            </Card>
          </TabsContent>
        ))}
      </ProformaTabs>
    ),
    [
      proformas,
      activeProformaId,
      setActiveProformaId, 
      closeProforma,
      handleAddNewProforma
    ]
  );

  // --- FIN: Llamadas a Hooks movidas al principio ---

  // Renderizado condicional basado en errores (después de llamar a los hooks)
  if (contentError) {
    return (
      <div className="p-6 max-w-6xl mx-auto bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-xl font-bold text-yellow-700 mb-4">Error en el contenido</h2>
        <p className="text-yellow-600 mb-2">
          {contentError instanceof Error ? contentError.message : "Se produjo un error desconocido."}
        </p>
        {contentError instanceof Error && contentError.stack && (
           <details className="mb-4">
             <summary className="cursor-pointer text-yellow-500 mb-2">Ver detalles técnicos</summary>
             <pre className="bg-yellow-100 p-4 rounded overflow-auto text-xs">
               {contentError.stack}
             </pre>
           </details>
        )}
        <button 
          onClick={() => window.location.reload()} // O una función de reseteo más específica
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors mt-4"
        >
          Reintentar Carga
        </button>
      </div>
    );
  }

  // Renderizado principal del componente
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Encabezado de la página */}
      <ProformaHeader
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        openProformasDialog={openProformasDialog}
        handleNew={() => handleAction("new")}
      />

      {/* Mostrar skeleton si está cargando, o las pestañas con proformas si no */}
      {showSkeletons ? (
        <Card className="border rounded-lg shadow-sm overflow-hidden transition-all">
          <CardContent className="p-6">
            <SkeletonProforma />
          </CardContent>
        </Card>
      ) : proformas.length > 0 ? ( // Solo renderizar tabs si hay proformas
        proformaTabs
      ) : (
        <Card className="border rounded-lg shadow-sm overflow-hidden transition-all">
           <CardContent className="p-6 text-center text-gray-500">
             No hay proformas activas. Crea una nueva o carga una existente.
           </CardContent>
         </Card>
      )}

      {/* Botones de acción (solo si hay una proforma activa?) */}
      {activeProformaId && <ProformaActions handleAction={handleAction} />}

      {/* Diálogos */}
      <ProformaDialogs
        // Diálogo de búsqueda de clientes
        showClientSearch={showClientSearch}
        closeClientSearch={closeClientSearch}
        handleClientSelection={handleClientSelection}
        clientes={clientes}
        loadingClientes={loadingClientes}
        searchClientes={searchCliente} // Usar la función de búsqueda
        onRequestLoadClientes={loadClientes} // Pasar la función loadClientes para cargar inicialmente
        // Diálogo de proformas guardadas
        showProformasDialog={showProformasDialog}
        closeProformasDialog={closeProformasDialog}
        handleSelectProforma={handleSelectProforma}
        onLoadProformas={handleLoadProformas} // La función que carga proformas
        proformas={state.savedProformas || []} // Usar proformas guardadas del estado global si existen
        loading={loading} // Loading general o específico de proformas guardadas?
        errorHandler={errorHandler}
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
};

/**
 * Componente wrapper que proporciona el contexto de proformas y maneja errores globales
 */
export default function EnhancedProformaWithQuery() {
  return (
    <ProformaProvider>
      <EnhancedProformaContent />
    </ProformaProvider>
  );
}
