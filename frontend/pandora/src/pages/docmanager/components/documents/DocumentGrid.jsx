import React from 'react';
import DocumentCard from './DocumentCard';

/**
 * Componente para mostrar documentos en vista de cuadrícula
 * @param {Object} props
 * @param {Array} props.documents - Lista de documentos
 * @param {Function} props.onToggleFavorite - Función para marcar/desmarcar favorito
 * @param {Function} props.onDownload - Función para descargar documento
 * @param {Function} props.onView - Función para visualizar documento
 * @param {Function} props.onManageTags - Función para administrar etiquetas
 */
const DocumentGrid = ({ documents, onToggleFavorite, onDownload, onView, onManageTags }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {documents.map((document) => (
        <DocumentCard 
          key={document.id}
          document={document}
          onToggleFavorite={onToggleFavorite}
          onDownload={onDownload}
          onView={onView}
          onManageTags={onManageTags}
        />
      ))}
    </div>
  );
};

export default DocumentGrid;