// src/pages/products/ProductsDisp/Components/ProductForm.jsx


import { useState } from 'react';
import { unidadesService, marcaService, categoriasService, productosOfertadosService, procedenciaService } from '@/services/api';

// Modal genérico para formularios simples con diseño mejorado
function FormModal({ isOpen, onClose, onSave, title, fields, submitLabel = "Guardar" }) {
  const [formValues, setFormValues] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Inicializar los valores del formulario basado en los campos proporcionados
  useState(() => {
    const initialValues = {};
    fields.forEach(field => {
      initialValues[field.name] = field.defaultValue !== undefined ? field.defaultValue : '';
    });
    setFormValues(initialValues);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Manejar diferentes tipos de inputs
    setFormValues(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    const requiredFields = fields.filter(field => field.required);
    for (const field of requiredFields) {
      // Saltamos la validación de campos booleanos
      if (field.type === 'checkbox') continue;
      
      if (!formValues[field.name]?.toString().trim()) {
        setError(`El campo ${field.label} es obligatorio`);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Preparar datos para guardar
      const dataToSave = {};
      fields.forEach(field => {
        if (field.type === 'checkbox') {
          dataToSave[field.name] = !!formValues[field.name];
        } else {
          dataToSave[field.name] = formValues[field.name]?.toString().trim() || '';
        }
      });
      
      // Llamar a la función de guardar proporcionada
      await onSave(dataToSave);
      
      // Limpiar y cerrar
      setFormValues({});
      onClose();
    } catch (err) {
      setError(err.message || `Error al guardar ${title.toLowerCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5 pb-2 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="p-3 mb-4 bg-red-50 border-l-4 border-red-500 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map(field => (
            <div key={field.name} className="mb-4">
              {field.type === 'checkbox' ? (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={field.name}
                    name={field.name}
                    checked={!!formValues[field.name]}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={field.name} className="ml-2 block text-sm text-gray-700">
                    {field.label}
                  </label>
                </div>
              ) : field.type === 'select' ? (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    name={field.name}
                    value={formValues[field.name] || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required={field.required}
                  >
                    {field.options?.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={formValues[field.name] || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder={field.placeholder || ''}
                    required={field.required}
                  />
                </>
              )}
              
              {field.helpText && (
                <p className="mt-1 text-xs text-gray-500">{field.helpText}</p>
              )}
            </div>
          ))}
          
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componentes específicos con FormModal
function UnidadFormModal({ isOpen, onClose, onSave }) {
  const fields = [
    {
      name: 'nombre',
      label: 'Nombre',
      required: true,
      placeholder: 'Ej: Kilogramo'
    },
    {
      name: 'code',
      label: 'Código',
      required: true,
      placeholder: 'Ej: kg',
      helpText: 'Código único para identificar la unidad (generalmente abreviatura)'
    }
  ];
  
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Agregar Nueva Unidad"
      fields={fields}
      submitLabel="Guardar Unidad"
    />
  );
}

function MarcaFormModal({ isOpen, onClose, onSave }) {
  const fields = [
    {
      name: 'nombre',
      label: 'Nombre',
      required: true,
      placeholder: 'Ej: Samsung'
    },
    {
      name: 'code',
      label: 'Código',
      required: true,
      placeholder: 'Ej: SAM',
      helpText: 'Código único para identificar la marca (máximo 20 caracteres)'
    },
    {
      name: 'description',
      label: 'Descripción',
      placeholder: 'Información adicional sobre la marca'
    },
    {
      name: 'proveedores',
      label: 'Proveedores',
      placeholder: 'Proveedores principales',
      helpText: 'Lista de proveedores separados por comas'
    },
    {
      name: 'country_origin',
      label: 'País de origen',
      placeholder: 'Ej: Alemania'
    },
    {
      name: 'website',
      label: 'Sitio web',
      type: 'url',
      placeholder: 'https://www.ejemplo.com'
    },
    {
      name: 'contact_info',
      label: 'Información de contacto',
      placeholder: 'Teléfono, email, dirección, etc.'
    },
    {
      name: 'is_active',
      label: 'Activo',
      type: 'checkbox',
      defaultValue: true
    }
  ];
  
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Agregar Nueva Marca"
      fields={fields}
      submitLabel="Guardar Marca"
    />
  );
}

function CategoriaFormModal({ isOpen, onClose, onSave, categorias = [] }) {
  const fields = [
    {
      name: 'nombre',
      label: 'Nombre',
      required: true,
      placeholder: 'Ej: Equipos Médicos'
    },
    {
      name: 'code',
      label: 'Código',
      required: true,
      placeholder: 'Ej: EQM',
      helpText: 'Código de 3 letras para generar IDs de productos'
    },
    {
      name: 'parent',
      label: 'Categoría Padre',
      type: 'select',
      options: [
        { value: '', label: 'Ninguna (Categoría principal)' },
        ...categorias.map(cat => ({ value: cat.id, label: cat.nombre }))
      ],
      helpText: 'Categoría padre (si es una subcategoría)'
    },
    {
      name: 'is_active',
      label: 'Activo',
      type: 'checkbox',
      defaultValue: true
    }
  ];
  
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Agregar Nueva Categoría"
      fields={fields}
      submitLabel="Guardar Categoría"
    />
  );
}

function RatingSlider({ name, value, label, onSliderChange, getRatingColor }) {
  const handleManualChange = (e) => {
    onSliderChange(name, [Number(e.target.value)]);
  };

  // Calcular el porcentaje para el indicador visual
  const percentage = (value / 5) * 100;
  const colorClass = getRatingColor(value);
  const sliderColor = colorClass.includes('green') ? 'bg-green-500' : 
                      colorClass.includes('yellow') ? 'bg-yellow-500' : 
                      colorClass.includes('red') ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label} (0-5)
        </label>
        <span className={`text-sm font-bold ${colorClass}`}>{value}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          id={name}
          min="0"
          max="5"
          step="1"
          value={value}
          onChange={handleManualChange}
          className="w-full h-2 appearance-none rounded-lg bg-gray-200 cursor-pointer"
        />
        <div className="absolute top-0 left-0 h-2 rounded-lg transition-all" 
          style={{ width: `${percentage}%`, backgroundColor: 'currentColor' }}></div>
      </div>
    </div>
  );
}

function ProductForm({
  formData,
  setFormData,
  categorias,
  marcas,
  productosOfertados = [], // <-- Lista de productos ofertados
  unidades = [],           // <-- Lista de unidades (tabla pandora.unidades)
  selectedItem,            // Indica si estamos editando un producto existente
  handleInputChange,
  handleSwitchChange,
  handleRemoveSelectedImage,
  handleRemoveSelectedDocument,
  handleImageChange,
  handleDocumentChange,
  handleDocumentMetadataChange,
  handleSubmit,
  selectedImages,
  selectedDocuments,
  documentMetadata,
  getRatingColor,
  handleSliderChange,
  setActiveTab,
  handleProductoOfertadoChange, // <-- Handler para cambio de producto ofertado
}) {
  // ---------------------------------------------------------
  // 1) ESTADOS PARA LA BÚSQUEDA DE PRODUCTO Y MODALES
  // ---------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResultsTable, setShowResultsTable] = useState(false);
  const [isUnidadModalOpen, setIsUnidadModalOpen] = useState(false);
  const [isMarcaModalOpen, setIsMarcaModalOpen] = useState(false);
  const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
  const [procedencias, setProcedencias] = useState([]);
  
  // Funciones para abrir modales
  const handleAddUnidad = () => {
    setIsUnidadModalOpen(true);
  };
  
  const handleAddMarca = () => {
    setIsMarcaModalOpen(true);
  };
  
  const handleAddCategoria = () => {
    setIsCategoriaModalOpen(true);
  };
  
  // Funciones para guardar nuevos registros
  const handleSaveUnidad = async (nuevaUnidad) => {
    try {
      // Llamar al servicio para crear la unidad
      const savedUnidad = await unidadesService.create(nuevaUnidad);
      
      console.log("Nueva unidad creada:", savedUnidad);
      alert(`Unidad "${nuevaUnidad.nombre}" creada exitosamente`);
      
      // Seleccionar la nueva unidad en el formulario
      setFormData({
        ...formData,
        presentacion: savedUnidad.id
      });
      
      return savedUnidad;
    } catch (error) {
      console.error("Error al crear unidad:", error);
      throw error;
    }
  };
  
  const handleSaveMarca = async (nuevaMarca) => {
    try {
      // Llamar al servicio para crear la marca
      const savedMarca = await marcaService.create(nuevaMarca);
      
      console.log("Nueva marca creada:", savedMarca);
      alert(`Marca "${nuevaMarca.nombre}" creada exitosamente`);
      
      // Seleccionar la nueva marca en el formulario
      setFormData({
        ...formData,
        id_marca: savedMarca.id
      });
      
      return savedMarca;
    } catch (error) {
      console.error("Error al crear marca:", error);
      throw error;
    }
  };
  
  const handleSaveCategoria = async (nuevaCategoria) => {
    try {
      // Llamar al servicio para crear la categoría
      const savedCategoria = await categoriasService.create(nuevaCategoria);
      
      console.log("Nueva categoría creada:", savedCategoria);
      alert(`Categoría "${nuevaCategoria.nombre}" creada exitosamente`);
      
      // Seleccionar la nueva categoría en el formulario y generar código automáticamente
      setFormData({
        ...formData,
        id_categoria: savedCategoria.id
      });
      
      // Si existe la función para generar código basado en categoría, llamarla
      if (typeof handleInputChange === 'function') {
        // Simulamos un evento de cambio de categoría para generar el código
        const event = {
          target: {
            name: 'id_categoria',
            value: savedCategoria.id
          }
        };
        handleInputChange(event);
      }
      
      return savedCategoria;
    } catch (error) {
      console.error("Error al crear categoría:", error);
      throw error;
    }
  };

  // Función para buscar productos entre los productos ofertados disponibles
  const handleSearch = async () => {
    try {
      if (!searchQuery.trim()) {
        alert("Por favor ingrese un término de búsqueda");
        return Promise.resolve(false); // Retorna una promesa resuelta con false
      }
      
      console.log("Buscando productos con término:", searchQuery);
      setIsSearching(true);
      
      // Realizar búsqueda en el servidor en lugar de filtrar en memoria
      // Esto permite buscar en toda la tabla de la base de datos
      const response = await productosOfertadosService.search(searchQuery);
      const results = response.results || [];
      
      console.log(`Se encontraron ${results.length} productos que coinciden con "${searchQuery}"`);
      
      if (results.length === 0) {
        alert("No se encontraron productos con ese término de búsqueda");
        return Promise.resolve(false);
      }
      
      // Mostramos máximo 10 resultados
      setSearchResults(results.slice(0, 10));
      
      // Mostrar la tabla de resultados
      setShowResultsTable(true);
      
      return Promise.resolve(true); // Retorna una promesa resuelta con true
    } catch (error) {
      console.error('Error buscando productos ofertados:', error);
      alert("Error al buscar productos: " + (error.message || "Error desconocido"));
      return Promise.resolve(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Manejo de selección de producto 
  const handleSelectProduct = (selectedProduct) => {
    if (!selectedProduct) return;
    
    console.log("Producto seleccionado:", selectedProduct);
    
    // Actualizar el campo id_producto_ofertado que es lo que necesitamos
    // Esto activará el handleProductoOfertadoChange en la página principal
    const evt = {
      target: {
        value: selectedProduct.id
      }
    };
    
    // Llamamos directamente a la función de cambio de producto ofertado
    handleProductoOfertadoChange(evt);
    
    // Ocultar la tabla de resultados
    setShowResultsTable(false);
  };

  // ---------------------------------------------------------
  // 2) CARGAR DATOS NECESARIOS AL INICIALIZAR
  // ---------------------------------------------------------
  useState(() => {
    // Cargar procedencias al inicializar el componente
    const fetchProcedencias = async () => {
      try {
        const data = await procedenciaService.getAll();
        setProcedencias(data.results || []);
      } catch (error) {
        console.error("Error al cargar procedencias:", error);
      }
    };
    
    fetchProcedencias();
  }, []);

  // ---------------------------------------------------------
  // 3) ESTRUCTURA DEL FORMULARIO
  // ---------------------------------------------------------
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-6xl mx-auto">
      {/* Modales para agregar nuevos registros */}
      <UnidadFormModal 
        isOpen={isUnidadModalOpen} 
        onClose={() => setIsUnidadModalOpen(false)} 
        onSave={handleSaveUnidad} 
      />
      <MarcaFormModal 
        isOpen={isMarcaModalOpen} 
        onClose={() => setIsMarcaModalOpen(false)} 
        onSave={handleSaveMarca} 
      />
      <CategoriaFormModal 
        isOpen={isCategoriaModalOpen} 
        onClose={() => setIsCategoriaModalOpen(false)} 
        onSave={handleSaveCategoria}
        categorias={categorias}
      />
      
      {/* Encabezado */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedItem ? 'Editar Producto' : 'Crear Nuevo Producto'}
          </h2>
          <button
            onClick={() => setActiveTab('listado')}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Listado
          </button>
        </div>
      </div>
      
      {/* ================================================================
          PRIMERA PARTE: BÚSQUEDA DE PRODUCTO OFERTADO (Opcional)
          ================================================================ */}
      <div className="bg-blue-50 p-5 rounded-lg mb-8 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Referencia de Producto Ofertado (Opcional)
        </h3>
        
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por código o nombre:
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ingrese parte del nombre o código"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSearching}
          >
            {isSearching ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Buscando...
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </span>
            )}
          </button>
        </div>

        {/* TABLA DE RESULTADOS */}
        {showResultsTable && searchResults.length > 0 && (
          <div className="mt-4 relative">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Resultados encontrados ({searchResults.length}):
              </label>
              <button
                type="button"
                onClick={() => setShowResultsTable(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="max-h-60 overflow-y-auto overflow-x-hidden border border-gray-300 rounded-lg bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchResults.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectProduct(product)}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.code}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-500">
                        {product.nombre}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-500">
                        {categorias.find(c => c.id === product.id_categoria)?.nombre || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right text-sm">
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-900 font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProduct(product);
                          }}
                        >
                          Seleccionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <p className="text-xs text-gray-500 mt-1 italic">
              Haga clic en una fila para seleccionar el producto y autocompletar los campos correspondientes
            </p>
          </div>
        )}
      </div>

      {/* ================================================================
          SEGUNDA PARTE: INFORMACIÓN BASE
          ================================================================ */}
      <div className="bg-gray-50 p-5 rounded-lg mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Información Base
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Row 1: Código (col-span-1) + Categoría (col-span-1) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código <span className="text-red-500">*</span>
              {!selectedItem && (
                <span className="text-xs text-blue-600 ml-1">
                  (Generado automáticamente o al elegir categoría)
                </span>
              )}
            </label>
            <input
              type="text"
              name="code"
              className={`w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                !selectedItem ? 'bg-gray-100 text-gray-800 font-semibold' : ''
              }`}
              value={formData.code || ''}
              onChange={handleInputChange}
              readOnly={!selectedItem} 
              required
              placeholder={!selectedItem ? 'Se puede autocompletar...' : ''}
            />
          </div>

          <div>
            <label
              htmlFor="id_categoria"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Categoría <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="id_categoria"
                name="id_categoria"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none pr-10"
                value={formData.id_categoria}
                onChange={(e) => {
                  if (e.target.value === "nueva_categoria") {
                    handleAddCategoria();
                  } else {
                    handleInputChange(e);
                  }
                }}
                required
                style={{ backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e')", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
                <option value="nueva_categoria" className="font-semibold text-blue-600">
                  + Agregar nueva categoría...
                </option>
              </select>
            </div>
          </div>

          {/* Row 2: Nombre (ocupa col-span-2) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={formData.nombre}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Row 3: Marca (col-span-1) + Modelo (col-span-1) */}
          <div>
            <label
              htmlFor="id_marca"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Marca <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="id_marca"
                name="id_marca"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none pr-10"
                value={formData.id_marca}
                onChange={(e) => {
                  if (e.target.value === "nueva_marca") {
                    handleAddMarca();
                  } else {
                    handleInputChange(e);
                  }
                }}
                required
                style={{ backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e')", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
              >
                <option value="">Seleccione una marca</option>
                {marcas.map((marca) => (
                  <option key={marca.id} value={marca.id}>
                    {marca.nombre}
                  </option>
                ))}
                <option value="nueva_marca" className="font-semibold text-blue-600">
                  + Agregar nueva marca...
                </option>
              </select>
            </div>
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
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={formData.modelo}
              onChange={handleInputChange}
            />
          </div>

          {/* Row 4: Presentación (col-span-1) + Activo (col-span-1) */}
          <div>
            <label
              htmlFor="presentacion"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Presentación
            </label>
            <div className="relative">
              <select
                name="presentacion"
                id="presentacion"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none pr-10"
                value={formData.presentacion || ''}
                onChange={(e) => {
                  if (e.target.value === "nueva_unidad") {
                    // Modal o formulario para agregar nueva unidad
                    handleAddUnidad();
                  } else {
                    handleInputChange(e);
                  }
                }}
                style={{ backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e')", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
              >
                <option value="">Seleccione unidad</option>
                {unidades.map((uni) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.nombre}
                  </option>
                ))}
                <option value="nueva_unidad" className="font-semibold text-blue-600">
                  + Agregar nueva unidad...
                </option>
              </select>
            </div>
          </div>
          
          <div>
            <label
              htmlFor="procedencia"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Procedencia
            </label>
            <div className="relative">
              <select
                name="procedencia"
                id="procedencia"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none pr-10"
                value={formData.procedencia || ''}
                onChange={handleInputChange}
                style={{ backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e')", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
              >
                <option value="">Seleccione procedencia</option>
                {procedencias.map((proc) => (
                  <option key={proc.id} value={proc.id}>
                    {proc.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center mt-8 md:mt-0">
            <div className="relative inline-block w-12 mr-2 align-middle select-none">
              <input 
                type="checkbox" 
                id="is_active" 
                name="is_active"
                checked={formData.is_active} 
                onChange={(e) => handleSwitchChange(e.target.checked)}
                className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label 
                htmlFor="is_active" 
                className={`block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${formData.is_active ? 'bg-blue-100' : ''}`}>
              </label>
            </div>
            <label htmlFor="is_active" className="block text-sm text-gray-700">
              {formData.is_active ? 'Activo' : 'Inactivo'}
            </label>
          </div>

          {/* Row 5: Referencia (textarea de varias filas, col-span-2) */}
          <div className="md:col-span-2">
            <label
              htmlFor="referencia"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Referencia
            </label>
            <textarea
              name="referencia"
              id="referencia"
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={formData.referencia || ''}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      {/* ================================================================
          INFORMACIÓN DE PRECIOS
          ================================================================ */}
      <div className="bg-blue-50 p-5 rounded-lg mb-8 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Información de Precios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Costo Referencial
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                name="costo_referencial"
                className="w-full pl-7 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.costo_referencial}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio SIE Referencial
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                name="precio_sie_referencial"
                className="w-full pl-7 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.precio_sie_referencial}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio SIE Tipo B
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                name="precio_sie_tipob"
                className="w-full pl-7 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.precio_sie_tipob}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio Venta Privado
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                name="precio_venta_privado"
                className="w-full pl-7 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.precio_venta_privado}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
          CALIFICACIONES (SLIDERS)
          ================================================================ */}
      <div className="bg-gray-50 p-5 rounded-lg mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Calificaciones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RatingSlider
            name="tz_oferta"
            value={formData.tz_oferta}
            label="Oferta"
            onSliderChange={handleSliderChange}
            getRatingColor={getRatingColor}
          />
          <RatingSlider
            name="tz_demanda"
            value={formData.tz_demanda}
            label="Demanda"
            onSliderChange={handleSliderChange}
            getRatingColor={getRatingColor}
          />
          <RatingSlider
            name="tz_inflacion"
            value={formData.tz_inflacion}
            label="Inflación"
            onSliderChange={handleSliderChange}
            getRatingColor={getRatingColor}
          />
          <RatingSlider
            name="tz_calidad"
            value={formData.tz_calidad}
            label="Calidad"
            onSliderChange={handleSliderChange}
            getRatingColor={getRatingColor}
          />
          <RatingSlider
            name="tz_eficiencia"
            value={formData.tz_eficiencia}
            label="Eficiencia"
            onSliderChange={handleSliderChange}
            getRatingColor={getRatingColor}
          />
          <RatingSlider
            name="tz_referencial"
            value={formData.tz_referencial}
            label="Referencial"
            onSliderChange={handleSliderChange}
            getRatingColor={getRatingColor}
          />
        </div>
      </div>

      {/* ================================================================
          IMÁGENES
          ================================================================ */}
      <div className="bg-white p-5 rounded-lg mb-8 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Imágenes
        </h3>
        <div className="space-y-4">
          {/* Previsualización de imágenes seleccionadas */}
          {selectedImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden shadow-sm">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Vista previa ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSelectedImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label="Eliminar imagen"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Botón para seleccionar imágenes */}
          <div>
            <input
              type="file"
              id="image-upload"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => document.getElementById('image-upload').click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
              </svg>
              Agregar Imágenes
            </button>
            <span className="ml-2 text-sm text-gray-500">
              Puede seleccionar múltiples imágenes
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================
          DOCUMENTOS
          ================================================================ */}
      <div className="bg-white p-5 rounded-lg mb-8 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Documentos
        </h3>
        <div className="space-y-4">
          {/* Lista de documentos seleccionados */}
          {selectedDocuments.length > 0 && (
            <div className="space-y-4 mt-4">
              {selectedDocuments.map((doc, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 transition-colors">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-10 h-12 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-bold">{doc.name.split('.').pop().toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(doc.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedDocument(index)}
                      className="text-red-500 hover:text-red-700 transition-colors ml-2 flex-shrink-0 focus:outline-none"
                      aria-label="Eliminar documento"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Campos de metadatos para el documento */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={documentMetadata[index]?.title || ''}
                        onChange={(e) =>
                          handleDocumentMetadataChange(index, 'title', e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Título del documento"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Documento
                      </label>
                      <select
                        value={documentMetadata[index]?.type || 'otros'}
                        onChange={(e) =>
                          handleDocumentMetadataChange(index, 'type', e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none pr-10"
                        style={{ backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e')", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
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
                        onChange={(e) =>
                          handleDocumentMetadataChange(index, 'description', e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        rows="2"
                        placeholder="Breve descripción del documento"
                      ></textarea>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botón para seleccionar documentos */}
          <div>
            <input
              type="file"
              id="document-upload"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleDocumentChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => document.getElementById('document-upload').click()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Agregar Documentos
            </button>
            <span className="ml-2 text-sm text-gray-500">
              PDF, Word, Excel, etc.
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================
          BOTONES DE ACCIÓN
          ================================================================ */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          onClick={() => setActiveTab('listado')}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {selectedItem ? 'Actualizar Producto' : 'Crear Producto'}
        </button>
      </div>

      {/* ================================================================
          DEBUG (Opcional)
          ================================================================ */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
        <details>
          <summary className="cursor-pointer font-medium flex items-center">
            <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Datos del formulario (Debug)
          </summary>
          <pre className="mt-2 whitespace-pre-wrap overflow-x-auto bg-white p-3 rounded border border-gray-200 text-gray-700">
            {JSON.stringify(
              { ...formData, id_categoria_type: typeof formData.id_categoria },
              null,
              2
            )}
          </pre>
        </details>
      </div>
    </div>
  );
}

export default ProductForm;