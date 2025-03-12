import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  BarChart,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Copy,
  CreditCard,
  Download,
  Edit,
  FileText,
  Filter,
  Info,
  Loader2,
  Mail,
  MoreHorizontal,
  Paperclip,
  PieChart,
  Plus,
  Printer,
  Send,
  Settings,
  Share,
  ShoppingCart,
  ThumbsDown,
  ThumbsUp,
  Trash,
  TrendingUp,
  User
} from "lucide-react";

// Mock data
const proformasData = [
  {
    id: "PRF-2025-0056",
    cliente: {
      id: "CLI-0023",
      nombre: "Hospital General Metropolitano",
      contacto: "Dr. Fernando Morales",
      email: "fernando.morales@hgm.med.ec",
      telefono: "(593) 2-298-1100",
      avatar: null
    },
    fecha: "2025-03-01",
    vencimiento: "2025-04-01",
    total: 25600.50,
    estado: "aprobada",
    items: 5,
    responsable: "Ana Martínez",
    notas: "Cliente requiere entrega inmediata",
    moneda: "USD",
    tipoDocumento: "proforma"
  },
  {
    id: "PRF-2025-0057",
    cliente: {
      id: "CLI-0042",
      nombre: "Clínica Santa María",
      contacto: "Dra. Carolina Suárez",
      email: "c.suarez@clinicasm.com.ec",
      telefono: "(593) 4-267-9080",
      avatar: null
    },
    fecha: "2025-03-02",
    vencimiento: "2025-04-02",
    total: 12340.75,
    estado: "pendiente",
    items: 3,
    responsable: "Pedro Valverde",
    notas: "",
    moneda: "USD",
    tipoDocumento: "proforma"
  },
  {
    id: "PRF-2025-0058",
    cliente: {
      id: "CLI-0015",
      nombre: "Centro Médico Internacional",
      contacto: "Dr. Juan Andrade",
      email: "j.andrade@cmi.org.ec",
      telefono: "(593) 2-333-2211",
      avatar: null
    },
    fecha: "2025-03-04",
    vencimiento: "2025-04-04",
    total: 8950.25,
    estado: "rechazada",
    items: 2,
    responsable: "Ana Martínez",
    notas: "Cliente solicita revisión de precios",
    moneda: "USD",
    tipoDocumento: "proforma"
  },
  {
    id: "PRF-2025-0059",
    cliente: {
      id: "CLI-0061",
      nombre: "Hospital Pediátrico del Norte",
      contacto: "Dr. Eduardo Mena",
      email: "eduardo.mena@hpn.med.ec",
      telefono: "(593) 2-456-7890",
      avatar: null
    },
    fecha: "2025-03-05",
    vencimiento: "2025-04-05",
    total: 34250.00,
    estado: "borrador",
    items: 8,
    responsable: "Luis Guzmán",
    notas: "",
    moneda: "USD",
    tipoDocumento: "cotización"
  },
  {
    id: "PRF-2025-0060",
    cliente: {
      id: "CLI-0027",
      nombre: "Laboratorios Farmacéuticos Unidos",
      contacto: "Ing. Roberto Pazmiño",
      email: "r.pazmino@labfu.com.ec",
      telefono: "(593) 4-567-8901",
      avatar: null
    },
    fecha: "2025-03-06",
    vencimiento: "2025-04-06",
    total: 5400.30,
    estado: "aprobada",
    items: 4,
    responsable: "Pedro Valverde",
    notas: "",
    moneda: "USD",
    tipoDocumento: "proforma"
  }
];

// Estadísticas generales
const estadisticas = {
  proformas: {
    total: 42,
    pendientes: 15,
    aprobadas: 20,
    rechazadas: 7,
    montoTotal: 243569.75,
    montoAprobado: 156400.25
  },
  rendimiento: {
    tasa_conversion: 63, // porcentaje
    tiempo_respuesta: 2.3, // días promedio
    crecimiento_mensual: 8.5, // porcentaje
  }
};

// Clientes más frecuentes
const clientesFrecuentes = [
  { id: "CLI-0023", nombre: "Hospital General Metropolitano", proformas: 8, montoTotal: 87500.50 },
  { id: "CLI-0027", nombre: "Laboratorios Farmacéuticos Unidos", proformas: 6, montoTotal: 45230.75 },
  { id: "CLI-0042", nombre: "Clínica Santa María", proformas: 5, montoTotal: 32140.00 },
  { id: "CLI-0015", nombre: "Centro Médico Internacional", proformas: 4, montoTotal: 27980.50 },
];

// Sistema de Gestión de Proformas Avanzado
const DashboardProformas = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("todos");
  const [selectedProforma, setSelectedProforma] = useState(null);
  const [showProformaDetails, setShowProformaDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filtrar proformas
  const filteredProformas = proformasData.filter(proforma => {
    // Filter by search term
    const searchMatch = 
      proforma.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proforma.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const statusMatch = filterEstado === "todos" || proforma.estado === filterEstado;
    
    // Filter by date range (simplified)
    let dateMatch = true;
    if (dateRange !== "todos") {
      const proformaDate = new Date(proforma.fecha);
      const today = new Date();
      
      if (dateRange === "ultima-semana") {
        const lastWeek = new Date();
        lastWeek.setDate(today.getDate() - 7);
        dateMatch = proformaDate >= lastWeek;
      } else if (dateRange === "ultimo-mes") {
        const lastMonth = new Date();
        lastMonth.setMonth(today.getMonth() - 1);
        dateMatch = proformaDate >= lastMonth;
      } 
    }
    
    return searchMatch && statusMatch && dateMatch;
  });

  // Format currency
  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-EC', options);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case "aprobada":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Aprobada</Badge>;
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendiente</Badge>;
      case "rechazada":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rechazada</Badge>;
      case "borrador":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Borrador</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{status}</Badge>;
    }
  };

  // Get avatar text
  const getAvatarText = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Handle proforma click
  const handleProformaClick = (proforma) => {
    setSelectedProforma(proforma);
    setShowProformaDetails(true);
  };

  // Handle refresh data
  const handleRefreshData = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  // Generate mock PDF (simulated)
  const handleGeneratePDF = (proformaId) => {
    alert(`Generando PDF para proforma ${proformaId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Proformas</h1>
          <p className="text-gray-500 mt-1">
            Sistema integrado para administración de proformas y cotizaciones
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleRefreshData} variant="outline" size="icon" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
          <Button onClick={() => navigate('/enhancedproforma')}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Proforma
          </Button>
        </div>
      </div>

      {/* Main content */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 md:w-auto md:inline-grid">
          <TabsTrigger value="dashboard">
            <BarChart className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="proformas">
            <FileText className="h-4 w-4 mr-2" />
            Proformas
          </TabsTrigger>
          <TabsTrigger value="clientes">
            <User className="h-4 w-4 mr-2" />
            Clientes
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                  Proformas Totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">{estadisticas.proformas.total}</p>
                    <p className="text-sm text-gray-500">Últimos 30 días</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex items-center text-green-600 text-sm">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      <span>{estadisticas.proformas.aprobadas} aprobadas</span>
                    </div>
                    <div className="flex items-center text-yellow-600 text-sm">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{estadisticas.proformas.pendientes} pendientes</span>
                    </div>
                    <div className="flex items-center text-red-600 text-sm">
                      <ThumbsDown className="h-3 w-3 mr-1" />
                      <span>{estadisticas.proformas.rechazadas} rechazadas</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                  Monto Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">{formatCurrency(estadisticas.proformas.montoTotal)}</p>
                    <p className="text-sm text-gray-500">Valor de proformas</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex items-center text-green-600 text-sm">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>{formatCurrency(estadisticas.proformas.montoAprobado)}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <span>Aprobado: {Math.round((estadisticas.proformas.montoAprobado / estadisticas.proformas.montoTotal) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <PieChart className="h-4 w-4 mr-2 text-blue-600" />
                  Rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Tasa de conversión:</span>
                    <div className="flex items-center">
                      <span className="font-medium">{estadisticas.rendimiento.tasa_conversion}%</span>
                      <div className="ml-2 w-16 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ width: `${estadisticas.rendimiento.tasa_conversion}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Respuesta promedio:</span>
                    <span className="font-medium">{estadisticas.rendimiento.tiempo_respuesta} días</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Crecimiento:</span>
                    <span className="font-medium text-green-600">+{estadisticas.rendimiento.crecimiento_mensual}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Proformas and Top Clients */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Proformas Recientes</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proformasData.slice(0, 5).map((proforma) => (
                      <TableRow key={proforma.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleProformaClick(proforma)}>
                        <TableCell className="font-medium">{proforma.id}</TableCell>
                        <TableCell>{proforma.cliente.nombre}</TableCell>
                        <TableCell>{formatCurrency(proforma.total)}</TableCell>
                        <TableCell>{getStatusBadge(proforma.estado)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="border-t p-4">
                <Button variant="link" className="ml-auto p-0" onClick={() => setCurrentTab("proformas")}>
                  Ver todas
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Clientes Frecuentes</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Proformas</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientesFrecuentes.map((cliente) => (
                      <TableRow key={cliente.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{cliente.nombre}</TableCell>
                        <TableCell>{cliente.proformas}</TableCell>
                        <TableCell>{formatCurrency(cliente.montoTotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="border-t p-4">
                <Button variant="link" className="ml-auto p-0" onClick={() => setCurrentTab("clientes")}>
                  Ver todos
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Proformas Tab */}
        <TabsContent value="proformas">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Lista de Proformas</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar proforma o cliente..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterEstado} onValueChange={setFilterEstado}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      <SelectItem value="aprobada">Aprobadas</SelectItem>
                      <SelectItem value="pendiente">Pendientes</SelectItem>
                      <SelectItem value="rechazada">Rechazadas</SelectItem>
                      <SelectItem value="borrador">Borradores</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas las fechas</SelectItem>
                      <SelectItem value="ultima-semana">Última semana</SelectItem>
                      <SelectItem value="ultimo-mes">Último mes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProformas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center py-4">
                          <AlertCircle className="h-8 w-8 text-gray-300 mb-2" />
                          <p className="text-gray-500">No se encontraron proformas</p>
                          <Button variant="link" onClick={() => {
                            setSearchTerm("");
                            setFilterEstado("todos");
                            setDateRange("todos");
                          }}>
                            Limpiar filtros
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProformas.map((proforma) => (
                      <TableRow key={proforma.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleProformaClick(proforma)}>
                        <TableCell className="font-medium">{proforma.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{getAvatarText(proforma.cliente.nombre)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{proforma.cliente.nombre}</p>
                              <p className="text-xs text-gray-500">{proforma.cliente.contacto}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(proforma.fecha)}</TableCell>
                        <TableCell>{formatDate(proforma.vencimiento)}</TableCell>
                        <TableCell>{formatCurrency(proforma.total)}</TableCell>
                        <TableCell>{getStatusBadge(proforma.estado)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => window.open(`/proformas/edit/${proforma.id}`, '_blank')}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleGeneratePDF(proforma.id)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Descargar PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => alert(`Duplicando proforma ${proforma.id}`)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => alert(`Compartiendo proforma ${proforma.id}`)}>
                                  <Share className="h-4 w-4 mr-2" />
                                  Compartir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t p-4">
              <div className="text-sm text-gray-500">
                Mostrando {filteredProformas.length} de {proformasData.length} proformas
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Siguiente
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Clientes Tab */}
        <TabsContent value="clientes">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Directorio de Clientes</CardTitle>
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar cliente..."
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Proformas</TableHead>
                    <TableHead>Total Generado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesFrecuentes.map((cliente) => (
                    <TableRow key={cliente.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{getAvatarText(cliente.nombre)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{cliente.nombre}</p>
                            <p className="text-xs text-gray-500">{cliente.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3.5 w-3.5 mr-1 text-gray-500" />
                            <span>contacto@ejemplo.com</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-3.5 w-3.5 mr-1 text-gray-500" />
                            <span>(593) 2-123-4567</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{cliente.proformas}</TableCell>
                      <TableCell>{formatCurrency(cliente.montoTotal)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Button variant="ghost" size="icon">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <User className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Cliente
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Administrar
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Proforma Details Dialog */}
      <Dialog open={showProformaDetails} onOpenChange={setShowProformaDetails}>
        <DialogContent className="max-w-4xl">
          {selectedProforma && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl">
                    {selectedProforma.tipoDocumento.charAt(0).toUpperCase() + selectedProforma.tipoDocumento.slice(1)} {selectedProforma.id}
                  </DialogTitle>
                  {getStatusBadge(selectedProforma.estado)}
                </div>
                <DialogDescription>
                  Creada el {formatDate(selectedProforma.fecha)} • Válida hasta {formatDate(selectedProforma.vencimiento)}
                </DialogDescription>
              </DialogHeader>

              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Información del Cliente</h3>
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getAvatarText(selectedProforma.cliente.nombre)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedProforma.cliente.nombre}</p>
                        <p className="text-sm">{selectedProforma.cliente.contacto}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Mail className="h-3.5 w-3.5 mr-1" />
                          <span>{selectedProforma.cliente.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-3.5 w-3.5 mr-1" />
                          <span>{selectedProforma.cliente.telefono}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Detalles de la Proforma</h3>
                    <dl className="space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Valor total:</dt>
                        <dd className="text-sm font-medium">{formatCurrency(selectedProforma.total)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Elementos:</dt>
                        <dd className="text-sm">{selectedProforma.items} productos/servicios</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Responsable:</dt>
                        <dd className="text-sm">{selectedProforma.responsable}</dd>
                      </div>
                      {selectedProforma.notas && (
                        <div className="mt-2 pt-2 border-t">
                          <dt className="text-sm text-gray-500 mb-1">Notas:</dt>
                          <dd className="text-sm">{selectedProforma.notas}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                <Separator />

                <div className="py-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Elementos de la Proforma</h3>
                  
                  {/* Simplified list of items - in a real app, these would come from the proforma data */}
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descripción</TableHead>
                          <TableHead className="text-center">Cantidad</TableHead>
                          <TableHead className="text-right">Precio Unit.</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Mock data - would be replaced with actual items */}
                        <TableRow>
                          <TableCell>
                            <div>
                              <p className="font-medium">Monitor multiparamétrico de paciente</p>
                              <p className="text-xs text-gray-500">REF: MON-2025-PRO</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">2</TableCell>
                          <TableCell className="text-right">{formatCurrency(6500)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(13000)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div>
                              <p className="font-medium">Sistema de anestesia avanzado</p>
                              <p className="text-xs text-gray-500">REF: ANES-500-MED</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">1</TableCell>
                          <TableCell className="text-right">{formatCurrency(8500)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(8500)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div>
                              <p className="font-medium">Instalación y capacitación</p>
                              <p className="text-xs text-gray-500">REF: SERV-INST-100</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">1</TableCell>
                          <TableCell className="text-right">{formatCurrency(1200)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(1200)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex justify-end mb-4">
                  <div className="w-full max-w-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>{formatCurrency(22700)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">IVA (12%):</span>
                      <span>{formatCurrency(2724)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between py-1 font-medium">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedProforma.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Información adicional</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Esta proforma tiene una validez de 30 días. Los precios pueden variar según disponibilidad y fluctuaciones del mercado.
                        La entrega estimada es de 45 días después de la confirmación del pedido.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => window.open(`/proformas/edit/${selectedProforma.id}`, '_blank')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" onClick={() => handleGeneratePDF(selectedProforma.id)}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
                <Button variant="outline" onClick={() => alert(`Compartiendo proforma ${selectedProforma.id}`)}>
                  <Share className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
                <Button onClick={() => navigate('/enhancedproforma')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Completa
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Additional icon components
const Phone = (props) => (
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
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const Search = (props) => (
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
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const RefreshCw = (props) => (
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
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export default DashboardProformas;