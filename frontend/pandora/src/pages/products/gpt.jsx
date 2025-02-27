// src/pages/productos/ProductosOfertadosPage.jsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { 
  categoriasService,
  productosOfertadosService
} from '@/services/api';

const ProductosOfertadosPage = () => {
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
  const itemsPerPage = 10;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await productosOfertadosService.getAll();
      setData(response.results || []);
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
    setIsDialogOpen(true);
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
    setIsDialogOpen(true);
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
      setIsDialogOpen(false);
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const paginatedData = (() => {
    const filteredData = data.filter((item) =>
      (item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.cudim?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    const totalItems = filteredData.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return {
      data: filteredData.slice(startIndex, startIndex + itemsPerPage),
      totalItems,
      totalPages: Math.ceil(totalItems / itemsPerPage),
    };
  })();

  const { data: visibleData, totalItems, totalPages } = paginatedData;

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const renderTable = () => (
    <div className="mt-6 bg-white p-4 rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Código</th>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">CUDIM</th>
              <th className="px-4 py-2 text-left">Categoría</th>
              <th className="px-4 py-2 text-left">Especialidad</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visibleData.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="px-4 py-2">{item.code}</td>
                <td className="px-4 py-2">{item.nombre}</td>
                <td className="px-4 py-2">{item.cudim}</td>
                <td className="px-4 py-2">
                  {categorias.find(cat => cat.id === item.id_categoria)?.nombre || 'No asignada'}
                </td>
                <td className="px-4 py-2">{item.especialidad}</td>
                <td className="px-4 py-2">{item.is_active ? 'Activo' : 'Inactivo'}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-purple-600 hover:text-purple-800 mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFormDialog = () => (
    <div className={isDialogOpen ? 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center' : 'hidden'}>
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h3 className="text-lg font-medium mb-4">
          {selectedItem ? 'Editar Producto Ofertado' : 'Nuevo Producto Ofertado'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
              <input
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CUDIM</label>
              <input
                name="cudim"
                value={formData.cudim}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select
                name="id_categoria"
                value={formData.id_categoria}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
              <input
                name="especialidad"
                value={formData.especialidad}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Referencias</label>
              <textarea
                name="referencias"
                value={formData.referencias}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Productos Ofertados</h2>
            <p className="text-gray-500 mt-1">Gestiona el catálogo de productos ofertados del sistema</p>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Producto
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <input
            placeholder="Buscar por código, nombre o CUDIM..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full max-w-sm p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {renderTable()}

        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-600">
            Mostrando {totalItems === 0 ? 0 : Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-transparent"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-gray-600">
              Página {currentPage} de {totalPages || 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-transparent"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {renderFormDialog()}
    </div>
  );
};

export default ProductosOfertadosPage;