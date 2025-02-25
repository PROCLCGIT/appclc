// src/pages/proformas/ProformaForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProformaForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Información Básica
    code: '',
    name: '',
    description: '',
    
    // Clasificación
    family: '',
    category: '',
    subcategory: '',
    
    // Información Comercial
    basePrice: '',
    cost: '',
    margin: '',

    // Items de la proforma
    items: []
  });

  const [currentItem, setCurrentItem] = useState({
    product: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    description: ''
  });

  const handleAddItem = () => {
    if (!currentItem.product) {
      return; // Validación básica
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...currentItem }]
    }));

    // Limpiar el item actual
    setCurrentItem({
      product: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      description: ''
    });
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const discount = (itemTotal * item.discount) / 100;
      return total + (itemTotal - discount);
    }, 0);
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Información Básica del Producto</h3>
      <div className="grid gap-4">
        <div>
          <input 
            type="text"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Código del Producto"
            value={formData.code}
            onChange={(e) => setFormData({...formData, code: e.target.value})}
          />
        </div>
        <div>
          <input 
            type="text"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Nombre del Producto"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div>
          <textarea 
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Descripción"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Items de la Proforma</h3>
      
      {/* Formulario para agregar item */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-5 gap-4">
          <div>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              placeholder="Producto"
              value={currentItem.product}
              onChange={(e) => setCurrentItem({
                ...currentItem,
                product: e.target.value
              })}
            />
          </div>
          <div>
            <input
              type="number"
              className="w-full p-2 border rounded-md"
              placeholder="Cantidad"
              value={currentItem.quantity}
              onChange={(e) => setCurrentItem({
                ...currentItem,
                quantity: parseInt(e.target.value)
              })}
            />
          </div>
          <div>
            <input
              type="number"
              className="w-full p-2 border rounded-md"
              placeholder="Precio Unitario"
              value={currentItem.unitPrice}
              onChange={(e) => setCurrentItem({
                ...currentItem,
                unitPrice: parseFloat(e.target.value)
              })}
            />
          </div>
          <div>
            <input
              type="number"
              className="w-full p-2 border rounded-md"
              placeholder="Descuento %"
              value={currentItem.discount}
              onChange={(e) => setCurrentItem({
                ...currentItem,
                discount: parseFloat(e.target.value)
              })}
            />
          </div>
          <div>
            <button
              className="w-full p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              onClick={handleAddItem}
            >
              Agregar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de items */}
      <div className="border rounded-lg overflow-hidden">
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
                Descuento
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
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.product}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  S/ {item.unitPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {item.discount}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  S/ {((item.quantity * item.unitPrice) * (1 - item.discount/100)).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleRemoveItem(index)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>S/ {calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Información Comercial</h3>
      <div className="grid gap-4">
        <div>
          <input 
            type="number"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Precio Base"
            value={formData.basePrice}
            onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
          />
        </div>
        <div>
          <input 
            type="number"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Costo"
            value={formData.cost}
            onChange={(e) => setFormData({...formData, cost: e.target.value})}
          />
        </div>
        <div>
          <input 
            type="number"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Margen (%)"
            value={formData.margin}
            onChange={(e) => setFormData({...formData, margin: e.target.value})}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Nueva Proforma</h2>
            <div className="text-sm text-gray-500">
              Paso {step} de 3
            </div>
          </div>
        </div>

        <div className="p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          
          <div className="mt-6 flex justify-between">
            <button
              className={`px-4 py-2 rounded-md border ${
                step === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              disabled={step === 1}
            >
              Anterior
            </button>
            
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              onClick={() => {
                if (step < 3) {
                  setStep(prev => prev + 1);
                } else {
                  console.log('Guardar proforma:', formData);
                  // Aquí iría la lógica de guardado
                }
              }}
            >
              {step === 3 ? 'Guardar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProformaForm;