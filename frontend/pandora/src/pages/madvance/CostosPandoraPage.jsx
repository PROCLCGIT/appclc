// src/pages/CostosPandoraPage.jsx
import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import {
  costosPandoraService,
  pandoraService,
  proveedoresService,
  marcaService,
} from '@/services/api';

const CostosPandoraPage = () => {
  const [costosPandora, setCostosPandora] = useState([]);
  const [pandoras, setPandoras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [marcas, setMarcas] = useState([]);

  // Para paginación en el frontend
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCostoPandora, setCurrentCostoPandora] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '',
  });

  const [formData, setFormData] = useState({
    pandora: '',
    proveedor: '',
    marca: '',
    precio: '',
    nota: '',
    fecha: '',
  });

  // Notificaciones
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Cargar datos
  useEffect(() => {
    fetchCostosPandora();
    fetchPandoras();
    fetchProveedores();
    fetchMarcas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  const fetchPandoras = async () => {
    try {
      const response = await pandoraService.getAll();
      setPandoras(response.results || []);
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al cargar los pandoras', 'error');
    }
  };

  const fetchProveedores = async () => {
    try {
      const response = await proveedoresService.getAll();
      setProveedores(response.results || []);
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al cargar los proveedores', 'error');
    }
  };

  const fetchMarcas = async () => {
    try {
      const response = await marcaService.getAll();
      setMarcas(response.results || []);
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al cargar las marcas', 'error');
    }
  };

  const fetchCostosPandora = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        search: searchTerm,
      };
      const response = await costosPandoraService.getAll(params);

      setCostosPandora(response.results || []);

      // Usar total_pages y current_page del backend
      setTotalPages(response.total_pages || 0);
      if (response.current_page) {
        setCurrentPage(response.current_page);
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al cargar los costos pandora', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    // Ajuste opcional para formatear un decimal, si se quiere
    if (type === 'number') {
      const formattedValue = value ? parseFloat(value).toFixed(2) : '';
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        precio: parseFloat(formData.precio),
      };

      if (currentCostoPandora) {
        await costosPandoraService.update(currentCostoPandora.id, dataToSubmit);
        showNotification('Costo Pandora actualizado exitosamente');
      } else {
        await costosPandoraService.create(dataToSubmit);
        showNotification('Costo Pandora creado exitosamente');
      }
      setIsModalOpen(false);
      resetForm();

      // Recargamos datos
      setTimeout(() => {
        fetchCostosPandora();
      }, 100);
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message || 'Error al procesar la solicitud', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este costo pandora?')) {
      try {
        await costosPandoraService.delete(id);
        showNotification('Costo Pandora eliminado exitosamente');
        fetchCostosPandora();
      } catch (error) {
        console.error('Error:', error);
        showNotification('Error al eliminar el costo pandora', 'error');
      }
    }
  };

  const handleEdit = (costoPandora) => {
    setCurrentCostoPandora(costoPandora);
    setFormData({
      pandora: costoPandora.pandora,
      proveedor: costoPandora.proveedor,
      marca: costoPandora.marca,
      precio:
        typeof costoPandora.precio === 'number'
          ? costoPandora.precio.toFixed(2)
          : Number(costoPandora.precio).toFixed(2),
      nota: costoPandora.nota || '',
      fecha: costoPandora.fecha || '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setCurrentCostoPandora(null);
    setFormData({
      pandora: '',
      proveedor: '',
      marca: '',
      precio: '',
      nota: '',
      fecha: '',
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
        <h1 className="text-2xl font-bold text-gray-800">
          Gestión de Costos Pandora
        </h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar costo pandora..."
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
                Proveedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Marca
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
            ) : costosPandora.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No se encontraron costos pandora
                </td>
              </tr>
            ) : (
              costosPandora.map((costoPandora) => (
                <tr key={costoPandora.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {pandoras.find((p) => p.id === costoPandora.pandora)?.nombre ||
                      '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {
                      proveedores.find((pr) => pr.id === costoPandora.proveedor)
                        ?.nombre || '-'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {marcas.find((m) => m.id === costoPandora.marca)?.nombre || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    $
                    {typeof costoPandora.precio === 'number'
                      ? costoPandora.precio.toFixed(2)
                      : Number(costoPandora.precio).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {costoPandora.fecha || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(costoPandora)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(costoPandora.id)}
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

      {/* Modal Form */}
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
                {/* Encabezado */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {currentCostoPandora
                      ? 'Editar Costo Pandora'
                      : 'Nuevo Costo Pandora'}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pandora */}
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
                        {pandoras.map((pandora) => (
                          <option key={pandora.id} value={pandora.id}>
                            {pandora.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Proveedor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Proveedor
                      </label>
                      <select
                        name="proveedor"
                        value={formData.proveedor}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Seleccione un proveedor</option>
                        {proveedores.map((prov) => (
                          <option key={prov.id} value={prov.id}>
                            {prov.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Marca */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marca
                      </label>
                      <select
                        name="marca"
                        value={formData.marca}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Seleccione una marca</option>
                        {marcas.map((marca) => (
                          <option key={marca.id} value={marca.id}>
                            {marca.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Precio */}
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
                  </div>

                  {/* Fecha y Nota */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha
                      </label>
                      <input
                        type="date"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

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
                      />
                    </div>
                  </div>

                  {/* Botones */}
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
                      {currentCostoPandora ? 'Actualizar' : 'Crear'}
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

export default CostosPandoraPage;
