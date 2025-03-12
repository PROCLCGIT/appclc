// src/pages/PreciosSie/components/PreciosSieFilters.jsx
import { Search, Plus } from 'lucide-react';

function PreciosSieFilters({ searchTerm, setSearchTerm, onNew }) {
  return (
    <div className="flex items-center gap-4 w-full sm:w-auto">
      {/* Input de búsqueda */}
      <div className="relative flex-1 sm:flex-initial">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar precio SIE..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Botón “Nuevo” */}
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <Plus className="h-4 w-4" />
        Nuevo
      </button>
    </div>
  );
}

export default PreciosSieFilters;
