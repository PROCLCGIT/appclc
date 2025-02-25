// src/pages/productos/ProductosOfertadosPage.jsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import DataTable from '@/components/common/DataTable';
import FormDialog from '@/components/common/FormDialog';
import SelectField from '@/components/common/SelectField';
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

  const columns = [
    { key: 'code', label: 'Código' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'cudim', label: 'CUDIM' },
    { 
      key: 'id_categoria', 
      label: 'Categoría',
      render: (item) => {
        const categoria = categorias.find(cat => cat.id === item.id_categoria);
        return categoria ? categoria.nombre : 'No asignada';
      }
    },
    { key: 'especialidad', label: 'Especialidad' },
    { 
      key: 'is_active', 
      label: 'Estado',
      render: (item) => item.is_active ? 'Activo' : 'Inactivo'
    },
    { key: 'created_at', label: 'Fecha Creación' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white shadow-sm rounded-md p-4 sm:p-6">
        <h1 className="text-2xl font-semibold mb-2">Productos Ofertados</h1>
        <p className="text-gray-500 mb-4">
          Gestiona el catálogo de productos ofertados del sistema
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex-1">
            <Input
              placeholder="Buscar por código, nombre o CUDIM..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="max-w-sm"
            />
          </div>
          <Button onClick={handleAdd} className="mt-2 sm:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Producto Ofertado
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-white shadow-sm rounded-md p-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-md p-4">
        <DataTable
          columns={columns}
          data={visibleData}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-600">
            Mostrando {totalItems === 0 ? 0 : Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span>
              Página {currentPage} de {totalPages || 1}
            </span>
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      <FormDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={selectedItem ? 'Editar Producto Ofertado' : 'Nuevo Producto Ofertado'}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="code" className="text-sm font-medium text-gray-700">
              Código *
            </label>
            <Input
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="cudim" className="text-sm font-medium text-gray-700">
              CUDIM
            </label>
            <Input
              id="cudim"
              name="cudim"
              value={formData.cudim}
              onChange={handleInputChange}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="nombre" className="text-sm font-medium text-gray-700">
              Nombre *
            </label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="id_categoria" className="text-sm font-medium text-gray-700">
              Categoría *
            </label>
            <SelectField
              id="id_categoria"
              name="id_categoria"
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
            </SelectField>
          </div>

          <div>
            <label htmlFor="especialidad" className="text-sm font-medium text-gray-700">
              Especialidad
            </label>
            <Input
              id="especialidad"
              name="especialidad"
              value={formData.especialidad}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={handleSwitchChange}
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Activo
            </label>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
              Descripción
            </label>
            <Textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="referencias" className="text-sm font-medium text-gray-700">
              Referencias
            </label>
            <Textarea
              id="referencias"
              name="referencias"
              value={formData.referencias}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

export default ProductosOfertadosPage;