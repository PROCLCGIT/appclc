import React, { useMemo, useCallback } from 'react';
import { useVirtual } from 'react-virtual';
import DocumentRow from './DocumentRow';
import PropTypes from 'prop-types';

// Custom CSS for fixed column sizing
const fixedColumnStyles = `
  .document-list-table th, .document-list-table td {
    box-sizing: border-box;
  }
  .document-list-table .col-select {
    width: 48px !important;
  }
  .document-list-table .col-document {
    width: 40% !important;
  }
  .document-list-table .col-category {
    width: 15% !important;
  }
  .document-list-table .col-updated {
    width: 15% !important;
  }
  .document-list-table .col-size {
    width: 10% !important;
  }
  .document-list-table .col-actions {
    width: 20% !important;
  }
`;

/**
 * Componente para mostrar documentos en vista de lista con virtualización
 * para mejorar el rendimiento con grandes conjuntos de datos
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
  // Referencia para el contenedor de filas virtualizadas
  const parentRef = React.useRef(null);

  // Asegurarse de que documents es un array válido para evitar errores
  const validDocuments = Array.isArray(documents) ? documents : [];
  
  // Configuración de virtualización para las filas
  const rowVirtualizer = useVirtual({
    size: validDocuments.length,
    parentRef,
    estimateSize: useCallback(() => 60, []), // Altura estimada de cada fila en píxeles
    overscan: 5 // Número de elementos adicionales a renderizar fuera de la vista
  });

  // Manejar la selección de todos los documentos
  const handleSelectAll = useCallback((e) => {
    if (!onToggleSelection || typeof onToggleSelection !== 'function') {
      console.warn('onToggleSelection no está definido o no es una función');
      return;
    }
    
    if (e.target.checked) {
      // Seleccionar todos
      onToggleSelection(validDocuments.map(doc => doc.id), true);
    } else {
      // Deseleccionar todos
      onToggleSelection([], false);
    }
  }, [validDocuments, onToggleSelection]);

  // Verificar si todos están seleccionados
  const allSelected = validDocuments.length > 0 && selectedDocuments && 
    Array.isArray(selectedDocuments) && selectedDocuments.length === validDocuments.length;
  
  // Memorizar los encabezados de la tabla para evitar re-renders innecesarios
  const tableHeaders = useMemo(() => (
    <tr className="table-fixed w-full">
      {selectionMode && (
        <th scope="col" className="px-4 py-3 w-12 col-select" style={{ width: "48px" }} aria-label="Seleccionar">
          <div className="flex items-center justify-center">
            <div className="relative w-5 h-5">
              <input 
                type="checkbox" 
                className="absolute w-5 h-5 rounded border-2 border-indigo-400 appearance-none cursor-pointer checked:bg-indigo-600 checked:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors" 
                checked={allSelected}
                onChange={handleSelectAll}
                aria-label="Seleccionar todos los documentos"
              />
              {allSelected && (
                <svg 
                  className="absolute top-0 left-0 w-5 h-5 text-white pointer-events-none" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </div>
          </div>
        </th>
      )}
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[40%] col-document" style={{ width: "40%" }}>Documento</th>
      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%] col-category" style={{ width: "15%" }}>Categoría</th>
      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%] col-updated" style={{ width: "15%" }}>Actualizado</th>
      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%] col-size" style={{ width: "10%" }}>Tamaño</th>
      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%] col-actions" style={{ width: "20%" }}>
        <div className="flex items-center justify-between">
          <span>Acciones</span>
          {!selectionMode && (
            <button 
              className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-200 font-medium transition-colors flex items-center gap-1"
              onClick={() => onToggleSelectionMode(true)}
              title="Activar selección múltiple"
              aria-label="Activar selección múltiple"
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
  ), [selectionMode, allSelected, handleSelectAll, onToggleSelectionMode]);

  // Panel de selección (aparece cuando está activo el modo selección)
  const selectionPanel = useMemo(() => {
    if (!selectionMode) return null;
    
    return (
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
            aria-label="Compartir seleccionados"
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
            aria-label="Cancelar selección"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }, [selectionMode, selectedDocuments.length, onShareSelected, onToggleSelectionMode]);

  // Cálculo del número total de columnas para el colSpan del placeholder
  const totalColumns = React.useMemo(() => {
    // Calcula el número de columnas basado en el modo de selección
    return selectionMode ? 6 : 5; // 5 columnas estándar + 1 columna de selección si está activa
  }, [selectionMode]);
  
  // Mensaje cuando no hay documentos o son inválidos
  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden p-6 text-center">
        <p className="text-gray-500">No hay documentos que mostrar.</p>
        <p className="text-gray-400 text-sm mt-2">
          {!documents ? "Error: Datos no disponibles" : 
           !Array.isArray(documents) ? "Error: Formato de datos incorrecto" : 
           "No se encontraron documentos que coincidan con los criterios de búsqueda."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Add style element for fixed column styles */}
      <style dangerouslySetInnerHTML={{ __html: fixedColumnStyles }} />
      
      {selectionPanel}
      
      <div className="overflow-hidden w-full">
        <table className="min-w-full divide-y divide-gray-200 table-fixed border-collapse document-list-table" role="grid" aria-rowcount={validDocuments.length} style={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            {selectionMode && <col className="w-12 col-select" style={{ width: "48px" }} />}
            <col className="w-[40%] col-document" style={{ width: "40%" }} />
            <col className="w-[15%] col-category" style={{ width: "15%" }} />
            <col className="w-[15%] col-updated" style={{ width: "15%" }} />
            <col className="w-[10%] col-size" style={{ width: "10%" }} />
            <col className="w-[20%] col-actions" style={{ width: "20%" }} />
          </colgroup>
          <thead className="bg-gray-50 sticky top-0 z-10 table-fixed w-full">
            {tableHeaders}
          </thead>
          
          {/* Tabla con cuerpo virtualizado */}
          <tbody 
            className="bg-white divide-y divide-gray-200 relative w-full"
            ref={parentRef}
            style={{ 
              height: `${Math.min(600, validDocuments.length * 60)}px`, // Altura máxima o basada en el número de documentos
              width: '100%'
            }}
            aria-live="polite"
          >
            <tr style={{ height: `${rowVirtualizer.totalSize}px`, width: '100%' }} className="virtual-placeholder w-full">
              <td colSpan={totalColumns} aria-hidden="true" style={{ padding: 0, border: 'none', width: '100%' }} />
            </tr>
            
            {rowVirtualizer.virtualItems.map(virtualRow => {
              const document = validDocuments[virtualRow.index];
              // Validar que el documento existe y tiene un ID válido
              if (!document || !document.id) {
                console.warn(`Documento inválido en índice ${virtualRow.index}:`, document);
                return null;
              }
              
              return (
                <tr 
                  key={document.id} 
                  className="absolute w-full table table-fixed"
                  style={{
                    top: 0,
                    left: 0,
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                    width: '100%',
                    tableLayout: 'fixed'
                  }}
                  role="row"
                  aria-rowindex={virtualRow.index + 1}
                >
                  <DocumentRow 
                    document={document}
                    onToggleFavorite={typeof onToggleFavorite === 'function' ? onToggleFavorite : () => {}}
                    onDownload={typeof onDownload === 'function' ? onDownload : () => {}}
                    onDelete={typeof onDelete === 'function' ? onDelete : () => {}}
                    onView={typeof onView === 'function' ? onView : () => {}}
                    onManageTags={typeof onManageTags === 'function' ? onManageTags : () => {}}
                    selectionMode={selectionMode}
                    isSelected={selectedDocuments.includes(document.id)}
                    onToggleSelection={typeof onToggleSelection === 'function' ? onToggleSelection : () => {}}
                  />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Optimizar con React.memo para evitar re-renders innecesarios
export default React.memo(DocumentList);

// Añadir validación de PropTypes
DocumentList.propTypes = {
  documents: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    // Añade aquí otras propiedades esperadas de cada documento si es necesario
  })).isRequired,
  onToggleFavorite: PropTypes.func,
  onDownload: PropTypes.func,
  onDelete: PropTypes.func,
  onView: PropTypes.func,
  onManageTags: PropTypes.func,
  selectionMode: PropTypes.bool,
  selectedDocuments: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  onToggleSelection: PropTypes.func,
  onToggleSelectionMode: PropTypes.func,
  onShareSelected: PropTypes.func,
};

// Valores por defecto para props opcionales (ya se hace en la desestructuración, pero es bueno tenerlo aquí también)
DocumentList.defaultProps = {
  selectionMode: false,
  selectedDocuments: [],
  onToggleFavorite: () => {},
  onDownload: () => {},
  onDelete: () => {},
  onView: () => {},
  onManageTags: () => {},
  onToggleSelection: () => {},
  onToggleSelectionMode: () => {},
  onShareSelected: () => {},
};