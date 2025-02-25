// src/pages/proformas/NewProformaForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useProforma from '../../hooks/useProforma';

const NewProformaForm = () => {
  const navigate = useNavigate();

  // Hook personalizado para manejar la creación de proformas
  const { createProforma, loading, error } = useProforma();

  // Manejo de pasos
  const [currentStep, setCurrentStep] = useState(1);

  // Manejo de errores de validación
  const [errors, setErrors] = useState({});

  // ------- 1. Datos del cliente y condiciones comerciales -------

  const [searchClient, setSearchClient] = useState('');
  const [clientResults, setClientResults] = useState([]);

  // Estado principal de la proforma
  const [formData, setFormData] = useState({
    // Información del cliente
    client: null,
    
    // Información comercial
    payment_terms: '',
    delivery_time: '',
    valid_until: '',
    
    // Notas y términos
    notes: '',
    terms_conditions: '',
    
    // Items (segunda parte)
    items: []
  });

  // Función para buscar clientes (requiere al menos 3 caracteres)
  const searchClients = async (query) => {
    if (query.length < 3) {
      setClientResults([]);
      return;
    }
    try {
      const response = await fetch(`/api/v1/clientes/?search=${query}`);
      const data = await response.json();
      setClientResults(data.results || []);
    } catch (error) {
      console.error('Error buscando clientes:', error);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchClient) {
        searchClients(searchClient);
      }
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [searchClient]);

  const selectClient = (client) => {
    setFormData(prev => ({
      ...prev,
      client: client.id
    }));
    setSearchClient('');
    setClientResults([]);
  };

  // Validación de los campos del Paso 1
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.client) {
      newErrors.client = 'Debe seleccionar un cliente';
    }
    if (!formData.payment_terms) {
      newErrors.payment_terms = 'Debe especificar los términos de pago';
    }
    if (!formData.delivery_time) {
      newErrors.delivery_time = 'Debe especificar el tiempo de entrega';
    }
    if (!formData.valid_until) {
      newErrors.valid_until = 'Debe especificar la fecha de validez';
    } else {
      const validUntil = new Date(formData.valid_until);
      const today = new Date();
      if (validUntil <= today) {
        newErrors.valid_until = 'La fecha de validez debe ser posterior a hoy';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------- 2. Agregar productos (items) a la proforma --------

  const [searchProduct, setSearchProduct] = useState('');
  const [productResults, setProductResults] = useState([]);

  // Estado para manejar el producto que se está agregando actualmente
  const [currentItem, setCurrentItem] = useState({
    product: null,
    quantity: 1,
    unit_price: 0,
    discount_percentage: 0,
    description: ''
  });

  const searchProducts = async (query) => {
    if (query.length < 3) {
      setProductResults([]);
      return;
    }
    try {
      const response = await fetch(`/api/products/?search=${query}`);
      const data = await response.json();
      setProductResults(data.results || []);
    } catch (error) {
      console.error('Error buscando productos:', error);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchProduct) {
        searchProducts(searchProduct);
      }
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [searchProduct]);

  const selectProduct = (product) => {
    setCurrentItem(prev => ({
      ...prev,
      product: product.id,
      unit_price: product.base_price || 0,
      description: product.description || ''
    }));
    setSearchProduct('');
    setProductResults([]);
  };

  // Cálculos de totales para cada item
  const calculateItemTotal = (item) => {
    const subtotal = item.quantity * item.unit_price;
    const discount = subtotal * (item.discount_percentage / 100);
    return subtotal - discount;
  };

  // Cálculos de totales generales
  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const tax = subtotal * 0.18; // Ejemplo de IGV 18%
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  // Manejo de items
  const addItem = () => {
    // Validar producto seleccionado
    if (!currentItem.product) {
      setErrors({ ...errors, product: 'Debe seleccionar un producto' });
      return;
    }
    // Validar cantidad > 0
    if (currentItem.quantity <= 0) {
      setErrors({ ...errors, quantity: 'La cantidad debe ser mayor a 0' });
      return;
    }
    // Validar precio > 0
    if (currentItem.unit_price <= 0) {
      setErrors({ ...errors, unit_price: 'El precio debe ser mayor a 0' });
      return;
    }

    // Agregar al array de items
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...currentItem }]
    }));

    // Resetear el item actual
    setCurrentItem({
      product: null,
      quantity: 1,
      unit_price: 0,
      discount_percentage: 0,
      description: ''
    });
    setSearchProduct('');
    setProductResults([]);
    setErrors({});
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Validación del Paso 2
  const validateStep2 = () => {
    const newErrors = {};
    if (formData.items.length === 0) {
      newErrors.items = 'Debe agregar al menos un producto';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ------- Manejo de pasos y guardado final -------

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSave = async () => {
    if (!validateStep2()) {
      return;
    }
    try {
      const { subtotal, tax, total } = calculateTotals();
      const proformaData = {
        ...formData,
        subtotal,
        tax,
        total
      };
      await createProforma(proformaData);
      navigate('/proformas');
    } catch (error) {
      console.error('Error al guardar la proforma:', error);
    }
  };

  // ------- Renderizado de cada Paso -------

  // --- Paso 1: Información de Cliente y Comercial ---
  const renderClientSearch = () => (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Buscar cliente..."
          value={searchClient}
          onChange={(e) => setSearchClient(e.target.value)}
        />
        {clientResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {clientResults.map(client => (
              <div
                key={client.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => selectClient(client)}
              >
                <div className="font-medium">{client.nombre}</div>
                <div className="text-sm text-gray-600">{client.ruc}</div>
              </div>
            ))}
          </div>
        )}
        {errors.client && (
          <p className="mt-1 text-sm text-red-600">{errors.client}</p>
        )}
      </div>

      {/* Mostrar datos del cliente seleccionado */}
      {formData.client && clientResults.find(c => c.id === formData.client) && (
        <div className="p-4 bg-gray-50 rounded-md">
          <h4 className="font-medium mb-2">Cliente Seleccionado</h4>
          <div className="text-sm">
            <p>
              <span className="font-medium">Nombre:</span>{' '}
              {clientResults.find(c => c.id === formData.client).nombre}
            </p>
            <p>
              <span className="font-medium">RUC:</span>{' '}
              {clientResults.find(c => c.id === formData.client).ruc}
            </p>
            <p>
              <span className="font-medium">Dirección:</span>{' '}
              {clientResults.find(c => c.id === formData.client).direccion}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderCommercialInfo = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Términos de Pago
        </label>
        <input
          type="text"
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={formData.payment_terms}
          onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
          placeholder="Ej: 50% adelanto, 50% contra entrega"
        />
        {errors.payment_terms && (
          <p className="mt-1 text-sm text-red-600">{errors.payment_terms}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tiempo de Entrega
        </label>
        <input
          type="text"
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={formData.delivery_time}
          onChange={(e) => setFormData({...formData, delivery_time: e.target.value})}
          placeholder="Ej: 5 días hábiles"
        />
        {errors.delivery_time && (
          <p className="mt-1 text-sm text-red-600">{errors.delivery_time}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Válido Hasta
        </label>
        <input
          type="date"
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={formData.valid_until}
          onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
        />
        {errors.valid_until && (
          <p className="mt-1 text-sm text-red-600">{errors.valid_until}</p>
        )}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Información del Cliente</h3>
        {renderClientSearch()}
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Información Comercial</h3>
        {renderCommercialInfo()}
      </div>
    </div>
  );

  // --- Paso 2: Búsqueda de Productos y listado de items ---
  const renderProductSearch = () => (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Buscar producto..."
          value={searchProduct}
          onChange={(e) => setSearchProduct(e.target.value)}
        />
        {productResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {productResults.map(product => (
              <div
                key={product.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => selectProduct(product)}
              >
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-gray-600">
                  Código: {product.code} | Precio: ${product.base_price}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Si hay un producto seleccionado, mostramos los campos de cantidad, precio, etc. */}
      {currentItem.product && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                className="w-full p-2 border rounded-md"
                value={currentItem.quantity}
                onChange={(e) => setCurrentItem({
                  ...currentItem,
                  quantity: parseInt(e.target.value) || 0
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Unitario
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full p-2 border rounded-md"
                value={currentItem.unit_price}
                onChange={(e) => setCurrentItem({
                  ...currentItem,
                  unit_price: parseFloat(e.target.value) || 0
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descuento %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full p-2 border rounded-md"
                value={currentItem.discount_percentage}
                onChange={(e) => setCurrentItem({
                  ...currentItem,
                  discount_percentage: parseFloat(e.target.value) || 0
                })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              className="w-full p-2 border rounded-md"
              value={currentItem.description}
              onChange={(e) => setCurrentItem({
                ...currentItem,
                description: e.target.value
              })}
              rows={2}
            />
          </div>

          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              onClick={addItem}
            >
              Agregar Producto
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderItemsList = () => (
    <div className="mt-6">
      <h4 className="font-medium mb-4">Productos Agregados</h4>
      {formData.items.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          No hay productos agregados
        </p>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Producto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Precio Unit.
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Desc.
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {formData.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-right">
                    ${item.unit_price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.discount_percentage}%
                  </td>
                  <td className="px-6 py-4 text-right">
                    ${calculateItemTotal(item).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => removeItem(index)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formData.items.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-end">
            <span className="font-medium w-24">Subtotal:</span>
            <span className="w-24 text-right">
              ${calculateTotals().subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-end">
            <span className="font-medium w-24">IGV (18%):</span>
            <span className="w-24 text-right">
              ${calculateTotals().tax.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-end text-lg font-bold">
            <span className="w-24">Total:</span>
            <span className="w-24 text-right">
              ${calculateTotals().total.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Agregar Productos</h3>
        {renderProductSearch()}
      </div>

      {renderItemsList()}

      {errors.items && (
        <p className="mt-1 text-sm text-red-600">{errors.items}</p>
      )}
    </div>
  );

  // ------- Render principal del componente -------
  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Nueva Proforma</h2>
            <div className="text-sm text-gray-500">
              Paso {currentStep} de 2
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Renderizamos el paso 1 o 2 según el estado */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}

          {/* Botones de navegación y acción */}
          <div className="mt-6 flex justify-between">
            <button
              className={`px-4 py-2 rounded-md border ${
                currentStep === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Anterior
            </button>
            
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              onClick={currentStep === 2 ? handleSave : handleNext}
              disabled={loading}
            >
              {currentStep === 2 ? 'Guardar' : 'Siguiente'}
            </button>
          </div>

          {/* Mostrar error general si existe */}
          {error && (
            <p className="mt-4 text-red-600">
              Error: {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewProformaForm;
