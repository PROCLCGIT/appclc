// src/pages/products/ProductosDisponiblesPage.jsx
import { useState, useEffect, useRef } from 'react';
import {
  categoriasService,
  marcaService,
  productosOfertadosService,
  productosDisponiblesService
} from '@/services/api';

const ProductosDisponiblesPage2 = () => {
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

  // Referencias para archivos
  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);

  // Estado para archivos seleccionados
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [documentMetadata, setDocumentMetadata] = useState([]);

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

  // Manejo de pestañas y CRUD
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
    setSelectedImages([]);
    setSelectedDocuments([]);
    setDocumentMetadata([]);
    setActiveTab('formulario');
  };

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
    setSelectedImages([]);
    setSelectedDocuments([]);
    setDocumentMetadata([]);
    setActiveTab('formulario');
  };

  const handleViewDetails = async (item) => {
    try {
      const productDetail = await productosDisponiblesService.getById(item.id);
      setDetailItem(productDetail);
      setActiveTab('detalles');
    } catch (err) {
      console.error('Error al cargar detalles del producto:', err);
      setError('Error al cargar detalles del producto');
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await productosDisponiblesService.delete(item.id);
        await loadData();
      } catch (err) {
        setError(err.message || 'Error al eliminar el producto');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.code || !formData.nombre || !formData.id_categoria || !formData.id_marca || !formData.id_producto_ofertado) {
        setError('Los campos marcados con * son obligatorios');
        return;
      }

      const dataToSubmit = {
        ...formData,
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

      // Si hay archivos, se arma un FormData; si no, se hace con JSON
      if (selectedImages.length > 0 || selectedDocuments.length > 0) {
        const formDataToSend = new FormData();
        Object.keys(dataToSubmit).forEach(key => {
          if (dataToSubmit[key] !== null && dataToSubmit[key] !== undefined) {
            formDataToSend.append(key, dataToSubmit[key]);
          }
        });
        // Agregar imágenes
        selectedImages.forEach(image => {
          formDataToSend.append('uploaded_images', image);
        });
        // Agregar documentos + metadatos
        selectedDocuments.forEach((doc, index) => {
          formDataToSend.append('uploaded_documents', doc);
          const title = documentMetadata[index]?.title || `Documento ${index + 1}`;
          const type = documentMetadata[index]?.type || 'otros';
          const description = documentMetadata[index]?.description || `Documento ${doc.name}`;
          formDataToSend.append('document_titles', title);
          formDataToSend.append('document_types', type);
          formDataToSend.append('document_descriptions', description);
        });

        if (selectedItem) {
          await productosDisponiblesService.updateWithFormData(selectedItem.id, formDataToSend);
        } else {
          await productosDisponiblesService.createWithFormData(formDataToSend);
        }
      } else {
        // Sin archivos
        if (selectedItem) {
          await productosDisponiblesService.update(selectedItem.id, dataToSubmit);
        } else {
          await productosDisponiblesService.create(dataToSubmit);
        }
      }

      setActiveTab('listado');
      await loadData();
    } catch (err) {
      setError(err.message || 'Error al guardar el producto');
    }
  };

  // Manejo de inputs y sliders
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages([...selectedImages, ...files]);
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedDocuments([...selectedDocuments, ...files]);
    const newMetadata = files.map(file => ({
      title: file.name.split('.')[0],
      type: 'otros',
      description: `Documento: ${file.name}`
    }));
    setDocumentMetadata([...documentMetadata, ...newMetadata]);
  };

  const handleDocumentMetadataChange = (index, field, value) => {
    if (field === 'description' && value.trim() === '') {
      value = `Documento #${index + 1}`;
    }
    const updatedMetadata = [...documentMetadata];
    updatedMetadata[index] = {
      ...updatedMetadata[index],
      [field]: value
    };
    setDocumentMetadata(updatedMetadata);
  };

  const handleRemoveSelectedImage = (index) => {
    const updatedImages = [...selectedImages];
    updatedImages.splice(index, 1);
    setSelectedImages(updatedImages);
  };

  const handleRemoveSelectedDocument = (index) => {
    const updatedDocuments = [...selectedDocuments];
    const updatedMetadata = [...documentMetadata];
    updatedDocuments.splice(index, 1);
    updatedMetadata.splice(index, 1);
    setSelectedDocuments(updatedDocuments);
    setDocumentMetadata(updatedMetadata);
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Filtrado y paginación manual (simple)
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

  // Ejemplo de función para mostrar estado "Published" / "Unpublished"
  const getStatusLabel = (item) => {
    // Puedes usar tu propia lógica. Aquí, si is_active == true => Published; false => Unpublished
    return item.is_active ? 'Published' : 'Unpublished';
  };

  // === 1) NUEVO renderListadoTab (imitando el diseño de la captura) ===
  const renderListadoTab = () => (
    <div className="space-y-4">
      {/* Barra superior con Plan Upgrade, Export, etc. */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200">
            Plan Upgrade
          </button>
          <button className="bg-pink-100 text-pink-600 px-3 py-2 rounded-md text-sm hover:bg-pink-200">
            Export Report
          </button>
        </div>
        {/* Search + Sort + Botón agregar */}
        <div className="flex items-center space-x-4">
          <select className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none">
            <option value="">Sort By</option>
            <option value="nombre">Name</option>
            <option value="precio_asc">Price Asc</option>
            <option value="precio_desc">Price Desc</option>
          </select>
          <div className="relative">
            <input
              type="text"
              className="border border-gray-300 rounded-md pl-3 pr-8 py-1 text-sm focus:outline-none"
              placeholder="Search Products..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
            onClick={handleAdd}
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Tabla estilo imagen */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="px-4 py-3">
                  <input type="checkbox" />
                </th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Seller</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Stock Qty</th>
                <th className="px-4 py-3 text-left">Total Sales</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-4 text-center">
                    Cargando productos...
                  </td>
                </tr>
              ) : visibleData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-4 text-center">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                visibleData.map((item, index) => {
                  // brandName real, si existe:
                  const brandName = marcas.find((m) => m.id === item.id_marca)?.nombre || 'Brand';
                  // Category (del array categorias):
                  const categoryName =
                    categorias.find((c) => c.id === item.id_categoria)?.nombre ||
                    'No Category';
                  // Ejemplo de imagen: tomamos la primera si existe, si no, placeholder
                  const productImage =
                    item.imagenes?.[0]?.url ||
                    'https://via.placeholder.com/80?text=No+Image';
                  // Ejemplo de "seller" (si no viene de la API, dejamos un placeholder)
                  const sellerName = item.sellerName || 'John Doe';
                  const sellerAvatar =
                    'https://via.placeholder.com/40?text=S'; // una imagen chiquita
                  // Stock Qty y Total Sales (placeholders si no existen)
                  const stockQty = item.stock_qty ?? 50;
                  const totalSales = item.total_sales ?? 10;
                  const price = item.precio_venta_privado
                    ? `$${parseFloat(item.precio_venta_privado).toLocaleString()}`
                    : '$0';

                  return (
                    <tr key={item.id || index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input type="checkbox" />
                      </td>
                      {/* Product (imagen + nombre + brand) */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <img
                            src={productImage}
                            alt="Product"
                            className="w-10 h-10 rounded object-cover border"
                          />
                          <div>
                            <p className="font-semibold">{item.nombre}</p>
                            <p className="text-xs text-gray-500">{brandName}</p>
                          </div>
                        </div>
                      </td>
                      {/* Seller (avatar + nombre) */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <img
                            src={sellerAvatar}
                            alt="Seller"
                            className="w-8 h-8 rounded-full object-cover border"
                          />
                          <p>{sellerName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{categoryName}</td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        {getStatusLabel(item) === 'Published' ? (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                            Published
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                            Unpublished
                          </span>
                        )}
                      </td>
                      {/* Stock Qty */}
                      <td className="px-4 py-3">{stockQty}</td>
                      {/* Total Sales */}
                      <td className="px-4 py-3">{totalSales}</td>
                      {/* Price */}
                      <td className="px-4 py-3">{price}</td>
                      {/* Acciones: Ver detalle, Editar, Eliminar */}
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            className="bg-blue-100 text-blue-600 p-2 rounded hover:bg-blue-200"
                            title="Ver Detalle"
                            onClick={() => handleViewDetails(item)}
                          >
                            👁️
                          </button>
                          <button
                            className="bg-purple-100 text-purple-600 p-2 rounded hover:bg-purple-200"
                            title="Editar"
                            onClick={() => handleEdit(item)}
                          >
                            ✏️
                          </button>
                          <button
                            className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200"
                            title="Eliminar"
                            onClick={() => handleDelete(item)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Footer paginación */}
        <div className="flex items-center justify-between p-4">
          <div className="text-sm text-gray-700">
            Showing {totalItems === 0 ? 0 : startIndex + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={handlePrevPage}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={handleNextPage}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // === 2) Sliders para calificaciones (se mantiene) ===
  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 2) return 'text-amber-500';
    return 'text-red-500';
  };

  const RatingSlider = ({ name, value, label }) => {
    const handleManualChange = (e) => {
      const newVal = Number(e.target.value);
      handleSliderChange(name, [newVal]);
    };
    return (
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">{label} (0-5)</label>
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

  // === 3) Formulario (sin cambios, salvo detalles) ===
  const renderFormularioTab = () => {
    // ... (aquí mantienes tu código actual del formulario)
    // solamente asegúrate de que tus componentes con classes se mantengan consistentes
    // y correspondan a tu estilo preferido. 
    // (Se omite en el snippet para no hacerlo demasiado extenso, lo conservas tal cual.)
    
    return (
      <div>
        {/* TODO: tu formulario existente, sin cambios esenciales */}
        <p className="text-gray-500 text-sm mb-4">
          Formulario de creación/edición (mantén tu código actual aquí).
        </p>
        {/* Ejemplo de botón Cancelar/Guardar */}
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          {selectedItem ? 'Actualizar Producto' : 'Crear Producto'}
        </button>
      </div>
    );
  };

  // === 4) Detalles del producto (sin cambios esenciales) ===
  const renderDetallesTab = () => {
    if (!detailItem) {
      return (
        <div className="text-center p-6">
          <p className="text-gray-500">No se ha seleccionado ningún producto.</p>
        </div>
      );
    }
    // ... Tu código de detalles actual
    return (
      <div>
        <p className="text-gray-500 text-sm mb-4">Detalles del producto seleccionado.</p>
        {/* TODO: tu render de detalles tal cual lo tienes */}
        <button
          className="px-4 py-2 bg-gray-200 rounded-md"
          onClick={() => setActiveTab('listado')}
        >
          Volver al Listado
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md">
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
              type="button"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              onClick={handleSubmit}
            >
              {selectedItem ? 'Actualizar Producto' : 'Crear Producto'}
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
              if (!selectedItem) {
                handleAdd();
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

      {/* Contenido según la pestaña */}
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

export default ProductosDisponiblesPage2;
