//src/pages/products/ProductsDisp/Components/ProductList.jsx

function ProductList({
  isLoading,
  error,
  data,
  marcas,
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
  handleNextPage
}) {
  return (
    <div className="space-y-4">
      {/* Buscador y botón Agregar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Buscar por código, nombre o modelo..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
          onClick={handleAdd}
        >
          Agregar Producto Disponible
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Imagen</th>
                <th className="px-4 py-2 text-left">Código</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Marca</th>
                <th className="px-4 py-2 text-left">Modelo</th>
                <th className="px-4 py-2 text-left">Precio SIE Ref.</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-2 text-center">
                    Cargando productos...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-2 text-center">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className={index % 2 === 0 ? 'bg-gray-50' : ''}
                  >
                    <td className="px-4 py-2">
                      {item.imagenes && item.imagenes.length > 0 ? (
                        <img 
                          src={item.imagenes.find(img => img.is_primary)?.url || item.imagenes[0].url} 
                          alt={item.nombre}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">Sin imagen</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">{item.code}</td>
                    <td className="px-4 py-2">{item.nombre}</td>
                    <td className="px-4 py-2">
                      {marcas.find((m) => m.id === item.id_marca)?.nombre ||
                        'No asignada'}
                    </td>
                    <td className="px-4 py-2">{item.modelo}</td>
                    <td className="px-4 py-2">
                      {item.precio_sie_referencial
                        ? `$${parseFloat(item.precio_sie_referencial).toFixed(2)}`
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-4">
                        <button
                          title="Ver Detalle"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleViewDetails(item)}
                        >
                          {/* Icono ojo */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 
                                 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.458 12C3.732 7.943 7.523 5 
                                 12 5c4.478 0 8.268 2.943 9.542 
                                 7-1.274 4.057-5.064 7-9.542
                                 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          title="Editar"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleEdit(item)}
                        >
                          {/* Icono editar */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 
                                 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414
                                 a2 2 0 112.828 2.828L11.828 15H9v-2.828
                                 l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          title="Eliminar"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(item)}
                        >
                          {/* Icono tacho */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 
                                 0 0116.138 21H7.862a2 2 0 
                                 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10
                                 V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4
                                 7h16"
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
        <div className="flex items-center justify-between p-4 border-t">
          <span className="text-sm text-gray-600">
            Mostrando{' '}
            {totalItems === 0
              ? 0
              : Math.min((currentPage - 1) * 10 + 1, totalItems)}{' '}
            - {Math.min(currentPage * 10, totalItems)} de {totalItems} resultados
          </span>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span className="text-sm">
              Página {currentPage} de {totalPages || 1}
            </span>
            <button
              className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
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
