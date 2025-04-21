import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { proformasService } from "@/services/api";
import { toast } from "sonner";
import { 
  FileText, 
  Search, 
  Filter, 
  CalendarIcon, 
  RefreshCw, 
  Plus, 
  MoreHorizontal, 
  Download,
  CheckCircle2,
  Clock8,
  AlertCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
    case "aprobada":
      return "bg-green-100 text-green-800";
    case "enviada":
      return "bg-blue-100 text-blue-800";
    case "borrador":
      return "bg-gray-100 text-gray-800";
    case "rechazada":
      return "bg-red-100 text-red-800";
    case "vencida":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Obtener el icono para el estado de la proforma
const getStatusIcon = (status) => {
  switch (status) {
    case "aprobada":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "enviada":
      return <Clock8 className="h-4 w-4 text-blue-600" />;
    case "borrador":
      return <FileText className="h-4 w-4 text-gray-600" />;
    case "rechazada":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "vencida":
      return <AlertCircle className="h-4 w-4 text-amber-600" />;
    default:
      return <FileText className="h-4 w-4 text-gray-600" />;
  }
};

const ProformasGuardadas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [proformas, setProformas] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  
  // Estado y funciones para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  useEffect(() => {
    loadProformas();
  }, [pagination.currentPage, selectedStatus, dateFrom, dateTo, searchTerm]);

  const loadProformas = async () => {
    setLoading(true);
    try {
      // Preparar filtros
      const filters = {
        page: pagination.currentPage,
        status: selectedStatus !== "todos" ? selectedStatus : undefined,
        date_from: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
        date_to: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined,
        search: searchTerm || undefined
      };
      
      const response = await proformasService.getAll(filters);
      
      // Actualizar datos de proformas
      if (response.results && Array.isArray(response.results)) {
        setProformas(response.results);
        setPagination({
          currentPage: response.current_page || 1,
          totalPages: response.total_pages || 1,
          totalItems: response.count || 0
        });
      } else if (Array.isArray(response)) {
        setProformas(response);
      }
    } catch (error) {
      console.error("Error al cargar proformas:", error);
      toast.error("No se pudieron cargar las proformas");
      setProformas([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination({
      ...pagination,
      currentPage: page
    });
  };

  const refreshData = () => {
    loadProformas();
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    
    // Restablecer a la primera página cuando se cambia el filtro
    setPagination({
      ...pagination,
      currentPage: 1
    });
  };

  const renderPagination = () => {
    const { currentPage, totalPages } = pagination;
    
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            href="#" 
            onClick={(e) => { e.preventDefault(); handlePageChange(i); }}
            isActive={i === currentPage}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => { 
                e.preventDefault();
                if (currentPage > 1) handlePageChange(currentPage - 1);
              }}
              className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
            />
          </PaginationItem>
          
          {pages}
          
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => { 
                e.preventDefault();
                if (currentPage < totalPages) handlePageChange(currentPage + 1);
              }}
              className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Mis Proformas</CardTitle>
            <CardDescription>
              Visualiza y gestiona todas tus proformas guardadas
            </CardDescription>
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <Button onClick={() => navigate('/enhancedproforma?new=true')} className="gap-1">
              <Plus className="h-4 w-4" />
              Nueva Proforma
            </Button>
            <Button variant="outline" onClick={refreshData} className="gap-1">
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="col-span-1 md:col-span-2">
              <form onSubmit={(e) => {
                e.preventDefault();
                setPagination({...pagination, currentPage: 1});
                loadProformas();
              }} className="flex w-full gap-2">
                <Input
                  placeholder="Buscar por número o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
                <Button type="submit" variant="outline" className="shrink-0">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
            
            <div>
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="borrador">Borrador</SelectItem>
                  <SelectItem value="enviada">Enviada</SelectItem>
                  <SelectItem value="aprobada">Aprobada</SelectItem>
                  <SelectItem value="rechazada">Rechazada</SelectItem>
                  <SelectItem value="vencida">Vencida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" type="button">
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={(date) => {
                      setDateFrom(date);
                      setPagination({...pagination, currentPage: 1});
                    }}
                    locale={es}
                    footer={
                      <div className="p-2 border-t border-gray-100 flex justify-between">
                        <span className="text-xs text-gray-500">Desde</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setDateFrom(null);
                            setPagination({...pagination, currentPage: 1});
                          }}
                          className="text-xs"
                          type="button"
                        >
                          Limpiar
                        </Button>
                      </div>
                    }
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" type="button">
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={(date) => {
                      setDateTo(date);
                      setPagination({...pagination, currentPage: 1});
                    }}
                    locale={es}
                    footer={
                      <div className="p-2 border-t border-gray-100 flex justify-between">
                        <span className="text-xs text-gray-500">Hasta</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setDateTo(null);
                            setPagination({...pagination, currentPage: 1});
                          }}
                          className="text-xs"
                          type="button"
                        >
                          Limpiar
                        </Button>
                      </div>
                    }
                  />
                </PopoverContent>
              </Popover>
              
              <Button 
                variant="outline" 
                type="button"
                onClick={() => {
                  setDateFrom(null);
                  setDateTo(null);
                  setSelectedStatus("todos");
                  setSearchTerm("");
                  setPagination({
                    ...pagination,
                    currentPage: 1
                  });
                  // Esperar al siguiente ciclo para que los estados se actualicen
                  setTimeout(() => loadProformas(), 0);
                }}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Tabla de proformas */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Nombre / Cliente</TableHead>
                  <TableHead>Fecha Emisión</TableHead>
                  <TableHead>Fecha Vencimiento</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado por</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                        <span>Cargando proformas...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : proformas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center p-4">
                        <FileText className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-gray-500 mb-1">No hay proformas disponibles</p>
                        <p className="text-gray-400 text-sm mb-4">
                          {searchTerm || selectedStatus || dateFrom || dateTo ? 
                            "No se encontraron proformas con los filtros seleccionados" : 
                            "Crea una nueva proforma para comenzar"}
                        </p>
                        <Button onClick={() => navigate('/enhancedproforma?new=true')}>
                          Nueva Proforma
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  proformas.map((proforma) => (
                    <TableRow key={proforma.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {proforma.numero}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-blue-700 font-medium">
                            {proforma.nombre || 'Sin nombre'}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                                {proforma.cliente_detail ? 
                                  proforma.cliente_detail.nombre.split(' ').slice(0, 2).map(n => n[0]).join('') : 
                                  (proforma.cliente_nombre ?
                                    proforma.cliente_nombre.split(' ').slice(0, 2).map(n => n[0]).join('') :
                                    "CN")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">
                              {proforma.cliente_detail ? 
                                proforma.cliente_detail.nombre : 
                                (proforma.cliente_nombre || 
                                 (proforma.cliente && typeof proforma.cliente === 'object' ? proforma.cliente.nombre : 
                                  (proforma.cliente ? `Cliente #${proforma.cliente}` : "Cliente sin nombre")))}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(proforma.fecha_emision)}
                      </TableCell>
                      <TableCell>
                        {formatDate(proforma.fecha_vencimiento)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(proforma.total)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(proforma.estado)}
                          <Badge 
                            variant="outline" 
                            className={`ml-2 ${getStatusColor(proforma.estado)}`}
                          >
                            {proforma.estado}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {proforma.created_by ? 
                          `${proforma.created_by.first_name} ${proforma.created_by.last_name}` : 
                          "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/enhancedproforma?id=${proforma.id}`)}>
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/enhancedproforma?id=${proforma.id}`)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              toast.info(`Duplicando proforma ${proforma.numero}...`);
                              proformasService.duplicar(proforma.id)
                                .then(() => {
                                  toast.success("Proforma duplicada correctamente");
                                  refreshData();
                                })
                                .catch(error => {
                                  console.error("Error al duplicar:", error);
                                  toast.error("Error al duplicar la proforma");
                                });
                            }}>
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              Enviar por correo
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              window.open(`${import.meta.env.VITE_API_URL || '/api/v1'}/proformas/proformas/${proforma.id}/exportar_pdf/`, '_blank');
                            }}>
                              <Download className="h-4 w-4 mr-2" />
                              Descargar PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => {
                              if (window.confirm(`¿Está seguro de que quiere cancelar la proforma ${proforma.numero}?`)) {
                                toast.info(`Cancelando proforma ${proforma.numero}...`);
                                proformasService.cambiarEstado(proforma.id, 'cancelada')
                                  .then(() => {
                                    toast.success("Proforma cancelada");
                                    refreshData();
                                  })
                                  .catch(error => {
                                    console.error("Error al cancelar:", error);
                                    toast.error("Error al cancelar la proforma");
                                  });
                              }
                            }}>
                              Cancelar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Paginación */}
          {renderPagination()}
          
          {/* Información de paginación */}
          {!loading && proformas.length > 0 && (
            <div className="text-sm text-gray-500 mt-4 text-center">
              Mostrando {proformas.length} de {pagination.totalItems} proformas
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProformasGuardadas; 