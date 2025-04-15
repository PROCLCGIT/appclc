import React, { useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';

/**
 * Componente de panel de filtros
 * @param {Object} props
 * @param {Array} props.categories - Categorías disponibles
 * @param {string} props.selectedCategory - Categoría seleccionada
 * @param {Function} props.setSelectedCategory - Función para actualizar categoría
 * @param {string} props.sortBy - Campo por el que ordenar
 * @param {Function} props.setSortBy - Función para actualizar campo de ordenación
 * @param {string} props.sortOrder - Orden (asc/desc)
 * @param {Function} props.setSortOrder - Función para actualizar orden
 */
const FilterPanel = ({ 
  categories, 
  selectedCategory, 
  setSelectedCategory,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder
}) => {
  const [showPanel, setShowPanel] = useState(false);

  return (
    <div className="relative">
      <button 
        className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition"
        onClick={() => setShowPanel(!showPanel)}
      >
        <Filter size={18} />
        <span className="text-sm font-medium text-gray-700">Filtros</span>
        <ChevronDown size={18} />
      </button>
      
      {showPanel && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg border border-gray-200 p-4 z-20">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Categoría</h3>
          <div className="space-y-2 mb-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="category-all"
                name="category"
                checked={selectedCategory === 'all'}
                onChange={() => setSelectedCategory('all')}
                className="mr-2 text-indigo-600"
              />
              <label htmlFor="category-all" className="text-sm text-gray-700">Todas</label>
            </div>
            {categories.map((category) => (
              <div key={category.id} className="flex items-center">
                <input
                  type="radio"
                  id={`category-${category.id}`}
                  name="category"
                  checked={selectedCategory === category.id.toString()}
                  onChange={() => setSelectedCategory(category.id.toString())}
                  className="mr-2 text-indigo-600"
                />
                <label htmlFor={`category-${category.id}`} className="text-sm text-gray-700">
                  {category.name} <span className="text-xs text-gray-500">({category.count})</span>
                </label>
              </div>
            ))}
          </div>
          
          <h3 className="text-base font-semibold text-gray-800 mb-3">Ordenar por</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="updated_at">Última modificación</option>
            <option value="created_at">Fecha de creación</option>
            <option value="title">Título</option>
            <option value="file_size">Tamaño</option>
          </select>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="order-desc"
                name="order"
                checked={sortOrder === 'desc'}
                onChange={() => setSortOrder('desc')}
                className="mr-2 text-indigo-600"
              />
              <label htmlFor="order-desc" className="text-sm text-gray-700">Descendente</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="order-asc"
                name="order"
                checked={sortOrder === 'asc'}
                onChange={() => setSortOrder('asc')}
                className="mr-2 text-indigo-600"
              />
              <label htmlFor="order-asc" className="text-sm text-gray-700">Ascendente</label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;