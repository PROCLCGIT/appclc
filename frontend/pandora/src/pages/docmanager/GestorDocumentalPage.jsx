import React, { useState } from 'react';

// Hooks personalizados
import useDocuments from './hooks/useDocuments';

// Componentes de layout
import Header from './components/layout/Header';
import SearchBar from './components/layout/SearchBar';

// Componentes de filtros
import FilterPanel from './components/filters/FilterPanel';
import ViewToggle from './components/filters/ViewToggle';

// Componentes de documentos
import DocumentGrid from './components/documents/DocumentGrid';
import DocumentList from './components/documents/DocumentList';

// Componentes comunes
import LoadingSpinner from './components/common/LoadingSpinner';
import EmptyState from './components/common/EmptyState';

// Componentes de modales
import UploadModal from './components/modal/UploadModal';

/**
 * Componente principal del Gestor Documental
 */
const GestorDocumentalPage = () => {
  // Estados locales
  const [viewMode, setViewMode] = useState('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Obtener datos y funciones del hook de documentos
  const {
    documents,
    categories,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    selectedFile,
    setSelectedFile,
    handleUpload,
    handleDownload,
    handleDelete,
    handleToggleFavorite
  } = useDocuments();

  // Manejar subida de archivos
  const onUploadClick = () => {
    setShowUploadModal(true);
  };

  // Subir documento y cerrar modal
  const onUpload = async () => {
    await handleUpload();
    setShowUploadModal(false);
    alert('Documento subido correctamente');
  };

  // Cerrar modal de subida
  const onCloseUpload = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
  };

  // Visualizar documento (simulado)
  const onView = (document) => {
    alert(`Visualizando: ${document.title}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Cabecera */}
      <Header onUploadClick={onUploadClick} />

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <SearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
          />

          <div className="flex items-center gap-4">
            {/* Panel de Filtros */}
            <FilterPanel 
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />
            
            {/* Selector de vista */}
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="container mx-auto px-6 py-8 flex-1">
        {isLoading ? (
          <LoadingSpinner />
        ) : documents.length === 0 ? (
          <EmptyState onUploadClick={onUploadClick} />
        ) : viewMode === 'grid' ? (
          <DocumentGrid 
            documents={documents} 
            onToggleFavorite={handleToggleFavorite}
            onDownload={handleDownload}
            onView={onView}
          />
        ) : (
          <DocumentList 
            documents={documents} 
            onToggleFavorite={handleToggleFavorite}
            onDownload={handleDownload}
            onDelete={handleDelete}
            onView={onView}
          />
        )}
      </main>

      {/* Modal de carga de archivos */}
      <UploadModal 
        show={showUploadModal}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        onClose={onCloseUpload}
        onUpload={onUpload}
      />
    </div>
  );
};

export default GestorDocumentalPage;