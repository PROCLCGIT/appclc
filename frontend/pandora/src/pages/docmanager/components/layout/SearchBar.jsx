import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * Componente de barra de búsqueda
 * @param {Object} props
 * @param {string} props.searchQuery - Query de búsqueda actual
 * @param {Function} props.setSearchQuery - Función para actualizar la query
 */
const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="relative flex-1">
      <input
        type="text"
        placeholder="Buscar documentos..."
        className="w-full p-3 pl-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      {searchQuery && (
        <button 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={() => setSearchQuery('')}
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;