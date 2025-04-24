// src/pages/proformas/hooks/useDashboardData.js
import { useMemo, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { useProformaDashboardQuery } from '@/hooks/queries/useProformasQuery';
import { ESTADO_COLORS } from '../utils/constants';

/**
 * Hook centralizado para gestionar datos del dashboard de proformas
 * 
 * Proporciona:
 * - Carga de datos mediante React Query
 * - Memorización de datos para gráficos
 * - Callbacks para filtros y selección de periodos
 * - Estados de carga y error
 * - Soporte para validación de formularios
 * 
 * @param {Object} dateRange - Rango de fechas ({startDate, endDate})
 * @param {Array} statusFilters - Estados seleccionados para filtro
 * @param {Object} options - Opciones de configuración adicionales
 * @param {boolean} options.enabled - Flag para habilitar/deshabilitar la consulta (útil para validación)
 * @returns {Object} Datos y funciones para el dashboard
 */
export function useDashboardData(dateRange, statusFilters, options = {}) {
  // Opciones por defecto
  const { enabled = true } = options;
  
  // Formato de fechas para la API
  const formattedStartDate = dateRange.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : undefined;
  const formattedEndDate = dateRange.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : undefined;
  
  // Query para obtener datos del dashboard con React Query
  const {
    data: dashboardData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch
  } = useProformaDashboardQuery({
    startDate: formattedStartDate,
    endDate: formattedEndDate
  }, {
    // Configuración adicional de la consulta
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false, // No recargar cuando el foco vuelve a la ventana
    refetchOnMount: true,      // Recargar cuando el componente se monta
    refetchOnReconnect: true,  // Recargar cuando se recupera la conexión
    retry: 3,                  // Número de reintentos si falla la consulta
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
    enabled: enabled          // Habilitar/deshabilitar la consulta basado en validaciones de formulario
  });
  
  // Recargar datos cuando cambia el rango de fechas (solo si enabled es true)
  useEffect(() => {
    if (enabled) {
      refetch();
    }
  }, [dateRange.startDate, dateRange.endDate, refetch, enabled]);
  
  // Preparar datos para el gráfico de estados - memoizado
  const estadosChartData = useMemo(() => {
    if (!dashboardData || !dashboardData.por_estado) return [];
    
    return Object.entries(dashboardData.por_estado)
      .filter(([estado]) => statusFilters.includes(estado))
      .map(([estado, info]) => ({
        estado: info.label,
        estadoKey: estado,
        cantidad: info.count,
        monto: parseFloat(info.total) || 0,
        color: ESTADO_COLORS[estado] || '#6b7280'
      }));
  }, [dashboardData, statusFilters]);
  
  // Preparar datos para el gráfico mensual - memoizado
  const mesChartData = useMemo(() => {
    if (!dashboardData || !dashboardData.por_mes) return [];
    
    return dashboardData.por_mes.map(item => ({
      mes: item.mes,
      cantidad: item.count,
      monto: parseFloat(item.total) || 0
    }));
  }, [dashboardData]);
  
  // Obtener datos de resumen para tarjetas - memoizado
  const summaryData = useMemo(() => {
    if (!dashboardData) return {
      totalProformas: 0,
      proformasAprobadas: 0,
      montoTotal: 0,
      promedioProforma: 0,
      tasaConversion: 0
    };
    
    const totalProformas = dashboardData.totalStats?.totalProformas || dashboardData.total_proformas || 0;
    const proformasAprobadas = dashboardData.totalStats?.proformasAprobadas || dashboardData.por_estado?.aprobada?.count || 0;
    const montoTotal = dashboardData.totalStats?.montoTotal || dashboardData.total_monto || 0;
    const tasaConversion = dashboardData.totalStats?.tasaConversion || 
      (totalProformas > 0 ? (proformasAprobadas / totalProformas) * 100 : 0);
    const promedioProforma = totalProformas > 0 ? montoTotal / totalProformas : 0;
    
    return {
      totalProformas,
      proformasAprobadas,
      montoTotal,
      promedioProforma,
      tasaConversion
    };
  }, [dashboardData]);
  
  // Callback para forzar una actualización de los datos
  const refreshData = useCallback(() => {
    if (enabled) {
      return refetch();
    }
    return Promise.resolve();
  }, [refetch, enabled]);
  
  // Memorizar proformas más recientes
  const recentProformas = useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.recientes || dashboardData.proformasRecientes || [];
  }, [dashboardData]);
  
  // Devolver los datos y funciones relevantes
  return {
    // Datos originales
    dashboardData,
    
    // Estado de la consulta
    isLoading,
    isFetching,
    isError,
    error,
    refreshData,
    
    // Datos procesados para componentes
    estadosChartData,
    mesChartData,
    summaryData,
    recentProformas
  };
}