// src/pages/productos/ProductosOfertadosPage.jsx

import { useState, useEffect, useRef } from 'react';
import { categoriasService, productosOfertadosService } from '@/services/api';

// Importamos nuestros componentes separados
import ProductosOfertadosList from './components/ProductosOfertadosList';
import ProductosOfertadosForm from './components/ProductosOfertadosForm';
import ProductosOfertadosDetail from './components/ProductosOfertadosDetail';

const ProductosOfertadosPage = () => {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categorias, setCategorias] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('listado'); // 'listado' | 'formulario' | 'visualizar'

  // Para el formulario
  const [formData, setFormData] = useState({
    code: '',
    cudim: '',
    nombre: '',
    descripcion: '',
    especialidad: '',
    referencias: '',
    is_active: true,
    id_categoria: '',
    imagenes_referencia: [],
    documentos: []
  });

  // Estado para la búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Aumentado a 20 para mostrar más productos por página

  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);

  // ---------------
  // Carga de datos
  // ---------------
  const loadData = async (page = 1) => {
    setIsLoading(true);
    try {
      // 1. Carga de productos ofertados con paginación desde el servidor
      // Pasamos parámetros de paginación al backend
      const params = {
        page: page,
        page_size: 50, // Reducido a 50 para mejorar la velocidad de respuesta
        ordering: '-created_at' // Ordenar por fecha de creación (más recientes primero)
      };
      
      const response = await productosOfertadosService.getAll(params);
      console.log("API response:", response); // Depuración
      
      // Procesar imágenes y documentos
      const productsWithAssets = (response.results || []).map(product => ({
        ...product,
        imagenes_referencia: Array.isArray(product.imagenes_referencia)
          ? product.imagenes_referencia
          : [],
        documentos: Array.isArray(product.documentos)
          ? product.documentos
          : []
      }));
      
      // Si estamos en la primera página o reemplazando datos, sobrescribimos el estado
      if (page === 1) {
        setData(productsWithAssets);
      } else {
        // Si estamos cargando páginas adicionales, combinamos con los datos existentes
        // evitando duplicados por ID
        const existingIds = new Set(data.map(item => item.id));
        const newItems = productsWithAssets.filter(item => !existingIds.has(item.id));
        setData(prevData => [...prevData, ...newItems]);
      }
      
      // Si la API devuelve un conteo total, lo guardamos
      if (response.count !== undefined) {
        setTotalCount(response.count);
        console.log(`Total de productos disponibles: ${response.count}`);
      }

      // 2. Carga de categorías
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

  // Cargar datos cuando cambia la página
  useEffect(() => {
    // Siempre cargamos los datos de la página actual directamente desde el servidor
    // Esto asegura que siempre tengamos los datos más recientes
    loadData(currentPage);
  }, [currentPage]);

  // Carga inicial - se maneja a través del efecto de currentPage

  // ---------------
  // Generar código único para productos ofertados: OFP-XXXX
  // ---------------
  const generateUniqueCode = () => {
    // Generar un número aleatorio de 4 dígitos
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `OFP-${randomNum}`;
  };
  
  // ---------------
  // Acciones
  // ---------------
  const handleAdd = () => {
    setSelectedItem(null);
    // Generar código único automáticamente
    const generatedCode = generateUniqueCode();
    
    setFormData({
      code: generatedCode, // Código generado automáticamente
      cudim: '',
      nombre: '',
      descripcion: '',
      especialidad: '',
      referencias: '',
      is_active: true,
      id_categoria: '',
      imagenes_referencia: [],
      documentos: []
    });
    setActiveTab('formulario');
    
    console.log("Código generado automáticamente:", generatedCode);
  };

  const handleEdit = async (item) => {
    try {
      setIsLoading(true);
      const detailedItem = await productosOfertadosService.getById(item.id);
      const imagenes = Array.isArray(detailedItem.imagenes_referencia)
        ? detailedItem.imagenes_referencia
        : [];
      const documentos = Array.isArray(detailedItem.documentos)
        ? detailedItem.documentos
        : [];
      const completeItem = {
        ...detailedItem,
        imagenes_referencia: imagenes,
        documentos: documentos
      };
      setSelectedItem(completeItem);
      setFormData({
        code: completeItem.code || '',
        cudim: completeItem.cudim || '',
        nombre: completeItem.nombre || '',
        descripcion: completeItem.descripcion || '',
        especialidad: completeItem.especialidad || '',
        referencias: completeItem.referencias || '',
        is_active: completeItem.is_active || true,
        id_categoria: completeItem.id_categoria || '',
        imagenes_referencia: imagenes,
        documentos: documentos
      });
      setActiveTab('formulario');
    } catch (error) {
      console.error("Error al cargar detalles del producto:", error);
      setError("No se pudieron cargar los detalles completos del producto");
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async (item) => {
    try {
      setIsLoading(true);
      const detailedItem = await productosOfertadosService.getById(item.id);
      const imagenes = Array.isArray(detailedItem.imagenes_referencia)
        ? detailedItem.imagenes_referencia
        : [];
      const documentos = Array.isArray(detailedItem.documentos)
        ? detailedItem.documentos
        : [];
      const completeItem = {
        ...detailedItem,
        imagenes_referencia: imagenes,
        documentos: documentos
      };
      setSelectedItem(completeItem);
      setActiveTab('visualizar');
    } catch (error) {
      console.error("Error al cargar detalles del producto:", error);
      setError("No se pudieron cargar los detalles completos del producto");
    } finally {
      setIsLoading(false);
    }
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

  // ---------------
  // Envío Formulario
  // ---------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validaciones
      if (!formData.code.trim()) {
        throw new Error('El código es obligatorio');
      }
      if (!formData.nombre.trim()) {
        throw new Error('El nombre es obligatorio');
      }
      if (!formData.id_categoria) {
        throw new Error('Debe seleccionar una categoría');
      }

      // Separamos los File de imágenes y documentos
      const imageFiles = formData.imagenes_referencia.filter(img => img instanceof File);
      const documentFiles = formData.documentos ? formData.documentos.filter(doc => doc.file instanceof File) : [];

      // Preparar metadatos de documentos
      const documentTitles = documentFiles.map(doc => doc.titulo || '');
      const documentTypes = documentFiles.map(doc => doc.tipo_documento || 'otros');
      const documentDescriptions = documentFiles.map(doc => doc.descripcion || '');
      
      // Extraer los File objects de los documentos
      const docFiles = documentFiles.map(doc => doc.file);

      // Objeto de producto sin las imágenes y documentos
      const productData = {
        code: formData.code,
        cudim: formData.cudim,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        especialidad: formData.especialidad,
        referencias: formData.referencias,
        is_active: formData.is_active,
        id_categoria: formData.id_categoria
      };

      let savedProduct;
      if (selectedItem) {
        savedProduct = await productosOfertadosService.update(selectedItem.id, productData);
      } else {
        savedProduct = await productosOfertadosService.create(productData);
      }

      const productId = savedProduct.id || selectedItem.id;
      
      // Subir imágenes nuevas si existen
      if (imageFiles.length > 0) {
        await productosOfertadosService.uploadImages(productId, imageFiles);
      }
      
      // Subir documentos nuevos si existen
      if (docFiles.length > 0) {
        await productosOfertadosService.uploadDocuments(
          productId, 
          docFiles, 
          documentTitles, 
          documentTypes, 
          documentDescriptions
        );
      }

      // Volver al listado
      setActiveTab('listado');
      await loadData();
    } catch (err) {
      console.error("Error en submit:", err);
      setError(err.message || 'Error al guardar el producto');
      // Opcional: scrollear el error a la vista
      setTimeout(() => {
        const errorElement = document.querySelector('.error-message');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------
  // Render
  // ---------------
  return (
    <div className="max-w-7xl w-full mx-auto bg-white rounded-lg shadow-md relative min-h-screen">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="mt-2 text-sm text-gray-700">Cargando...</span>
          </div>
        </div>
      )}

      {/* Header mejorado */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-3xl font-bold text-gray-800">Productos Ofertados</h2>

          {activeTab === 'listado' && (
            <button
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-md hover:from-purple-700 hover:to-purple-800 shadow-md transition-all flex items-center space-x-2"
              onClick={handleAdd}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Agregar Producto</span>
            </button>
          )}
          {activeTab === 'formulario' && (
            <button
              type="button"
              form="productoOfertadoForm"
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-md hover:from-purple-700 hover:to-purple-800 shadow-md transition-all flex items-center space-x-2"
              onClick={() =>
                document
                  .getElementById('productoOfertadoForm')
                  .dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
              }
              disabled={isSubmitting}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          )}
        </div>
        <p className="text-gray-500">Gestión de productos ofertados a clientes</p>
      </div>

      {/* Tabs mejoradas */}
      <div className="border-b bg-gray-50">
        <div className="flex">
          <button
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'listado'
                ? 'border-b-2 border-purple-500 text-purple-700 bg-white'
                : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('listado')}
          >
            <div className="flex items-center">
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Listado de Productos
            </div>
          </button>

          {activeTab === 'formulario' && (
            <button
              className="px-6 py-3 font-medium border-b-2 border-purple-500 text-purple-700 bg-white flex items-center"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {selectedItem ? 
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path> :
                  <path d="M12 5v14M5 12h14"></path>
                }
                {selectedItem && <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>}
              </svg>
              {selectedItem ? 'Editar Producto' : 'Nuevo Producto'}
            </button>
          )}

          {activeTab === 'visualizar' && selectedItem && (
            <button
              className="px-6 py-3 font-medium border-b-2 border-purple-500 text-purple-700 bg-white flex items-center"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Visualizar Producto
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {activeTab === 'listado' && (
          <ProductosOfertadosList
            data={data}
            error={error}
            isLoading={isLoading}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalCount={totalCount}
          />
        )}

        {activeTab === 'formulario' && (
          <ProductosOfertadosForm
            error={error}
            formData={formData}
            setFormData={setFormData}
            isSubmitting={isSubmitting}
            categorias={categorias}
            onSubmit={handleSubmit}
            onCancel={() => setActiveTab('listado')}
            fileInputRef={fileInputRef}
            documentInputRef={documentInputRef}
          />
        )}

        {activeTab === 'visualizar' && selectedItem && (
          <ProductosOfertadosDetail
            error={error}
            selectedItem={selectedItem}
            categorias={categorias}
            onEdit={handleEdit}
            onBack={() => setActiveTab('listado')}
          />
        )}
      </div>
    </div>
  );
};

export default ProductosOfertadosPage;
