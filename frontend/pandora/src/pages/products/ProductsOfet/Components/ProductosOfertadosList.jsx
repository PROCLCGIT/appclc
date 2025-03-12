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
  // Filtrado local de datos (si no estás usando paginación desde el servidor)
  const filteredData = data.filter((item) =>
    item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.cudim?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cálculo de la cantidad total
  const filteredItems = filteredData.length;
  const totalItems = searchTerm ? filteredItems : Math.max(filteredItems, totalCount);

  // Cálculo de la paginación
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Encabezado con búsqueda y botones */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        {/* Campo de búsqueda */}
        <div className="flex-1 max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 
                   7 0 11-14 0 7 7 0 
                   0114 0z" 
              />
            </svg>
          </div>
          <input
            type="text"
            className="w-full pl-10 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Buscar por código, nombre o CUDIM..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Botones: Agregar y Productos Recientes */}
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
            onClick={onAdd}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              className="mr-1"
            >
              <path 
                d="M12 5v14M5 12h14" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            Agregar Producto
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            onClick={() => setCurrentPage(1)}
            title="Ver los productos más recientes"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="mr-1"
            >
              <path 
                d="M3 12h18M3 6h18M3 18h18" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            Productos Recientes
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-base text-red-600">{error}</p>
        </div>
      )}

      {/* Tabla principal con estilo similar a ProductList */}
      <div className="bg-white rounded-lg overflow-hidden shadow-md w-full max-w-7xl mx-auto">
        <div className="overflow-x-auto">
          <table className="min-w-full text-lg">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-sm tracking-wider">
                {/* Primera columna: Producto Ofertado (nombre, y debajo code + cudim) */}
                <th className="px-4 py-3 border-b border-gray-200 text-left w-1/3">
                  Producto Ofertado
                </th>
                {/* Segunda columna: Referencias */}
                <th className="px-4 py-3 border-b border-gray-200 text-left w-1/3">
                  Referencias
                </th>
                {/* Tercera columna: Descripción */}
                <th className="px-4 py-3 border-b border-gray-200 text-left w-1/4">
                  Descripción
                </th>
                {/* Cuarta columna: Acciones */}
                <th className="px-4 py-3 border-b border-gray-200 text-left w-24">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center">
                    Cargando productos...
                  </td>
                </tr>
              ) : visibleData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                visibleData.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className={index % 2 === 0 ? "bg-gray-50" : ""}
                  >
                    {/* Producto Ofertado => nombre y debajo code + cudim */}
                    <td className="px-4 py-5 border-gray-200 w-1/3">
                      <p className="font-medium text-gray-800 text-lg">{item.nombre}</p>
                      <p className="text-base text-gray-500">
                        Code: {item.code}{" "}
                        {item.cudim && (
                          <>
                            {" | "}CUDIM: {item.cudim}
                          </>
                        )}
                      </p>
                    </td>

                    {/* Referencias */}
                    <td className="px-4 py-5 border-gray-200 w-1/3 whitespace-normal h-28 align-top overflow-y-auto text-base">
                      {item.referencias}
                    </td>

                    {/* Descripción */}
                    <td className="px-4 py-5 border-gray-200 w-1/4 whitespace-normal h-28 align-top overflow-y-auto text-base">
                      {item.descripcion}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-5 border-gray-200 w-24">
                      <div className="flex space-x-2">
                        {/* Ver Detalles */}
                        <button
                          className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          onClick={() => onView(item)}
                          title="Ver detalles"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              d="M1 12s4-8 11-8 
                                 11 8 11 8-4 8-11 8
                                 -11-8-11-8z"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="3"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        
                        {/* Editar - celeste */}
                        <button
                          className="p-2 rounded-full bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                          onClick={() => onEdit(item)}
                          title="Editar"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              d="M11 4H4a2 2 0 0 0-2 
                                 2v14a2 2 0 0 0 2 
                                 2h14a2 2 0 0 0 2-2
                                 v-7"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M18.5 2.5a2.121 
                                 2.121 0 0 1 3 3
                                 L12 15l-4 1 
                                 1-4 9.5-9.5z"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        
                        {/* Eliminar */}
                        <button
                          className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          onClick={() => onDelete(item)}
                          title="Eliminar"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <polyline
                              points="3 6 5 6 21 6"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M19 6v14a2 2 0 0 1-2 
                                 2H7a2 2 0 0 1-2-2V6
                                 m3 0V4a2 2 0 0 1 2-2
                                 h4a2 2 0 0 1 2 2v2"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <line
                              x1="10"
                              y1="11"
                              x2="10"
                              y2="17"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <line
                              x1="14"
                              y1="11"
                              x2="14"
                              y2="17"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
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
        <div className="flex items-center justify-between p-4 border-t bg-white">
          <span className="text-base text-gray-600">
            Mostrando{" "}
            {totalItems === 0 ? 0 : Math.min(startIndex + 1, totalItems)}{" "}
            - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
          </span>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 text-base"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Anterior
            </button>

            {/* Selector de páginas */}
            <div className="flex items-center gap-2">
              <span className="text-base">Página</span>
              <select 
                className="px-2 py-1 border rounded-md text-base"
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
              <span className="text-base">de {totalPages || 1}</span>
            </div>

            <button
              className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 text-base"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductosOfertadosList;
