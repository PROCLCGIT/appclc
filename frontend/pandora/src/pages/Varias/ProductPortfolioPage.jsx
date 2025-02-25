import React, { useState } from 'react';
import { Search, Filter, Plus, Minus } from 'lucide-react';

const ProductPortfolio = () => {
  // Estado para los productos y sus alternativas
  const [products, setProducts] = useState([
    {
      id: 1,
      category: "Monitores",
      specification: "Monitor 19 pulgadas",
      alternatives: [
        {
          brand: "Dell",
          model: "P1917S",
          specs: {
            resolution: "1280 x 1024",
            panel: "IPS",
            ports: "VGA, DisplayPort, HDMI",
            cports: "VGAf, DisplayPort, HDMI2",
            response: "5ms"
          },
          price: 199.99,
          stock: 15,
          rating: 4.5
        },
        {
          brand: "HP",
          model: "V194",
          specs: {
            resolution: "1366 x 768",
            panel: "TN",
            ports: "VGA, DVI",
            response: "5ms"
          },
          price: 159.99,
          stock: 8,
          rating: 4.2
        },
        {
          brand: "LG",
          model: "19M38A",
          specs: {
            resolution: "1366 x 768",
            panel: "TN",
            ports: "VGA",
            response: "5ms"
          },
          price: 149.99,
          stock: 12,
          rating: 4.0
        }
      ]
    }
  ]);

  // Estado para filtros
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 1000 },
    brands: [],
    inStock: false
  });

  // Estado para búsqueda
  const [searchQuery, setSearchQuery] = useState('');

  // Estado para mostrar/ocultar especificaciones
  const [expandedProducts, setExpandedProducts] = useState({});

  // Función para alternar la visualización de especificaciones
  const toggleExpand = (productId) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  return (
    <div className="p-4 space-y-4">
      {/* Barra de búsqueda y filtros */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full p-2 pl-10 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white">
          <Filter size={20} />
          Filtros
        </button>
      </div>

      {/* Lista de productos */}
      {products.map(product => (
        <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">{product.specification}</h2>
              <button
                onClick={() => toggleExpand(product.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                {expandedProducts[product.id] ? <Minus size={20} /> : <Plus size={20} />}
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {product.alternatives.map((alt, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">{alt.brand} {alt.model}</h3>
                      <p className="text-sm text-gray-500">Stock: {alt.stock} unidades</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">${alt.price}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Rating:</span>
                        <span className="text-sm font-medium">{alt.rating}/5</span>
                      </div>
                    </div>
                  </div>
                  
                  {expandedProducts[product.id] && (
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      {Object.entries(alt.specs).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-500 capitalize">{key}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Botón para agregar nuevo producto */}
      <button className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700">
        <Plus size={24} />
      </button>
    </div>
  );
};

export default ProductPortfolio;