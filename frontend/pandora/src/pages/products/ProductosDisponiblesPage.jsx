// src/pages/products/ProductosDisponiblesPage.jsx
import { useState, useEffect } from 'react';
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

  // Elemento seleccionado para editar/crear
  const [selectedItem, setSelectedItem] = useState(null);

  // Elemento seleccionado para ver en detalle
  const [detailItem, setDetailItem] = useState(null);

  // Datos del formulario
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

  // Búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pestaña activa: listado | formulario | estadisticas | detalles
  const [activeTab, setActiveTab] = useState('listado');

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

  // Agregar producto (resetea el formulario y va a la pestaña formulario)
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
    setActiveTab('formulario');
  };

  // Editar producto (carga sus datos en el formulario y va a la pestaña formulario)
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
    setActiveTab('formulario');
  };

  // Ver detalle de un producto
  const handleViewDetails = (item) => {
    setDetailItem(item);
    setActiveTab('detalles');
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
    try {
      const dataToSubmit = {
        ...formData,
        // Convertir a número si hay valores
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

      // Vuelve a la pestaña de listado
      setActiveTab('listado');
      await loadData();
    } catch (err) {
      setError(err.message || 'Error al guardar el producto');
    }
  };

  // Manejo de inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Slider manual
  const handleSliderChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value[0] || 0
    });
  };

  // Switch
  const handleSwitchChange = (checked) => {
    setFormData({
      ...formData,
      is_active: checked
    });
  };

  // Cuando se selecciona producto ofertado, autocompleta nombre y categoría
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

  // Búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Filtrado y paginación manual
  const filteredData = data.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.code?.toLowerCase().includes(term) ||
      item.nombre?.toLowerCase().includes(term) ||
      item.modelo?.toLowerCase().includes(term)
    );
  });

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

  // Helper para color de calificaciones
  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 2) return 'text-amber-500';
    return 'text-red-500';
  };

  // Render de la pestaña LISTADO
  const renderListadoTab = () => (
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
                <th className="px-4 py-2 text-left">Código</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Marca</th>
                <th className="px-4 py-2 text-left">Modelo</th>
                <th className="px-4 py-2 text-left">Precio SIE Ref.</th>
                <th className="px-4 py-2 text-left">Calificaciones</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-2 text-center">
                    Cargando productos...
                  </td>
                </tr>
              ) : visibleData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-2 text-center">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                visibleData.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className={index % 2 === 0 ? 'bg-gray-50' : ''}
                  >
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
                      <div className="flex space-x-1">
                        <span
                          className={getRatingColor(item.tz_oferta)}
                          title="Oferta"
                        >
                          O:{item.tz_oferta}
                        </span>
                        <span
                          className={getRatingColor(item.tz_demanda)}
                          title="Demanda"
                        >
                          D:{item.tz_demanda}
                        </span>
                        <span
                          className={getRatingColor(item.tz_calidad)}
                          title="Calidad"
                        >
                          C:{item.tz_calidad}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {item.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleViewDetails(item)}
                        >
                          Ver Detalle
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleEdit(item)}
                        >
                          Editar
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(item)}
                        >
                          Eliminar
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
              : Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}{' '}
            - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}{' '}
            resultados
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

  // Slider manual
  const RatingSlider = ({ name, value, label }) => {
    const handleManualChange = (e) => {
      const newVal = Number(e.target.value);
      handleSliderChange(name, [newVal]);
    };

    return (
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <label htmlFor={name} className="text-sm font-medium text-gray-700">
            {label} (0-5)
          </label>
          <span className={`font-semibold ${getRatingColor(value)}`}>
            {value}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="1"
          value={value}
          onChange={handleManualChange}
          className="w-full"
        />
      </div>
    );
  };

  // Render de la pestaña FORMULARIO
  const renderFormularioTab = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Básica */}
        <div>
          <h3 className="text-lg font-medium mb-4">Información Básica</h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="id_producto_ofertado"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Producto Ofertado *
              </label>
              <select
                id="id_producto_ofertado"
                name="id_producto_ofertado"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              </select>
            </div>

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
              <label
                htmlFor="id_categoria"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Categoría *
              </label>
              <select
                id="id_categoria"
                name="id_categoria"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              </select>
            </div>
          </div>
        </div>

        {/* Marca, modelo, etc. */}
        <div>
          <h3 className="text-lg font-medium mb-4">Detalles</h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="id_marca"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Marca *
              </label>
              <select
                id="id_marca"
                name="id_marca"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              </select>
            </div>

            <div>
              <label
                htmlFor="modelo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Modelo
              </label>
              <input
                type="text"
                name="modelo"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.modelo}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="presentacion"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Presentación
              </label>
              <input
                type="text"
                name="presentacion"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.presentacion}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="referencia"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Referencia
              </label>
              <input
                type="text"
                name="referencia"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.referencia}
                onChange={handleInputChange}
              />
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
              <label
                htmlFor="is_active"
                className="ml-2 block text-sm text-gray-700"
              >
                Activo
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Precios */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Información de Precios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Costo Referencial
            </label>
            <input
              type="number"
              step="0.01"
              name="costo_referencial"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.costo_referencial}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio SIE Referencial
            </label>
            <input
              type="number"
              step="0.01"
              name="precio_sie_referencial"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.precio_sie_referencial}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio SIE Tipo B
            </label>
            <input
              type="number"
              step="0.01"
              name="precio_sie_tipob"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.precio_sie_tipob}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio Venta Privado
            </label>
            <input
              type="number"
              step="0.01"
              name="precio_venta_privado"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.precio_venta_privado}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      {/* Calificaciones (sliders) */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Calificaciones (0-5)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RatingSlider name="tz_oferta" value={formData.tz_oferta} label="Oferta" />
          <RatingSlider name="tz_demanda" value={formData.tz_demanda} label="Demanda" />
          <RatingSlider name="tz_inflacion" value={formData.tz_inflacion} label="Inflación" />
          <RatingSlider name="tz_calidad" value={formData.tz_calidad} label="Calidad" />
          <RatingSlider name="tz_eficiencia" value={formData.tz_eficiencia} label="Eficiencia" />
          <RatingSlider name="tz_referencial" value={formData.tz_referencial} label="Referencial" />
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-2 pt-4 border-t mt-6">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          onClick={() => setActiveTab('listado')}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 shadow-sm text-sm font-medium"
        >
          {selectedItem ? 'Actualizar Producto' : 'Crear Producto'}
        </button>
      </div>
    </form>
  );

  // Render de la pestaña DETALLES
  const renderDetallesTab = () => {
    if (!detailItem) {
      return (
        <div className="text-center p-6">
          <p className="text-gray-500">No se ha seleccionado ningún producto.</p>
        </div>
      );
    }

    // Obtenemos la marca, la categoría y el producto ofertado si es necesario
    const marca = marcas.find((m) => m.id === detailItem.id_marca);
    const categoria = categorias.find((c) => c.id === detailItem.id_categoria);
    const ofertado = productosOfertados.find(
      (p) => p.id === detailItem.id_producto_ofertado
    );

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Detalles del Producto</h3>
        <div className="border p-4 rounded-md">
          <p>
            <strong>Código:</strong> {detailItem.code}
          </p>
          <p>
            <strong>Nombre:</strong> {detailItem.nombre}
          </p>
          <p>
            <strong>Producto Ofertado:</strong>{' '}
            {ofertado ? ofertado.nombre : 'N/A'}
          </p>
          <p>
            <strong>Categoría:</strong> {categoria ? categoria.nombre : 'N/A'}
          </p>
          <p>
            <strong>Marca:</strong> {marca ? marca.nombre : 'N/A'}
          </p>
          <p>
            <strong>Modelo:</strong> {detailItem.modelo || 'N/A'}
          </p>
          <p>
            <strong>Presentación:</strong> {detailItem.presentacion || 'N/A'}
          </p>
          <p>
            <strong>Referencia:</strong> {detailItem.referencia || 'N/A'}
          </p>
          <p>
            <strong>Estado:</strong>{' '}
            {detailItem.is_active ? 'Activo' : 'Inactivo'}
          </p>
        </div>

        <h4 className="text-lg font-medium mt-6">Precios</h4>
        <div className="border p-4 rounded-md">
          <p>
            <strong>Costo Referencial:</strong>{' '}
            {detailItem.costo_referencial != null
              ? `$${parseFloat(detailItem.costo_referencial).toFixed(2)}`
              : 'N/A'}
          </p>
          <p>
            <strong>Precio SIE Referencial:</strong>{' '}
            {detailItem.precio_sie_referencial != null
              ? `$${parseFloat(detailItem.precio_sie_referencial).toFixed(2)}`
              : 'N/A'}
          </p>
          <p>
            <strong>Precio SIE Tipo B:</strong>{' '}
            {detailItem.precio_sie_tipob != null
              ? `$${parseFloat(detailItem.precio_sie_tipob).toFixed(2)}`
              : 'N/A'}
          </p>
          <p>
            <strong>Precio Venta Privado:</strong>{' '}
            {detailItem.precio_venta_privado != null
              ? `$${parseFloat(detailItem.precio_venta_privado).toFixed(2)}`
              : 'N/A'}
          </p>
        </div>

        <h4 className="text-lg font-medium mt-6">Calificaciones</h4>
        <div className="border p-4 rounded-md space-y-2">
          <p>
            <strong>Oferta:</strong>{' '}
            <span className={getRatingColor(detailItem.tz_oferta)}>
              {detailItem.tz_oferta}
            </span>
          </p>
          <p>
            <strong>Demanda:</strong>{' '}
            <span className={getRatingColor(detailItem.tz_demanda)}>
              {detailItem.tz_demanda}
            </span>
          </p>
          <p>
            <strong>Inflación:</strong>{' '}
            <span className={getRatingColor(detailItem.tz_inflacion)}>
              {detailItem.tz_inflacion}
            </span>
          </p>
          <p>
            <strong>Calidad:</strong>{' '}
            <span className={getRatingColor(detailItem.tz_calidad)}>
              {detailItem.tz_calidad}
            </span>
          </p>
          <p>
            <strong>Eficiencia:</strong>{' '}
            <span className={getRatingColor(detailItem.tz_eficiencia)}>
              {detailItem.tz_eficiencia}
            </span>
          </p>
          <p>
            <strong>Referencial:</strong>{' '}
            <span className={getRatingColor(detailItem.tz_referencial)}>
              {detailItem.tz_referencial}
            </span>
          </p>
        </div>

        {/* Botón para volver al listado */}
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            onClick={() => setActiveTab('listado')}
          >
            Volver al Listado
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md">
      {/* Encabezado */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Productos Disponibles</h2>
          {activeTab === 'listado' ? (
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              onClick={handleAdd}
            >
              Agregar Producto Disponible
            </button>
          ) : activeTab === 'formulario' ? (
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              onClick={handleSubmit}
            >
              Guardar Cambios
            </button>
          ) : null}
        </div>
      </div>

      {/* Pestañas */}
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

          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'formulario'
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => {
              if (selectedItem) {
                // Si hay un elemento seleccionado, permanecemos con su data
              } else {
                handleAdd(); // Si no, limpiamos para crear un nuevo producto
              }
              setActiveTab('formulario');
            }}
          >
            {selectedItem ? 'Editar Producto' : 'Nuevo Producto'}
          </button>

          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'estadisticas'
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('estadisticas')}
          >
            Estadísticas
          </button>

          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'detalles'
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('detalles')}
          >
            Detalles
          </button>
        </div>
      </div>

      {/* Contenido según la pestaña activa */}
      <div className="p-6">
        {activeTab === 'listado' && renderListadoTab()}
        {activeTab === 'formulario' && renderFormularioTab()}
        {activeTab === 'estadisticas' && (
          <div className="text-center p-8 text-gray-500">
            El módulo de estadísticas está en desarrollo.
          </div>
        )}
        {activeTab === 'detalles' && renderDetallesTab()}
      </div>
    </div>
  );
};

export default ProductosDisponiblesPage;
