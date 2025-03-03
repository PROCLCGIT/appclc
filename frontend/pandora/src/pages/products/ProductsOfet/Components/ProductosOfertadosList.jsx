// src/pages/productos/components/ProductosOfertadosList.jsx

import React from 'react';

const ProductosOfertadosList = ({
  data,
  error,
  isLoading,
  onAdd,
  onView,
  onEdit,
  onDelete,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  totalCount = 0
}) => {
  // Filtro de búsqueda
  const filteredData = data.filter((item) =>
    (item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.cudim?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Paginación
  // Si hay un conteo total del servidor, usamos ese para mostrar información completa
  const filteredItems = filteredData.length;
  const totalItems = searchTerm ? filteredItems : Math.max(filteredItems, totalCount);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="space-y-4">
      {/* Buscador y botón "Agregar" */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Buscar por código, nombre o CUDIM..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
            onClick={onAdd}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mr-2">
              <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Agregar Producto
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            onClick={() => setCurrentPage(1)}
            title="Ver los productos más recientes"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mr-2">
              <path d="M3 12h18M3 6h18M3 18h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Productos Recientes
          </button>
        </div>
      </div>

      {/* Errores */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-lg overflow-hidden w-full max-w-7xl mx-auto">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left border border-gray-200">Código</th>
                <th className="px-4 py-2 text-left border border-gray-200">CUDIM</th>
                <th className="px-4 py-2 text-left border border-gray-200 w-1/4">Nombre</th>
                <th className="px-4 py-2 text-left border border-gray-200 w-1/5">Referencias</th>
                <th className="px-4 py-2 text-left border border-gray-200 w-1/5">Descripción</th>
                <th className="px-4 py-2 text-left border border-gray-200">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-2 text-center border border-gray-200">Cargando productos...</td>
                </tr>
              ) : visibleData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-2 text-center border border-gray-200">No se encontraron productos</td>
                </tr>
              ) : (
                visibleData.map((item, index) => (
                  <tr key={item.id || index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="px-4 py-2 border border-gray-200">{item.code}</td>
                    <td className="px-4 py-2 border border-gray-200">{item.cudim}</td>
                    <td className="px-4 py-3 border border-gray-200 w-1/4 whitespace-normal h-24 overflow-y-auto">
                      {item.nombre}
                    </td>
                    <td className="px-4 py-3 border border-gray-200 w-1/5 whitespace-normal h-24 align-top overflow-y-auto">
                      {item.referencias}
                    </td>
                    <td className="px-4 py-3 border border-gray-200 w-1/5 whitespace-normal h-24 align-top overflow-y-auto">
                      {item.descripcion}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      <div className="flex space-x-2">
                        {/* Ver */}
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => onView(item)}
                          title="Ver detalles"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        {/* Editar */}
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => onEdit(item)}
                          title="Editar"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        {/* Eliminar */}
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => onDelete(item)}
                          title="Eliminar"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="3 6 5 6 21 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="10" y1="11" x2="10" y2="17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="14" y1="11" x2="14" y2="17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between p-4 border-t">
          <span className="text-sm text-gray-600">
            Mostrando {totalItems === 0 ? 0 : Math.min(startIndex + 1, totalItems)} -{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
          </span>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            
            {/* Selector de páginas para saltos grandes */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Página</span>
              <select 
                className="px-2 py-1 border rounded-md"
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
              >
                {Array.from({ length: Math.min(50, totalPages) }, (_, i) => (
                  <option key={i+1} value={i+1}>
                    {i+1}
                  </option>
                ))}
                {totalPages > 50 && (
                  <>
                    {currentPage > 50 && <option value={currentPage}>{currentPage}</option>}
                    <option value={totalPages}>{totalPages}</option>
                  </>
                )}
              </select>
              <span className="text-sm">de {totalPages || 1}</span>
            </div>
            
            <button
              className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Siguiente
            </button>
            <span className="ml-4 text-sm text-gray-600">
              ({totalItems} productos encontrados)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductosOfertadosList;
