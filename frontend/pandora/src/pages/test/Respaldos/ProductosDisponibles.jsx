// src/pages/products/ProductosDisponiblesPage.jsx
import { useState, useEffect, useRef } from 'react';
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Cargar datos principales
  // ─────────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Genera un código único para un nuevo producto
  //   - Usando el campo "codigo" de la tabla categoria como prefijo
  // ─────────────────────────────────────────────────────────────────────────────
  const generateProductCode = async (categoryId) => {
    if (!categoryId) return '';
    
    try {
      // Primero, obtener la categoría para conseguir su "codigo" (p.ej: "INS")
      const categoria = categorias.find(cat => cat.id === categoryId);
      if (!categoria || !categoria.codigo) return '';
      
      // Prefijo = la columna "codigo" de la categoría
      const prefix = categoria.codigo.toUpperCase();
      
      // Obtener todos los productos para determinar el siguiente número secuencial
      const productos = await productosDisponiblesService.getAll();
      const allCodes = productos.results.map(product => product.code || '');
      
      // Buscar el patrón de código para esta categoría: XXX-A###
      // Ej: "INS-A001"
      const pattern = new RegExp(`${prefix}-A(\\d{3})`);
      let maxNumber = 0;
      
      allCodes.forEach(code => {
        const match = code.match(pattern);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num > maxNumber) {
            maxNumber = num;
          }
        }
      });
      
      // Incrementar el número y formatear con ceros a la izquierda
      const nextNumber = maxNumber + 1;
      const formattedNumber = nextNumber.toString().padStart(3, '0');
      
      return `${prefix}-A${formattedNumber}`;
    } catch (error) {
      console.error("Error generando código de producto:", error);
      return '';
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Acciones principales (Agregar, Editar, Ver Detalle, Eliminar)
  // ─────────────────────────────────────────────────────────────────────────────
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
    if (window.confirm('¿Está seguro de eliminar este producto disponible?')) {
      try {
        await productosDisponiblesService.delete(item.id);
        await loadData();
      } catch (err) {
        setError(err.message || 'Error al eliminar el producto');
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Guardar (crear o actualizar)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      // Validación manual de campos obligatorios
      if (!formData.code || !formData.nombre || !formData.id_categoria || !formData.id_marca || !formData.id_producto_ofertado) {
        setError('Los campos marcados con * son obligatorios');
        return;
      }
      
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

      // Si hay archivos seleccionados, preparamos un FormData
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
        
        // Agregar documentos y sus metadatos
        selectedDocuments.forEach((doc, index) => {
          formDataToSend.append('uploaded_documents', doc);
          
          const title = documentMetadata[index]?.title || `Documento ${index + 1}`;
          const type = documentMetadata[index]?.type || 'otros';
          const description = documentMetadata[index]?.description || `Documento ${doc.name}`;
          
          formDataToSend.append('document_titles', title);
          formDataToSend.append('document_types', type);
          formDataToSend.append('document_descriptions', description);
        });
        
        try {
          if (selectedItem) {
            await productosDisponiblesService.updateWithFormData(selectedItem.id, formDataToSend);
          } else {
            await productosDisponiblesService.createWithFormData(formDataToSend);
          }
        } catch (err) {
          console.error('Error al enviar FormData:', err);
          setError(err.message || 'Error al guardar el producto');
          return;
        }
      } else {
        // Si no hay archivos, usamos el método normal
        try {
          if (selectedItem) {
            await productosDisponiblesService.update(selectedItem.id, dataToSubmit);
          } else {
            await productosDisponiblesService.create(dataToSubmit);
          }
        } catch (err) {
          console.error('Error al guardar datos:', err);
          setError(err.message || 'Error al guardar el producto');
          return;
        }
      }

      setActiveTab('listado');
      await loadData();
    } catch (err) {
      setError(err.message || 'Error al guardar el producto');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Manejo de inputs (incluye autogenerar código si cambia la categoría)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    
    // Si se cambia la categoría y estamos creando un nuevo producto (no editando)
    if (name === 'id_categoria' && !selectedItem && value) {
      // Generar nuevo código basado en la categoría seleccionada
      const newCode = await generateProductCode(value);
      
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
        code: newCode // Actualiza el código automáticamente
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };
  
  // Manejo de selección de imágenes
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages([...selectedImages, ...files]);
  };
  
  // Manejo de selección de documentos
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
  
  // Actualizar metadatos de documentos
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
  
  // Eliminar una imagen seleccionada (antes de guardar)
  const handleRemoveSelectedImage = (index) => {
    const updatedImages = [...selectedImages];
    updatedImages.splice(index, 1);
    setSelectedImages(updatedImages);
  };
  
  // Eliminar un documento seleccionado (antes de guardar)
  const handleRemoveSelectedDocument = (index) => {
    const updatedDocuments = [...selectedDocuments];
    const updatedMetadata = [...documentMetadata];
    
    updatedDocuments.splice(index, 1);
    updatedMetadata.splice(index, 1);
    
    setSelectedDocuments(updatedDocuments);
    setDocumentMetadata(updatedMetadata);
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
  const handleProductoOfertadoChange = async (e) => {
    const productoOfertadoId = e.target.value;
    const productoOfertado = productosOfertados.find(
      (p) => p.id.toString() === productoOfertadoId
    );

    if (productoOfertado) {
      if (!selectedItem) {
        // Generar código automáticamente basado en la categoría
        const newCode = await generateProductCode(productoOfertado.id_categoria);
        
        setFormData({
          ...formData,
          id_producto_ofertado: productoOfertadoId,
          nombre: productoOfertado.nombre,
          id_categoria: productoOfertado.id_categoria,
          code: newCode 
        });
      } else {
        // Editando, no regeneramos code
        setFormData({
          ...formData,
          id_producto_ofertado: productoOfertadoId,
          nombre: productoOfertado.nombre,
          id_categoria: productoOfertado.id_categoria
        });
      }
    } else {
      setFormData({
        ...formData,
        id_producto_ofertado: productoOfertadoId
      });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Búsqueda y paginación
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

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

  // ─────────────────────────────────────────────────────────────────────────────
  // Render de la pestaña LISTADO
  // ─────────────────────────────────────────────────────────────────────────────
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
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-2 text-center">
                    Cargando productos...
                  </td>
                </tr>
              ) : visibleData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-2 text-center">
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
                      <div className="flex space-x-4">
                        <button
                          title="Ver Detalle"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleViewDetails(item)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          title="Editar"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleEdit(item)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          title="Eliminar"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(item)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Slider manual (para calificaciones en el formulario)
  // ─────────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Render de la pestaña FORMULARIO
  // ─────────────────────────────────────────────────────────────────────────────
  const renderFormularioTab = () => (
    <div className="space-y-6">
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
                Código *{' '}
                {!selectedItem && (
                  <span className="text-xs text-blue-600">
                    (Generado automáticamente al seleccionar categoría)
                  </span>
                )}
              </label>
              <input
                type="text"
                name="code"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.code}
                onChange={handleInputChange}
                readOnly={!selectedItem} // Solo editable si estamos actualizando un producto
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

      {/* Sección de imágenes */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Imágenes</h3>
        <div className="space-y-4">
          {selectedImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative">
                  <img 
                    src={URL.createObjectURL(image)} 
                    alt={`Vista previa ${index + 1}`}
                    className="w-full h-32 object-cover rounded border border-gray-300" 
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSelectedImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div>
            <input
              type="file"
              id="image-upload"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              ref={imageInputRef}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => imageInputRef.current.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Agregar Imágenes
            </button>
            <span className="ml-2 text-sm text-gray-500">
              Puede seleccionar múltiples imágenes
            </span>
          </div>
        </div>
      </div>

      {/* Sección de documentos */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Documentos (PDF, Fichas técnicas, etc.)</h3>
        <div className="space-y-4">
          {selectedDocuments.length > 0 && (
            <div className="space-y-4">
              {selectedDocuments.map((doc, index) => (
                <div key={index} className="border p-4 rounded-md">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">📄</span>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          {(doc.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedDocument(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                  
                  {/* Metadatos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={documentMetadata[index]?.title || ''}
                        onChange={(e) => handleDocumentMetadataChange(index, 'title', e.target.value)}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Documento
                      </label>
                      <select
                        value={documentMetadata[index]?.type || 'otros'}
                        onChange={(e) => handleDocumentMetadataChange(index, 'type', e.target.value)}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="manual">Manual de Usuario</option>
                        <option value="ficha_tecnica">Ficha Técnica</option>
                        <option value="certificado">Certificado</option>
                        <option value="catalogo">Catálogo</option>
                        <option value="otros">Otros</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={documentMetadata[index]?.description || ''}
                        onChange={(e) => handleDocumentMetadataChange(index, 'description', e.target.value)}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows="2"
                      ></textarea>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div>
            <input
              type="file"
              id="document-upload"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleDocumentChange}
              ref={documentInputRef}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => documentInputRef.current.click()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + Agregar Documentos
            </button>
            <span className="ml-2 text-sm text-gray-500">
              PDF, Word, Excel, etc.
            </span>
          </div>
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
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 shadow-sm text-sm font-medium"
        >
          {selectedItem ? 'Actualizar Producto' : 'Crear Producto'}
        </button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Render de la pestaña DETALLES
  // ─────────────────────────────────────────────────────────────────────────────
  const renderDetallesTab = () => {
    if (!detailItem) {
      return (
        <div className="text-center p-6">
          <p className="text-gray-500">No se ha seleccionado ningún producto.</p>
        </div>
      );
    }

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
        
        {detailItem.imagenes && detailItem.imagenes.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-medium">Imágenes</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {detailItem.imagenes.map((img, index) => (
                <div key={index} className="border rounded-md overflow-hidden">
                  <a href={img.url} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={img.url} 
                      alt={img.descripcion || `Imagen ${index + 1}`}
                      className="w-full h-32 object-cover" 
                    />
                  </a>
                  {img.descripcion && (
                    <p className="p-2 text-sm text-center truncate">{img.descripcion}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {detailItem.documentos && detailItem.documentos.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-medium">Documentos</h4>
            <div className="space-y-2 mt-2">
              {detailItem.documentos.map((doc, index) => (
                <div key={index} className="border p-3 rounded-md">
                  <div className="flex items-start">
                    <span className="text-xl mr-2">📄</span>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{doc.titulo}</p>
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Descargar
                        </a>
                      </div>
                      <p className="text-sm text-gray-600">{doc.tipo_documento_display}</p>
                      {doc.descripcion && (
                        <p className="text-sm mt-1">{doc.descripcion}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {doc.extension?.toUpperCase()} - {doc.tamano} MB
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

  // ─────────────────────────────────────────────────────────────────────────────
  // Render principal
  // ─────────────────────────────────────────────────────────────────────────────
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
              if (selectedItem) {
                // Si hay un elemento seleccionado, usamos sus datos
              } else {
                handleAdd(); // Si no, limpiamos para crear uno nuevo
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
