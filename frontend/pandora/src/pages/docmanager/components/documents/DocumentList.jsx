import React from 'react';
import DocumentRow from './DocumentRow';

/**
 * Componente para mostrar documentos en vista de lista
 * @param {Object} props
 * @param {Array} props.documents - Lista de documentos
 * @param {Function} props.onToggleFavorite - Función para marcar/desmarcar favorito
 * @param {Function} props.onDownload - Función para descargar documento
 * @param {Function} props.onDelete - Función para eliminar documento
 * @param {Function} props.onView - Función para visualizar documento
 * @param {Function} props.onManageTags - Función para administrar etiquetas
 * @param {boolean} props.selectionMode - Indica si está activo el modo de selección
 * @param {Array} props.selectedDocuments - Documentos seleccionados
 * @param {Function} props.onToggleSelection - Función para marcar/desmarcar selección
 * @param {Function} props.onToggleSelectionMode - Función para activar/desactivar modo selección
 * @param {Function} props.onShareSelected - Función para compartir documentos seleccionados
 */
const DocumentList = ({ 
  documents, 
  onToggleFavorite, 
  onDownload, 
  onDelete, 
  onView,
  onManageTags,
  selectionMode = false,
  selectedDocuments = [],
  onToggleSelection,
  onToggleSelectionMode,
  onShareSelected
}) => {
  // Manejar la selección de todos los documentos
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Seleccionar todos
      onToggleSelection(documents.map(doc => doc.id), true);
    } else {
      // Deseleccionar todos
      onToggleSelection([], false);
    }
  };

  // Verificar si todos están seleccionados
  const allSelected = documents.length > 0 && selectedDocuments.length === documents.length;
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {selectionMode && (
        <div className="bg-indigo-50 p-3 flex items-center justify-between border-b border-indigo-100 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white mr-3">
              {selectedDocuments.length}
            </div>
            <div>
              <div className="text-sm font-medium text-indigo-800">
                {selectedDocuments.length} {selectedDocuments.length === 1 ? 'documento seleccionado' : 'documentos seleccionados'}
              </div>
              {selectedDocuments.length > 0 && (
                <div className="text-xs text-indigo-600">
                  Seleccione qué acción realizar con los documentos
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onShareSelected}
              disabled={selectedDocuments.length === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share-2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              Compartir seleccionados
            </button>
            <button 
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              onClick={() => onToggleSelectionMode(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {selectionMode && (
              <th className="px-4 py-3 w-12">
                <div className="flex items-center justify-center">
                  <div className="relative w-5 h-5">
                    <input 
                      type="checkbox" 
                      className="absolute w-5 h-5 rounded border-2 border-indigo-400 appearance-none cursor-pointer checked:bg-indigo-600 checked:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors" 
                      checked={allSelected}
                      onChange={handleSelectAll}
                    />
                    {allSelected && (
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
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actualizado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamaño</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex items-center justify-between">
                <span>Acciones</span>
                {!selectionMode && (
                  <button 
                    className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-200 font-medium transition-colors flex items-center gap-1"
                    onClick={() => onToggleSelectionMode(true)}
                    title="Activar selección múltiple"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-square">
                      <polyline points="9 11 12 14 22 4"></polyline>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    Seleccionar
                  </button>
                )}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((document) => (
            <DocumentRow 
              key={document.id}
              document={document}
              onToggleFavorite={onToggleFavorite}
              onDownload={onDownload}
              onDelete={onDelete}
              onView={onView}
              onManageTags={onManageTags}
              selectionMode={selectionMode}
              isSelected={selectedDocuments.includes(document.id)}
              onToggleSelection={onToggleSelection}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentList;