// src/pages/products/ProductsDisp/Components/ProductList.jsx

import React from "react";

function ProductList({
  isLoading,
  error,
  data,
  marcas,
  categorias,
  searchTerm,
  handleSearchChange,
  handleAdd,
  handleEdit,
  handleDelete,
  handleViewDetails,
  currentPage,
  totalPages,
  totalItems,
  handlePrevPage,
  handleNextPage,
  sortBy = 'nombre',
  setSortBy = () => {}
}) {
  return (
    <div className="space-y-4">
      {/* Encabezado con ordenamiento, búsqueda y botón Agregar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        {/* Ordenamiento */}
        <div className="flex items-center w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 border rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none pr-8"
            >
              <option value="nombre">Ordenar por Nombre</option>
              <option value="code">Ordenar por Código</option>
              <option value="precio_sie_referencial">Ordenar por Precio</option>
              <option value="modelo">Ordenar por Modelo</option>
              <option value="created_at">Ordenar por Fecha</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 
                     10.586l3.293-3.293a1 1 0 111.414 
                     1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 
                     1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Búsqueda y botón Agregar */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-full md:w-80 relative">
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
              placeholder="Buscar por código o nombre"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
            onClick={handleAdd}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
            Agregar Producto Disponible
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-base text-red-600">{error}</p>
        </div>
      )}

      {/* Tabla principal */}
      <div className="bg-white rounded-lg overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full text-base">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-sm tracking-wider">
                {/* 1) Productos Disponibles => imagen + nombre + sub-line con code + categoría */}
                <th className="px-4 py-3 text-left">Productos Disponibles</th>
                {/* 2) Proveedor (antes “Provedor”) */}
                <th className="px-4 py-3 text-left">Proveedor</th>
                {/* 3) Nueva columna Modelo */}
                <th className="px-4 py-3 text-left">Modelo</th>
                {/* 4) Precio */}
                <th className="px-4 py-3 text-right">Precio</th>
                {/* 5) Acción */}
                <th className="px-4 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-4 text-center">
                    Cargando productos...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-4 text-center">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                data.map((item, index) => {
                  return (
                    <tr key={item.id || index} className="hover:bg-gray-50">
                      {/* Productos Disponibles => imagen + nombre + code + categoría */}
                      <td className="px-4 py-4 flex items-center space-x-3">
                        {item.imagenes && item.imagenes.length > 0 ? (
                          <img
                            src={
                              item.imagenes.find((img) => img.is_primary)?.url ||
                              item.imagenes[0].url
                            }
                            alt={item.nombre}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-sm text-gray-500">Sin img</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{item.nombre}</p>
                          {/* Sub-line: Code + Categoría (si existe item.categoria, de lo contrario “N/A”) */}
                          <p className="text-sm text-gray-400">
                            Code: {item.code}{" "}
                            | {categorias?.find(cat => cat.id === item.id_categoria)?.nombre || "N/A"}
                          </p>
                        </div>
                      </td>

                      {/* Proveedor => se usaba marcas.find(...) */}
                      <td className="px-4 py-4">
                        {marcas.find((m) => m.id === item.id_marca)?.nombre || "No asignada"}
                      </td>

                      {/* Modelo => item.modelo */}
                      <td className="px-4 py-4 text-gray-600">
                        {item.modelo || "N/A"}
                      </td>

                      {/* Precio */}
                      <td className="px-4 py-4 text-right">
                        {item.precio_sie_referencial
                          ? `$${parseFloat(item.precio_sie_referencial).toFixed(2)}`
                          : "N/A"}
                      </td>

                      {/* Acción => Botones */}
                      <td className="px-4 py-4">
                        <div className="flex justify-center space-x-2">
                          {/* Ver Detalle */}
                          <button
                            title="Ver Detalle"
                            onClick={() => handleViewDetails(item)}
                            className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 
                                   3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.458 12C3.732 
                                   7.943 7.523 5 12 
                                   5c4.478 0 8.268 
                                   2.943 9.542 7
                                   -1.274 4.057-5.064 
                                   7-9.542 7
                                   -4.477 0-8.268-2.943
                                   -9.542-7z"
                              />
                            </svg>
                          </button>

                          {/* Editar (celeste) */}
                          <button
                            title="Editar"
                            onClick={() => handleEdit(item)}
                            className="p-2 rounded-full bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11 5H6a2 2 0 
                                   00-2 2v11a2 2 0 
                                   002 2h11a2 2 0 
                                   002-2v-5m-1.414-9.414
                                   a2 2 0 112.828 2.828
                                   L11.828 15H9v-2.828
                                   l8.586-8.586z"
                              />
                            </svg>
                          </button>

                          {/* Eliminar */}
                          <button
                            title="Eliminar"
                            onClick={() => handleDelete(item)}
                            className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142
                                   A2 2 0 0116.138 
                                   21H7.862a2 2 0 
                                   01-1.995-1.858
                                   L5 7m5 4v6m4-6v6m1-10
                                   V4a1 1 0 00-1-1h-4
                                   a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between p-4 border-t bg-white">
          <span className="text-base text-gray-600">
            Mostrando{" "}
            {totalItems === 0
              ? 0
              : Math.min((currentPage - 1) * 10 + 1, totalItems)}{" "}
            - {Math.min(currentPage * 10, totalItems)} de {totalItems} resultados
          </span>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 text-base"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span className="text-base">
              Página {currentPage} de {totalPages || 1}
            </span>
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
}

export default ProductList;
