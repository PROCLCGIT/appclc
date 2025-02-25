// src/pages/products/ProductForm.jsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { categoriasService, marcaService, procedenciaService, unidadesService } from '@/services/api';

const ProductForm = ({ 
  initialData = null,
  onSuccess = () => {},
  onCancel = () => {}
}) => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: '',
    brand: '',
    unit: '',
    origin: '',
    base_price: '',
    stock: '',
    min_stock: '',
    is_active: true
  });

  // Estados para manejo de UI
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Estados para datos maestros
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [origins, setOrigins] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [
          categoriesData,
          brandsData,
          unitsData,
          originsData
        ] = await Promise.all([
          categoriasService.getAll(),
          marcaService.getAll(),
          unidadesService.getAll(),
          procedenciaService.getAll()
        ]);

        setCategories(categoriesData);
        setBrands(brandsData);
        setUnits(unitsData);
        setOrigins(originsData);

        if (initialData) {
          setFormData({
            ...initialData,
            category: initialData.category?.id || '',
            brand: initialData.brand?.id || '',
            unit: initialData.unit?.id || '',
            origin: initialData.origin?.id || ''
          });
        }
      } catch (error) {
        setSubmitError('Error al cargar los datos maestros');
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    
    // Validaciones requeridas
    if (!formData.code?.trim()) newErrors.code = 'El código es requerido';
    if (!formData.name?.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.category) newErrors.category = 'La categoría es requerida';
    if (!formData.brand) newErrors.brand = 'La marca es requerida';
    if (!formData.unit) newErrors.unit = 'La unidad es requerida';
    if (!formData.origin) newErrors.origin = 'La procedencia es requerida';

    // Validaciones de números
    if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
      newErrors.base_price = 'El precio base debe ser mayor a 0';
    }
    if (formData.stock && parseInt(formData.stock) < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }
    if (formData.min_stock && parseInt(formData.min_stock) < 0) {
      newErrors.min_stock = 'El stock mínimo no puede ser negativo';
    }

    // Validación de formato de código
    if (formData.code?.trim()) {
      const codeRegex = /^[A-Za-z0-9-]+$/;
      if (!codeRegex.test(formData.code)) {
        newErrors.code = 'El código solo puede contener letras, números y guiones';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const dataToSubmit = {
        ...formData,
        base_price: parseFloat(formData.base_price),
        stock: formData.stock ? parseInt(formData.stock) : 0,
        min_stock: formData.min_stock ? parseInt(formData.min_stock) : 0
      };

      // Aquí iría la llamada al servicio para guardar
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
      onSuccess(dataToSubmit);
    } catch (error) {
      setSubmitError(error.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (loading && !formData.id) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow relative">
      {/* Botón para cerrar (opcional, usando el ícono X) */}
      <button
        type="button"
        onClick={onCancel}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
      >
        <X className="w-5 h-5" />
      </button>

      {submitError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección 1: Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Código *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.code ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
              placeholder="Código del producto"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
              placeholder="Nombre del producto"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="Descripción detallada del producto"
          />
        </div>

        {/* Sección 2: Clasificación */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Categoría *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.category ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
            >
              <option value="">Seleccione...</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Marca *
            </label>
            <select
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.brand ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
            >
              <option value="">Seleccione...</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            {errors.brand && (
              <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Unidad *
            </label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.unit ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
            >
              <option value="">Seleccione...</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
            {errors.unit && (
              <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Procedencia *
            </label>
            <select
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.origin ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
            >
              <option value="">Seleccione...</option>
              {origins.map(origin => (
                <option key={origin.id} value={origin.id}>
                  {origin.name}
                </option>
              ))}
            </select>
            {errors.origin && (
              <p className="mt-1 text-sm text-red-600">{errors.origin}</p>
            )}
          </div>
        </div>

        {/* Sección 3: Precios y Stock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Precio Base *
            </label>
            <input
              type="number"
              step="0.01"
              name="base_price"
              value={formData.base_price}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.base_price ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
              placeholder="0.00"
            />
            {errors.base_price && (
              <p className="mt-1 text-sm text-red-600">{errors.base_price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Stock Actual
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.stock ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
              placeholder="0"
            />
            {errors.stock && (
              <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Stock Mínimo
            </label>
            <input
              type="number"
              name="min_stock"
              value={formData.min_stock}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.min_stock ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
              placeholder="0"
            />
            {errors.min_stock && (
              <p className="mt-1 text-sm text-red-600">{errors.min_stock}</p>
            )}
          </div>
        </div>

        {/* Estado (Activo/Inactivo) */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            id="is_active"
          />
          <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
            Activo
          </label>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
