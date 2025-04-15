import React from 'react';
import { Grid, List } from 'lucide-react';

/**
 * Componente de toggle para cambiar entre vista de grid y lista
 * @param {Object} props
 * @param {string} props.viewMode - Modo de vista actual ('grid' o 'list')
 * @param {Function} props.setViewMode - Función para cambiar el modo de vista
 */
const ViewToggle = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        className={`p-2 rounded-md transition ${
          viewMode === 'grid' ? 'bg-white shadow-md' : ''
        }`}
        onClick={() => setViewMode('grid')}
      >
        <Grid size={18} />
      </button>
      <button
        className={`p-2 rounded-md transition ${
          viewMode === 'list' ? 'bg-white shadow-md' : ''
        }`}
        onClick={() => setViewMode('list')}
      >
        <List size={18} />
      </button>
    </div>
  );
};

export default ViewToggle;