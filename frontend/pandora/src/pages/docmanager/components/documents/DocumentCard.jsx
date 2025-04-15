import React from 'react';
import { Star, MoreHorizontal, Folder, Clock, Eye, Download, Tag } from 'lucide-react';
import { renderFileIcon, formatDate, formatFileSize } from '../../utils/formatters.jsx';

/**
 * Componente de tarjeta de documento para vista de grid
 * @param {Object} props
 * @param {Object} props.document - Datos del documento
 * @param {Function} props.onToggleFavorite - Función para marcar/desmarcar favorito
 * @param {Function} props.onDownload - Función para descargar documento
 * @param {Function} props.onView - Función para visualizar documento
 */
const DocumentCard = ({ document, onToggleFavorite, onDownload, onView }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 transform hover:scale-105">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-indigo-100 p-3 rounded-lg">
            {renderFileIcon(document.file_type)}
          </div>
          <div className="flex space-x-1">
            <button 
              className="text-gray-400 hover:text-yellow-500 transition"
              onClick={() => onToggleFavorite(document.id, document.is_favorite)}
            >
              <Star 
                size={18} 
                className={document.is_favorite ? "fill-current text-yellow-500" : ""}
              />
            </button>
            <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {document.title}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {document.description || 'Sin descripción'}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {document.tags && document.tags.map((tag) => (
            <span key={tag.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {tag.name}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="flex items-center">
            <Folder size={14} className="mr-1" />
            {document.category ? document.category.name : 'Sin categoría'}
          </span>
          <span className="flex items-center">
            <Clock size={14} className="mr-1" />
            {formatDate(document.updated_at || document.created_at)}
          </span>
        </div>
      </div>
      
      <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
              {document.file_type}
            </span>
            <span className="text-xs text-gray-500">
              {formatFileSize(document.file_size)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="p-1 text-gray-400 hover:text-indigo-600 transition"
              title="Ver documento"
              onClick={() => onView(document)}
            >
              <Eye size={18} />
            </button>
            <button 
              className="p-1 text-gray-400 hover:text-indigo-600 transition"
              title="Descargar documento"
              onClick={() => onDownload(document)}
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;