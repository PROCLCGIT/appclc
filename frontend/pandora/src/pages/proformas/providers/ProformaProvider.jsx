/**
 * Provider centralizado para gestionar el estado de proformas usando React Query
 * Reemplaza múltiples providers y hooks con un enfoque más eficiente
 */
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useProformaQuery } from '@/hooks/queries/useProformaQuery';

// Crear el contexto
const ProformaContext = createContext(null);

/**
 * Provider de proformas que centraliza la gestión de estado con React Query
 */
export function ProformaProvider({ children, initialId }) {
  // Utilizar el hook centralizado que maneja todas las operaciones con React Query
  const proformaQuery = useProformaQuery({ initialId });
  
  // Desestructurar para facilitar acceso y mejor optimización
  const {
    // Datos
    activeProforma,
    activeId,
    openProformas,
    config,
    previewMode,
    
    // Estado
    isLoading,
    isSaving,
    
    // Operaciones
    loadProforma,
    saveProforma,
    createNewProforma,
    closeProforma,
    updateProforma,
    setActiveProforma,
    setPreviewMode,
    changeProformaState,
    duplicateProforma,
  } = proformaQuery;
  
  // Funciones específicas del negocio
  
  // Manejar cambios en los items
  const handleItemsChange = useCallback((updatedItems) => {
    updateProforma({ items: updatedItems });
  }, [updateProforma]);
  
  // Añadir un item
  const addItem = useCallback((item) => {
    const newItems = [...(activeProforma.items || []), item];
    handleItemsChange(newItems);
    return item;
  }, [activeProforma, handleItemsChange]);
  
  // Actualizar un item
  const updateItem = useCallback((itemId, updates) => {
    if (!activeProforma?.items) return null;
    
    const newItems = activeProforma.items.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );
    
    handleItemsChange(newItems);
  }, [activeProforma, handleItemsChange]);
  
  // Eliminar un item
  const removeItem = useCallback((itemId) => {
    if (!activeProforma?.items) return;
    
    const newItems = activeProforma.items.filter(item => item.id !== itemId);
    handleItemsChange(newItems);
  }, [activeProforma, handleItemsChange]);
  
  // Manejar cambios en el cliente
  const handleClientChange = useCallback((client) => {
    updateProforma({ client });
  }, [updateProforma]);
  
  // Manejar cambios en los datos de la proforma
  const handleQuoteChange = useCallback((quoteData) => {
    updateProforma({ quote: { ...activeProforma.quote, ...quoteData } });
  }, [activeProforma?.quote, updateProforma]);
  
  // Formatear moneda
  const formatCurrency = useCallback((value) => {
    if (value === null || value === undefined) return '$0.00';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '$0.00';
    
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  }, []);
  
  // Preparar valor de contexto
  const contextValue = useMemo(() => ({
    // Datos generales
    activeProforma,
    activeId,
    openProformas,
    config,
    previewMode,
    items: activeProforma?.items || [],
    client: activeProforma?.client || null,
    quote: activeProforma?.quote || {},
    
    // Estado
    isLoading,
    isSaving,
    
    // Funciones de control
    setActiveProforma,
    setPreviewMode,
    
    // Operaciones CRUD principales
    loadProforma,
    saveProforma,
    createNewProforma,
    closeProforma,
    changeProformaState,
    duplicateProforma,
    
    // Funciones de manipulación de datos internos
    updateProforma,
    handleQuoteChange,
    handleClientChange,
    
    // Funciones para ítems
    handleItemsChange,
    addItem,
    updateItem,
    removeItem,
    
    // Utilidades
    formatCurrency,
    
    // Acceso al query completo para casos avanzados
    proformaQuery,
  }), [
    activeProforma, activeId, openProformas, config, previewMode,
    isLoading, isSaving,
    setActiveProforma, setPreviewMode,
    loadProforma, saveProforma, createNewProforma, closeProforma,
    changeProformaState, duplicateProforma,
    updateProforma, handleQuoteChange, handleClientChange,
    handleItemsChange, addItem, updateItem, removeItem,
    formatCurrency, proformaQuery
  ]);
  
  return (
    <ProformaContext.Provider value={contextValue}>
      {children}
    </ProformaContext.Provider>
  );
}

ProformaProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

ProformaProvider.defaultProps = {
  initialId: null,
};

/**
 * Hook para acceder al contexto de proformas
 */
export function useProforma() {
  const context = useContext(ProformaContext);
  
  if (!context) {
    throw new Error('useProforma debe ser usado dentro de un ProformaProvider');
  }
  
  return context;
}

// Exportar por defecto para mantener compatibilidad
export default useProforma;