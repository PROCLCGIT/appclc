import React from 'react';

/**
 * Componente de spinner de carga
 */
const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
    </div>
  );
};

export default LoadingSpinner;