// src/pages/proformas/components/ProformaContent.jsx
import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ProformaTemplate from './ProformaTemplate';

/**
 * Componente memoizado para el contenido de una proforma
 * Creado para mejorar el rendimiento evitando re-renders innecesarios
 */
const ProformaContent = memo(({ 
  proforma,
  previewMode,
  updateProforma,
  company,
  config,
  openClientSearch,
  // Items handlers
  addItem,
  updateItem,
  removeItem,
  reorderItems,
  // Props de búsqueda
  searchTerm,
  setSearchTerm,
  searchSource,
  setSearchSource,
  searchState,
  updateSearchState,
  searchResults,
  addProductFromSearch,
  searchProducts,
  viewType,
  setViewType,
  loadingProducts,
  formatCurrency
}) => {
  return (
    <CardContent className="p-0">
      <div
        className={`p-6 ${previewMode ? "bg-gray-50 bg-opacity-50" : ""}`}
      >
        <ProformaTemplate
          previewMode={previewMode}
          // Pasar datos específicos de la proforma actual
          quote={proforma.quote} 
          setQuote={(newQuote) =>
            updateProforma(proforma.id, { quote: newQuote })
          }
          client={proforma.client}
          setClient={(newClient) =>
            updateProforma(proforma.id, { client: newClient })
          } 
          items={proforma.items || []}
          setItems={(newItems) =>
            updateProforma(proforma.id, { items: newItems })
          }
          company={company}
          config={config || {}}
          handleClientSearch={openClientSearch}
          // Funciones de manejo de items
          addItem={addItem} 
          updateItem={updateItem}
          removeItem={removeItem}
          reorderItems={reorderItems}
          // Props de búsqueda de productos
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchSource={searchSource}
          setSearchSource={setSearchSource}
          showSearchResults={searchState.showSearchResults}
          setShowSearchResults={(show) =>
            updateSearchState({ showSearchResults: show })
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
  );
});

ProformaContent.displayName = 'ProformaContent';

export default ProformaContent;