import React from 'react';
import { Star, Tag, Eye, Download, Trash2, Calendar } from 'lucide-react';
import { renderFileIcon, formatDate, formatFileSize } from '../../utils/formatters.jsx';

/**
 * Componente de fila de documento para vista de lista
 * @param {Object} props
 * @param {Object} props.document - Datos del documento
 * @param {Function} props.onToggleFavorite - Función para marcar/desmarcar favorito
 * @param {Function} props.onDownload - Función para descargar documento
 * @param {Function} props.onDelete - Función para eliminar documento
 * @param {Function} props.onView - Función para visualizar documento
 */
const DocumentRow = ({ document, onToggleFavorite, onDownload, onDelete, onView }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            {renderFileIcon(document.file_type, 20)}
          </div>
          <div className="ml-4">
            <div className="flex items-center">
              <span className="text-sm font-semibold text-gray-900">{document.title}</span>
              {document.is_favorite && (
                <Star className="ml-1 fill-current text-yellow-500" size={14} />
              )}
            </div>
            <p className="text-sm text-gray-500 line-clamp-1 max-w-md">
              {document.description || 'Sin descripción'}
            </p>
            {document.tags && document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {document.tags.map((tag) => (
                  <span key={tag.id} className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                    <Tag size={10} className="mr-1" />
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
          {document.category ? document.category.name : 'Sin categoría'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center">
          <Calendar size={14} className="mr-1" />
          {formatDate(document.updated_at || document.created_at)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatFileSize(document.file_size)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <button 
            className="p-1 hover:text-blue-600 transition"
            title="Ver documento"
            onClick={() => onView(document)}
          >
            <Eye size={18} />
          </button>
          <button 
            className="p-1 hover:text-green-600 transition"
            title="Descargar documento"
            onClick={() => onDownload(document)}
          >
            <Download size={18} />
          </button>
          <button 
            className="p-1 hover:text-red-600 transition"
            title="Eliminar documento"
            onClick={() => onDelete(document.id)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default DocumentRow;