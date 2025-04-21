/**
 * Vista optimizada de Proformas que utiliza React Query y custom hooks simplificados
 */
import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

// Componentes UI
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { SkeletonProforma } from "@/components/SkeletonList";

// Componentes específicos de proformas
import ProformaTabs from "./components/ProformaTabs";
import ProformaTemplate from "./components/ProformaTemplate";
import ProformaHeader from "./components/ProformaHeader";
import ProformaActions from "./components/ProformaActions";
import ProformaDialogs from "./components/ProformaDialogs";

// Proveedor y hooks de React Query
import { ProformaProvider, useProforma } from './providers/ProformaProvider';
import { useProductSearchQuery, useClientSearchQuery } from '@/hooks/queries/useProformaQuery';
import useDelayedFlag from '@/hooks/useDelayedFlag';

/**
 * Componente de error para mostrar cuando ocurre un error en la interfaz
 */
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-6 max-w-6xl mx-auto bg-yellow-50 border border-yellow-200 rounded-lg">
      <h2 className="text-xl font-bold text-yellow-700 mb-4">Error en la proforma</h2>
      <p className="text-yellow-600 mb-2">{error.message}</p>
      {error.stack && (
        <details className="mb-4">
          <summary className="cursor-pointer text-yellow-500 mb-2">Ver detalles técnicos</summary>
          <pre className="bg-yellow-100 p-4 rounded overflow-auto text-xs">{error.stack}</pre>
        </details>
      )}
      <button 
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors mt-4"
      >
        Reintentar
      </button>
    </div>
  );
}

/**
 * Componente principal de proforma con React Query
 */
function ProformaContent() {
  // Obtener parámetros de la URL
  const [searchParams] = useSearchParams();
  const proformaId = searchParams.get('id');
  const isNewProforma = searchParams.get('new') === 'true';
  
  // Hooks para diálogos y estado UI
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [showProformasDialog, setShowProformasDialog] = useState(false);
  
  // Acceder al contexto de proformas
  const {
    activeProforma,
    activeId,
    openProformas,
    isLoading,
    previewMode,
    setPreviewMode,
    setActiveProforma,
    createNewProforma,
    closeProforma,
    saveProforma,
    changeProformaState,
    formatCurrency,
    handleQuoteChange,
    handleClientChange,
    handleItemsChange,
    addItem,
    updateItem,
    removeItem,
  } = useProforma();
  
  // Hook para búsqueda de productos
  const {
    searchTerm,
    setSearchTerm,
    searchSource,
    setSearchSource,
    viewType, 
    setViewType,
    searchResults,
    isLoading: loadingProducts,
    searchProducts,
  } = useProductSearchQuery();
  
  // Hook para búsqueda de clientes
  const {
    clientes,
    isLoading: loadingClientes,
    searchClientes,
    loadClientes,
  } = useClientSearchQuery();
  
  // Usar delayed flag para evitar flash de loading
  const showSkeletons = useDelayedFlag(isLoading, 300);
  
  // Manejadores para diálogos
  const openClientSearch = useCallback(() => {
    setShowClientSearch(true);
    loadClientes();
  }, [loadClientes]);
  
  const closeClientSearch = useCallback(() => {
    setShowClientSearch(false);
  }, []);
  
  const openProformasDialog = useCallback(() => {
    setShowProformasDialog(true);
  }, []);
  
  const closeProformasDialog = useCallback(() => {
    setShowProformasDialog(false);
  }, []);
  
  // Manejador para acciones de proforma
  const handleAction = useCallback((action, data) => {
    switch (action) {
      case 'new':
        createNewProforma();
        break;
      case 'save':
        saveProforma();
        break;
      case 'preview':
        setPreviewMode(!previewMode);
        break;
      case 'send':
        changeProformaState({
          id: activeId,
          estado: 'enviada',
          notas: data?.notas || ''
        });
        break;
      case 'approve':
        changeProformaState({
          id: activeId,
          estado: 'aprobada',
          notas: data?.notas || ''
        });
        break;
      case 'reject':
        changeProformaState({
          id: activeId,
          estado: 'rechazada',
          notas: data?.notas || ''
        });
        break;
      default:
        console.warn(`Acción no implementada: ${action}`);
    }
  }, [activeId, changeProformaState, createNewProforma, previewMode, saveProforma, setPreviewMode]);
  
  // Manejador para selección de cliente
  const handleClientSelection = useCallback((selectedClient) => {
    handleClientChange(selectedClient);
    closeClientSearch();
  }, [handleClientChange, closeClientSearch]);
  
  // Manejador para selección de proforma
  const handleSelectProforma = useCallback((proforma) => {
    setActiveProforma(proforma.id);
    closeProformasDialog();
  }, [setActiveProforma, closeProformasDialog]);
  
  // Agregar producto desde búsqueda
  const addProductFromSearch = useCallback((product) => {
    if (!product) return null;
    
    // Transformar el producto a formato de item
    const newItem = {
      id: Date.now() + Math.random(),
      code: product.codigo || '',
      description: product.nombre || product.descripcion || 'Producto sin descripción',
      unit: product.unidad || 'Unidad',
      quantity: 1,
      unitPrice: parseFloat(product.precio) || 0,
      discount: 0,
      total: parseFloat(product.precio) || 0,
      source: product.tipo || 'personalizado',
      productId: product.id || null,
      original: product
    };
    
    // Añadir el item
    return addItem(newItem);
  }, [addItem]);
  
  // Memoizar las pestañas para evitar re-renders innecesarios
  const proformaTabs = useMemo(
    () => (
      <ProformaTabs
        proformas={openProformas}
        activeProformaId={activeProforma?.id}
        setActiveProformaId={setActiveProforma}
        closeProforma={closeProforma}
        addNewProforma={() => handleAction("new")}
      >
        {openProformas.map((proforma) => (
          <TabsContent key={proforma.id} value={proforma.id.toString()}>
            <Card className="border rounded-lg shadow-sm overflow-hidden transition-all">
              <CardContent className="p-0">
                <div
                  className={`p-6 ${previewMode ? "bg-gray-50 bg-opacity-50" : ""}`}
                >
                  <ProformaTemplate
                    previewMode={previewMode}
                    quote={proforma.quote}
                    setQuote={handleQuoteChange}
                    client={proforma.client}
                    setClient={handleClientChange}
                    items={proforma.items || []}
                    setItems={handleItemsChange}
                    addItem={addItem} 
                    updateItem={updateItem}
                    removeItem={removeItem}
                    handleClientSearch={openClientSearch}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    searchSource={searchSource}
                    setSearchSource={setSearchSource}
                    showSearchResults={searchTerm.length >= 2}
                    setShowSearchResults={(show) => {
                      if (!show) setSearchTerm('');
                    }}
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
      openProformas,
      activeProforma?.id,
      previewMode,
      handleQuoteChange,
      handleClientChange,
      handleItemsChange,
      addItem,
      updateItem,
      removeItem,
      openClientSearch,
      searchTerm,
      setSearchTerm,
      searchSource,
      setSearchSource,
      searchResults,
      addProductFromSearch,
      searchProducts,
      viewType,
      setViewType,
      loadingProducts,
      formatCurrency,
      setActiveProforma,
      closeProforma,
      handleAction
    ]
  );
  
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
      ) : openProformas.length > 0 ? (
        proformaTabs
      ) : (
        <Card className="border rounded-lg shadow-sm overflow-hidden transition-all">
           <CardContent className="p-6 text-center text-gray-500">
             No hay proformas activas. Crea una nueva o carga una existente.
           </CardContent>
         </Card>
      )}

      {/* Botones de acción (solo si hay una proforma activa) */}
      {activeProforma && <ProformaActions handleAction={handleAction} />}

      {/* Diálogos */}
      <ProformaDialogs
        // Diálogo de búsqueda de clientes
        showClientSearch={showClientSearch}
        closeClientSearch={closeClientSearch}
        handleClientSelection={handleClientSelection}
        clientes={clientes}
        loadingClientes={loadingClientes}
        searchClientes={searchClientes}
        // Diálogo de proformas guardadas
        showProformasDialog={showProformasDialog}
        closeProformasDialog={closeProformasDialog}
        handleSelectProforma={handleSelectProforma}
        proformas={openProformas}
        loading={isLoading}
      />
    </div>
  );
}

/**
 * Componente principal que encapsula el Provider y manejo de errores
 */
export default function OptimizedProformaView() {
  // Obtener el ID de proforma de la URL si existe
  const [searchParams] = useSearchParams();
  const proformaId = searchParams.get('id');
  
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.href = '/proformas?new=true'}
    >
      <ProformaProvider initialId={proformaId}>
        <ProformaContent />
      </ProformaProvider>
    </ErrorBoundary>
  );
}