// src/pages/PreciosSie/components/PreciosSieTable.jsx
import { Pencil, Trash2 } from 'lucide-react';

function PreciosSieTable({
  preciosSie,
  loading,
  pandoras,
  clientes,
  procesosAuditados,
  productosOfertados,
  productosDisponibles,
  handleEdit,
  handleDelete,
  currentPage,
  totalPages,
  setCurrentPage,
}) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pandora
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Detalle SIE
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Producto Ofertado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Producto Disponible
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Precio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan="8" className="px-6 py-4 text-center">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </td>
            </tr>
          ) : preciosSie.length === 0 ? (
            <tr>
              <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                No se encontraron precios SIE
              </td>
            </tr>
          ) : (
            preciosSie.map((precio) => (
              <tr key={precio.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {pandoras.find((p) => p.id === precio.pandora)?.nombre || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {clientes.find((c) => c.id === precio.cliente)?.nombre || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {procesosAuditados.find((p) => p.id === precio.detalle_sie)?.nombre || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {productosOfertados.find((p) => p.id === precio.producto_ofertado)?.nombre || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {productosDisponibles.find((p) => p.id === precio.producto_disponible)?.nombre || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ${parseFloat(precio.precio).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {precio.fecha_sie || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(precio)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(precio.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                currentPage === 1 ? 'cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              Anterior
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                  currentPage === i + 1
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                currentPage === totalPages ? 'cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              Siguiente
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

export default PreciosSieTable;
