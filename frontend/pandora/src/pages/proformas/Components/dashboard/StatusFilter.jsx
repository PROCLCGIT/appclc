// src/pages/proformas/components/dashboard/StatusFilter.jsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { ESTADO_COLORS, ESTADOS_PROFORMA } from '../../utils/constants';

/**
 * Componente para filtrar por estado de proforma
 * Incluye soporte para accesibilidad y usa constantes globales
 */
const StatusFilter = ({ estadosFiltrados, toggleEstadoFiltro, className = "" }) => {
  return (
    <div 
      className={`flex flex-wrap gap-2 mb-4 ${className}`}
      role="group" 
      aria-labelledby="status-filter-label"
    >
      <span 
        id="status-filter-label" 
        className="text-sm font-medium mr-2 self-center"
      >
        Filtrar por estado:
      </span>
      {ESTADOS_PROFORMA.map(estado => {
        const isSelected = estadosFiltrados.includes(estado.value);
        return (
          <Button
            key={estado.value}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => toggleEstadoFiltro(estado.value)}
            style={{
              backgroundColor: isSelected ? estado.color : undefined,
              borderColor: !isSelected ? estado.color : undefined,
              color: isSelected ? 'white' : estado.color
            }}
            aria-pressed={isSelected}
            aria-label={`Filtrar por estado: ${estado.label} ${isSelected ? '(seleccionado)' : ''}`}
          >
            {estado.label}
          </Button>
        );
      })}
    </div>
  );
};

// Re-exportamos los colores para compatibilidad con componentes existentes
export { ESTADO_COLORS as CHART_COLORS };
export default StatusFilter;