// src/pages/proformas/DashboardProformas.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';
import useDelayedFlag from '@/hooks/useDelayedFlag';
import { SkeletonDashboard } from '@/components/SkeletonList';

// Contextos y providers
import { ThemeProvider } from '@/contexts/ThemeContext';

// Hook centralizado para datos del dashboard
import { useDashboardData } from './hooks/useDashboardData';

// Componentes de dashboard
import DashboardHeader from './components/dashboard/DashboardHeader';
import DateRangeSelector from './components/dashboard/DateRangeSelector';
import SummaryCards from './components/dashboard/SummaryCards';
import StatusFilter from './components/dashboard/StatusFilter';
import StatusChart from './components/dashboard/StatusChart';
import AmountChart from './components/dashboard/AmountChart';
import MonthlyTrendChart from './components/dashboard/MonthlyTrendChart';
import RecentQuotesCard from './components/dashboard/RecentQuotesCard';
import ErrorMessage from './components/dashboard/ErrorMessage';

/**
 * Dashboard de Proformas principal con análisis y métricas
 * Implementa accesibilidad, validación, responsividad y soporte para temas
 * Optimizado con useMemo, useCallback y React.memo para evitar renderizaciones innecesarias
 */
const DashboardProformas = () => {
  // Estado para el rango de fechas - inicializar con useMemo para evitar cálculos repetidos
  const [dateRange, setDateRange] = useState(() => ({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  }));
  
  // Estado para filtros de estados - Inicializado solo con estados activos
  const [estadosFiltrados, setEstadosFiltrados] = useState([
    'enviada', 'aprobada', 'borrador' // Estados activos más relevantes primero
  ]);
  
  // Estado para validación del formulario de fechas
  const [isDateRangeValid, setIsDateRangeValid] = useState(true);
  const [dateRangeError, setDateRangeError] = useState(null);
  
  // Callback para manejar la validación de fechas
  const handleDateRangeValidation = useCallback((isValid, errorMessage = null) => {
    setIsDateRangeValid(isValid);
    setDateRangeError(errorMessage);
  }, []);
  
  // Opciones para el hook useDashboardData - memoizado para evitar recreación
  const dashboardOptions = useMemo(() => ({
    enabled: isDateRangeValid // Solo hacer la petición si el rango de fechas es válido
  }), [isDateRangeValid]);
  
  // Hook centralizado para obtener y procesar datos del dashboard
  const {
    dashboardData,
    isLoading,
    isFetching,
    isError,
    error,
    refreshData,
    estadosChartData,
    mesChartData,
    summaryData,
    recentProformas
  } = useDashboardData(dateRange, estadosFiltrados, dashboardOptions);
  
  // Usar el hook de delayed flag para evitar el flash de loading
  const showSkeletons = useDelayedFlag(isLoading || isFetching, 300);
  
  // Flag de carga memoizado para evitar cálculos repetidos
  const isContentLoading = useMemo(() => 
    isLoading || !isDateRangeValid, 
    [isLoading, isDateRangeValid]
  );
  
  // Manejar toggle de estados en filtro (con useCallback)
  const toggleEstadoFiltro = useCallback((estado) => {
    setEstadosFiltrados(prev => {
      if (prev.includes(estado)) {
        return prev.filter(e => e !== estado);
      } else {
        return [...prev, estado];
      }
    });
  }, []);

  // Memoizar el contenido de los gráficos para evitar recreación innecesaria
  const chartGrid = useMemo(() => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <StatusChart 
        data={estadosChartData} 
        isError={isError} 
        isLoading={isContentLoading}
        className="w-full"
      />
      <AmountChart 
        data={estadosChartData} 
        isError={isError} 
        isLoading={isContentLoading}
        className="w-full"
      />
    </div>
  ), [estadosChartData, isError, isContentLoading]);
  
  // Memoizar el contenido principal del dashboard cuando hay datos
  const mainContent = useMemo(() => {
    if (showSkeletons) {
      return <SkeletonDashboard />;
    }
    
    if (isError) {
      return <ErrorMessage error={error} refetch={refreshData} />;
    }
    
    return (
      <>
        {/* Tarjetas de métricas principales */}
        <SummaryCards 
          dashboardData={dashboardData} 
          summaryData={summaryData} 
          isLoading={isContentLoading}
        />
        
        {/* Filtros de estado para gráficos */}
        <StatusFilter 
          estadosFiltrados={estadosFiltrados} 
          toggleEstadoFiltro={toggleEstadoFiltro} 
          className="flex-wrap"
        />
        
        {/* Gráficos de estados y montos - memoizados */}
        {chartGrid}
        
        {/* Gráfico de tendencia mensual */}
        <MonthlyTrendChart 
          data={mesChartData} 
          isError={isError} 
          isLoading={isContentLoading}
          className="w-full"
        />
        
        {/* Tabla de proformas recientes */}
        <RecentQuotesCard 
          dashboardData={dashboardData}
          recentProformas={recentProformas}
          isError={isError}
          error={error}
          isFetching={isFetching}
          isLoading={isContentLoading}
          refetch={refreshData}
        />
      </>
    );
  }, [
    showSkeletons, isError, error, refreshData, 
    dashboardData, summaryData, isContentLoading, 
    estadosFiltrados, toggleEstadoFiltro, chartGrid, 
    mesChartData, recentProformas, isFetching
  ]);

  // Memoizar el contenido completo del dashboard
  const dashboardContent = useMemo(() => (
    // Usar clase container de Tailwind para responsividad
    <main className="container mx-auto px-4 py-6">
      {/* Cabecera del dashboard */}
      <DashboardHeader 
        isLoading={isLoading} 
        isFetching={isFetching} 
        refetch={refreshData}
        dateRange={dateRange}
        statusFilters={estadosFiltrados}
      />
      
      {/* Selector de rango de fechas con validación */}
      <DateRangeSelector 
        dateRange={dateRange} 
        setDateRange={setDateRange} 
        onValidationChange={handleDateRangeValidation}
      />
      
      {/* Contenido principal memoizado */}
      {mainContent}
    </main>
  ), [
    isLoading, isFetching, refreshData, dateRange, estadosFiltrados,
    handleDateRangeValidation, setDateRange, mainContent
  ]);

  // Envolver el dashboard con ThemeProvider para soporte de tema claro/oscuro
  return (
    <ThemeProvider>
      {dashboardContent}
    </ThemeProvider>
  );
};

// Usar React.memo para evitar re-renders innecesarios del componente principal
export default React.memo(DashboardProformas);