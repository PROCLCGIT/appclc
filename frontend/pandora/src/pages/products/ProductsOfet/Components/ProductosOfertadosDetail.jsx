// src/pages/productos/components/ProductosOfertadosDetail.jsx

import React from 'react';

const ProductosOfertadosDetail = ({
  error,
  selectedItem,
  categorias,
  onEdit,
  onBack
}) => {
  if (!selectedItem) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 font-medium">No hay producto seleccionado</p>
      </div>
    );
  }

  const categoriaNombre = categorias.find(
    (cat) => cat.id === selectedItem.id_categoria
  )?.nombre;

  return (
    <div className="space-y-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header con acciones */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{selectedItem.nombre}</h3>
          <p className="text-sm text-gray-500 mt-1">Código: {selectedItem.code || 'No definido'}</p>
        </div>
        <div className="flex space-x-3">
          <button
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg flex items-center font-medium transition-colors hover:bg-blue-100"
            onClick={() => onEdit(selectedItem)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mr-2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Editar
          </button>
          <button
            className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg flex items-center font-medium transition-colors hover:bg-gray-100"
            onClick={onBack}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mr-2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Volver
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Estado y categoría destacados */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-500 mr-2">Estado:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              selectedItem.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {selectedItem.is_active ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-500 mr-2">Categoría:</span>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            {categoriaNombre || 'No asignada'}
          </span>
        </div>
      </div>

      {/* Información del producto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-xl">
        {/* Columna 1 */}
        <div className="space-y-5">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Información básica</h4>
            <div className="space-y-4">
              <div>
                <h5 className="text-xs font-medium text-gray-500">CUDIM</h5>
                <p className="text-sm font-medium mt-1">{selectedItem.cudim || 'No definido'}</p>
              </div>
              <div>
                <h5 className="text-xs font-medium text-gray-500">Especialidad</h5>
                <p className="text-sm font-medium mt-1">{selectedItem.especialidad || 'No definido'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Descripción</h4>
            <p className="text-sm text-gray-700">{selectedItem.descripcion || 'Sin descripción'}</p>
          </div>
        </div>

        {/* Columna 2 */}
        <div className="space-y-5">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Referencias</h4>
            <p className="text-sm text-gray-700">{selectedItem.referencias || 'Sin referencias'}</p>
          </div>
        </div>
      </div>

      {/* Imágenes de Referencia */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          Imágenes de Referencia
          {selectedItem.imagenes_referencia && selectedItem.imagenes_referencia.length > 0 && (
            <span className="ml-2 text-sm font-medium text-gray-500">
              ({selectedItem.imagenes_referencia.length})
            </span>
          )}
        </h4>

        {selectedItem.imagenes_referencia && selectedItem.imagenes_referencia.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {selectedItem.imagenes_referencia.map((imagen, index) => (
              <div
                key={imagen.id || index}
                className="group relative rounded-lg overflow-hidden bg-white shadow-md border border-gray-200 transition-all hover:shadow-lg"
              >
                <div className="relative h-48">
                  {imagen.is_primary && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-md z-10 font-medium">
                      Principal
                    </div>
                  )}
                  <a
                    href={imagen.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full"
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    <img
                      src={imagen.url}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          'https://via.placeholder.com/150?text=Imagen+no+disponible';
                        e.target.alt = 'Imagen no disponible';
                      }}
                    />
                  </a>
                </div>
                {imagen.descripcion && (
                  <div className="px-3 py-2 bg-gray-50 text-sm text-gray-700 truncate border-t border-gray-200">
                    {imagen.descripcion}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">
                Este producto no tiene imágenes asociadas
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductosOfertadosDetail;