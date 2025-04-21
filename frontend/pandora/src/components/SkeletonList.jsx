import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Componente para mostrar una lista de skeletons durante la carga
 * @param {Object} props - Propiedades del componente
 * @param {number} props.rows - Número de filas de skeleton a mostrar
 * @param {string} props.className - Clases adicionales para el contenedor
 * @param {string} props.rowClassName - Clases adicionales para cada fila
 * @param {string} props.rowHeight - Altura de cada fila (por defecto: 'h-12')
 * @returns {JSX.Element} - Componente SkeletonList
 */
export default function SkeletonList({ 
  rows = 5, 
  className = "", 
  rowClassName = "",
  rowHeight = "h-12"
}) {
  return (
    <div className={`space-y-3 w-full ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton
          key={i}
          className={`${rowHeight} w-full ${rowClassName}`}
        />
      ))}
    </div>
  );
}

/**
 * Componente para mostrar un skeleton de una tabla durante la carga
 * @param {Object} props - Propiedades del componente
 * @param {number} props.rows - Número de filas a mostrar
 * @param {number} props.columns - Número de columnas a mostrar
 * @param {boolean} props.showHeader - Si debe mostrar header de tabla
 * @returns {JSX.Element} - Componente SkeletonTable
 */
export function SkeletonTable({ 
  rows = 5, 
  columns = 4, 
  showHeader = true 
}) {
  return (
    <div className="w-full overflow-hidden rounded-lg border">
      {showHeader && (
        <div className="bg-gray-50 px-4 py-3.5 border-b">
          <Skeleton className="h-6 w-32" />
        </div>
      )}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center px-4 py-3">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className={`flex-1 px-2 ${colIndex === 0 ? 'flex-0.5' : ''}`}>
                <Skeleton 
                  className={`h-5 ${colIndex === 0 ? 'w-6' : colIndex === 1 ? 'w-3/4' : 'w-full'}`} 
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Componente para mostrar un skeleton de una tarjeta de proforma
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} - Componente SkeletonProforma
 */
export function SkeletonProforma() {
  return (
    <div className="border rounded-lg p-6 space-y-6">
      {/* Header con información del cliente */}
      <div className="flex justify-between">
        <div className="space-y-2 w-1/2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="space-y-2 w-1/3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
      
      {/* Tabla de items */}
      <div className="mt-8">
        <div className="bg-gray-50 py-2 grid grid-cols-12 gap-2 rounded-t-lg border border-b-0">
          <Skeleton className="h-5 w-10 col-span-1 mx-auto" />
          <Skeleton className="h-5 w-24 col-span-5 mx-2" />
          <Skeleton className="h-5 w-16 col-span-2 mx-auto" />
          <Skeleton className="h-5 w-16 col-span-2 mx-auto" />
          <Skeleton className="h-5 w-16 col-span-2 mx-auto" />
        </div>
        
        <div className="border border-t-0 rounded-b-lg">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 py-3 px-2 border-b last:border-b-0">
              <Skeleton className="h-5 w-5 col-span-1 mx-auto" />
              <Skeleton className="h-5 w-full col-span-5" />
              <Skeleton className="h-5 w-14 col-span-2 mx-auto" />
              <Skeleton className="h-5 w-16 col-span-2 mx-auto" />
              <Skeleton className="h-5 w-16 col-span-2 mx-auto" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer con totales */}
      <div className="flex justify-end mt-6">
        <div className="w-72 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex justify-between mt-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente para mostrar un skeleton del dashboard de proformas
 * @returns {JSX.Element} - Componente SkeletonDashboard
 */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Cards con métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mt-2" />
            <Skeleton className="h-3 w-32 mt-2" />
          </div>
        ))}
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="border rounded-lg p-4">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
      
      {/* Tabla de proformas recientes */}
      <div className="border rounded-lg p-4">
        <Skeleton className="h-6 w-48 mb-4" />
        <SkeletonTable rows={5} columns={5} />
      </div>
    </div>
  );
}
