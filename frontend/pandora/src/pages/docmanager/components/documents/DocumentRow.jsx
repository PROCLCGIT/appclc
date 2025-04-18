/* eslint-disable react/prop-types */

import { Star, Tag, Eye, Download, Calendar, Printer, Share2 } from 'lucide-react';
import { renderFileIcon, formatDate, formatFileSize } from '../../utils/formatters.jsx';

/**
 * Componente de fila de documento para vista de lista
 * @param {Object} props
 * @param {Object} props.document - Datos del documento
 * @param {Function} props.onDownload - Función para descargar documento
 * @param {Function} props.onView - Función para visualizar documento
 * @param {Function} props.onManageTags - Función para administrar etiquetas de documento
 * @param {boolean} props.selectionMode - Indica si está activo el modo de selección
 * @param {boolean} props.isSelected - Indica si el documento está seleccionado
 * @param {Function} props.onToggleSelection - Función para marcar/desmarcar selección
 */
const DocumentRow = ({ 
  document, 
  onDownload, 
  onView,
  onManageTags,
  selectionMode = false,
  isSelected = false,
  onToggleSelection
}) => {
  // Manejar checkbox de selección
  const handleSelectionChange = (e) => {
    onToggleSelection(document.id, e.target.checked);
  };
  
  return (
    <tr className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-indigo-50' : ''}`}>
      {selectionMode && (
        <td className="px-4 py-4 w-12">
          <div className="flex items-center justify-center">
            <div className="relative w-5 h-5">
              <input 
                type="checkbox" 
                className="absolute w-5 h-5 rounded border-2 border-indigo-400 appearance-none cursor-pointer checked:bg-indigo-600 checked:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors" 
                checked={isSelected}
                onChange={handleSelectionChange}
              />
              {isSelected && (
                <svg 
                  className="absolute top-0 left-0 w-5 h-5 text-white pointer-events-none" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </div>
          </div>
        </td>
      )}
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
          {document.category_name || 
           (document.category && (typeof document.category === 'object' ? document.category.name : document.category)) || 
           'Sin categoría'}
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
            className="p-1 hover:text-purple-600 transition"
            title="Imprimir documento"
            onClick={() => {
              // Abrir el documento y mostrar diálogo de impresión
              const printWindow = window.open(document.file_url, '_blank');
              if (printWindow) {
                printWindow.addEventListener('load', () => {
                  printWindow.print();
                });
              } else {
                alert('Por favor, permita las ventanas emergentes para imprimir este documento');
              }
            }}
          >
            <Printer size={18} />
          </button>
          <button 
            className="p-1 hover:text-indigo-600 transition"
            title="Compartir documento"
            onClick={() => {
              // Verificar si la API Web Share está disponible
              if (navigator.share) {
                navigator.share({
                  title: document.title,
                  text: document.description || 'Compartir documento',
                  url: document.file_url,
                })
                .catch(error => console.log('Error compartiendo documento:', error));
              } else {
                // Fallback: Copiar al portapapeles
                const tempInput = document.createElement('input');
                document.body.appendChild(tempInput);
                tempInput.value = document.file_url || window.location.href;
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                alert('Enlace copiado al portapapeles');
              }
            }}
          >
            <Share2 size={18} />
          </button>
          <button 
            className="p-1 hover:text-yellow-600 transition"
            title="Administrar etiquetas"
            onClick={() => onManageTags && onManageTags(document)}
          >
            <Tag size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default DocumentRow;