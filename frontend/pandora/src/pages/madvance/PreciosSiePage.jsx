// src/pages/PreciosSiePage.jsx
import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import {
  pandoraService,
  clientesService,
  procesosAuditadosService,
  preciosSieService,
} from '@/services/api';

const PreciosSiePage = () => {
  const [preciosSie, setPreciosSie] = useState([]);
  const [pandoras, setPandoras] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [procesosAuditados, setProcesosAuditados] = useState([]);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPrecioSie, setCurrentPrecioSie] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '',
  });

  const [formData, setFormData] = useState({
    pandora: '',
    cliente: '',
    detalle_sie: '',
    precio: '',
    nota: '',
    fecha_sie: '',
  });

  useEffect(() => {
    fetchPreciosSie();
    fetchPandoras();
    fetchClientes();
    fetchProcesosAuditados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const fetchPandoras = async () => {
    try {
      const response = await pandoraService.getAll();
      setPandoras(response.results || []);
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al cargar los pandoras', 'error');
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await clientesService.getAll();
      setClientes(response.results || []);
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al cargar los clientes', 'error');
    }
  };

  const fetchProcesosAuditados = async () => {
    try {
      const response = await procesosAuditadosService.getAll();
      setProcesosAuditados(response.results || []);
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al cargar los procesos auditados', 'error');
    }
  };

  const fetchPreciosSie = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        search: searchTerm,
      };
      const response = await preciosSieService.getAll(params);

      setPreciosSie(response.results || []);

      // Ajustamos totalPages y currentPage
      setTotalPages(response.total_pages || 0);
      if (response.current_page) {
        setCurrentPage(response.current_page);
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al cargar los precios SIE', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentPrecioSie) {
        await preciosSieService.update(currentPrecioSie.id, formData);
        showNotification('Precio SIE actualizado exitosamente');
      } else {
        await preciosSieService.create(formData);
        showNotification('Precio SIE creado exitosamente');
      }
      setIsModalOpen(false);
      resetForm();

      // Recarga
      setTimeout(() => {
        fetchPreciosSie();
      }, 100);
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message || 'Error al procesar la solicitud', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este precio SIE?')) {
      try {
        await preciosSieService.delete(id);
        showNotification('Precio SIE eliminado exitosamente');
        fetchPreciosSie();
      } catch (error) {
        console.error('Error:', error);
        showNotification('Error al eliminar el precio SIE', 'error');
      }
    }
  };

  const handleEdit = (precioSie) => {
    setCurrentPrecioSie(precioSie);
    setFormData({
      pandora: precioSie.pandora,
      cliente: precioSie.cliente,
      detalle_sie: precioSie.detalle_sie,
      precio: precioSie.precio,
      nota: precioSie.nota || '',
      fecha_sie: precioSie.fecha_sie || '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setCurrentPrecioSie(null);
    setFormData({
      pandora: '',
      cliente: '',
      detalle_sie: '',
      precio: '',
      nota: '',
      fecha_sie: '',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notificación */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Precios SIE</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar precio SIE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nuevo
          </button>
        </div>
      </div>

      {/* Tabla */}
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
                <td colSpan="6" className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : preciosSie.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
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
                    {
                      procesosAuditados.find(
                        (p) => p.id === precio.detalle_sie
                      )?.nombre || '-'
                    }
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
      </div>

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

      {/* Modal de Formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Fondo */}
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                {/* Encabezado del Modal */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {currentPrecioSie ? 'Editar Precio SIE' : 'Nuevo Precio SIE'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Selects de Pandora, Cliente y Detalle SIE */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pandora
                      </label>
                      <select
                        name="pandora"
                        value={formData.pandora}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Seleccione un pandora</option>
                        {pandoras.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cliente
                      </label>
                      <select
                        name="cliente"
                        value={formData.cliente}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Seleccione un cliente</option>
                        {clientes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Detalle SIE
                      </label>
                      <select
                        name="detalle_sie"
                        value={formData.detalle_sie}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Seleccione un detalle SIE</option>
                        {procesosAuditados.map((proc) => (
                          <option key={proc.id} value={proc.id}>
                            {proc.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Campos de Precio y Fecha */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio
                      </label>
                      <input
                        type="number"
                        name="precio"
                        value={formData.precio}
                        onChange={handleInputChange}
                        required
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha SIE
                      </label>
                      <input
                        type="date"
                        name="fecha_sie"
                        value={formData.fecha_sie}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Campo Nota */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nota
                    </label>
                    <textarea
                      name="nota"
                      value={formData.nota}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Ingrese una nota (opcional)"
                    ></textarea>
                  </div>

                  {/* Botones del formulario */}
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {currentPrecioSie ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreciosSiePage;
