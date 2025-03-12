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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableFooter, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Activity,
  AlertCircle,
  Archive,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight, 
  Calendar,
  Check,
  ChevronDown,
  CreditCard,
  DollarSign,
  Download,
  Edit,
  FileText,
  Filter,
  HelpCircle,
  Image,
  LifeBuoy,
  Mail,
  MoreHorizontal,
  Package,
  Percent,
  PlusCircle,
  Printer,
  Search,
  ShoppingCart,
  Trash,
  TrendingUp,
  User,
  Users
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Modelo 1: Dashboard de Proformas con análisis y métricas

// Datos de ejemplo
const proformasData = [
  {
    id: "PRO-2025-001",
    cliente: "Hospital General Metropolitano",
    fecha: "2025-03-01",
    monto: 24850.75,
    estado: "aprobada",
    items: 12,
    responsable: "Carlos Mendoza"
  },
  {
    id: "PRO-2025-002",
    cliente: "Clínica Santa María",
    fecha: "2025-03-05",
    monto: 13425.50,
    estado: "pendiente",
    items: 8,
    responsable: "María Rodríguez"
  },
  {
    id: "PRO-2025-003",
    cliente: "Laboratorios Farmacéuticos Unidos",
    fecha: "2025-03-07",
    monto: 36750.25,
    estado: "borrador",
    items: 15,
    responsable: "Carlos Mendoza"
  },
  {
    id: "PRO-2025-004",
    cliente: "Centro Médico Especializado",
    fecha: "2025-03-10",
    monto: 8975.30,
    estado: "rechazada",
    items: 5,
    responsable: "Ana Gómez"
  },
  {
    id: "PRO-2025-005",
    cliente: "Hospital Infantil Norte",
    fecha: "2025-03-12",
    monto: 19650.00,
    estado: "aprobada",
    items: 10,
    responsable: "María Rodríguez"
  }
];

// Componente principal
const Testing25 = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [viewMode, setViewMode] = useState("card");
  const [timeRange, setTimeRange] = useState("month");
  
  // Calcular métricas
  const totalProformas = proformasData.length;
  const proformasAprobadas = proformasData.filter(p => p.estado === "aprobada").length;
  const porcentajeAprobacion = (proformasAprobadas / totalProformas) * 100;
  const totalMonto = proformasData.reduce((sum, p) => sum + p.monto, 0);
  const montoPromedio = totalMonto / totalProformas;
  
  // Formatting functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'aprobada':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Aprobada</Badge>;
      case 'pendiente':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Pendiente</Badge>;
      case 'borrador':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Borrador</Badge>;
      case 'rechazada':
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200">Rechazada</Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">Desconocido</Badge>;
    }
  };
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de Proformas</h1>
            <p className="text-gray-500 mt-1">
              Monitoreo y análisis de proformas comerciales
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="year">Último año</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Nueva Proforma
            </Button>
          </div>
        </div>
      </div>

      {/* Pestañas */}
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="proformas">Proformas</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
          </TabsList>
          
          {activeTab === "proformas" && (
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={viewMode === "card" ? "bg-muted" : ""}
                      onClick={() => setViewMode("card")}
                    >
                      <Package className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Vista de tarjetas</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={viewMode === "table" ? "bg-muted" : ""}
                      onClick={() => setViewMode("table")}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Vista de tabla</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="aprobada">Aprobadas</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="borrador">Borradores</SelectItem>
                  <SelectItem value="rechazada">Rechazadas</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative">
                <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Buscar proforma..."
                  className="pl-8 w-[250px]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Contenido de Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Métricas clave */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Proformas</p>
                    <h3 className="text-3xl font-bold mt-1">{totalProformas}</h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
                  <span className="text-sm font-medium text-emerald-600">+12%</span>
                  <span className="text-xs text-gray-500 ml-2">vs. mes anterior</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Monto Total</p>
                    <h3 className="text-3xl font-bold mt-1">{formatCurrency(totalMonto)}</h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
                  <span className="text-sm font-medium text-emerald-600">+8.5%</span>
                  <span className="text-xs text-gray-500 ml-2">vs. mes anterior</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tasa de Aprobación</p>
                    <h3 className="text-3xl font-bold mt-1">{porcentajeAprobacion.toFixed(1)}%</h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
                  <span className="text-sm font-medium text-emerald-600">+5.2%</span>
                  <span className="text-xs text-gray-500 ml-2">vs. mes anterior</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Monto Promedio</p>
                    <h3 className="text-3xl font-bold mt-1">{formatCurrency(montoPromedio)}</h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
                  <span className="text-sm font-medium text-emerald-600">+3.7%</span>
                  <span className="text-xs text-gray-500 ml-2">vs. mes anterior</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Gráficos y análisis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Tendencia Mensual</CardTitle>
                <CardDescription>Monto de proformas por mes</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Aquí iría un gráfico real - Simulación visual */}
                <div className="w-full h-[300px] bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <TrendingUp className="h-10 w-10" />
                    <p className="text-sm">Gráfico de tendencia mensual</p>
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <span className="text-xs">Este año</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <span className="text-xs">Año anterior</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs">Proyección</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estado de Proformas</CardTitle>
                <CardDescription>Distribución por estado</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Aquí iría un gráfico real - Simulación visual */}
                <div className="w-full h-[300px] bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <PieChart className="h-10 w-10" />
                    <p className="text-sm">Gráfico de distribución</p>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-xs">Aprobadas</span>
                    </div>
                    <span className="text-xs font-medium">{formatCurrency(44500.75)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="text-xs">Pendientes</span>
                    </div>
                    <span className="text-xs font-medium">{formatCurrency(13425.50)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-xs">Borradores</span>
                    </div>
                    <span className="text-xs font-medium">{formatCurrency(36750.25)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      <span className="text-xs">Rechazadas</span>
                    </div>
                    <span className="text-xs font-medium">{formatCurrency(8975.30)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Proformas recientes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Proformas Recientes</CardTitle>
                <CardDescription>Últimas proformas creadas o actualizadas</CardDescription>
              </div>
              <Button variant="outline" size="sm">Ver todas</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proformasData.map((proforma) => (
                    <TableRow key={proforma.id}>
                      <TableCell className="font-medium">{proforma.id}</TableCell>
                      <TableCell>{proforma.cliente}</TableCell>
                      <TableCell>{formatDate(proforma.fecha)}</TableCell>
                      <TableCell>{proforma.responsable}</TableCell>
                      <TableCell className="text-right">{formatCurrency(proforma.monto)}</TableCell>
                      <TableCell>{getStatusBadge(proforma.estado)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contenido de Proformas */}
        <TabsContent value="proformas" className="space-y-6">
          {viewMode === "table" ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Responsable</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proformasData.map((proforma) => (
                      <TableRow key={proforma.id}>
                        <TableCell className="font-medium">{proforma.id}</TableCell>
                        <TableCell>{proforma.cliente}</TableCell>
                        <TableCell>{formatDate(proforma.fecha)}</TableCell>
                        <TableCell>{proforma.responsable}</TableCell>
                        <TableCell className="text-right">{proforma.items}</TableCell>
                        <TableCell className="text-right">{formatCurrency(proforma.monto)}</TableCell>
                        <TableCell>{getStatusBadge(proforma.estado)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proformasData.map((proforma) => (
                <Card key={proforma.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{proforma.id}</CardTitle>
                        <CardDescription>{proforma.cliente}</CardDescription>
                      </div>
                      {getStatusBadge(proforma.estado)}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-0">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Fecha</p>
                        <p className="font-medium">{formatDate(proforma.fecha)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Responsable</p>
                        <p className="font-medium">{proforma.responsable}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Items</p>
                        <p className="font-medium">{proforma.items}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Monto</p>
                        <p className="font-medium">{formatCurrency(proforma.monto)}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-3 flex justify-between">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          <div className="flex justify-center">
            <Button variant="outline">Cargar más proformas</Button>
          </div>
        </TabsContent>

        {/* Contenido de Clientes */}
        <TabsContent value="clientes" className="space-y-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Clientes con Proformas</h2>
            <div className="relative w-[300px]">
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar cliente..."
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Cliente 1 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700">HG</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">Hospital General Metropolitano</CardTitle>
                    <CardDescription>Cliente desde 2023</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Proformas</p>
                    <p className="font-medium">12</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-medium">{formatCurrency(156800.25)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Aprobación</p>
                    <p className="font-medium">83%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Última Proforma</p>
                    <p className="font-medium">01 mar 2025</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-3">
                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Proformas
                </Button>
              </CardFooter>
            </Card>
            
            {/* Cliente 2 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-blue-100 text-blue-700">CS</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">Clínica Santa María</CardTitle>
                    <CardDescription>Cliente desde 2024</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Proformas</p>
                    <p className="font-medium">8</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-medium">{formatCurrency(87500.50)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Aprobación</p>
                    <p className="font-medium">75%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Última Proforma</p>
                    <p className="font-medium">05 mar 2025</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-3">
                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Proformas
                </Button>
              </CardFooter>
            </Card>
            
            {/* Cliente 3 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">LF</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">Laboratorios Farmacéuticos Unidos</CardTitle>
                    <CardDescription>Cliente desde 2022</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Proformas</p>
                    <p className="font-medium">15</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-medium">{formatCurrency(204350.75)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Aprobación</p>
                    <p className="font-medium">91%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Última Proforma</p>
                    <p className="font-medium">07 mar 2025</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-3">
                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Proformas
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Contenido de Reportes */}
        <TabsContent value="reportes" className="space-y-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Reportes y Análisis</h2>
            <div className="flex gap-3">
              <Select defaultValue="month">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mes</SelectItem>
                  <SelectItem value="quarter">Trimestre</SelectItem>
                  <SelectItem value="year">Año</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Proformas por Estado</CardTitle>
                <CardDescription>Distribución por estado</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Aquí iría un gráfico real - Simulación visual */}
                <div className="w-full h-[200px] bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <PieChart className="h-10 w-10" />
                    <p className="text-sm">Gráfico por estado</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-sm">Aprobadas</span>
                      </div>
                      <span className="text-sm font-medium">40%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-sm">Pendientes</span>
                      </div>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Borradores</span>
                      </div>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                        <span className="text-sm">Rechazadas</span>
                      </div>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Proformas por Responsable</CardTitle>
                <CardDescription>Distribución por usuario</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Aquí iría un gráfico real - Simulación visual */}
                <div className="w-full h-[200px] bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <BarChart4 className="h-10 w-10" />
                    <p className="text-sm">Gráfico por responsable</p>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">CM</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">Carlos Mendoza</span>
                    </div>
                    <span className="text-sm font-medium">42%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">MR</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">María Rodríguez</span>
                    </div>
                    <span className="text-sm font-medium">38%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">AG</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">Ana Gómez</span>
                    </div>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tendencias Temporales</CardTitle>
              <CardDescription>Evolución de proformas e ingresos</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Aquí iría un gráfico real - Simulación visual */}
              <div className="w-full h-[300px] bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <TrendingUp className="h-10 w-10" />
                  <p className="text-sm">Gráfico de tendencias temporales</p>
                </div>
              </div>
              
              <div className="flex justify-between mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span className="text-xs">Número de proformas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs">Monto total ($)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-xs">Tasa de aprobación (%)</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-end gap-3">
              <Button variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Descargar CSV
              </Button>
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                Enviar Reporte
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente de gráfico simulado para el ejemplo
const PieChart = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

// Componente de gráfico simulado para el ejemplo
const BarChart4 = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3v18h18" />
    <path d="M13 17V9" />
    <path d="M18 17V5" />
    <path d="M8 17v-3" />
  </svg>
);

export default Testing25;