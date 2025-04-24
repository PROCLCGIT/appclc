// src/pages/proformas/components/dashboard/ErrorMessage.jsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

/**
 * Componente para mostrar mensajes de error en el dashboard
 */
const ErrorMessage = ({ error, refetch }) => {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg mb-6">
      <h3 className="text-lg font-semibold text-red-700 mb-2">Error al cargar datos del dashboard</h3>
      <p className="text-red-600 mb-4">{error?.message || "Se produjo un error al obtener las estadísticas."}</p>
      <Button onClick={() => refetch()} variant="outline" className="bg-white">
        <RefreshCw className="h-4 w-4 mr-2" />
        Reintentar
      </Button>
    </div>
  );
};

export default ErrorMessage;