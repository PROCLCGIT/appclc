// src/pages/productos/ProductosOfertadosPage.jsx
import { useState, useEffect } from 'react';
import { 
  categoriasService,
  productosOfertadosService
} from '@/services/api';

const testpage1 = () => {
  const [data, setData] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    cudim: '',
    nombre: '',
    descripcion: '',
    especialidad: '',
    referencias: '',
    is_active: true,
    id_categoria: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('listado');
  const itemsPerPage = 10;

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Carga de productos ofertados
      const response = await productosOfertadosService.getAll();
      setData(response.results || []);
      
      // Carga las categorías para el select
      const categoriasResponse = await categoriasService.getAll();
      setCategorias(categoriasResponse.results || []);
      
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
      console.error('Error cargando datos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({
      code: '',
      cudim: '',
      nombre: '',
      descripcion: '',
      especialidad: '',
      referencias: '',
      is_active: true,
      id_categoria: ''
    });
    setActiveTab('formulario');
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      code: item.code || '',
      cudim: item.cudim || '',
      nombre: item.nombre || '',
      descripcion: item.descripcion || '',
      especialidad: item.especialidad || '',
      referencias: item.referencias || '',
      is_active: item.is_active || true,
      id_categoria: item.id_categoria || ''
    });
    setActiveTab('formulario');
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setActiveTab('visualizar');
  };

  const handleDelete = async (item) => {
    if (window.confirm('¿Está seguro de eliminar este producto ofertado?')) {
      try {
        await productosOfertadosService.delete(item.id);
        await loadData();
      } catch (err) {
        setError(err.message || 'Error al eliminar el producto');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedItem) {
        await productosOfertadosService.update(selectedItem.id, formData);
      } else {
        await productosOfertadosService.create(formData);
      }
      setActiveTab('listado');
      await loadData();
    } catch (err) {
      setError(err.message || 'Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSwitchChange = (checked) => {
    setFormData({
      ...formData,
      is_active: checked
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredData = data.filter((item) =>
    (item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.cudim?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const renderListadoTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Buscar por código, nombre o CUDIM..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
          onClick={handleAdd}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mr-2">
            <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Agregar Producto
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Código</th>
                <th className="px-4 py-2 text-left">CUDIM</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Descripción</th>
                <th className="px-4 py-2 text-left">Referencias</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-2 text-center">Cargando productos...</td>
                </tr>
              ) : visibleData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-2 text-center">No se encontraron productos</td>
                </tr>
              ) : (
                visibleData.map((item, index) => (
                  <tr key={item.id || index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="px-4 py-2">{item.code}</td>
                    <td className="px-4 py-2">{item.cudim}</td>
                    <td className="px-4 py-2">{item.nombre}</td>
                    <td className="px-4 py-2">{item.descripcion?.substring(0, 50)}{item.descripcion?.length > 50 ? '...' : ''}</td>
                    <td className="px-4 py-2">{item.referencias?.substring(0, 50)}{item.referencias?.length > 50 ? '...' : ''}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {item.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleView(item)}
                          title="Ver detalles"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleEdit(item)}
                          title="Editar"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(item)}
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

        <div className="flex items-center justify-between p-4 border-t">
          <span className="text-sm text-gray-600">
            Mostrando {totalItems === 0 ? 0 : Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
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

  const renderFormularioTab = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Información Básica</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código *
              </label>
              <input
                type="text"
                name="code"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.code}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CUDIM
              </label>
              <input
                type="text"
                name="cudim"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.cudim}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especialidad
              </label>
              <input
                type="text"
                name="especialidad"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.especialidad}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Configuración</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                name="id_categoria"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.id_categoria}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                checked={formData.is_active}
                onChange={(e) => handleSwitchChange(e.target.checked)}
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Producto Activo
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            name="descripcion"
            rows="3"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={formData.descripcion}
            onChange={handleInputChange}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Referencias
          </label>
          <textarea
            name="referencias"
            rows="3"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={formData.referencias}
            onChange={handleInputChange}
          ></textarea>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          onClick={() => setActiveTab('listado')}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 shadow-sm text-sm font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : selectedItem ? 'Actualizar Producto' : 'Crear Producto'}
        </button>
      </div>
    </form>
  );

  const renderVisualizarTab = () => {
    if (!selectedItem) return <div>No hay producto seleccionado</div>;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{selectedItem.nombre}</h3>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 border rounded-md flex items-center text-blue-600 hover:bg-blue-50"
              onClick={() => handleEdit(selectedItem)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mr-1">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Editar
            </button>
            <button
              className="px-3 py-1 border rounded-md flex items-center text-gray-600 hover:bg-gray-50"
              onClick={() => setActiveTab('listado')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mr-1">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Volver
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Código</h4>
                  <p className="text-base font-medium">{selectedItem.code || 'No definido'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">CUDIM</h4>
                  <p className="text-base">{selectedItem.cudim || 'No definido'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Nombre</h4>
                  <p className="text-base">{selectedItem.nombre || 'No definido'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Especialidad</h4>
                  <p className="text-base">{selectedItem.especialidad || 'No definido'}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Categoría</h4>
                  <p className="text-base">
                    {categorias.find(cat => cat.id === selectedItem.id_categoria)?.nombre || 'No asignada'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Estado</h4>
                  <p className="inline-flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${selectedItem.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {selectedItem.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Descripción</h4>
              <p className="text-base mt-1">{selectedItem.descripcion || 'Sin descripción'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Referencias</h4>
              <p className="text-base mt-1">{selectedItem.referencias || 'Sin referencias'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Productos Ofertados</h2>
          {activeTab === 'listado' ? (
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              onClick={handleAdd}
            >
              Agregar Producto
            </button>
          ) : activeTab === 'formulario' ? (
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          ) : null}
        </div>
      </div>

      <div className="border-b">
        <div className="flex">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'listado' 
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('listado')}
          >
            Listado de Productos
          </button>
          {activeTab === 'formulario' && (
            <button
              className={`px-4 py-2 font-medium border-b-2 border-purple-500 text-purple-600`}
            >
              {selectedItem ? 'Editar Producto' : 'Nuevo Producto'}
            </button>
          )}
          {activeTab === 'visualizar' && selectedItem && (
            <button
              className={`px-4 py-2 font-medium border-b-2 border-purple-500 text-purple-600`}
            >
              Visualizar Producto
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        {activeTab === 'listado' && renderListadoTab()}
        {activeTab === 'formulario' && renderFormularioTab()}
        {activeTab === 'visualizar' && renderVisualizarTab()}
      </div>
    </div>
  );
};

export default testpage1;