// src/pages/products/ProductWizard.jsx
import { useState } from 'react';

const ProductWizard = () => {
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
    margin: ''
  });

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
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
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Clasificación del Producto</h3>
            <div className="grid gap-4">
              <div>
                <input 
                  type="text"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Familia de Productos"
                  value={formData.family}
                  onChange={(e) => setFormData({...formData, family: e.target.value})}
                />
              </div>
              <div>
                <input 
                  type="text"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Categoría"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                />
              </div>
              <div>
                <input 
                  type="text"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Subcategoría"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
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
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Nuevo Producto</h2>
          <div className="text-sm text-gray-500">
            Paso {step} de 3
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between mt-6">
            <button
              className={`px-4 py-2 rounded-md border ${
                step === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Anterior
            </button>
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              onClick={() => {
                if (step < 3) {
                  setStep(step + 1);
                } else {
                  // Aquí iría la lógica de guardado
                  console.log('Guardar producto:', formData);
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

export default ProductWizard;