import React from 'react';
import { FileText, Upload } from 'lucide-react';

/**
 * Componente para mostrar cuando no hay documentos
 * @param {Object} props
 * @param {Function} props.onUploadClick - Función para manejar click en botón de subir
 */
const EmptyState = ({ onUploadClick }) => {
  return (
    <div className="text-center py-16 bg-white rounded-lg shadow-md">
      <FileText size={48} className="mx-auto text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay documentos</h3>
      <p className="text-gray-500 mb-4">No se encontraron documentos que coincidan con tu búsqueda.</p>
      <button 
        className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
        onClick={onUploadClick}
      >
        <Upload className="mr-2" size={18} />
        Subir un documento
      </button>
    </div>
  );
};

export default EmptyState;