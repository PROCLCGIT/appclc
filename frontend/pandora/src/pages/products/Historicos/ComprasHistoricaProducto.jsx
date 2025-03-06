// ComprasHistoricaProducto.jsx

import { useState, useEffect } from 'react';
import api from '@/config/axios';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Importar tus subcomponentes refactorizados
import HComprasFilters from "./components/compras/HComprasFilters";
import HComprasTable from "./components/compras/HComprasTable";
import HComprasFormDialog from "./components/compras/HComprasFormDialog";
import HComprasDetailDialog from "./components/compras/HComprasDetailDialog";

// Importar servicios o lógicas
import { 
  proveedoresService, 
  empresasClcService as empresaService,
  productosDisponiblesService
} from '@/services/api';

// Crear un servicio para compras
class ComprasService {
  constructor() {
    this.endpoint = 'products/historial-compras/';
  }

  async getAll(params = {}) {
    try {
      const response = await api.get(this.endpoint, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getById(id) {
    try {
      const response = await api.get(`${this.endpoint}${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async create(data) {
    try {
      const response = await api.post(this.endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async update(id, data) {
    try {
      const response = await api.put(`${this.endpoint}${id}/`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(id) {
    try {
      await api.delete(`${this.endpoint}${id}/`);
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      throw {
        status: error.response.status,
        message: error.response.data.detail || error.response.data.message || "Error en la solicitud",
        errors: error.response.data,
      };
    } else if (error.request) {
      throw {
        status: 503,
        message: 'No se pudo conectar con el servidor. Por favor, verifica tu conexión.',
      };
    } else {
      throw {
        status: 500,
        message: 'Error al procesar la solicitud.',
      };
    }
  }
}

const comprasService = new ComprasService();

const ComprasHistoricaProducto = () => {
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [productos, setProductos] = useState([]);
  
  // Estados de paginación, filtros, búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    proveedor: 'all_proveedores',
    fecha_inicio: null,
    fecha_fin: null,
    producto: 'all_productos',
    empresa: 'all_empresas'
  });
  
  // Estados para modales y formulario
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    producto: '',
    proveedor: '',
    empresa: '',
    fecha: new Date(),
    factura: '',
    valor: '',
    iva: '',
    cantidad: 1
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  
  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Ejemplo de llamadas en paralelo
        const [
          comprasResponse,
          proveedoresResponse,
          empresasResponse,
          productosResponse
        ] = await Promise.all([
          comprasService.getAll({
            page: currentPage,
            page_size: itemsPerPage,
            search: searchTerm,
            ...buildApiFilters()
          }),
          proveedoresService.getAll(),
          empresaService.getAll(),
          productosDisponiblesService.getAll()
        ]);
        
        // Manejo de compras
        if (comprasResponse?.results) {
          setCompras(comprasResponse.results);
          setTotalPages(Math.ceil((comprasResponse.count || 0) / itemsPerPage));
        } else if (Array.isArray(comprasResponse)) {
          setCompras(comprasResponse);
          setTotalPages(Math.ceil(comprasResponse.length / itemsPerPage));
        } else {
          setCompras([]);
          setTotalPages(1);
        }
        
        // Manejo de proveedores
        if (proveedoresResponse?.results) {
          setProveedores(proveedoresResponse.results);
        } else if (Array.isArray(proveedoresResponse)) {
          setProveedores(proveedoresResponse);
        }
        
        // Manejo de empresas
        if (empresasResponse?.results) {
          setEmpresas(empresasResponse.results);
        } else if (Array.isArray(empresasResponse)) {
          setEmpresas(empresasResponse);
        }
        
        // Manejo de productos
        if (productosResponse?.results) {
          setProductos(productosResponse.results);
        } else if (Array.isArray(productosResponse)) {
          setProductos(productosResponse);
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
  
  // Construir filtros
  const buildApiFilters = () => {
    const apiFilters = {};
    if (filters.proveedor && filters.proveedor !== 'all_proveedores') {
      apiFilters.proveedor = String(filters.proveedor);
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
  
  // Acciones CRUD y handlers para el form
  const handleOpenModal = (item = null) => {
    if (item) {
      setIsEditing(true);
      setCurrentItem(item);
      setFormData({
        producto: item.producto?.id,
        proveedor: item.proveedor?.id,
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
        proveedor: '',
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
    setIsLoading(true);
    try {
      if (item && item.id && item.producto && item.proveedor && item.empresa) {
        setCurrentItem(item);
        setDetailModalOpen(true);
      } else {
        const response = await comprasService.getById(item.id);
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
        description: "No se pudieron cargar los detalles."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (dataToSubmit, isEdit) => {
    setIsLoading(true);
    try {
      if (isEdit && currentItem) {
        await comprasService.update(currentItem.id, dataToSubmit);
        toast({
          title: "Éxito",
          description: "Compra actualizada correctamente."
        });
      } else {
        await comprasService.create(dataToSubmit);
        toast({
          title: "Éxito",
          description: "Compra registrada correctamente."
        });
      }
      
      setModalOpen(false);
      
      // Recargar lista
      const comprasResponse = await comprasService.getAll({
        page: currentPage,
        page_size: itemsPerPage,
        search: searchTerm,
        ...buildApiFilters()
      });
      
      if (comprasResponse?.results) {
        setCompras(comprasResponse.results);
        setTotalPages(Math.ceil((comprasResponse.count || 0) / itemsPerPage));
      } else if (Array.isArray(comprasResponse)) {
        setCompras(comprasResponse);
        setTotalPages(Math.ceil(comprasResponse.length / itemsPerPage));
      }
      
    } catch (error) {
      console.error("Error al guardar la compra:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Hubo un problema al guardar los datos."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este registro?")) return;
    setIsLoading(true);
    try {
      await comprasService.delete(id);
      toast({
        title: "Éxito",
        description: "Compra eliminada correctamente."
      });
      
      // Recargar lista
      const comprasResponse = await comprasService.getAll({
        page: currentPage,
        page_size: itemsPerPage,
        search: searchTerm,
        ...buildApiFilters()
      });
      
      if (comprasResponse?.results) {
        setCompras(comprasResponse.results);
        setTotalPages(Math.ceil((comprasResponse.count || 0) / itemsPerPage));
      } else if (Array.isArray(comprasResponse)) {
        setCompras(comprasResponse);
        setTotalPages(Math.ceil(comprasResponse.length / itemsPerPage));
      }
      
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo eliminar el registro."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Manejo de filtros
  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };
  
  const handleResetFilters = () => {
    setFilters({
      proveedor: 'all_proveedores',
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
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-[95%]">
      <Card>
        <CardHeader className="bg-purple-50 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-purple-900">
                Historial de Compras
              </CardTitle>
              <CardDescription>
                Registro histórico de compras de productos
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenModal()} className="bg-purple-700 hover:bg-purple-800">
              <PlusCircle className="h-4 w-4 mr-2" />
              Nueva Compra
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Barra de búsqueda y botón Filtros */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por factura, proveedor o producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
          
          {/* Filtros */}
          {showFilters && (
            <HComprasFilters
              filters={filters}
              handleFilterChange={handleFilterChange}
              handleResetFilters={handleResetFilters}
              applyFilters={applyFilters}
              proveedores={proveedores}
              productos={productos}
              empresas={empresas}
            />
          )}
          
          {/* Tabla */}
          <HComprasTable
            compras={compras}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            handleViewDetails={handleViewDetails}
            handleOpenModal={handleOpenModal}
            handleDelete={handleDelete}
          />
        </CardContent>
      </Card>
      
      {/* Form dialog */}
      <HComprasFormDialog
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        isEditing={isEditing}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        proveedores={proveedores}
        empresas={empresas}
        productos={productos}
        isLoading={isLoading}
      />
      
      {/* Detail dialog */}
      <HComprasDetailDialog
        detailModalOpen={detailModalOpen}
        setDetailModalOpen={setDetailModalOpen}
        currentItem={currentItem}
        handleOpenModal={handleOpenModal}
      />
    </div>
  );
};

export default ComprasHistoricaProducto;