// src/pages/products/ProductCreate.jsx
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductForm from './ProductForm';

const ProductCreate = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver a Productos
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Producto</h1>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <ProductForm 
          onSuccess={() => {
            // Redirigir a la lista después de guardar exitosamente
            navigate('/products');
          }}
          onCancel={() => {
            // Volver a la lista al cancelar
            navigate('/products');
          }}
        />
      </div>
    </div>
  );
};

export default ProductCreate;