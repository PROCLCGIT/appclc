// src/pages/productos/ProductosDisponiblesPage.jsx

import { useState, useEffect } from 'react';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

import DataTable from '@/components/common/DataTable';
import FormDialog from '@/components/common/FormDialog';
import SelectField from '@/components/common/SelectField';

import {
  categoriasService,
  marcaService,
  productosOfertadosService,
  productosDisponiblesService
} from '@/services/api';

const ProductosDisponiblesPage = () => {
  const [data, setData] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [productosOfertados, setProductosOfertados] = useState([]);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    nombre: '',
    id_categoria: '',
    id_producto_ofertado: '',
    id_marca: '',
    modelo: '',
    presentacion: '',
    referencia: '',
    tz_oferta: 0,
    tz_demanda: 0,
    tz_inflacion: 0,
    tz_calidad: 0,
    tz_eficiencia: 0,
    tz_referencial: 0,
    costo_referencial: '',
    precio_sie_referencial: '',
    precio_sie_tipob: '',
    precio_venta_privado: '',
    is_active: true
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Cargar datos principales
  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await productosDisponiblesService.getAll();
      setData(response.results || []);

      const [categoriasRes, marcasRes, productosOfertadosRes] = await Promise.all([
        categoriasService.getAll(),
        marcaService.getAll(),
        productosOfertadosService.getAll()
      ]);

      setCategorias(categoriasRes.results || []);
      setMarcas(marcasRes.results || []);
      setProductosOfertados(productosOfertadosRes.results || []);

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

  // Agregar producto (resetea el formulario)
  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({
      code: '',
      nombre: '',
      id_categoria: '',
      id_producto_ofertado: '',
      id_marca: '',
      modelo: '',
      presentacion: '',
      referencia: '',
      tz_oferta: 0,
      tz_demanda: 0,
      tz_inflacion: 0,
      tz_calidad: 0,
      tz_eficiencia: 0,
      tz_referencial: 0,
      costo_referencial: '',
      precio_sie_referencial: '',
      precio_sie_tipob: '',
      precio_venta_privado: '',
      is_active: true
    });
    setIsDialogOpen(true);
  };

  // Editar producto (carga sus datos en el formulario)
  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      code: item.code || '',
      nombre: item.nombre || '',
      id_categoria: item.id_categoria || '',
      id_producto_ofertado: item.id_producto_ofertado || '',
      id_marca: item.id_marca || '',
      modelo: item.modelo || '',
      presentacion: item.presentacion || '',
      referencia: item.referencia || '',
      tz_oferta: item.tz_oferta || 0,
      tz_demanda: item.tz_demanda || 0,
      tz_inflacion: item.tz_inflacion || 0,
      tz_calidad: item.tz_calidad || 0,
      tz_eficiencia: item.tz_eficiencia || 0,
      tz_referencial: item.tz_referencial || 0,
      costo_referencial: item.costo_referencial || '',
      precio_sie_referencial: item.precio_sie_referencial || '',
      precio_sie_tipob: item.precio_sie_tipob || '',
      precio_venta_privado: item.precio_venta_privado || '',
      is_active: item.is_active !== undefined ? item.is_active : true
    });
    setIsDialogOpen(true);
  };

  // Eliminar producto
  const handleDelete = async (item) => {
    if (window.confirm('¿Está seguro de eliminar este producto disponible?')) {
      try {
        await productosDisponiblesService.delete(item.id);
        await loadData();
      } catch (err) {
        setError(err.message || 'Error al eliminar el producto');
      }
    }
  };

  // Guardar (crear o actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        // Asegurarnos de convertir correctamente a números
        costo_referencial: formData.costo_referencial
          ? parseFloat(formData.costo_referencial)
          : null,
        precio_sie_referencial: formData.precio_sie_referencial
          ? parseFloat(formData.precio_sie_referencial)
          : null,
        precio_sie_tipob: formData.precio_sie_tipob
          ? parseFloat(formData.precio_sie_tipob)
          : null,
        precio_venta_privado: formData.precio_venta_privado
          ? parseFloat(formData.precio_venta_privado)
          : null
      };

      if (selectedItem) {
        await productosDisponiblesService.update(selectedItem.id, dataToSubmit);
      } else {
        await productosDisponiblesService.create(dataToSubmit);
      }

      setIsDialogOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejo de inputs, sliders y switches
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSliderChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value[0] || 0
    });
  };

  const handleSwitchChange = (checked) => {
    setFormData({
      ...formData,
      is_active: checked
    });
  };

  // Si se elige un producto ofertado, autocompleta nombre y categoría
  const handleProductoOfertadoChange = (e) => {
    const productoOfertadoId = e.target.value;
    const productoOfertado = productosOfertados.find(
      (p) => p.id.toString() === productoOfertadoId
    );

    if (productoOfertado) {
      setFormData({
        ...formData,
        id_producto_ofertado: productoOfertadoId,
        nombre: productoOfertado.nombre,
        id_categoria: productoOfertado.id_categoria
      });
    } else {
      setFormData({
        ...formData,
        id_producto_ofertado: productoOfertadoId
      });
    }
  };

  // Búsqueda y paginación
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const paginatedData = (() => {
    const filteredData = data.filter((item) =>
      item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalItems = filteredData.length;
    const startIndex = (currentPage - 1) * itemsPerPage;

    return {
      data: filteredData.slice(startIndex, startIndex + itemsPerPage),
      totalItems,
      totalPages: Math.ceil(totalItems / itemsPerPage)
    };
  })();

  const { data: visibleData, totalItems, totalPages } = paginatedData;

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Helper para color de calificaciones
  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 2) return 'text-amber-500';
    return 'text-red-500';
  };

  // Columnas de la tabla
  const columns = [
    { key: 'code', label: 'Código' },
    { key: 'nombre', label: 'Nombre' },
    {
      key: 'id_marca',
      label: 'Marca',
      render: (item) => {
        const marca = marcas.find((m) => m.id === item.id_marca);
        return marca ? marca.nombre : 'No asignada';
      }
    },
    { key: 'modelo', label: 'Modelo' },
    {
      key: 'precio_sie_referencial',
      label: 'Precio SIE Ref.',
      render: (item) =>
        item.precio_sie_referencial
          ? `$${parseFloat(item.precio_sie_referencial).toFixed(2)}`
          : 'N/A'
    },
    {
      key: 'ratings',
      label: 'Calificaciones',
      render: (item) => (
        <div className="flex space-x-1">
          <span className={getRatingColor(item.tz_oferta)} title="Oferta">
            O:{item.tz_oferta}
          </span>
          <span className={getRatingColor(item.tz_demanda)} title="Demanda">
            D:{item.tz_demanda}
          </span>
          <span className={getRatingColor(item.tz_calidad)} title="Calidad">
            C:{item.tz_calidad}
          </span>
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (item) => (item.is_active ? 'Activo' : 'Inactivo')
    }
  ];

  // Slider para calificaciones
  const RatingSlider = ({ name, value, label }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <span className={`font-semibold ${getRatingColor(value)}`}>
          {value}
        </span>
      </div>
      <Slider
        id={name}
        min={0}
        max={5}
        step={1}
        value={[value]}
        onValueChange={(val) => handleSliderChange(name, val)}
      />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md">
      {/* Encabezado */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Productos Disponibles</h2>
            <p className="text-gray-500">
              Gestiona el catálogo de productos disponibles con precios y calificaciones
            </p>
          </div>
          <Button
            onClick={handleAdd}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Producto Disponible
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-6 border-b">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Búsqueda */}
      <div className="p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Buscar por código, nombre o modelo..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {/* Tabla de datos */}
      <div className="p-6">
        <DataTable
          columns={columns}
          data={visibleData}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Paginación */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-600">
            Mostrando{' '}
            {totalItems === 0
              ? 0
              : Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}{' '}
            - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
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

      {/* Modal para crear/editar */}
      <FormDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={
          selectedItem ? 'Editar Producto Disponible' : 'Nuevo Producto Disponible'
        }
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        size="xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Información básica */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-2">Información Básica</h3>
            <div className="border-b border-gray-200 mb-4"></div>
          </div>

          <div>
            <label
              htmlFor="id_producto_ofertado"
              className="text-sm font-medium text-gray-700"
            >
              Producto Ofertado *
            </label>
            <SelectField
              id="id_producto_ofertado"
              name="id_producto_ofertado"
              value={formData.id_producto_ofertado}
              onChange={handleProductoOfertadoChange}
              required
            >
              <option value="">Seleccione un producto ofertado</option>
              {productosOfertados.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.code} - {prod.nombre}
                </option>
              ))}
            </SelectField>
          </div>

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

          <div>
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
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </SelectField>
          </div>

          <div>
            <label htmlFor="id_marca" className="text-sm font-medium text-gray-700">
              Marca *
            </label>
            <SelectField
              id="id_marca"
              name="id_marca"
              value={formData.id_marca}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione una marca</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id}>
                  {marca.nombre}
                </option>
              ))}
            </SelectField>
          </div>

          <div>
            <label htmlFor="modelo" className="text-sm font-medium text-gray-700">
              Modelo
            </label>
            <Input
              id="modelo"
              name="modelo"
              value={formData.modelo}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label htmlFor="presentacion" className="text-sm font-medium text-gray-700">
              Presentación
            </label>
            <Input
              id="presentacion"
              name="presentacion"
              value={formData.presentacion}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label htmlFor="referencia" className="text-sm font-medium text-gray-700">
              Referencia
            </label>
            <Input
              id="referencia"
              name="referencia"
              value={formData.referencia}
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

          {/* Precios */}
          <div className="md:col-span-2 mt-4">
            <h3 className="text-lg font-medium mb-2">Información de Precios</h3>
            <div className="border-b border-gray-200 mb-4"></div>
          </div>

          <div>
            <label htmlFor="costo_referencial" className="text-sm font-medium text-gray-700">
              Costo Referencial
            </label>
            <Input
              id="costo_referencial"
              name="costo_referencial"
              type="number"
              step="0.01"
              value={formData.costo_referencial}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label
              htmlFor="precio_sie_referencial"
              className="text-sm font-medium text-gray-700"
            >
              Precio SIE Referencial
            </label>
            <Input
              id="precio_sie_referencial"
              name="precio_sie_referencial"
              type="number"
              step="0.01"
              value={formData.precio_sie_referencial}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label htmlFor="precio_sie_tipob" className="text-sm font-medium text-gray-700">
              Precio SIE Tipo B
            </label>
            <Input
              id="precio_sie_tipob"
              name="precio_sie_tipob"
              type="number"
              step="0.01"
              value={formData.precio_sie_tipob}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label
              htmlFor="precio_venta_privado"
              className="text-sm font-medium text-gray-700"
            >
              Precio Venta Privado
            </label>
            <Input
              id="precio_venta_privado"
              name="precio_venta_privado"
              type="number"
              step="0.01"
              value={formData.precio_venta_privado}
              onChange={handleInputChange}
            />
          </div>

          {/* Calificaciones */}
          <div className="md:col-span-2 mt-4">
            <h3 className="text-lg font-medium mb-2">Calificaciones (0-5)</h3>
            <div className="border-b border-gray-200 mb-4"></div>
          </div>

          <div>
            <RatingSlider
              name="tz_oferta"
              value={formData.tz_oferta}
              label="Oferta"
            />
          </div>
          <div>
            <RatingSlider
              name="tz_demanda"
              value={formData.tz_demanda}
              label="Demanda"
            />
          </div>
          <div>
            <RatingSlider
              name="tz_inflacion"
              value={formData.tz_inflacion}
              label="Inflación"
            />
          </div>
          <div>
            <RatingSlider
              name="tz_calidad"
              value={formData.tz_calidad}
              label="Calidad"
            />
          </div>
          <div>
            <RatingSlider
              name="tz_eficiencia"
              value={formData.tz_eficiencia}
              label="Eficiencia"
            />
          </div>
          <div>
            <RatingSlider
              name="tz_referencial"
              value={formData.tz_referencial}
              label="Referencial"
            />
          </div>
        </div>

        {/* Botones de acción en el diálogo */}
        <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-purple-600 text-white hover:bg-purple-700"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Guardando...'
              : selectedItem
              ? 'Actualizar Producto'
              : 'Crear Producto'}
          </Button>
        </div>
      </FormDialog>
    </div>
  );
};

export default ProductosDisponiblesPage;
