// src/pages/products/ProductsDisp/ProductosDisponiblesPage.jsx
import { useState, useEffect, useRef } from 'react';
import {
  categoriasService,
  marcaService,
  productosOfertadosService,
  productosDisponiblesService,
  unidadesService
} from '@/services/api';

// Importamos nuestros componentes:
import ProductList from './Components/ProductList';
import ProductForm from './Components/ProductForm';
import ProductDetails from './Components/ProductDetails';
import ProductStats from './Components/ProductStats';

const ProductosDisponiblesPage = () => {
  const [data, setData] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [productosOfertados, setProductosOfertados] = useState([]);
  const [unidades, setUnidades] = useState([]);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Elemento seleccionado para editar/crear
  const [selectedItem, setSelectedItem] = useState(null);

  // Elemento seleccionado para ver en detalle
  const [detailItem, setDetailItem] = useState(null);

  // Referencias para archivos
  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);

  // Archivos seleccionados
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

  // Búsqueda, paginación y pestaña activa
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [activeTab, setActiveTab] = useState('listado');

  // ─────────────────────────────────────────────────────────────────────────────
  // Cargar datos principales
  // ─────────────────────────────────────────────────────────────────────────────
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Cargar todos los productos disponibles
      const response = await productosDisponiblesService.getAll();
      setData(response.results || []);

      // Cargar catálogos (categorías, marcas, productos ofertados, unidades)
      const [catRes, marcaRes, prodOferRes, uniRes] = await Promise.all([
        categoriasService.getAll(),
        marcaService.getAll(),
        productosOfertadosService.getAll(),
        unidadesService.getAll()
      ]);

      setCategorias(catRes.results || []);
      setMarcas(marcaRes.results || []);
      setProductosOfertados(prodOferRes.results || []);
      setUnidades(uniRes.results || []);

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
  // Generar código basado en el campo "code" de la categoría (prefijo de 3 letras)
  // ─────────────────────────────────────────────────────────────────────────────
  const generateProductCode = async (categoryId) => {
    if (!categoryId) {
      console.warn("No se proporcionó ID de categoría");
      return '';
    }
    
    try {
      console.log("Generando código para categoría ID:", categoryId);
      
      // Verificar si es string o number y normalizarlo a string
      const catIdStr = categoryId.toString();
      
      // Encontrar categoría por ID
      const categoria = categorias.find(cat => cat.id.toString() === catIdStr);
      if (!categoria) {
        console.error("No se encontró la categoría con ID:", catIdStr);
        return '';
      }

      console.log("Categoría encontrada:", categoria);
      
      // Extraer el código de la categoría (debe ser un prefijo de 3 letras)
      let prefix = '';
      if (!categoria.code) {
        console.error("La categoría no tiene un campo 'code' asignado.");
        alert(`Error: La categoría "${categoria.nombre}" no tiene un código asignado en el campo 'code'.`);
        return '';
      }
      
      // Usar el valor del campo 'code' de la categoría como prefijo
      prefix = categoria.code.toUpperCase();
      console.log("Prefijo de la categoría:", prefix);
      
      // Simplificamos el proceso: generamos un código basado en TimeStamp
      // Esto garantiza que sea único sin necesidad de consultar la API
      const timestamp = new Date().getTime() % 1000; // Últimos 3 dígitos del timestamp
      const formattedNumber = timestamp.toString().padStart(3, '0');
      
      const newCode = `${prefix}-A${formattedNumber}`;
      console.log("Código generado:", newCode);
      
      return newCode;
    } catch (error) {
      console.error("Error generando código de producto:", error);
      console.error(error.stack);
      return '';
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Acciones: Agregar, Editar, Ver Detalle, Eliminar
  // ─────────────────────────────────────────────────────────────────────────────

  // Limpia el formulario y pasa a la pestaña "formulario"
  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({
      code: '', // Se generará automáticamente
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
    
    // Mensaje para el usuario
    console.log("Modo de creación: Para generar el código automáticamente, seleccione una categoría o un producto ofertado.");
  };

  // Carga datos en el formulario y va a la pestaña "formulario"
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

  // Ver detalle de un producto (carga detalles y va a "detalles")
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

  // Eliminar un producto
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
      console.log("Iniciando proceso de guardado. Datos:", formData);
      
      // Limpiar errores previos
      setError(null);
      
      // Validación mínima
      if (
        !formData.code ||
        !formData.nombre ||
        !formData.id_categoria ||
        !formData.id_marca
      ) {
        const missingFields = [];
        if (!formData.code) missingFields.push("Código");
        if (!formData.nombre) missingFields.push("Nombre");
        if (!formData.id_categoria) missingFields.push("Categoría");
        if (!formData.id_marca) missingFields.push("Marca");
        
        const errorMsg = `Los campos marcados con * son obligatorios. Falta: ${missingFields.join(', ')}`;
        setError(errorMsg);
        console.error(errorMsg);
        alert(errorMsg); // Alerta para asegurar que el usuario lo vea
        return;
      }

      // Creamos una copia del formData para mostrar en la consola
      console.log("Preparando datos para enviar:", { ...formData });

      // Crear copia de formData para enviar
      const dataToSubmit = {};
      
      // Procesar cada campo individualmente
      Object.keys(formData).forEach(key => {
        // Campos numéricos - convertir a número si tienen valor
        if (['costo_referencial', 'precio_sie_referencial', 'precio_sie_tipob', 'precio_venta_privado'].includes(key)) {
          if (formData[key]) {
            dataToSubmit[key] = parseFloat(formData[key]);
          }
        }
        // El id_producto_ofertado es requerido por el modelo, así que verificamos
        // si tenemos un id de categoría para obtener al menos un producto ofertado
        else if (key === 'id_producto_ofertado') {
          if (formData[key] && formData[key] !== '') {
            dataToSubmit[key] = formData[key];
          } else {
            // SOLUCIÓN TEMPORAL:
            // Si no hay producto ofertado seleccionado, buscamos el primer producto 
            // ofertado que tenga la misma categoría seleccionada
            if (formData.id_categoria) {
              const productoOfertadoDefault = productosOfertados.find(
                p => p.id_categoria.toString() === formData.id_categoria.toString()
              );
              
              if (productoOfertadoDefault) {
                dataToSubmit[key] = productoOfertadoDefault.id;
                console.log(`⚠️ NOTA: Usando producto ofertado por defecto (ID: ${productoOfertadoDefault.id}) ya que el backend lo requiere`);
              } else {
                // Si no encontramos ninguno, tomamos el primero de la lista como último recurso
                if (productosOfertados.length > 0) {
                  dataToSubmit[key] = productosOfertados[0].id;
                  console.log(`⚡ ADVERTENCIA: Usando primer producto ofertado disponible (ID: ${productosOfertados[0].id}) como fallback`);
                } else {
                  setError("No hay productos ofertados disponibles. No se puede crear un producto disponible sin al menos un producto ofertado en el sistema.");
                  return; // Salir de la función
                }
              }
            } else {
              setError("Se requiere seleccionar una categoría y un producto ofertado.");
              return; // Salir de la función
            }
          }
        }
        // Otros campos - incluir si no son indefinidos o nulos
        else if (formData[key] !== undefined && formData[key] !== null) {
          dataToSubmit[key] = formData[key];
        }
      });
      
      console.log("Datos a enviar después de limpieza:", dataToSubmit);

      // Manejo de archivos (si hay imágenes o documentos en selectedImages / selectedDocuments)
      if (selectedImages.length > 0 || selectedDocuments.length > 0) {
        console.log("Preparando FormData con archivos adjuntos");
        const formDataToSend = new FormData();

        // Copiar campos al FormData
        Object.keys(dataToSubmit).forEach((key) => {
          if (dataToSubmit[key] !== null && dataToSubmit[key] !== undefined) {
            formDataToSend.append(key, dataToSubmit[key]);
            console.log(`Añadiendo campo ${key}:`, dataToSubmit[key]);
          }
        });

        // Agregar imágenes
        selectedImages.forEach((image, idx) => {
          formDataToSend.append('uploaded_images', image);
          console.log(`Añadiendo imagen ${idx+1}:`, image.name);
        });

        // Agregar documentos
        selectedDocuments.forEach((doc, index) => {
          formDataToSend.append('uploaded_documents', doc);
          console.log(`Añadiendo documento ${index+1}:`, doc.name);

          const title = documentMetadata[index]?.title || `Documento ${index + 1}`;
          const type = documentMetadata[index]?.type || 'otros';
          const description =
            documentMetadata[index]?.description || `Documento ${doc.name}`;

          formDataToSend.append('document_titles', title);
          formDataToSend.append('document_types', type);
          formDataToSend.append('document_descriptions', description);
        });

        // Crear o actualizar con FormData
        if (selectedItem) {
          console.log(`Actualizando producto ID ${selectedItem.id} con FormData`);
          await productosDisponiblesService.updateWithFormData(
            selectedItem.id,
            formDataToSend
          );
          console.log("Producto actualizado con éxito");
        } else {
          console.log("Creando nuevo producto con FormData");
          const result = await productosDisponiblesService.createWithFormData(formDataToSend);
          console.log("Producto creado con éxito:", result);
        }
      } else {
        // Sin archivos => create/update normal
        if (selectedItem) {
          console.log(`Actualizando producto ID ${selectedItem.id} sin archivos`);
          await productosDisponiblesService.update(selectedItem.id, dataToSubmit);
          console.log("Producto actualizado con éxito");
        } else {
          console.log("Creando nuevo producto sin archivos");
          const result = await productosDisponiblesService.create(dataToSubmit);
          console.log("Producto creado con éxito:", result);
        }
      }

      // Vuelve a la pestaña de listado y recarga
      alert(selectedItem ? "Producto actualizado correctamente" : "Producto creado correctamente");
      setActiveTab('listado');
      await loadData();
    } catch (err) {
      console.error('Error al guardar datos:', err);
      const errorMsg = err.message || 'Error al guardar el producto. Revisa la consola para más detalles.';
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers de formulario e inputs
  // ─────────────────────────────────────────────────────────────────────────────
  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    
    // Detectar si está cambiando la categoría
    if (name === 'id_categoria' && value) {
      console.log(`Categoría seleccionada: ${value}`);
      
      // Si no estamos en modo edición, generamos código automáticamente
      if (!selectedItem) {
        // Actualizamos primero el valor de la categoría
        setFormData({
          ...formData,
          [name]: type === 'checkbox' ? checked : value
        });
        
        // Generamos el código después de un breve retraso para asegurar que
        // la categoría se haya actualizado en el estado
        setTimeout(async () => {
          try {
            const code = await generateProductCode(value);
            console.log("Código generado después de seleccionar categoría:", code);
            
            if (code) {
              setFormData(prevState => ({
                ...prevState,
                code: code
              }));
            }
          } catch (err) {
            console.error("Error al generar código:", err);
          }
        }, 100);
      } else {
        // Si es modo edición, actualizamos normalmente
        setFormData({
          ...formData,
          [name]: type === 'checkbox' ? checked : value
        });
      }
    } else {
      // Para otros campos, actualizamos normalmente
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Cuando selecciona un producto ofertado (autocompleta)
  const handleProductoOfertadoChange = async (e) => {
    const productoOfertadoId = e.target.value;
    console.log("Producto ofertado seleccionado ID:", productoOfertadoId);
    
    if (!productoOfertadoId) {
      return; // No hacer nada si no hay ID
    }
    
    // Buscar el producto ofertado en la lista
    const productoOfertado = productosOfertados.find(
      (p) => p.id.toString() === productoOfertadoId.toString()
    );
    
    console.log("Producto ofertado encontrado:", productoOfertado);
    
    if (productoOfertado) {
      // Primero actualizamos el formulario con los datos básicos
      setFormData({
        ...formData,
        id_producto_ofertado: productoOfertadoId,
        nombre: productoOfertado.nombre,
        id_categoria: productoOfertado.id_categoria
      });
      
      // Si no estamos en modo edición, generamos código automáticamente
      // Pero lo hacemos en un segundo paso para asegurar que los primeros datos ya estén actualizados
      if (!selectedItem) {
        console.log("Generando código para producto ofertado, categoría ID:", productoOfertado.id_categoria);
        
        // Pequeño delay para asegurar que el estado se haya actualizado
        setTimeout(async () => {
          try {
            const code = await generateProductCode(productoOfertado.id_categoria);
            console.log("Código generado para producto ofertado:", code);
            
            if (code) {
              setFormData(prevState => ({
                ...prevState,
                code: code
              }));
            }
          } catch (err) {
            console.error("Error generando código para producto ofertado:", err);
          }
        }, 100);
      }
    } else {
      console.warn("No se encontró el producto ofertado con ID:", productoOfertadoId);
      setFormData({
        ...formData,
        id_producto_ofertado: productoOfertadoId
      });
    }
  };

  // Switch (checkbox de is_active)
  const handleSwitchChange = (checked) => {
    setFormData({
      ...formData,
      is_active: checked
    });
  };

  // Manejo de imágenes
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages([...selectedImages, ...files]);
  };

  const handleRemoveSelectedImage = (index) => {
    const updated = [...selectedImages];
    updated.splice(index, 1);
    setSelectedImages(updated);
  };

  // Manejo de documentos
  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedDocuments([...selectedDocuments, ...files]);

    // Crear metadata por defecto
    const newMetadata = files.map((f) => ({
      title: f.name.split('.')[0],
      type: 'otros',
      description: `Documento: ${f.name}`
    }));
    setDocumentMetadata([...documentMetadata, ...newMetadata]);
  };

  const handleRemoveSelectedDocument = (index) => {
    const updatedDocs = [...selectedDocuments];
    const updatedMetadata = [...documentMetadata];
    updatedDocs.splice(index, 1);
    updatedMetadata.splice(index, 1);
    setSelectedDocuments(updatedDocs);
    setDocumentMetadata(updatedMetadata);
  };

  const handleDocumentMetadataChange = (index, field, value) => {
    if (field === 'description' && value.trim() === '') {
      value = `Documento #${index + 1}`;
    }
    const updated = [...documentMetadata];
    updated[index] = { ...updated[index], [field]: value };
    setDocumentMetadata(updated);
  };

  // Slider (calificaciones 0-5)
  const handleSliderChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value[0] || 0
    });
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper para color de calificaciones
  // ─────────────────────────────────────────────────────────────────────────────
  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 2) return 'text-amber-500';
    return 'text-red-500';
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
                // Si estamos editando, mantenemos data
              } else {
                // Si estamos creando nuevo
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

      {/* Contenido según la pestaña activa */}
      <div className="p-6">
        {activeTab === 'listado' && (
          <ProductList
            isLoading={isLoading}
            error={error}
            data={visibleData}
            marcas={marcas}
            searchTerm={searchTerm}
            handleSearchChange={handleSearchChange}
            handleAdd={handleAdd}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleViewDetails={handleViewDetails}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            handlePrevPage={handlePrevPage}
            handleNextPage={handleNextPage}
          />
        )}

        {activeTab === 'formulario' && (
          <ProductForm
            formData={formData}
            productosOfertados={productosOfertados}
            categorias={categorias}
            marcas={marcas}
            unidades={unidades}
            selectedItem={selectedItem}
            handleProductoOfertadoChange={handleProductoOfertadoChange}
            handleInputChange={handleInputChange}
            handleSwitchChange={handleSwitchChange}
            handleRemoveSelectedImage={handleRemoveSelectedImage}
            handleRemoveSelectedDocument={handleRemoveSelectedDocument}
            handleImageChange={handleImageChange}
            handleDocumentChange={handleDocumentChange}
            handleDocumentMetadataChange={handleDocumentMetadataChange}
            handleSubmit={handleSubmit}
            selectedImages={selectedImages}
            selectedDocuments={selectedDocuments}
            documentMetadata={documentMetadata}
            getRatingColor={getRatingColor}
            handleSliderChange={handleSliderChange}
            setActiveTab={setActiveTab}
            setFormData={setFormData}
          />
        )}

        {activeTab === 'estadisticas' && (
          <ProductStats />
        )}

        {activeTab === 'detalles' && (
          <ProductDetails
            detailItem={detailItem}
            marcas={marcas}
            categorias={categorias}
            productosOfertados={productosOfertados}
            getRatingColor={getRatingColor}
            setActiveTab={setActiveTab}
          />
        )}
      </div>
    </div>
  );
};

export default ProductosDisponiblesPage;
