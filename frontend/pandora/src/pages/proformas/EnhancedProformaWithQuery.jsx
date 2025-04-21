// src/pages/proformas/EnhancedProformaWithQuery.jsx

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

// Componentes UI
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

// Componentes personalizados
import ProformaTabs from "./components/ProformaTabs";
import ProformaTemplate from "./components/ProformaTemplate";
import ProformaHeader from "./components/ProformaHeader";
import ProformaActions from "./components/ProformaActions";
import ProformaDialogs from "./components/ProformaDialogs";

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
import useNotifications from "./hooks/useNotifications.jsx";
import useProformaSelection from "./hooks/useProformaSelection.jsx";
import useDelayedFlag from "@/hooks/useDelayedFlag";
import { SkeletonProforma } from "@/components/SkeletonList";

/**
 * Componente principal que implementa el contexto y la lógica de proformas con React Query
 */
const EnhancedProformaContent = () => {
  // Estado para capturar errores específicos
  const [contentError, setContentError] = useState(null);

  // Manejador de errores global para este componente
  useEffect(() => {
    const handleError = (event) => {
      console.error("Error capturado en EnhancedProformaContent:", event.error);
      setContentError(event.error);
      event.preventDefault();
    };
    
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (contentError) {
    return (
      <div className="p-6 max-w-6xl mx-auto bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-xl font-bold text-yellow-700 mb-4">Error en el contenido</h2>
        <p className="text-yellow-600 mb-2">{contentError.message}</p>
        <pre className="bg-yellow-100 p-4 rounded overflow-auto text-xs">
          {contentError.stack}
        </pre>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors mt-4"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Obtener parámetros de la URL
  const [searchParams] = useSearchParams();
  const isNewProforma = searchParams.get("new") === "true";

  // Hooks para notificaciones y errores
  const notify = useNotifications();
  const errorHandler = useErrorHandler();

  // Acceder al contexto de proformas con React Query
  const { state, actions } = useProformaContextQuery();
  const {
    proformas = [],
    activeProformaId = null,
    loading = false,
    client = null,
    items = [],
    previewMode = false,
    config = {},
    searchState = {},
  } = state || {};
  
  // Usar delayed flag para evitar flash de loading
  const showSkeletons = useDelayedFlag(loading, 300);

  // Inicializar hook para la plantilla y configuración
  const { company } = useProformaTemplate();

  // Inicializar hooks para búsqueda con React Query
  const { 
    clientes, 
    loadingClientes, 
    loadClientes,
    searchCliente
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
    setLoadExisting: actions.setLoadExisting,
    addNewProforma: actions.addNewProforma,
    loadProforma: actions.loadProforma,
    loadClientes,
    loadInitialProducts,
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

  // Inicializar hooks para cálculos y acciones
  const { formatCurrency, recalculateTotals } = useTotalsCalculation({
    activeProformaId,
    proformas,
    updateProforma: actions.updateProforma,
    config,
    items,
  });

  const { handleAction } = useProformaActions({
    proformas,
    activeProformaId,
    updateProforma: actions.updateProforma,
    addNewProforma: actions.addNewProforma,
    closeProforma: actions.closeProforma,
    loadProforma: actions.loadProforma,
    saveProforma: actions.saveProforma,
    changeProformaState: actions.changeProformaState,
    duplicateProforma: actions.duplicateProforma,
    formatCurrency,
    showSuccessDialog,
    showErrorDialog,
    showWarningDialog,
  });

  // Hook para la selección de proformas
  const { handleSelectProforma } = useProformaSelection({
    proformas,
    setActiveProformaId: actions.setActiveProformaId,
    closeProformasDialog,
    handleAction,
    loadSpecificProforma,
    errorHandler,
    setLoading: actions.setLoading,
  });

  // Inicializar hooks para gestión de items y clientes
  const { addItem, updateItem, removeItem, addProductFromSearch } =
    useItemsHandlers({
      activeProformaId,
      proformas,
      updateProforma: actions.updateProforma,
      setItems: actions.setItems,
      recalculateTotals,
    });

  const { handleSelectClient } = useClientHandlers({
    activeProformaId,
    updateProforma: actions.updateProforma,
    setClient: actions.setClient,
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
      actions.setLoading(true);

      const options = {
        showToasts: true,
        itemsLimit: 10,
        forceRefresh: true,
      };

      const loadedProformas = await actions.loadSavedProformas(options);
      return loadedProformas || [];
    } catch (error) {
      errorHandler.handleError(error, "handleLoadProformas");
      return [];
    } finally {
      actions.setLoading(false);
    }
  }, [actions, errorHandler]);

  // Cargar proformas cuando se abre el diálogo
  useEffect(() => {
    if (showProformasDialog) {
      handleLoadProformas().catch((e) => {
        errorHandler.handleError(e, "loadProformasEffect");
      });
    }
  }, [showProformasDialog, handleLoadProformas, errorHandler]);

  // Efecto para recalcular totales cuando cambia la proforma activa
  useEffect(() => {
    if (activeProformaId && !loading) {
      const recalcTimer = setTimeout(() => {
        const currentProforma = proformas.find(
          (p) => p.id === activeProformaId,
        );
        if (currentProforma?.items?.length > 0) {
          recalculateTotals();
        }
      }, 300);

      return () => clearTimeout(recalcTimer);
    }
  }, [activeProformaId, loading, proformas, recalculateTotals]);

  // Actualizar estado de búsqueda en el contexto global
  useEffect(() => {
    actions.updateSearchState({
      searchTerm,
      searchSource,
      searchResults,
      loadingProducts,
      viewType,
      showSearchResults: searchTerm.length >= 2,
    });
  }, [searchTerm, searchSource, searchResults, loadingProducts, viewType, actions]);

  // Memoizar las pestañas para evitar re-renders innecesarios
  const proformaTabs = useMemo(
    () => (
      <ProformaTabs
        proformas={proformas}
        activeProformaId={activeProformaId}
        setActiveProformaId={actions.setActiveProformaId}
        closeProforma={actions.closeProforma}
        addNewProforma={actions.addNewProforma}
      >
        {proformas.map((proforma) => (
          <TabsContent key={proforma.id} value={proforma.id.toString()}>
            <Card className="border rounded-lg shadow-sm overflow-hidden transition-all">
              <CardContent className="p-0">
                <div
                  className={`p-6 ${previewMode ? "bg-gray-50 bg-opacity-50" : ""}`}
                >
                  <ProformaTemplate
                    previewMode={previewMode}
                    quote={proforma.quote}
                    setQuote={(newQuote) =>
                      actions.updateProforma(proforma.id, { quote: newQuote })
                    }
                    client={proforma.client}
                    setClient={(newClient) =>
                      actions.updateProforma(proforma.id, { client: newClient })
                    }
                    items={proforma.items || []}
                    setItems={(newItems) =>
                      actions.updateProforma(proforma.id, { items: newItems })
                    }
                    company={company}
                    config={config || {}}
                    handleClientSearch={openClientSearch}
                    addItem={addItem}
                    updateItem={updateItem}
                    removeItem={removeItem}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    searchSource={searchSource}
                    setSearchSource={setSearchSource}
                    showSearchResults={searchTerm.length >= 2}
                    setShowSearchResults={(show) =>
                      actions.updateSearchState({ showSearchResults: show })
                    }
                    searchResults={searchResults}
                    addProductFromSearch={addProductFromSearch}
                    searchProducts={searchProducts}
                    viewType={viewType}
                    setViewType={setViewType}
                    loadingProducts={loadingProducts}
                    formatCurrency={formatCurrency}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </ProformaTabs>
    ),
    [
      proformas,
      activeProformaId,
      actions,
      previewMode,
      company,
      config,
      searchTerm,
      searchSource,
      searchResults,
      loadingProducts,
      viewType,
      openClientSearch,
      addItem,
      updateItem,
      removeItem,
      addProductFromSearch,
      searchProducts,
      formatCurrency,
      setSearchTerm,
      setSearchSource,
      setViewType,
    ]
  );

  try {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        {/* Encabezado de la página */}
        <ProformaHeader
          previewMode={previewMode}
          setPreviewMode={actions.setPreviewMode}
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
        ) : (
          proformaTabs
        )}

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
          onLoadProformas={handleLoadProformas}
          proformas={proformas}
          loading={loading}
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
  } catch (err) {
    console.error("Error en EnhancedProformaContent:", err);
    setContentError(err);
    return null;
  }
};

/**
 * Componente wrapper que proporciona el contexto de proformas
 */
export default function EnhancedProformaWithQuery() {
  // Añadir un manejador de errores para capturar cualquier problema
  const [error, setError] = useState(null);

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-700 mb-4">Error al cargar el componente</h2>
        <p className="text-red-600 mb-2">{error.message}</p>
        <details className="mb-4">
          <summary className="cursor-pointer text-red-500 mb-2">Ver detalles técnicos</summary>
          <pre className="bg-red-100 p-4 rounded overflow-auto text-xs">
            {error.stack}
          </pre>
        </details>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  try {
    return (
      <ProformaProvider>
        <EnhancedProformaContent />
      </ProformaProvider>
    );
  } catch (err) {
    console.error("Error al renderizar EnhancedProformaWithQuery:", err);
    setError(err);
    return null;
  }
}
