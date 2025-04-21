// src/pages/proformas/DashboardProformasWithQuery.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronDownIcon, FileIcon, PlusIcon, RefreshCw } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import format from 'date-fns/format';
import { es } from 'date-fns/locale';
import { addMonths, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import ProformasDashboardTable from './components/ProformasDashboardTable';
import { useProformaDashboardQuery } from '@/hooks/queries/useProformasQuery';
import { cn } from '@/lib/utils';
import useDelayedFlag from '@/hooks/useDelayedFlag';
import { SkeletonDashboard } from '@/components/SkeletonList';
import { proformasService } from '@/services/api';

// Colores para los gráficos
const CHART_COLORS = {
  aprobada: '#10b981', // Verde
  enviada: '#3b82f6', // Azul
  borrador: '#6b7280', // Gris
  rechazada: '#ef4444', // Rojo
  vencida: '#f59e0b', // Naranja
  convertida: '#8b5cf6' // Púrpura
};

// Estados de proforma para los filtros
const ESTADOS_PROFORMA = [
  { value: 'borrador', label: 'Borrador', color: CHART_COLORS.borrador },
  { value: 'enviada', label: 'Enviada', color: CHART_COLORS.enviada },
  { value: 'aprobada', label: 'Aprobada', color: CHART_COLORS.aprobada },
  { value: 'rechazada', label: 'Rechazada', color: CHART_COLORS.rechazada },
  { value: 'vencida', label: 'Vencida', color: CHART_COLORS.vencida },
  { value: 'convertida', label: 'Convertida', color: CHART_COLORS.convertida }
];

// Componente para seleccionar rango de fechas
const DateRangeSelector = ({ dateRange, setDateRange }) => {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  // Presets de rangos de fechas
  const handlePresetClick = (preset) => {
    const now = new Date();
    
    switch (preset) {
      case 'este-mes':
        setDateRange({
          startDate: startOfMonth(now),
          endDate: endOfMonth(now)
        });
        break;
      case 'mes-anterior':
        const lastMonth = subMonths(now, 1);
        setDateRange({
          startDate: startOfMonth(lastMonth),
          endDate: endOfMonth(lastMonth)
        });
        break;
      case 'ultimos-3-meses':
        setDateRange({
          startDate: startOfMonth(subMonths(now, 2)),
          endDate: endOfMonth(now)
        });
        break;
      case 'ultimos-6-meses':
        setDateRange({
          startDate: startOfMonth(subMonths(now, 5)),
          endDate: endOfMonth(now)
        });
        break;
      case 'todo':
        setDateRange({
          startDate: null,
          endDate: null
        });
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-wrap items-center space-x-4 mb-4">
      <span className="text-sm font-medium">Período:</span>
      
      {/* Selector de Fecha Inicio */}
      <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-9 px-4"
          >
            {dateRange.startDate ? (
              format(dateRange.startDate, 'dd/MM/yyyy')
            ) : (
              <span>Fecha inicial</span>
            )}
            <CalendarIcon className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateRange.startDate}
            onSelect={(date) => {
              setDateRange(prev => ({ ...prev, startDate: date }));
              // Use a timeout to prevent state update from causing rerenders
              setTimeout(() => setIsStartOpen(false), 0);
            }}
            initialFocus
            locale={es}
          />
        </PopoverContent>
      </Popover>
      
      <span>a</span>
      
      {/* Selector de Fecha Fin */}
      <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-9 px-4"
          >
            {dateRange.endDate ? (
              format(dateRange.endDate, 'dd/MM/yyyy')
            ) : (
              <span>Fecha final</span>
            )}
            <CalendarIcon className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateRange.endDate}
            onSelect={(date) => {
              setDateRange(prev => ({ ...prev, endDate: date }));
              // Use a timeout to prevent state update from causing rerenders
              setTimeout(() => setIsEndOpen(false), 0);
            }}
            fromDate={dateRange.startDate || undefined}
            initialFocus
            locale={es}
          />
        </PopoverContent>
      </Popover>
      
      {/* Presets de rangos */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-9">
            Presets
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56">
          <div className="flex flex-col space-y-1">
            <Button 
              variant="ghost"
              className="justify-start text-left"
              onClick={() => handlePresetClick('este-mes')}
            >
              Este mes
            </Button>
            <Button 
              variant="ghost"
              className="justify-start text-left"
              onClick={() => handlePresetClick('mes-anterior')}
            >
              Mes anterior
            </Button>
            <Button 
              variant="ghost"
              className="justify-start text-left"
              onClick={() => handlePresetClick('ultimos-3-meses')}
            >
              Últimos 3 meses
            </Button>
            <Button 
              variant="ghost"
              className="justify-start text-left"
              onClick={() => handlePresetClick('ultimos-6-meses')}
            >
              Últimos 6 meses
            </Button>
            <Button 
              variant="ghost"
              className="justify-start text-left"
              onClick={() => handlePresetClick('todo')}
            >
              Todo el tiempo
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// Componente principal del Dashboard
const DashboardProformasWithQuery = () => {
  // Estado para el rango de fechas
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  });
  
  // Estado para filtros de estados
  const [estadosFiltrados, setEstadosFiltrados] = useState(ESTADOS_PROFORMA.map(e => e.value));
  
  // Query para obtener datos del dashboard
  const {
    data: dashboardData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch
  } = useProformaDashboardQuery({
    startDate: dateRange.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : undefined,
    endDate: dateRange.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : undefined
  });
  
  // Usar el hook de delayed flag para evitar el flash de loading
  const showSkeletons = useDelayedFlag(isLoading || isFetching, 300);
  
  // Manejar toggle de estados en filtro
  const toggleEstadoFiltro = (estado) => {
    setEstadosFiltrados(prev => {
      if (prev.includes(estado)) {
        return prev.filter(e => e !== estado);
      } else {
        return [...prev, estado];
      }
    });
  };
  
  // Memoizar datos para evitar recálculos innecesarios en cada render
  const datosPorEstado = useMemo(() => {
    if (!dashboardData || !dashboardData.por_estado) return [];

    console.log('Calculando datosPorEstado memoizado');
    
    return Object.entries(dashboardData.por_estado)
      .filter(([estado]) => estadosFiltrados.includes(estado))
      .map(([estado, info]) => ({
        estado: info.label,
        estadoKey: estado,
        cantidad: info.count,
        monto: parseFloat(info.total) || 0,
        color: CHART_COLORS[estado] || '#6b7280'
      }));
  }, [dashboardData, estadosFiltrados]);
  
  // Memoizar datos de mes para evitar recálculos innecesarios
  const datosPorMes = useMemo(() => {
    if (!dashboardData || !dashboardData.por_mes) return [];
    
    console.log('Calculando datosPorMes memoizado');
    
    return dashboardData.por_mes.map(item => ({
      mes: item.mes,
      cantidad: item.count,
      monto: parseFloat(item.total) || 0
    }));
  }, [dashboardData]);
  
  // Las funciones prepararDatos* han sido reemplazadas por valores memoizados
  
  // Formatear montos como moneda
  const formatMonto = (valor) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(valor);
  };
  
  // Custom tooltip para gráficos
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color || '#333' }}>
              {entry.name}: {entry.name === 'Monto' ? formatMonto(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Proformas</h1>
          <p className="text-muted-foreground">Análisis y métricas de proformas</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", {
              "animate-spin": isFetching
            })} />
            Actualizar
          </Button>
          <Link to="/enhancedproforma?new=true">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nueva Proforma
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Selector de rango de fechas */}
      <DateRangeSelector dateRange={dateRange} setDateRange={setDateRange} />
      
      {showSkeletons ? (
        <SkeletonDashboard />
      ) : isError ? (
        // Mostrar error si la consulta falló
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error al cargar datos del dashboard</h3>
          <p className="text-red-600 mb-4">{error?.message || "Se produjo un error al obtener las estadísticas."}</p>
          <Button onClick={() => refetch()} variant="outline" className="bg-white">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      ) : (
        <>
          {/* Tarjetas de métricas principales */}
          {dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Proformas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {dashboardData.totalStats?.totalProformas || dashboardData.total_proformas || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    En el período seleccionado
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Proformas Aprobadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {dashboardData.totalStats?.proformasAprobadas || dashboardData.por_estado?.aprobada?.count || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tasa de aprobación: {dashboardData.totalStats?.tasaConversion || 
                    (dashboardData.total_proformas && dashboardData.por_estado?.aprobada ? 
                     Math.round((dashboardData.por_estado.aprobada.count / dashboardData.total_proformas) * 100) : 0)}%
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monto Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {formatMonto(dashboardData.totalStats?.montoTotal || dashboardData.total_monto || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Valor total de proformas
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Promedio por Proforma
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {formatMonto(
                      (dashboardData.totalStats?.totalProformas || dashboardData.total_proformas) > 0 
                        ? ((dashboardData.totalStats?.montoTotal || dashboardData.total_monto) / 
                           (dashboardData.totalStats?.totalProformas || dashboardData.total_proformas)) 
                        : 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Valor promedio
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Filtros de estado para gráficos */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm font-medium mr-2 self-center">Filtrar por estado:</span>
            {ESTADOS_PROFORMA.map(estado => (
              <Button
                key={estado.value}
                variant={estadosFiltrados.includes(estado.value) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleEstadoFiltro(estado.value)}
                style={{
                  backgroundColor: estadosFiltrados.includes(estado.value) ? estado.color : undefined,
                  borderColor: !estadosFiltrados.includes(estado.value) ? estado.color : undefined,
                  color: estadosFiltrados.includes(estado.value) ? 'white' : estado.color
                }}
              >
                {estado.label}
              </Button>
            ))}
          </div>
          
          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico por estado */}
            <Card>
              <CardHeader>
                <CardTitle>Proformas por Estado</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isError ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-red-500">Error al cargar los datos</p>
                  </div>
                ) : datosPorEstado.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p>No hay datos disponibles</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={datosPorEstado}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="cantidad"
                        nameKey="estado"
                        label={({ estado, percent }) => `${estado} ${(percent * 100).toFixed(0)}%`}
                      >
                        {datosPorEstado.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            {/* Gráfico de montos por estado */}
            <Card>
              <CardHeader>
                <CardTitle>Montos por Estado</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isError ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-red-500">Error al cargar los datos</p>
                  </div>
                ) : datosPorEstado.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p>No hay datos disponibles</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={datosPorEstado}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="estado" />
                      <YAxis 
                        tickFormatter={(value) => `${value.toLocaleString()}`} 
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="monto" 
                        name="Monto" 
                        radius={[4, 4, 0, 0]}
                      >
                        {datosPorEstado.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Gráfico por mes */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Tendencia de Proformas por Mes</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {isError ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-red-500">Error al cargar los datos</p>
                </div>
              ) : datosPorMes.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p>No hay datos disponibles</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosPorMes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="mes" 
                      tickFormatter={(value) => {
                        const [year, month] = value.split('-');
                        return `${month}/${year.slice(2)}`;
                      }}
                    />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tickFormatter={(value) => `${value.toLocaleString()}`} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="cantidad" 
                      name="Cantidad" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      yAxisId="right"
                      dataKey="monto" 
                      name="Monto" 
                      fill="#10b981" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          {/* Tabla de Proformas Recientes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Proformas Recientes</CardTitle>
              {!isLoading && dashboardData && (
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className={cn("h-4 w-4 mr-2", {
                    "animate-spin": isFetching
                  })} />
                  Actualizar
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isError ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <XCircle className="mx-auto h-12 w-12 text-red-400" />
                    <h3 className="mt-2 text-sm font-semibold text-red-600">Error al cargar los datos</h3>
                    <p className="mt-1 text-sm text-red-500">{error?.message || "No se pudieron obtener las proformas recientes"}</p>
                    <div className="mt-6">
                      <Button variant="outline" onClick={() => refetch()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reintentar
                      </Button>
                    </div>
                  </div>
                </div>
              ) : dashboardData?.proformasRecientes?.length === 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay proformas</h3>
                    <p className="mt-1 text-sm text-gray-500">Crea una nueva proforma para comenzar</p>
                    <div className="mt-6">
                      <Link to="/enhancedproforma?new=true">
                        <Button>
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Nueva Proforma
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <ProformasDashboardTable 
                  proformas={dashboardData?.proformasRecientes || []} 
                  loading={isFetching}
                  onRefresh={() => refetch()}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DashboardProformasWithQuery;
