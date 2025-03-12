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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  Download,
  Edit,
  FileText,
  Filter,
  Loader2,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  Share,
  ShoppingCart,
  Tag,
  Trash,
  Users,
  X
} from "lucide-react";

// Mock data for demonstration purposes
const proformasData = [
  { 
    id: "PRF-2025-001", 
    cliente: "Hospital General Metropolitano", 
    fecha: "2025-03-05", 
    monto: 25780.45, 
    estado: "pendiente",
    validez: "2025-04-05"
  },
  { 
    id: "PRF-2025-002", 
    cliente: "Clínica Santa María", 
    fecha: "2025-03-03", 
    monto: 8965.70, 
    estado: "aprobada",
    validez: "2025-04-03"
  },
  { 
    id: "PRF-2025-003", 
    cliente: "Instituto Médico Nacional", 
    fecha: "2025-03-01", 
    monto: 12450.00, 
    estado: "rechazada",
    validez: "2025-04-01"
  },
  { 
    id: "PRF-2025-004", 
    cliente: "Centro de Diagnóstico Avanzado", 
    fecha: "2025-02-28", 
    monto: 34670.25, 
    estado: "expirada",
    validez: "2025-03-28"
  },
  { 
    id: "PRF-2025-005", 
    cliente: "Laboratorio Clínico Especializado", 
    fecha: "2025-02-25", 
    monto: 5490.30, 
    estado: "aprobada",
    validez: "2025-03-25"
  },
  { 
    id: "PRF-2025-006", 
    cliente: "Hospital Infantil", 
    fecha: "2025-02-20", 
    monto: 19850.00, 
    estado: "pendiente",
    validez: "2025-03-20"
  },
  { 
    id: "PRF-2025-007", 
    cliente: "Clínica de Especialidades", 
    fecha: "2025-02-18", 
    monto: 7430.50, 
    estado: "aprobada",
    validez: "2025-03-18"
  },
  { 
    id: "PRF-2025-008", 
    cliente: "Centro de Salud San Mateo", 
    fecha: "2025-02-15", 
    monto: 3250.75, 
    estado: "expirada",
    validez: "2025-03-15"
  }
];

// Main Dashboard for Proforma Management
const Testing27 = () => {
  const [selectedProforma, setSelectedProforma] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");
  const [dateRange, setDateRange] = useState("todas");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);

  // Filter proformas based on search term, status filter, and date range
  const filteredProformas = proformasData.filter(proforma => {
    // Search term filter
    const searchMatch = 
      proforma.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proforma.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const statusMatch = 
      statusFilter === "todas" || 
      proforma.estado === statusFilter;
    
    // Date range filter (simplified for demo)
    let dateMatch = true;
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
    } else if (dateRange === "ultimo-trimestre") {
      const lastQuarter = new Date();
      lastQuarter.setMonth(today.getMonth() - 3);
      dateMatch = proformaDate >= lastQuarter;
    }
    
    return searchMatch && statusMatch && dateMatch;
  });

  // Get statistics
  const stats = {
    total: proformasData.length,
    pendientes: proformasData.filter(p => p.estado === "pendiente").length,
    aprobadas: proformasData.filter(p => p.estado === "aprobada").length,
    rechazadas: proformasData.filter(p => p.estado === "rechazada").length,
    expiradas: proformasData.filter(p => p.estado === "expirada").length,
    montoTotal: proformasData.reduce((sum, p) => sum + p.monto, 0)
  };

  // Format date strings
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get badge color based on status
  const getStatusBadge = (status) => {
    switch(status) {
      case "pendiente":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>;
      case "aprobada":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aprobada</Badge>;
      case "rechazada":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rechazada</Badge>;
      case "expirada":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Expirada</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Handle proforma view
  const viewProforma = (proforma) => {
    setSelectedProforma(proforma);
    setShowSummaryDialog(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Proformas</h1>
          <p className="text-gray-500 mt-1">
            Administre todas sus proformas y cotizaciones en un solo lugar
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleRefresh} variant="outline" size="icon" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
          <Button asChild>
            <a href="/nueva-proforma">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Proforma
            </a>
          </Button>
        </div>
      </div>

      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Total Proformas</span>
              <span className="text-3xl font-bold mt-2">{stats.total}</span>
              <div className="mt-2">
                <span className="text-xs text-gray-500">Valor total: </span>
                <span className="text-sm font-medium">{formatCurrency(stats.montoTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Pendientes</span>
              <span className="text-3xl font-bold mt-2 text-yellow-600">{stats.pendientes}</span>
              <div className="mt-2">
                <span className="text-xs text-yellow-600">{Math.round((stats.pendientes / stats.total) * 100)}% del total</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Aprobadas</span>
              <span className="text-3xl font-bold mt-2 text-green-600">{stats.aprobadas}</span>
              <div className="mt-2">
                <span className="text-xs text-green-600">{Math.round((stats.aprobadas / stats.total) * 100)}% del total</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Rechazadas</span>
              <span className="text-3xl font-bold mt-2 text-red-600">{stats.rechazadas}</span>
              <div className="mt-2">
                <span className="text-xs text-red-600">{Math.round((stats.rechazadas / stats.total) * 100)}% del total</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Expiradas</span>
              <span className="text-3xl font-bold mt-2 text-gray-600">{stats.expiradas}</span>
              <div className="mt-2">
                <span className="text-xs text-gray-600">{Math.round((stats.expiradas / stats.total) * 100)}% del total</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and search section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por ID o cliente..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg animate-in slide-in-from-top">
            <div>
              <Label htmlFor="status-filter" className="text-sm">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" className="mt-1">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="aprobada">Aprobadas</SelectItem>
                  <SelectItem value="rechazada">Rechazadas</SelectItem>
                  <SelectItem value="expirada">Expiradas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date-filter" className="text-sm">Período</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger id="date-filter" className="mt-1">
                  <SelectValue placeholder="Filtrar por fecha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las fechas</SelectItem>
                  <SelectItem value="ultima-semana">Última semana</SelectItem>
                  <SelectItem value="ultimo-mes">Último mes</SelectItem>
                  <SelectItem value="ultimo-trimestre">Último trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" size="sm" className="mt-auto" onClick={() => {
                setStatusFilter("todas");
                setDateRange("todas");
                setSearchTerm("");
              }}>
                Limpiar filtros
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Proformas list */}
      <Card>
        <CardHeader className="p-4 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Proformas ({filteredProformas.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Validez</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProformas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-8 w-8 text-gray-300 mb-2" />
                      <p className="text-gray-500">No se encontraron proformas</p>
                      {(searchTerm || statusFilter !== "todas" || dateRange !== "todas") && (
                        <Button variant="link" onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("todas");
                          setDateRange("todas");
                        }}>
                          Limpiar filtros
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProformas.map((proforma) => (
                  <TableRow key={proforma.id} className="cursor-pointer hover:bg-gray-50" onClick={() => viewProforma(proforma)}>
                    <TableCell className="font-medium">{proforma.id}</TableCell>
                    <TableCell>{proforma.cliente}</TableCell>
                    <TableCell>{formatDate(proforma.fecha)}</TableCell>
                    <TableCell>{formatDate(proforma.validez)}</TableCell>
                    <TableCell>{formatCurrency(proforma.monto)}</TableCell>
                    <TableCell>{getStatusBadge(proforma.estado)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-gray-500">
            Mostrando {filteredProformas.length} de {stats.total} proformas
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Proforma Summary Dialog */}
      <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
        <DialogContent className="max-w-4xl">
          {selectedProforma && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Proforma {selectedProforma.id}</span>
                  {getStatusBadge(selectedProforma.estado)}
                </DialogTitle>
                <DialogDescription>
                  Creada el {formatDate(selectedProforma.fecha)} • Válida hasta {formatDate(selectedProforma.validez)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Información del cliente</h3>
                  <div className="space-y-1">
                    <p className="font-medium">{selectedProforma.cliente}</p>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Mail className="h-3.5 w-3.5 mr-1" />
                      <span>cliente@example.com</span>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Phone className="h-3.5 w-3.5 mr-1" />
                      <span>(+593) 2-123-4567</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Detalles de la proforma</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Monto total:</span>
                      <span className="font-medium">{formatCurrency(selectedProforma.monto)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Forma de pago:</span>
                      <span>50% anticipo, 50% contra entrega</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tiempo de entrega:</span>
                      <span>45 días</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Garantía:</span>
                      <span>12 meses</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="py-4">
                <h3 className="text-sm font-medium mb-3">Productos y servicios</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead className="text-right">Precio unitario</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <div>
                            <p className="font-medium">Monitor de signos vitales</p>
                            <p className="text-xs text-gray-500">MON-001</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">2</TableCell>
                        <TableCell className="text-right">{formatCurrency(3500)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(7000)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div>
                            <p className="font-medium">Sistema de diagnóstico por imágenes</p>
                            <p className="text-xs text-gray-500">DIAG-103</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">1</TableCell>
                        <TableCell className="text-right">{formatCurrency(15000)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(15000)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div>
                            <p className="font-medium">Mantenimiento preventivo</p>
                            <p className="text-xs text-gray-500">SERV-005</p>
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
              
              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal:</span>
                    <span>{formatCurrency(23200)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">IVA (12%):</span>
                    <span>{formatCurrency(2784)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedProforma.monto)}</span>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex gap-2">
                <Button variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Testing27;