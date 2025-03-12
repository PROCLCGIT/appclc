import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

// Definición interna del componente Progress para evitar problemas de importación
const Progress = React.forwardRef(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-slate-100",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 bg-slate-900 transition-all",
        indicatorClassName
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = "Progress";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  Clock,
  Download,
  Eye,
  Filter,
  LineChart,
  MoreHorizontal,
  PieChart,
  Plus,
  RefreshCcw,
  Search,
  Share2,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

// Datos de ejemplo para las métricas de marketing
const marketingData = {
  performanceMetrics: [
    {
      id: 1,
      name: "Conversiones",
      value: 2845,
      change: "+12.3%",
      trend: "up",
      target: 3000,
      progress: 94.8,
      timeframe: "Este mes"
    },
    {
      id: 2,
      name: "Impresiones",
      value: 754320,
      change: "+5.7%",
      trend: "up",
      target: 800000,
      progress: 94.3,
      timeframe: "Este mes"
    },
    {
      id: 3,
      name: "CTR",
      value: "3.25%",
      change: "-0.8%",
      trend: "down",
      target: "3.5%",
      progress: 92.9,
      timeframe: "Este mes"
    },
    {
      id: 4,
      name: "CPA",
      value: "$28.45",
      change: "-4.2%",
      trend: "up", // Up is good for CPA going down
      target: "$30.00",
      progress: 95.2,
      timeframe: "Este mes"
    }
  ],
  campaigns: [
    {
      id: 1,
      name: "Campaña de Black Friday",
      status: "active",
      platform: "Meta",
      impressions: 243500,
      clicks: 12345,
      conversions: 987,
      spend: 4325.65,
      ctr: 5.07,
      cpc: 0.35,
      roas: 4.2
    },
    {
      id: 2,
      name: "Remarketing Clientes Potenciales",
      status: "active",
      platform: "Google",
      impressions: 156780,
      clicks: 7823,
      conversions: 543,
      spend: 2765.23,
      ctr: 4.99,
      cpc: 0.35,
      roas: 3.8
    },
    {
      id: 3,
      name: "Campaña de Lanzamiento Producto",
      status: "paused",
      platform: "Meta",
      impressions: 87650,
      clicks: 4325,
      conversions: 321,
      spend: 1543.67,
      ctr: 4.93,
      cpc: 0.36,
      roas: 3.5
    },
    {
      id: 4,
      name: "Campaña de Email Marketing",
      status: "completed",
      platform: "Email",
      impressions: 75000,
      clicks: 6584,
      conversions: 452,
      spend: 850.00,
      ctr: 8.78,
      cpc: 0.13,
      roas: 8.9
    },
    {
      id: 5,
      name: "Google Shopping",
      status: "active",
      platform: "Google",
      impressions: 192450,
      clicks: 9874,
      conversions: 542,
      spend: 3876.45,
      ctr: 5.13,
      cpc: 0.39,
      roas: 3.2
    }
  ],
  channelPerformance: [
    { channel: "Búsqueda orgánica", sessions: 28450, conversions: 854, convRate: 3.0 },
    { channel: "Búsqueda pagada", sessions: 20320, conversions: 1217, convRate: 6.0 },
    { channel: "Social Media", sessions: 15675, conversions: 628, convRate: 4.0 },
    { channel: "Email", sessions: 10540, conversions: 842, convRate: 8.0 },
    { channel: "Directo", sessions: 8965, conversions: 313, convRate: 3.5 },
    { channel: "Referral", sessions: 5430, conversions: 217, convRate: 4.0 }
  ],
  revenueByMonth: [
    { month: "Ene", revenue: 45000 },
    { month: "Feb", revenue: 52000 },
    { month: "Mar", revenue: 49000 },
    { month: "Abr", revenue: 63000 },
    { month: "May", revenue: 58000 },
    { month: "Jun", revenue: 72000 },
    { month: "Jul", revenue: 80000 },
    { month: "Ago", revenue: 74000 },
    { month: "Sep", revenue: 82000 },
    { month: "Oct", revenue: 95000 },
    { month: "Nov", revenue: 110000 },
    { month: "Dic", revenue: 86000 }
  ]
};

// Componente para métricas principales
const MetricCard = ({ metric }) => {
  const getTrendIcon = () => {
    if (metric.trend === "up") {
      return <ArrowUpRight className={`h-4 w-4 ${metric.name === "CPA" ? "text-emerald-500" : "text-emerald-500"}`} />;
    } else {
      return <ArrowDownRight className={`h-4 w-4 ${metric.name === "CPA" ? "text-rose-500" : "text-rose-500"}`} />;
    }
  };

  const getTrendClass = () => {
    if (metric.trend === "up") {
      return metric.name === "CPA" ? "text-emerald-600" : "text-emerald-600";
    } else {
      return metric.name === "CPA" ? "text-rose-600" : "text-rose-600";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{metric.name}</p>
            <h3 className="text-3xl font-bold mt-1">{metric.value}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            {metric.name === "Conversiones" ? <Zap className="h-5 w-5 text-indigo-600" /> :
             metric.name === "Impresiones" ? <Eye className="h-5 w-5 text-blue-600" /> :
             metric.name === "CTR" ? <TrendingUp className="h-5 w-5 text-emerald-600" /> :
             <BarChart3 className="h-5 w-5 text-orange-600" />}
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              {getTrendIcon()}
              <span className={`text-sm font-medium ml-1 ${getTrendClass()}`}>
                {metric.change}
              </span>
              <span className="text-xs text-gray-500 ml-2">vs. anterior</span>
            </div>
            <span className="text-xs text-gray-500">{metric.progress}% de meta</span>
          </div>
          <Progress value={Number(metric.progress)} className="h-1" />
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para la tabla de campañas
const CampaignsTable = ({ campaigns }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Activa</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100">Pausada</Badge>;
      case 'completed':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">Completada</Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">Desconocido</Badge>;
    }
  };

  const getPlatformBadge = (platform) => {
    switch (platform) {
      case 'Meta':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{platform}</Badge>;
      case 'Google':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{platform}</Badge>;
      case 'Email':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">{platform}</Badge>;
      default:
        return <Badge variant="outline">{platform}</Badge>;
    }
  };

  const formatNumber = (num) => {
    return num.toLocaleString('es-ES');
  };

  const formatCurrency = (num) => {
    return `$${num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (num) => {
    return `${num.toFixed(2)}%`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Campaña</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Estado</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Plataforma</th>
            <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm">Impresiones</th>
            <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm">Clicks</th>
            <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm">Conv.</th>
            <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm">Gasto</th>
            <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm">CTR</th>
            <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm">CPC</th>
            <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm">ROAS</th>
            <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm"></th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 font-medium">{campaign.name}</td>
              <td className="py-3 px-4">{getStatusBadge(campaign.status)}</td>
              <td className="py-3 px-4">{getPlatformBadge(campaign.platform)}</td>
              <td className="py-3 px-4 text-right">{formatNumber(campaign.impressions)}</td>
              <td className="py-3 px-4 text-right">{formatNumber(campaign.clicks)}</td>
              <td className="py-3 px-4 text-right">{formatNumber(campaign.conversions)}</td>
              <td className="py-3 px-4 text-right">{formatCurrency(campaign.spend)}</td>
              <td className="py-3 px-4 text-right">{formatPercentage(campaign.ctr)}</td>
              <td className="py-3 px-4 text-right">{formatCurrency(campaign.cpc)}</td>
              <td className="py-3 px-4 text-right font-medium text-emerald-600">{campaign.roas}x</td>
              <td className="py-3 px-4 text-right">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Componente para el gráfico de barras de ingresos
const RevenueBarChart = ({ data }) => {
  // Determinar el valor máximo para escalar las barras
  const maxRevenue = Math.max(...data.map(item => item.revenue));
  
  return (
    <div className="h-[250px] flex items-end justify-between p-4 mt-6">
      {data.map((item, index) => {
        // Calcular la altura de la barra basada en el valor máximo
        const barHeight = `${(item.revenue / maxRevenue) * 100}%`;
        // Alternar colores para meses adyacentes
        const barColor = index % 2 === 0 
          ? "bg-gradient-to-t from-indigo-600 to-indigo-400" 
          : "bg-gradient-to-t from-blue-600 to-blue-400";
        
        return (
          <div key={index} className="flex flex-col items-center flex-1 mx-1">
            <div 
              className={`w-full ${barColor} rounded-t-md`}
              style={{ height: barHeight }}
            ></div>
            <div className="text-xs text-gray-600 mt-2">{item.month}</div>
          </div>
        );
      })}
    </div>
  );
};

// Componente para el gráfico de embudo
const FunnelChart = () => {
  return (
    <div className="flex flex-col items-center space-y-3 p-6">
      <div className="w-full max-w-md bg-blue-500 h-16 rounded-md flex items-center justify-center text-white font-medium">
        Visitantes (85,420)
      </div>
      <div className="w-[85%] max-w-md bg-indigo-500 h-14 rounded-md flex items-center justify-center text-white font-medium">
        Visualizaciones de producto (42,710)
      </div>
      <div className="w-[65%] max-w-md bg-violet-500 h-14 rounded-md flex items-center justify-center text-white font-medium">
        Añadidos al carrito (12,813)
      </div>
      <div className="w-[45%] max-w-md bg-purple-500 h-14 rounded-md flex items-center justify-center text-white font-medium">
        Checkout iniciado (7,688)
      </div>
      <div className="w-[25%] max-w-md bg-fuchsia-500 h-14 rounded-md flex items-center justify-center text-white font-medium">
        Compras (3,845)
      </div>
    </div>
  );
};

// Componente principal para monitoreo de KPIs de marketing
const Testing14 = () => {
  const [timeFrame, setTimeFrame] = useState("month");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Monitoreo de KPIs de Marketing</h1>
            <p className="text-gray-500 mt-1">
              Análisis y seguimiento de métricas clave de rendimiento
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="year">Último año</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={refreshData} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Actualizar
                </>
              )}
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Exportar datos
            </Button>
          </div>
        </div>
      </div>
      
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {marketingData.performanceMetrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>
      
      {/* Pestañas para diferentes vistas */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
              <TabsTrigger value="overview">Vista general</TabsTrigger>
              <TabsTrigger value="campaigns">Campañas</TabsTrigger>
              <TabsTrigger value="channels">Canales</TabsTrigger>
              <TabsTrigger value="conversions">Conversiones</TabsTrigger>
            </TabsList>
            
            <div className="mt-4">
              <TabsContent value="overview" className="m-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Ingresos por Mes</CardTitle>
                      <CardDescription>Evolución de ingresos durante el último año</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                      <RevenueBarChart data={marketingData.revenueByMonth} />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Embudo de Conversión</CardTitle>
                      <CardDescription>Tasa de conversión por etapa del embudo</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FunnelChart />
                    </CardContent>
                  </Card>
                  
                  <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Rendimiento por Canal</CardTitle>
                        <CardDescription>Sesiones y conversiones por canal de marketing</CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtrar
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Canal</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm">Sesiones</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm">Conversiones</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm">Tasa Conv.</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {marketingData.channelPerformance.map((channel, index) => (
                              <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium">{channel.channel}</td>
                                <td className="py-3 px-4 text-right">{channel.sessions.toLocaleString()}</td>
                                <td className="py-3 px-4 text-right">{channel.conversions.toLocaleString()}</td>
                                <td className="py-3 px-4 text-right">{channel.convRate.toFixed(1)}%</td>
                                <td className="py-3 px-4 text-right">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="campaigns" className="m-0">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div className="relative flex-grow max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Buscar campañas..." className="pl-10" />
                    </div>
                    <div className="flex gap-3">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="active">Activas</SelectItem>
                          <SelectItem value="paused">Pausadas</SelectItem>
                          <SelectItem value="completed">Completadas</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva campaña
                      </Button>
                    </div>
                  </div>
                  
                  <Card>
                    <CardContent className="p-0">
                      <CampaignsTable campaigns={marketingData.campaigns} />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="channels" className="m-0">
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center">
                    <p className="text-gray-500 mb-4">La vista detallada de canales se encuentra en desarrollo</p>
                    <Button>Ver estadísticas preliminares</Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="conversions" className="m-0">
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center">
                    <p className="text-gray-500 mb-4">La vista de conversiones se encuentra en desarrollo</p>
                    <Button>Ver estadísticas preliminares</Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Contenido de Card ahora está controlado por Tabs */}
        </CardContent>
      </Card>
      
      {/* Resumen de actividad reciente */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Actividad Reciente</CardTitle>
              <CardDescription>Últimas actualizaciones y eventos</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              Ver todo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 border-b pb-4">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {i === 1 ? <Zap className="h-5 w-5 text-indigo-600" /> :
                   i === 2 ? <Share2 className="h-5 w-5 text-blue-600" /> :
                   <LineChart className="h-5 w-5 text-emerald-600" />}
                </div>
                <div>
                  <p className="font-medium mb-1">
                    {i === 1 ? "Campaña Black Friday actualizada" :
                     i === 2 ? "Informe mensual generado" :
                     "Nuevo objetivo de conversión establecido"}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>
                      {i === 1 ? "Hace 2 horas" :
                       i === 2 ? "Ayer, 14:30" :
                       "27/02/2025, 09:15"}
                    </span>
                    <span className="mx-2">•</span>
                    <span>
                      {i === 1 ? "Ana Martínez" :
                       i === 2 ? "Sistema" :
                       "Carlos Rodríguez"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Testing14;