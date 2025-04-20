import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  FileText, Star, Download, Eye, Trash2, Tag, Check
} from 'lucide-react';

/**
 * Componente para cada fila de documento en la vista de lista
 * Optimizado con memoización para evitar re-renders innecesarios
 */
const DocumentRow = ({ 
  document, 
  onToggleFavorite, 
  onDownload, 
  onDelete, 
  onView,
  onManageTags,
  selectionMode = false,
  isSelected = false,
  onToggleSelection
}) => {
  // Manejar icono de archivo según tipo
  const getFileIcon = useCallback(() => {
    const fileType = document.file_type?.toLowerCase() || 'unknown';
    
    // Usar SVG inline en lugar de iconos de lucide-react
    switch (fileType) {
      case 'pdf':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500" width="24" height="24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        );
      case 'xls':
      case 'xlsx':
      case 'csv':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600" width="24" height="24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500" width="24" height="24">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        );
      case 'zip':
      case 'rar':
      case '7z':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600" width="24" height="24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="12" x2="12" y2="18"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
        );
      case 'html':
      case 'css':
      case 'js':
      case 'json':
      case 'xml':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500" width="24" height="24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <polyline points="8 16 11 13 8 10"></polyline>
            <line x1="15" y1="16" x2="15" y2="10"></line>
          </svg>
        );
      default:
        return <FileText className="text-gray-500" size={24} />;
    }
  }, [document.file_type]);

  // Formatear fecha relativa
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Fecha desconocida';
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { 
        addSuffix: true,
        locale: es
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  }, []);

  // Formatear tamaño de archivo
  const formatFileSize = useCallback((sizeInBytes) => {
    if (!sizeInBytes || typeof sizeInBytes !== 'number') return 'Desconocido';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = sizeInBytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }, []);

  // Callbacks para eventos
  const handleToggleFavorite = useCallback((e) => {
    e.stopPropagation();
    onToggleFavorite(document.id);
  }, [document.id, onToggleFavorite]);

  const handleDownload = useCallback((e) => {
    e.stopPropagation();
    onDownload(document.id, document.title || 'documento');
  }, [document.id, document.title, onDownload]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    onDelete(document.id);
  }, [document.id, onDelete]);

  const handleView = useCallback((e) => {
    e.stopPropagation();
    onView(document);
  }, [document, onView]);

  const handleManageTags = useCallback((e) => {
    e.stopPropagation();
    onManageTags(document);
  }, [document, onManageTags]);

  const handleToggleSelection = useCallback((e) => {
    e.stopPropagation();
    onToggleSelection(document.id, e.target.checked);
  }, [document.id, onToggleSelection]);

  return (
    <>
      {selectionMode && (
        <td className="px-4 py-4 w-12" role="cell">
          <div className="flex items-center justify-center">
            <div className="relative w-5 h-5">
              <input 
                type="checkbox" 
                className="absolute w-5 h-5 rounded border-2 border-indigo-400 appearance-none cursor-pointer checked:bg-indigo-600 checked:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors" 
                checked={isSelected}
                onChange={handleToggleSelection}
                aria-label={`Seleccionar ${document.title}`}
              />
              {isSelected && (
                <Check className="absolute top-0 left-0 w-5 h-5 text-white pointer-events-none" size={20} aria-hidden="true" />
              )}
            </div>
          </div>
        </td>
      )}
      
      <td className="px-6 py-4 whitespace-nowrap w-[40%]" role="cell">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
            {getFileIcon()}
          </div>
          <div className="ml-4 max-w-xs">
            <div className="text-sm font-medium text-gray-900 truncate" title={document.title}>
              {document.title}
            </div>
            <div className="text-sm text-gray-500 truncate" title={document.description}>
              {document.description || 'Sin descripción'}
            </div>
            
            {/* Mostrar etiquetas si existen */}
            {Array.isArray(document.tags) && document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1 max-w-xs overflow-hidden">
                {document.tags.slice(0, 3).map(tag => (
                  <span 
                    key={tag.id} 
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    style={{
                      backgroundColor: tag.color_code ? `${tag.color_code}22` : undefined,
                      color: tag.color_code || undefined
                    }}
                    title={tag.name}
                  >
                    {tag.name}
                  </span>
                ))}
                {document.tags.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    +{document.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-center w-[15%]" role="cell">
        <div className="text-sm text-gray-900">
          {document.category_name || 'Sin categoría'}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-center w-[15%]" role="cell">
        <div className="text-sm text-gray-900">
          {formatDate(document.updated_at || document.created_at)}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center w-[10%]" role="cell">
        {formatFileSize(document.file_size)}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium w-[20%]" role="cell">
        <div className="flex items-center justify-end space-x-4">
          <button 
            onClick={handleToggleFavorite} 
            className={`text-gray-400 hover:text-yellow-500 ${document.is_favorite ? 'text-yellow-500' : ''}`}
            title={document.is_favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
            aria-label={document.is_favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            <Star size={18} fill={document.is_favorite ? "currentColor" : "none"} />
          </button>
          
          <button 
            onClick={handleView}
            className="text-indigo-600 hover:text-indigo-800"
            title="Ver documento"
            aria-label="Ver documento"
          >
            <Eye size={18} />
          </button>
          
          <button 
            onClick={handleDownload}
            className="text-green-600 hover:text-green-800"
            title="Descargar documento"
            aria-label="Descargar documento"
          >
            <Download size={18} />
          </button>
          
          <button 
            onClick={handleManageTags}
            className="text-purple-600 hover:text-purple-800"
            title="Administrar etiquetas"
            aria-label="Administrar etiquetas"
          >
            <Tag size={18} />
          </button>
          
          <button 
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800"
            title="Eliminar documento"
            aria-label="Eliminar documento"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </>
  );
};

// Función de comparación personalizada para React.memo
const areEqual = (prevProps, nextProps) => {
  // Re-renderizar solo si estos props han cambiado
  return (
    prevProps.document.id === nextProps.document.id &&
    prevProps.document.title === nextProps.document.title &&
    prevProps.document.description === nextProps.document.description &&
    prevProps.document.category_name === nextProps.document.category_name &&
    prevProps.document.updated_at === nextProps.document.updated_at &&
    prevProps.document.file_size === nextProps.document.file_size &&
    prevProps.document.is_favorite === nextProps.document.is_favorite &&
    prevProps.document.file_type === nextProps.document.file_type &&
    JSON.stringify(prevProps.document.tags) === JSON.stringify(nextProps.document.tags) &&
    prevProps.selectionMode === nextProps.selectionMode &&
    prevProps.isSelected === nextProps.isSelected
  );
};

// Exportar como componente memoizado
export default React.memo(DocumentRow, areEqual);

// Añadir validación de PropTypes
DocumentRow.propTypes = {
  document: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    file_type: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      color_code: PropTypes.string
    })),
    category_name: PropTypes.string,
    updated_at: PropTypes.string,
    created_at: PropTypes.string,
    file_size: PropTypes.number,
    is_favorite: PropTypes.bool
  }).isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onManageTags: PropTypes.func.isRequired,
  selectionMode: PropTypes.bool,
  isSelected: PropTypes.bool,
  onToggleSelection: PropTypes.func.isRequired
};

// Valores por defecto para props opcionales (si es necesario, aunque ya los tienes en la desestructuración)
DocumentRow.defaultProps = {
  selectionMode: false,
  isSelected: false,
  document: {
    title: 'Sin título',
    description: '',
    tags: [],
    category_name: 'Sin categoría',
    updated_at: '',
    created_at: '',
    file_size: 0,
    is_favorite: false,
    file_type: 'unknown',
  }
};