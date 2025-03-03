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
    imagenes_referencia: []
  });

  // Estado para la búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Aumentado a 20 para mostrar más productos por página

  const fileInputRef = useRef(null);

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
      
      // Procesar imágenes
      const productsWithImages = (response.results || []).map(product => ({
        ...product,
        imagenes_referencia: Array.isArray(product.imagenes_referencia)
          ? product.imagenes_referencia
          : []
      }));
      
      // Si estamos en la primera página o reemplazando datos, sobrescribimos el estado
      if (page === 1) {
        setData(productsWithImages);
      } else {
        // Si estamos cargando páginas adicionales, combinamos con los datos existentes
        // evitando duplicados por ID
        const existingIds = new Set(data.map(item => item.id));
        const newItems = productsWithImages.filter(item => !existingIds.has(item.id));
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
      imagenes_referencia: []
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
      const completeItem = {
        ...detailedItem,
        imagenes_referencia: imagenes
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
        imagenes_referencia: imagenes
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
      const completeItem = {
        ...detailedItem,
        imagenes_referencia: imagenes
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

      // Separamos los File de imágenes
      const imageFiles = formData.imagenes_referencia.filter(img => img instanceof File);

      // Objeto de producto sin las imágenes
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

      // Subir imágenes nuevas si existen
      if (imageFiles.length > 0) {
        const productId = savedProduct.id || selectedItem.id;
        await productosOfertadosService.uploadImages(productId, imageFiles);
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

      {/* Header */}
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-2xl font-bold">Productos Ofertados</h2>

        {activeTab === 'listado' && (
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            onClick={handleAdd}
          >
            Agregar Producto
          </button>
        )}
        {activeTab === 'formulario' && (
          <button
            type="button"
            form="productoOfertadoForm"
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            onClick={() =>
              document
                .getElementById('productoOfertadoForm')
                .dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
            }
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        )}
      </div>

      {/* Tabs */}
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
              className="px-4 py-2 font-medium border-b-2 border-purple-500 text-purple-600"
            >
              {selectedItem ? 'Editar Producto' : 'Nuevo Producto'}
            </button>
          )}

          {activeTab === 'visualizar' && selectedItem && (
            <button
              className="px-4 py-2 font-medium border-b-2 border-purple-500 text-purple-600"
            >
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
