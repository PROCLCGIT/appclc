import { useState, useEffect } from 'react';
import api from '@/config/axios';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { CalendarIcon, PlusCircle, Pencil, Eye, Trash2, Search, X, Check, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";

// Importar servicios de la API
import { clientesService, empresasClcService as empresaService } from '@/services/api';
import { productosDisponiblesService } from '@/services/api';

// ────────────────────────────────────────────────────────────────────────────────
// VENTAS SERVICE UNIFICADO
// ────────────────────────────────────────────────────────────────────────────────
const ventasService = {
  getAll: async (params) => {
    try {
      const response = await api.get('products/historial-ventas/', { params });
      return response.data; // Solo data
    } catch (error) {
      console.error("Error en getAll de ventasService:", error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`products/historial-ventas/${id}/`);
      return response.data;
    } catch (error) {
      console.error("Error en getById de ventasService:", error);
      throw error;
    }
  },
  create: async (data) => {
    try {
      console.log("Enviando datos a endpoint real:", data);
      const response = await api.post('products/historial-ventas/', data);
      return response.data;
    } catch (error) {
      console.error("Error en create de ventasService:", error);
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      const response = await api.put(`products/historial-ventas/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error("Error en update de ventasService:", error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`products/historial-ventas/${id}/`);
      return response.data;
    } catch (error) {
      console.error("Error en delete de ventasService:", error);
      throw error;
    }
  }
};

// Servicio de productos
const productosService = {
  getAll: async () => {
    try {
      const result = await productosDisponiblesService.getAll();
      return result;
    } catch (error) {
      console.error("Error al obtener productos:", error);
      throw error;
    }
  }
};

const to = () => {
  // Estados principales
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estados para búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    cliente: 'all_clientes',
    fecha_inicio: null,
    fecha_fin: null,
    producto: 'all_productos',
    empresa: 'all_empresas'
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    producto: '',
    cliente: '',
    empresa: '',
    fecha: new Date(),
    factura: '',
    valor: '',
    iva: '',
    cantidad: 1
  });
  
  const { toast } = useToast();
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Cargar datos iniciales
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [
          ventasResponse, 
          clientesResponse, 
          empresasResponse, 
          productosResponse
        ] = await Promise.all([
          ventasService.getAll({
            page: currentPage,
            page_size: itemsPerPage,
            search: searchTerm,
            ...buildApiFilters()
          }),
          clientesService.getAll(),
          empresaService.getAll(),
          productosService.getAll()
        ]);
        
        // Manejo de la respuesta de ventas
        if (ventasResponse && typeof ventasResponse === 'object') {
          if (ventasResponse.results) {
            setVentas(ventasResponse.results);
            setTotalPages(Math.ceil((ventasResponse.count || 0) / itemsPerPage));
          } else {
            setVentas(Array.isArray(ventasResponse) ? ventasResponse : []);
            setTotalPages(Math.ceil((Array.isArray(ventasResponse) ? ventasResponse.length : 0) / itemsPerPage));
          }
        } else {
          setVentas([]);
          setTotalPages(1);
        }

        // Manejo de clientes
        if (clientesResponse) {
          if (clientesResponse.results) {
            setClientes(clientesResponse.results);
          } else {
            setClientes(Array.isArray(clientesResponse) ? clientesResponse : []);
          }
        }
        
        // Manejo de empresas
        if (empresasResponse) {
          if (empresasResponse.results) {
            setEmpresas(empresasResponse.results);
          } else {
            setEmpresas(Array.isArray(empresasResponse) ? empresasResponse : []);
          }
        }
        
        // Manejo de productos
        if (productosResponse) {
          if (productosResponse.results) {
            setProductos(productosResponse.results);
          } else {
            setProductos(Array.isArray(productosResponse) ? productosResponse : []);
          }
        }
        
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("No se pudieron cargar los datos. Por favor intente nuevamente.");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Hubo un problema al cargar los datos."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [currentPage, searchTerm, filters]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Construir parámetros de filtro para la API
  // ─────────────────────────────────────────────────────────────────────────────
  const buildApiFilters = () => {
    const apiFilters = {};
    
    if (filters.cliente && filters.cliente !== 'all_clientes') {
      apiFilters.cliente = String(filters.cliente);
    }
    if (filters.producto && filters.producto !== 'all_productos') {
      apiFilters.producto = String(filters.producto);
    }
    if (filters.empresa && filters.empresa !== 'all_empresas') {
      apiFilters.empresa = String(filters.empresa);
    }
    
    if (filters.fecha_inicio) {
      apiFilters.fecha_inicio = format(filters.fecha_inicio, 'yyyy-MM-dd');
    }
    if (filters.fecha_fin) {
      apiFilters.fecha_fin = format(filters.fecha_fin, 'yyyy-MM-dd');
    }
    
    return apiFilters;
  };
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Manejo de cambios en el formulario
  // ─────────────────────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      fecha: date
    });
  };
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Manejo de filtros
  // ─────────────────────────────────────────────────────────────────────────────
  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const handleResetFilters = () => {
    setFilters({
      cliente: 'all_clientes',
      fecha_inicio: null,
      fecha_fin: null,
      producto: 'all_productos',
      empresa: 'all_empresas'
    });
    setCurrentPage(1);
  };
  
  const applyFilters = () => {
    setCurrentPage(1);
    setShowFilters(false);
  };
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Acciones CRUD
  // ─────────────────────────────────────────────────────────────────────────────
  const handleOpenModal = (item = null) => {
    if (item) {
      setIsEditing(true);
      setCurrentItem(item);
      setFormData({
        producto: item.producto?.id,
        cliente: item.cliente?.id,
        empresa: item.empresa?.id,
        fecha: new Date(item.fecha),
        factura: item.factura,
        valor: item.valor,
        iva: item.iva,
        cantidad: item.cantidad || 1
      });
    } else {
      setIsEditing(false);
      setCurrentItem(null);
      setFormData({
        producto: '',
        cliente: '',
        empresa: '',
        fecha: new Date(),
        factura: '',
        valor: '',
        iva: '',
        cantidad: 1
      });
    }
    setModalOpen(true);
  };
  
  const handleViewDetails = async (item) => {
    try {
      setIsLoading(true);
      if (item && item.id && item.producto && item.cliente && item.empresa) {
        // Ya tenemos los datos detallados
        setCurrentItem(item);
        setDetailModalOpen(true);
      } else {
        // Obtenemos más detalles del backend
        const response = await ventasService.getById(item.id);
        if (response && typeof response === 'object') {
          setCurrentItem(response);
        } else {
          throw new Error("Formato de respuesta inesperado");
        }
        setDetailModalOpen(true);
      }
    } catch (err) {
      console.error("Error al cargar detalles:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los detalles de la venta."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!formData.producto || !formData.cliente || !formData.empresa || 
          !formData.fecha || !formData.factura || !formData.valor) {
        throw new Error("Por favor complete todos los campos requeridos.");
      }
      
      const dataToSubmit = {
        producto: String(formData.producto),
        cliente: String(formData.cliente),
        empresa: String(formData.empresa),
        fecha: format(formData.fecha, 'yyyy-MM-dd'),
        factura: formData.factura,
        valor: parseFloat(formData.valor),
        iva: parseFloat(formData.iva || 0),
        cantidad: parseInt(formData.cantidad || 1)
      };
      
      try {
        if (isEditing) {
          await ventasService.update(currentItem.id, dataToSubmit);
          toast({
            title: "Éxito",
            description: "Venta actualizada correctamente."
          });
        } else {
          await ventasService.create(dataToSubmit);
          toast({
            title: "Éxito",
            description: "Venta registrada correctamente."
          });
        }
        
        setModalOpen(false);
        
        // Recargamos la lista de ventas
        const ventasResponse = await ventasService.getAll({
          page: currentPage,
          page_size: itemsPerPage,
          search: searchTerm,
          ...buildApiFilters()
        });
        
        if (ventasResponse && typeof ventasResponse === 'object') {
          if (ventasResponse.results) {
            setVentas(ventasResponse.results);
            setTotalPages(Math.ceil((ventasResponse.count || 0) / itemsPerPage));
          } else {
            setVentas(Array.isArray(ventasResponse) ? ventasResponse : []);
            setTotalPages(Math.ceil((Array.isArray(ventasResponse) ? ventasResponse.length : 0) / itemsPerPage));
          }
        }
      } catch (submitError) {
        console.error("Error específico al guardar:", submitError);
        let errorMessage = "Hubo un problema al guardar los datos.";
        
        if (submitError.errors) {
          const errorDetails = Object.entries(submitError.errors)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('. ');
          errorMessage = errorDetails || errorMessage;
        } else if (submitError.message) {
          errorMessage = submitError.message;
        }
        
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage
        });
        throw submitError;
      }
      
    } catch (err) {
      console.error("Error al guardar la venta:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Hubo un problema al guardar los datos."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este registro de venta?")) return;
    
    setIsLoading(true);
    try {
      await ventasService.delete(id);
      toast({
        title: "Éxito",
        description: "Venta eliminada correctamente."
      });
      
      const ventasResponse = await ventasService.getAll({
        page: currentPage,
        page_size: itemsPerPage,
        search: searchTerm,
        ...buildApiFilters()
      });
      
      if (ventasResponse && typeof ventasResponse === 'object') {
        if (ventasResponse.results) {
          setVentas(ventasResponse.results);
          setTotalPages(Math.ceil((ventasResponse.count || 0) / itemsPerPage));
        } else {
          setVentas(Array.isArray(ventasResponse) ? ventasResponse : []);
          const totalItems = Array.isArray(ventasResponse) ? ventasResponse.length : 0;
          setTotalPages(Math.ceil(totalItems / itemsPerPage));
          
          if (currentPage > 1 && totalItems <= (currentPage - 1) * itemsPerPage) {
            setCurrentPage(Math.max(1, Math.ceil(totalItems / itemsPerPage)));
          }
        }
      } else {
        setVentas([]);
        setTotalPages(1);
      }
      
    } catch (err) {
      console.error("Error al eliminar la venta:", err);
      let errorMessage = "No se pudo eliminar el registro de venta.";
      if (err.message) {
        errorMessage += ` ${err.message}`;
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Formatear valores numéricos
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-EC', { 
      style: 'currency', 
      currency: 'USD'
    }).format(value);
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-[95%]">
      <Card>
        <CardHeader className="bg-purple-50 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-purple-900">
                Historial de Ventas
              </CardTitle>
              <CardDescription>
                Registro histórico de ventas de productos
              </CardDescription>
            </div>
            <Button 
              onClick={() => handleOpenModal()} 
              className="bg-purple-700 hover:bg-purple-800"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Nueva Venta
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Barra de búsqueda y botón de filtros */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por factura, cliente o producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              className="flex items-center" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {Object.values(filters).some(v => v !== '' && v !== null) && (
                <span className="ml-2 bg-purple-100 text-purple-700 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {Object.values(filters).filter(v => v !== '' && v !== null).length}
                </span>
              )}
            </Button>
          </div>
          
          {/* Panel de filtros */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label>Cliente</Label>
                  <Select 
                    value={filters.cliente} 
                    onValueChange={(value) => handleFilterChange('cliente', value)}
                    className="w-full"
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todos los clientes" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80 overflow-y-auto min-w-[300px]">
                      <SelectItem value="all_clientes">Todos los clientes</SelectItem>
                      {clientes.map(cliente => (
                        <SelectItem key={cliente.id} value={String(cliente.id)}>
                          {cliente.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Producto</Label>
                  <Select 
                    value={filters.producto} 
                    onValueChange={(value) => handleFilterChange('producto', value)}
                    className="w-full"
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todos los productos" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80 overflow-y-auto min-w-[300px]">
                      <SelectItem value="all_productos">Todos los productos</SelectItem>
                      {productos.map(producto => (
                        <SelectItem key={producto.id} value={String(producto.id)}>
                          {producto.code || producto.codigo || ''} {producto.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Empresa</Label>
                  <Select 
                    value={filters.empresa} 
                    onValueChange={(value) => handleFilterChange('empresa', value)}
                    className="w-full"
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todas las empresas" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80 overflow-y-auto min-w-[300px]">
                      <SelectItem value="all_empresas">Todas las empresas</SelectItem>
                      {empresas.map(empresa => (
                        <SelectItem key={empresa.id} value={String(empresa.id)}>
                          {empresa.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Fecha inicio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.fecha_inicio
                          ? format(filters.fecha_inicio, "dd/MM/yyyy")
                          : "Seleccione fecha inicio"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.fecha_inicio}
                        onSelect={(date) => handleFilterChange('fecha_inicio', date)}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label>Fecha fin</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.fecha_fin
                          ? format(filters.fecha_fin, "dd/MM/yyyy")
                          : "Seleccione fecha fin"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.fecha_fin}
                        onSelect={(date) => handleFilterChange('fecha_fin', date)}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleResetFilters}>
                  Limpiar filtros
                </Button>
                <Button onClick={applyFilters}>
                  Aplicar filtros
                </Button>
              </div>
            </div>
          )}
          
          {/* Tabla de ventas */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
            </div>
          ) : (
            <>
              <div className="rounded-lg border shadow-sm overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-[120px]">Factura</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead className="w-[100px]">Fecha</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">IVA</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[160px] text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ventas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          No se encontraron registros de ventas
                        </TableCell>
                      </TableRow>
                    ) : (
                      ventas.map((venta) => (
                        <TableRow key={venta.id}>
                          <TableCell className="font-medium">{venta.factura}</TableCell>
                          {/* Usamos cliente_detail y producto_detail para mostrar el nombre */}
                          <TableCell>{venta.cliente_detail?.nombre || 'N/A'}</TableCell>
                          <TableCell>{venta.producto_detail?.nombre || 'N/A'}</TableCell>
                          <TableCell>
                            {format(new Date(venta.fecha), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="text-right">{venta.cantidad || 1}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(venta.valor || 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(venta.iva || 0)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(
                              parseFloat(venta.valor || 0) + parseFloat(venta.iva || 0)
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleViewDetails(venta)}
                                title="Ver detalles"
                              >
                                <Eye className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleOpenModal(venta)}
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4 text-amber-600" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDelete(venta.id)}
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        />
                      </PaginationItem>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={currentPage === i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Modal de formulario */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[750px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Venta' : 'Registrar Nueva Venta'}
            </DialogTitle>
            <DialogDescription>
              Complete los campos para {isEditing ? 'actualizar el' : 'registrar un nuevo'} registro de venta.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="factura" className="font-medium">
                  N° de Factura <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="factura"
                  name="factura"
                  placeholder="Ejemplo: FAC-001-123456"
                  value={formData.factura}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date" className="font-medium">
                  Fecha <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.fecha ? (
                        format(formData.fecha, "dd/MM/yyyy")
                      ) : (
                        <span>Seleccione una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.fecha}
                      onSelect={handleDateChange}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente" className="font-medium">
                  Cliente <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.cliente} 
                  onValueChange={(value) => handleSelectChange('cliente', value)}
                  required
                  className="w-full"
                >
                  <SelectTrigger id="cliente" className="w-full">
                    <SelectValue placeholder="Seleccione un cliente" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80 overflow-y-auto min-w-[300px]">
                    {clientes.map(cliente => (
                      <SelectItem key={cliente.id} value={String(cliente.id)}>
                        {cliente.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="empresa" className="font-medium">
                  Empresa <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.empresa} 
                  onValueChange={(value) => handleSelectChange('empresa', value)}
                  required
                  className="w-full"
                >
                  <SelectTrigger id="empresa" className="w-full">
                    <SelectValue placeholder="Seleccione una empresa" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80 overflow-y-auto min-w-[300px]">
                    {empresas.map(empresa => (
                      <SelectItem key={empresa.id} value={String(empresa.id)}>
                        {empresa.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="producto" className="font-medium">
                Producto <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.producto} 
                onValueChange={(value) => handleSelectChange('producto', value)}
                required
                className="w-full"
              >
                <SelectTrigger id="producto" className="w-full">
                  <SelectValue placeholder="Seleccione un producto" />
                </SelectTrigger>
                <SelectContent className="max-h-80 overflow-y-auto min-w-[350px]">
                  {productos.map(producto => (
                    <SelectItem key={producto.id} value={String(producto.id)}>
                      {producto.code || producto.codigo || ''} {producto.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cantidad" className="font-medium">
                  Cantidad <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cantidad"
                  name="cantidad"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.cantidad}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valor" className="font-medium">
                  Valor <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="valor"
                  name="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.valor}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="iva" className="font-medium">
                  IVA
                </Label>
                <Input
                  id="iva"
                  name="iva"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.iva}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-purple-700 hover:bg-purple-800"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {isEditing ? 'Actualizar Venta' : 'Registrar Venta'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Modal de detalles */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-[750px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Venta</DialogTitle>
            <DialogDescription>
              Información completa del registro de venta
            </DialogDescription>
          </DialogHeader>
          
          {currentItem && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-purple-900">
                    Factura: {currentItem.factura}
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {format(new Date(currentItem.fecha), 'dd/MM/yyyy')}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Cliente:</p>
                    {/* Usamos cliente_detail para mostrar el nombre */}
                    <p className="font-medium">
                      {currentItem.cliente_detail?.nombre || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Empresa:</p>
                    <p className="font-medium">
                      {currentItem.empresa_detail?.nombre || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <h4 className="font-semibold text-purple-900 mb-2">Producto</h4>
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-600">Código:</span>{" "}
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded border">
                      {currentItem.producto_detail?.code || 'N/A'}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Nombre:</span>{" "}
                    <span className="font-medium">
                      {currentItem.producto_detail?.nombre || 'N/A'}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Cantidad:</span>{" "}
                    <span className="font-medium">
                      {currentItem.cantidad || 1} unidad(es)
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h4 className="font-semibold text-green-900 mb-2">Valores</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Valor:</p>
                    <p className="font-medium">
                      {formatCurrency(currentItem.valor)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">IVA:</p>
                    <p className="font-medium">
                      {formatCurrency(currentItem.iva)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Total:</p>
                    <p className="text-lg font-bold text-green-700">
                      {formatCurrency(
                        parseFloat(currentItem.valor) + parseFloat(currentItem.iva)
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-between border-t">
                <Button 
                  variant="outline" 
                  onClick={() => handleOpenModal(currentItem)}
                  className="flex items-center"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button onClick={() => setDetailModalOpen(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default to;
