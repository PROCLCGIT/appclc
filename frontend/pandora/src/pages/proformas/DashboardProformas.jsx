import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { proformasService } from "@/services/api";
import { toast } from "sonner";
import ProformasDashboardTable from "./components/ProformasDashboardTable";
import {
  Calendar,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Clock,
  Download,
  FileText,
  Filter,
  MoreHorizontal,
  PieChart as PieChartIcon,
  Plus,
  RefreshCw,
  Search,
  Settings,
  TrendingUp,
  Upload,
  Users,
  ArrowUpRight,
  CheckCircle2,
  Clock8,
  AlertCircle,
  XCircle,
  BarChart3,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// Datos simulados para el dashboard
const proformasByStatus = [
  { name: "Borrador", value: 15, color: "#94a3b8" },
  { name: "Enviadas", value: 27, color: "#3b82f6" },
  { name: "Aprobadas", value: 18, color: "#22c55e" },
  { name: "Rechazadas", value: 8, color: "#ef4444" },
  { name: "Expiradas", value: 12, color: "#f97316" }
];

const monthlyProformas = [
  { name: "Ene", total: 42, approved: 28, rejected: 6, expired: 8 },
  { name: "Feb", total: 38, approved: 25, rejected: 5, expired: 8 },
  { name: "Mar", total: 55, approved: 32, rejected: 10, expired: 13 },
  { name: "Abr", total: 47, approved: 33, rejected: 7, expired: 7 },
  { name: "May", total: 53, approved: 38, rejected: 5, expired: 10 },
  { name: "Jun", total: 68, approved: 45, rejected: 8, expired: 15 },
  { name: "Jul", total: 71, approved: 52, rejected: 9, expired: 10 },
  { name: "Ago", total: 65, approved: 48, rejected: 7, expired: 10 },
  { name: "Sep", total: 59, approved: 43, rejected: 6, expired: 10 },
  { name: "Oct", total: 64, approved: 46, rejected: 8, expired: 10 },
  { name: "Nov", total: 70, approved: 51, rejected: 9, expired: 10 },
  { name: "Dic", total: 80, approved: 62, rejected: 8, expired: 10 }
];

const montosPorVendedor = [
  { name: "Ana Martínez", value: 158600, color: "#3b82f6" },
  { name: "Carlos López", value: 142300, color: "#22c55e" },
  { name: "Diana Torres", value: 126800, color: "#f97316" },
  { name: "Eduardo Paz", value: 98500, color: "#8b5cf6" },
  { name: "Fabiola Ruiz", value: 78900, color: "#ec4899" }
];

const tasasConversion = [
  { name: "Ene", tasa: 65 },
  { name: "Feb", tasa: 68 },
  { name: "Mar", tasa: 62 },
  { name: "Abr", tasa: 70 },
  { name: "May", tasa: 72 },
  { name: "Jun", tasa: 74 },
  { name: "Jul", tasa: 78 },
  { name: "Ago", tasa: 76 },
  { name: "Sep", tasa: 80 },
  { name: "Oct", tasa: 82 },
  { name: "Nov", tasa: 84 },
  { name: "Dic", tasa: 85 }
];

const proformasRecientes = [
  {
    id: "PRO-2025-0042",
    cliente: "Hospital Metropolitano",
    fecha: "15/03/2025",
    expira: "30/03/2025",
    monto: 24850.00,
    estado: "Aprobada",
    vendedor: "Ana Martínez",
    clienteAvatar: "HM"
  },
  {
    id: "PRO-2025-0041",
    cliente: "Clínica San Rafael",
    fecha: "14/03/2025",
    expira: "29/03/2025",
    monto: 18750.00,
    estado: "Enviada",
    vendedor: "Eduardo Paz",
    clienteAvatar: "CS"
  },
  {
    id: "PRO-2025-0040",
    cliente: "Laboratorios Médicos S.A.",
    fecha: "12/03/2025",
    expira: "27/03/2025",
    monto: 35420.00,
    estado: "Enviada",
    vendedor: "Carlos López",
    clienteAvatar: "LM"
  },
  {
    id: "PRO-2025-0039",
    cliente: "Centro Quirúrgico Internacional",
    fecha: "10/03/2025",
    expira: "25/03/2025",
    monto: 42680.00,
    estado: "Borrador",
    vendedor: "Diana Torres",
    clienteAvatar: "CQ"
  },
  {
    id: "PRO-2025-0038",
    cliente: "Instituto Oftalmológico",
    fecha: "08/03/2025",
    expira: "23/03/2025",
    monto: 15920.00,
    estado: "Rechazada",
    vendedor: "Fabiola Ruiz",
    clienteAvatar: "IO"
  }
];

const topClientesPorFacturacion = [
  { cliente: "Hospital Metropolitano", monto: 154200, porcentaje: 15.4 },
  { cliente: "Centro Quirúrgico Internacional", monto: 142500, porcentaje: 14.2 },
  { cliente: "Laboratorios Médicos S.A.", monto: 128900, porcentaje: 12.9 },
  { cliente: "Instituto Oncológico Nacional", monto: 98600, porcentaje: 9.9 },
  { cliente: "Red Hospitalaria del Norte", monto: 92400, porcentaje: 9.2 }
];

const topProductosCotizados = [
  { producto: "Monitor de signos vitales", unidades: 68, monto: 146200 },
  { producto: "Microscopio digital de alta resolución", unidades: 22, monto: 80300 },
  { producto: "Equipo de diagnóstico médico", unidades: 45, monto: 56250 },
  { producto: "Centrífuga de laboratorio", unidades: 28, monto: 51800 },
  { producto: "Kit de insumos quirúrgicos", unidades: 112, monto: 50400 }
];

const proformasPorCategoria = [
  { name: "Equipos Diagnóstico", value: 35, color: "#3b82f6" },
  { name: "Insumos Médicos", value: 25, color: "#22c55e" },
  { name: "Equipos Laboratorio", value: 20, color: "#f97316" },
  { name: "Servicios", value: 12, color: "#ec4899" },
  { name: "Mobiliario", value: 8, color: "#8b5cf6" }
];

// Formatear valores monetarios
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

// Obtener el color para el estado de la proforma
const getStatusColor = (status) => {
  switch (status) {
    case "Aprobada":
      return "bg-green-100 text-green-800";
    case "Enviada":
      return "bg-blue-100 text-blue-800";
    case "Borrador":
      return "bg-gray-100 text-gray-800";
    case "Rechazada":
      return "bg-red-100 text-red-800";
    case "Expirada":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Obtener el icono para el estado de la proforma
const getStatusIcon = (status) => {
  switch (status) {
    case "Aprobada":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "Enviada":
      return <Clock8 className="h-4 w-4 text-blue-600" />;
    case "Borrador":
      return <FileText className="h-4 w-4 text-gray-600" />;
    case "Rechazada":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "Expirada":
      return <AlertCircle className="h-4 w-4 text-amber-600" />;
    default:
      return <FileText className="h-4 w-4 text-gray-600" />;
  }
};

const DashboardProformas = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("este-mes");
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para datos reales
  const [dashboardData, setDashboardData] = useState({
    proformasByStatus: [],
    monthlyProformas: [],
    montosPorVendedor: [],
    tasasConversion: [],
    proformasRecientes: [],
    topClientesPorFacturacion: [],
    topProductosCotizados: [],
    proformasPorCategoria: [],
    totalStats: {
      totalProformas: 0,
      proformasAprobadas: 0,
      tasaConversion: 0,
      montoTotal: 0
    }
  });
  
  // Cargar datos reales al montar el componente y cuando cambia el periodo
  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);
  
  // Función para cargar datos del dashboard desde el backend
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Obtener fechas basadas en el periodo seleccionado
      const { startDate, endDate } = getPeriodDates(selectedPeriod);
      
      // Obtener datos del dashboard desde el backend
      const response = await proformasService.obtenerDashboard(startDate, endDate);
      
      console.log("Respuesta API dashboard:", JSON.stringify(response, null, 2));
      
      // Transformar datos de la API al formato esperado por el componente
      
      // Transformar por_estado a proformasByStatus
      const proformasByStatus = Object.entries(response.por_estado || {}).map(([key, value]) => ({
        name: value.label,
        value: value.count,
        color: getStatusColorCode(key)
      }));
      
      // Transformar por_mes a monthlyProformas
      const monthlyProformas = (response.por_mes || []).map(item => {
        const [year, month] = item.mes.split('-');
        const monthName = getSpanishMonthName(parseInt(month) - 1);
        return {
          name: monthName,
          total: item.count,
          approved: Math.round(item.count * 0.7), // Valor aproximado
          rejected: Math.round(item.count * 0.2), // Valor aproximado
          expired: Math.round(item.count * 0.1)   // Valor aproximado
        };
      });
      
      // Verificar si tenemos proformas recientes
      console.log("Proformas recientes del API:", response.proformasRecientes);
      
      // Verificar específicamente los datos de proformas recientes
      console.log("Proformas recientes:", response.proformasRecientes);
      
      // Imprimir el número de proformas recientes
      if (response.proformasRecientes) {
        console.log(`Número de proformas recientes: ${response.proformasRecientes.length}`);
      } else {
        console.log("No se encontraron proformas recientes en la respuesta");
      }
      
      // Si no hay proformas recientes o hay algún problema con el formato, mostrar array vacío
      const useRealProformas = 
        response.proformasRecientes && 
        Array.isArray(response.proformasRecientes) && 
        response.proformasRecientes.length > 0;
      
      console.log("¿Usar proformas reales?", useRealProformas);
      
      // Actualizar el estado con los datos reales
      const dashboardState = {
        proformasByStatus: proformasByStatus.length > 0 ? proformasByStatus : proformasByStatus,
        monthlyProformas: monthlyProformas.length > 0 ? monthlyProformas : monthlyProformas,
        montosPorVendedor: response.montosPorVendedor || montosPorVendedor,
        tasasConversion: response.tasasConversion || tasasConversion,
        // Usar proformas reales solo si existen y son válidas
        proformasRecientes: useRealProformas ? response.proformasRecientes : [],
        topClientesPorFacturacion: response.topClientesPorFacturacion || topClientesPorFacturacion,
        topProductosCotizados: response.topProductosCotizados || topProductosCotizados,
        proformasPorCategoria: response.proformasPorCategoria || proformasPorCategoria,
        totalStats: response.totalStats || {
          totalProformas: response.total_proformas || 0,
          proformasAprobadas: response.total_proformas ? Math.round(response.total_proformas * 0.7) : 0,
          tasaConversion: 70,
          montoTotal: response.total_monto || 0
        }
      };
      
      console.log("Datos del dashboard transformados:", dashboardState);
      setDashboardData(dashboardState);
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
      toast.error("Error al cargar datos del dashboard. Mostrando datos de ejemplo.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para obtener el nombre del mes en español
  const getSpanishMonthName = (monthIndex) => {
    const months = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun", 
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];
    return months[monthIndex];
  };
  
  // Función para obtener el color por código de estado
  const getStatusColorCode = (status) => {
    switch (status) {
      case "borrador": return "#94a3b8"; // gris
      case "enviada": return "#3b82f6";  // azul
      case "aprobada": return "#22c55e"; // verde
      case "rechazada": return "#ef4444"; // rojo
      case "vencida": return "#f97316";  // naranja
      case "convertida": return "#8b5cf6"; // púrpura
      default: return "#94a3b8";         // gris por defecto
    }
  };
  
  // Función para obtener fechas de inicio y fin según el periodo seleccionado
  const getPeriodDates = (period) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();
    
    switch (period) {
      case "hoy":
        // Usar la fecha actual (ya está en startDate y endDate)
        break;
      case "esta-semana":
        // Ir al inicio de la semana (domingo o lunes según la configuración regional)
        startDate.setDate(today.getDate() - today.getDay());
        break;
      case "este-mes":
        // Ir al inicio del mes
        startDate.setDate(1);
        break;
      case "este-trimestre":
        // Calcular el inicio del trimestre actual
        const currentMonth = today.getMonth();
        const currentQuarter = Math.floor(currentMonth / 3);
        startDate.setMonth(currentQuarter * 3);
        startDate.setDate(1);
        break;
      case "este-ano":
        // Ir al inicio del año
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        // Por defecto, usar el mes actual
        startDate.setDate(1);
    }
    
    // Formatear fechas como YYYY-MM-DD
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };
  
  // Función para actualizar datos
  const refreshData = () => {
    loadDashboardData();
  };
  
  // Estadísticas principales (calculadas desde los datos reales o usando valores predeterminados)
  const stats = [
    {
      title: "Total Proformas",
      value: dashboardData.totalStats.totalProformas.toString() || "0",
      change: "+12.3%", // Este valor debería calcularse comparando con el periodo anterior
      changeType: "positive",
      icon: <FileText className="h-8 w-8 text-blue-600" />
    },
    {
      title: "Proformas Aprobadas",
      value: dashboardData.totalStats.proformasAprobadas.toString() || "0",
      change: "+8.7%", // Este valor debería calcularse comparando con el periodo anterior
      changeType: "positive",
      icon: <CheckCircle2 className="h-8 w-8 text-green-600" />
    },
    {
      title: "Tasa de Conversión",
      value: `${dashboardData.totalStats.tasaConversion.toFixed(1)}%` || "0%",
      change: "+5.2%", // Este valor debería calcularse comparando con el periodo anterior
      changeType: "positive",
      icon: <TrendingUp className="h-8 w-8 text-purple-600" />
    },
    {
      title: "Monto Total",
      value: formatCurrency(dashboardData.totalStats.montoTotal || 0),
      change: "+15.8%", // Este valor debería calcularse comparando con el periodo anterior
      changeType: "positive",
      icon: <CircleDollarSign className="h-8 w-8 text-emerald-600" />
    }
  ];

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Proformas</h1>
          <p className="text-gray-500 mt-1">
            Monitoreo y análisis de proformas comerciales
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoy">Hoy</SelectItem>
              <SelectItem value="esta-semana">Esta semana</SelectItem>
              <SelectItem value="este-mes">Este mes</SelectItem>
              <SelectItem value="este-trimestre">Este trimestre</SelectItem>
              <SelectItem value="este-ano">Este año</SelectItem>
              <SelectItem value="personalizado">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">Actualizar</span>
          </Button>
          <Button onClick={() => {
            console.log("Navegando a nueva proforma");
            navigate('/enhancedproforma?new=true');
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Proforma
          </Button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <div className="flex items-center mt-1">
                    <span className={`text-xs font-medium ${
                      stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">vs. periodo anterior</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-full">{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="general">Vista General</TabsTrigger>
          <TabsTrigger value="vendedores">Vendedores</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="productos">Productos</TabsTrigger>
        </TabsList>

        {/* Vista General */}
        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gráfico de proformas mensuales */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Evolución Mensual de Proformas</CardTitle>
                    <CardDescription>
                      Total de proformas emitidas y su estado final
                    </CardDescription>
                  </div>
                  <Select defaultValue="total">
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Vista" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="total">Total</SelectItem>
                      <SelectItem value="aprobadas">Aprobadas</SelectItem>
                      <SelectItem value="rechazadas">Rechazadas</SelectItem>
                      <SelectItem value="expiradas">Expiradas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.monthlyProformas.length > 0 ? dashboardData.monthlyProformas : monthlyProformas}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} proformas`, ""]}
                      labelFormatter={(label) => `${label} ${new Date().getFullYear()}`}
                    />
                    <Legend />
                    <Bar dataKey="approved" name="Aprobadas" stackId="a" fill="#22c55e" />
                    <Bar dataKey="rejected" name="Rechazadas" stackId="a" fill="#ef4444" />
                    <Bar dataKey="expired" name="Expiradas" stackId="a" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribución por Estado */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Estado</CardTitle>
                <CardDescription>
                  Proformas actuales por estado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.proformasByStatus.length > 0 ? dashboardData.proformasByStatus : proformasByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {(dashboardData.proformasByStatus.length > 0 ? dashboardData.proformasByStatus : proformasByStatus).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} proformas`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {(dashboardData.proformasByStatus.length > 0 ? dashboardData.proformasByStatus : proformasByStatus).map((status, index) => (
                    <div key={index} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: status.color }}
                      ></div>
                      <span className="text-sm">{status.name}: {status.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tasa de Conversión */}
            <Card>
              <CardHeader>
                <CardTitle>Tasa de Conversión</CardTitle>
                <CardDescription>
                  Porcentaje de proformas convertidas a ventas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData.tasasConversion.length > 0 ? dashboardData.tasasConversion : tasasConversion}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis domain={[50, 90]} />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, "Tasa"]}
                        labelFormatter={(label) => `${label} ${new Date().getFullYear()}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="tasa" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Proformas Recientes */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Proformas Recientes</CardTitle>
                  <CardDescription>
                    Últimas proformas emitidas en el sistema
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Redireccionar a la página de proformas guardadas
                    navigate('/proformas-guardadas');
                  }}
                >
                  Ver todas
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Usar el componente personalizado que hace la carga directa */}
              <ProformasDashboardTable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vista Vendedores */}
        <TabsContent value="vendedores" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rendimiento por Vendedor */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Rendimiento por Vendedor</CardTitle>
                <CardDescription>
                  Monto total de proformas por vendedor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={montosPorVendedor}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" tickFormatter={(value) => `$${value / 1000}k`} />
                      <YAxis type="category" dataKey="name" width={120} />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value), "Monto"]}
                      />
                      <Bar dataKey="value" name="Monto">
                        {montosPorVendedor.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas de Vendedores */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Vendedores</CardTitle>
                <CardDescription>
                  Desempeño comparado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {montosPorVendedor.map((vendedor, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>{vendedor.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{vendedor.name}</span>
                        </div>
                        <span className="text-sm font-semibold">{formatCurrency(vendedor.value)}</span>
                      </div>
                      <Progress 
                        value={(vendedor.value / montosPorVendedor[0].value) * 100} 
                        className="h-2"
                        indicatorColor={vendedor.color}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{Math.round((vendedor.value / montosPorVendedor.reduce((acc, curr) => acc + curr.value, 0)) * 100)}% del total</span>
                        <span>{Math.round(vendedor.value / 1000)}k USD</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas de Desempeño */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Tasa de Conversión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">74.3%</div>
                  <div className="text-sm text-gray-500">Promedio general</div>
                  <div className="w-full mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Ana Martínez</span>
                      <span className="font-medium">82%</span>
                    </div>
                    <Progress value={82} className="h-1.5" />
                    <div className="flex justify-between text-sm">
                      <span>Carlos López</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <Progress value={78} className="h-1.5" />
                    <div className="flex justify-between text-sm">
                      <span>Diana Torres</span>
                      <span className="font-medium">73%</span>
                    </div>
                    <Progress value={73} className="h-1.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Tiempo de Cierre</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">7.2 días</div>
                  <div className="text-sm text-gray-500">Promedio general</div>
                  <div className="w-full mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Ana Martínez</span>
                      <span className="font-medium">5.8 días</span>
                    </div>
                    <Progress value={85} className="h-1.5" />
                    <div className="flex justify-between text-sm">
                      <span>Carlos López</span>
                      <span className="font-medium">6.5 días</span>
                    </div>
                    <Progress value={75} className="h-1.5" />
                    <div className="flex justify-between text-sm">
                      <span>Diana Torres</span>
                      <span className="font-medium">8.2 días</span>
                    </div>
                    <Progress value={60} className="h-1.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Monto Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-1">$12,450</div>
                  <div className="text-sm text-gray-500">Promedio general</div>
                  <div className="w-full mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Ana Martínez</span>
                      <span className="font-medium">$15,860</span>
                    </div>
                    <Progress value={90} className="h-1.5" />
                    <div className="flex justify-between text-sm">
                      <span>Carlos López</span>
                      <span className="font-medium">$14,230</span>
                    </div>
                    <Progress value={82} className="h-1.5" />
                    <div className="flex justify-between text-sm">
                      <span>Diana Torres</span>
                      <span className="font-medium">$10,980</span>
                    </div>
                    <Progress value={68} className="h-1.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vista Clientes */}
        <TabsContent value="clientes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Principales Clientes por Facturación</CardTitle>
                <CardDescription>
                  Top 5 clientes con mayor valor en proformas aprobadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {topClientesPorFacturacion.map((cliente, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-1 rounded-full">
                            #{index + 1}
                          </span>
                          <span className="font-medium">{cliente.cliente}</span>
                        </div>
                        <span className="font-semibold">{formatCurrency(cliente.monto)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${cliente.porcentaje}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{cliente.porcentaje}% de la facturación total</span>
                        <span>{formatCurrency(cliente.monto)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Clientes</CardTitle>
                <CardDescription>
                  Datos clave sobre la cartera de clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-blue-700 font-medium">Clientes Activos</p>
                      <Users className="h-5 w-5 text-blue-700" />
                    </div>
                    <p className="text-2xl font-bold mt-1">87</p>
                    <p className="text-xs text-blue-700 mt-1">
                      <ArrowUpRight className="h-3 w-3 inline-block mr-1" />
                      Incremento de 12% vs. periodo anterior
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-green-700 font-medium">Clientes Nuevos</p>
                      <Users className="h-5 w-5 text-green-700" />
                    </div>
                    <p className="text-2xl font-bold mt-1">14</p>
                    <p className="text-xs text-green-700 mt-1">
                      <ArrowUpRight className="h-3 w-3 inline-block mr-1" />
                      Este periodo
                    </p>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-amber-700 font-medium">Retención de Clientes</p>
                      <Users className="h-5 w-5 text-amber-700" />
                    </div>
                    <p className="text-2xl font-bold mt-1">92%</p>
                    <p className="text-xs text-amber-700 mt-1">
                      <ArrowUpRight className="h-3 w-3 inline-block mr-1" />
                      Incremento de 3% vs. periodo anterior
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Distribución de Clientes por Sector</CardTitle>
                  <CardDescription>
                    Composición de la cartera de clientes por industria
                  </CardDescription>
                </div>
                <Select defaultValue="proformas">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Vista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proformas">Por Proformas</SelectItem>
                    <SelectItem value="monto">Por Monto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-center">
                  <div className="h-64 w-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Hospitales", value: 45, color: "#3b82f6" },
                            { name: "Clínicas", value: 28, color: "#22c55e" },
                            { name: "Laboratorios", value: 18, color: "#f97316" },
                            { name: "Consultas", value: 9, color: "#8b5cf6" }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {proformasByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                      <span>Hospitales</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">45%</span>
                      <Badge variant="outline" className="bg-blue-50">39 clientes</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                      <span>Clínicas</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">28%</span>
                      <Badge variant="outline" className="bg-green-50">24 clientes</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
                      <span>Laboratorios</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">18%</span>
                      <Badge variant="outline" className="bg-orange-50">16 clientes</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
                      <span>Consultas</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">9%</span>
                      <Badge variant="outline" className="bg-purple-50">8 clientes</Badge>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-medium">Total</span>
                    <Badge variant="outline" className="bg-gray-50">87 clientes</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vista Productos */}
        <TabsContent value="productos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top Productos */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Productos Más Cotizados</CardTitle>
                <CardDescription>
                  Top 5 productos incluidos en proformas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Unidades</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="text-right">% del Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProductosCotizados.map((producto, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{producto.producto}</TableCell>
                        <TableCell className="text-right">{producto.unidades}</TableCell>
                        <TableCell className="text-right">{formatCurrency(producto.monto)}</TableCell>
                        <TableCell className="text-right">
                          {Math.round((producto.monto / topProductosCotizados.reduce((acc, curr) => acc + curr.monto, 0)) * 100)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Distribución por Categoría */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Categoría</CardTitle>
                <CardDescription>
                  Proformas por categoría de producto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={proformasPorCategoria}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        labelLine={false}
                        label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {proformasPorCategoria.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-4">
                  {proformasPorCategoria.map((categoria, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: categoria.color }}
                        ></div>
                        <span className="text-sm">{categoria.name}</span>
                      </div>
                      <span className="text-sm font-medium">{categoria.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tendencias e Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencias e Insights de Productos</CardTitle>
              <CardDescription>
                Análisis de comportamiento y oportunidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <TrendingUp className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Productos en Crecimiento</h4>
                      <p className="text-sm text-gray-500">Mayor incremento en cotizaciones</p>
                    </div>
                  </div>
                  <div className="pl-12">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Kit de diagnóstico rápido</span>
                          <span className="text-green-600">+68%</span>
                        </div>
                        <Progress value={68} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Sistema de monitoreo remoto</span>
                          <span className="text-green-600">+52%</span>
                        </div>
                        <Progress value={52} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Equipos de telemedicina</span>
                          <span className="text-green-600">+45%</span>
                        </div>
                        <Progress value={45} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-full mr-3">
                      <BarChart3 className="h-5 w-5 text-purple-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Mejor Margen</h4>
                      <p className="text-sm text-gray-500">Productos con mayor rentabilidad</p>
                    </div>
                  </div>
                  <div className="pl-12">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Servicios de mantenimiento</span>
                          <span className="text-purple-600">68%</span>
                        </div>
                        <Progress value={68} className="h-1.5 bg-purple-100">
                          <div className="h-full bg-purple-600 rounded-full"></div>
                        </Progress>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Software de análisis</span>
                          <span className="text-purple-600">62%</span>
                        </div>
                        <Progress value={62} className="h-1.5 bg-purple-100">
                          <div className="h-full bg-purple-600 rounded-full"></div>
                        </Progress>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Equipos de laboratorio</span>
                          <span className="text-purple-600">54%</span>
                        </div>
                        <Progress value={54} className="h-1.5 bg-purple-100">
                          <div className="h-full bg-purple-600 rounded-full"></div>
                        </Progress>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="bg-amber-100 p-2 rounded-full mr-3">
                      <AlertCircle className="h-5 w-5 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Oportunidades</h4>
                      <p className="text-sm text-gray-500">Productos con potencial</p>
                    </div>
                  </div>
                  <div className="pl-12">
                    <div className="space-y-3">
                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <p className="text-sm font-medium text-amber-800">Baja existencia</p>
                        <p className="text-xs text-amber-700 mt-1">Kit de diagnóstico (5 unidades)</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-800">Alta demanda</p>
                        <p className="text-xs text-blue-700 mt-1">Monitores de signos vitales (15 consultas)</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-800">Promoción sugerida</p>
                        <p className="text-xs text-green-700 mt-1">Paquetes de equipamiento integral</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Acciones Rápidas Flotantes */}
      <div className="fixed bottom-6 right-6">
        <div className="flex flex-col space-y-2">
          <Button 
            size="icon" 
            className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              console.log("Navegando a nueva proforma (botón flotante)");
              navigate('/enhancedproforma?new=true');
            }}
            title="Nueva Proforma"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="secondary" className="rounded-full shadow-lg">
            <Download className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="outline" className="rounded-full shadow-lg bg-white">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardProformas;