// src/pages/MsprefPage.jsx
import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import {
  msprefService,
  categoriasService,
  especialidadesService,
} from '@/services/api';

const MsprefPage = () => {
  const [msPrefs, setMsPrefs] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMsPref, setCurrentMsPref] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '',
  });

  // State para el formulario con TODOS los campos de MsPref
  const [formData, setFormData] = useState({
    sku: '',
    nombre_generico: '',
    categoria: '',         // ID si el backend retorna numérico
    especialidad: '',      // ID si el backend retorna numérico
    normada: false,
    referencias_tecnica: '',
    aplicaciones: '',
  });

  // Mostrar notificación
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Cargar data inicial
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Cargar MS Prefs + Categorías + Especialidades en paralelo
      // Aquí pasamos limit: 25
      const [msPrefResp, catResp, espResp] = await Promise.all([
        msprefService.getAll({ page: currentPage, limit: 25, search: searchTerm }),
        categoriasService.getAll(),
        especialidadesService.getAll(),
      ]);

      // Guardar resultados en state
      setMsPrefs(msPrefResp.results || []);
      setCategorias(catResp.results || []);
      setEspecialidades(espResp.results || []);

      // Ajustar paginación
      setTotalPages(msPrefResp.total_pages || 0);
      if (msPrefResp.current_page) {
        setCurrentPage(msPrefResp.current_page);
      }
    } catch (error) {
      console.error('Error al cargar:', error);
      showNotification(error.message || 'Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Manejo del formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setCurrentMsPref(null);
    setFormData({
      sku: '',
      nombre_generico: '',
      categoria: '',
      especialidad: '',
      normada: false,
      referencias_tecnica: '',
      aplicaciones: '',
    });
  };

  // Crear o actualizar
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentMsPref) {
        // Editar
        await msprefService.update(currentMsPref.id, formData);
        showNotification('MSPref actualizado exitosamente');
      } else {
        // Crear
        await msprefService.create(formData);
        showNotification('MSPref creado exitosamente');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error al guardar:', error);
      showNotification(error.message || 'Error al guardar MSPref', 'error');
    }
  };

  // Eliminar
  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este MSPref?')) {
      try {
        await msprefService.delete(id);
        showNotification('MSPref eliminado exitosamente');
        fetchData();
      } catch (error) {
        console.error('Error al eliminar:', error);
        showNotification(error.message || 'Error al eliminar MSPref', 'error');
      }
    }
  };

  // Editar (carga datos en el formulario)
  const handleEdit = (mspref) => {
    setCurrentMsPref(mspref);
    // Asumiendo que mspref.categoria y mspref.especialidad
    // son IDs numéricos
    setFormData({
      sku: mspref.sku || '',
      nombre_generico: mspref.nombre_generico || '',
      categoria: mspref.categoria || '',
      especialidad: mspref.especialidad || '',
      normada: mspref.normada,
      referencias_tecnica: mspref.referencias_tecnica || '',
      aplicaciones: mspref.aplicaciones || '',
    });
    setIsModalOpen(true);
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
        <h1 className="text-2xl font-bold text-gray-800">Gestión de MSP Referencias</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar MS Pref..."
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

      {/* Tabla con todas las columnas del modelo MsPref */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Genérico</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Normada</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencias Técnicas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aplicaciones</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="10" className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : msPrefs.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
                  No se encontraron MSPrefs
                </td>
              </tr>
            ) : (
              msPrefs.map((mspref) => (
                <tr key={mspref.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{mspref.sku}</td>
                  <td className="px-6 py-4">{mspref.nombre_generico}</td>
                  {/* Si el backend manda solo IDs, usamos find() en categorias/especialidades */}
                  <td className="px-6 py-4">
                    {
                      categorias.find((cat) => cat.id === mspref.categoria)
                        ?.nombre || '-'
                    }
                  </td>
                  <td className="px-6 py-4">
                    {
                      especialidades.find((esp) => esp.id === mspref.especialidad)
                        ?.nombre || '-'
                    }
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        mspref.normada
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {mspref.normada ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-pre-line">
                    {mspref.referencias_tecnica || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-pre-line">
                    {mspref.aplicaciones || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(mspref)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(mspref.id)}
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

      {/* Paginación con números */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            {/* Botón "Anterior" */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1 ? 'cursor-not-allowed text-gray-400' : 'hover:bg-gray-50'
              }`}
            >
              Anterior
            </button>

            {/* Botones numéricos de páginas */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === num
                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                    : 'hover:bg-gray-50'
                }`}
              >
                {num}
              </button>
            ))}

            {/* Botón "Siguiente" */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages
                  ? 'cursor-not-allowed text-gray-400'
                  : 'hover:bg-gray-50'
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
            {/* Fondo oscurecido */}
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            {/* Trick para centrar verticalmente */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>

            {/* Contenido del Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                {/* Encabezado del Modal */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {currentMsPref ? 'Editar MS Pref' : 'Nuevo MS Pref'}
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
                    {/* SKU */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Ingrese SKU"
                      />
                    </div>

                    {/* Nombre Genérico */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre Genérico
                      </label>
                      <input
                        type="text"
                        name="nombre_generico"
                        value={formData.nombre_generico}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Ingrese nombre genérico"
                      />
                    </div>
                  </div>

                  {/* Categoría y Especialidad */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoría
                      </label>
                      <select
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Seleccione una categoría</option>
                        {categorias.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Especialidad
                      </label>
                      <select
                        name="especialidad"
                        value={formData.especialidad}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Seleccione una especialidad</option>
                        {especialidades.map((esp) => (
                          <option key={esp.id} value={esp.id}>
                            {esp.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Normada */}
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="normada"
                        checked={formData.normada}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="text-sm text-gray-700">Normada</span>
                    </label>
                  </div>

                  {/* Referencias Técnicas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Referencias Técnicas
                    </label>
                    <textarea
                      name="referencias_tecnica"
                      value={formData.referencias_tecnica}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Ingrese referencias técnicas"
                    />
                  </div>

                  {/* Aplicaciones */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aplicaciones
                    </label>
                    <textarea
                      name="aplicaciones"
                      value={formData.aplicaciones}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Ingrese aplicaciones"
                    />
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
                      {currentMsPref ? 'Actualizar' : 'Crear'}
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

export default MsprefPage;
