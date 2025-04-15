import React, { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Plus, Search, Filter, X, Save, Pencil, Trash2 } from 'lucide-react';

import { useClientes } from '@/services/clientes';
import { useContactos } from '@/services/contactos';
import { useRelacionesBlue } from '@/services/relacionesBlue';

const RelacionesBlue = () => {
  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [clienteFilter, setClienteFilter] = useState('');
  const [contactoFilter, setContactoFilter] = useState('');
  const [nivelFilter, setNivelFilter] = useState([1, 9]);
  const [showFilters, setShowFilters] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRelacion, setCurrentRelacion] = useState(null);
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    cliente: '',
    contacto: '',
    nivel: 5,
  });

  // Hooks de datos
  const { 
    relaciones,
    isLoading: relacionesLoading,
    error: relacionesError,
    getRelaciones,
    createRelacion,
    updateRelacion,
    deleteRelacion
  } = useRelacionesBlue();

  const {
    clientes,
    isLoading: clientesLoading,
    getClientes
  } = useClientes();

  const {
    contactos,
    isLoading: contactosLoading,
    getContactos
  } = useContactos();
  
  // Procesamos relaciones para asegurar que cliente y contacto son objetos completos
  const procesarRelaciones = React.useCallback((relacionesData) => {
    if (!Array.isArray(relacionesData) || relacionesData.length === 0) return [];
    
    console.log('Procesando relaciones para normalizar estructura...');
    
    return relacionesData.map(relacion => {
      // Si ya tiene la estructura correcta, lo dejamos igual
      if (relacion.cliente && 
          typeof relacion.cliente === 'object' && 
          relacion.cliente.nombre &&
          relacion.contacto && 
          typeof relacion.contacto === 'object' &&
          relacion.contacto.nombre) {
        return relacion;
      }
      
      // Si cliente o contacto son IDs, buscamos los objetos correspondientes
      let clienteObj = relacion.cliente;
      let contactoObj = relacion.contacto;
      
      // Si cliente es un ID, buscar el objeto completo
      if (typeof relacion.cliente === 'number' || 
          (typeof relacion.cliente === 'string' && !isNaN(relacion.cliente))) {
        const clienteId = Number(relacion.cliente);
        clienteObj = clientes.find(c => c.id === clienteId) || 
                     { id: clienteId, nombre: `Cliente ID ${clienteId}` };
      }
      
      // Si contacto es un ID, buscar el objeto completo
      if (typeof relacion.contacto === 'number' || 
          (typeof relacion.contacto === 'string' && !isNaN(relacion.contacto))) {
        const contactoId = Number(relacion.contacto);
        contactoObj = contactos.find(c => c.id === contactoId) || 
                      { id: contactoId, nombre: `Contacto ID ${contactoId}` };
      }
      
      // Crear una nueva relación con objetos completos
      return {
        ...relacion,
        cliente: clienteObj,
        contacto: contactoObj
      };
    });
  }, [clientes, contactos]);
  
  // Filtrar relaciones según criterios
  const filteredRelaciones = React.useMemo(() => {
    // Verificar que relaciones sea un array
    if (!Array.isArray(relaciones)) return [];
    
    // Procesar relaciones para asegurar estructura correcta
    const dataToFilter = procesarRelaciones(relaciones);
    
    return dataToFilter.filter(relacion => {
      // Verificar que relacion.cliente y relacion.contacto existan
      if (!relacion || !relacion.cliente || !relacion.contacto) return false;
      
      const matchesSearch = searchTerm === '' || 
        (relacion.cliente.nombre && relacion.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (relacion.contacto.nombre && relacion.contacto.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCliente = clienteFilter === '' || 
        (relacion.cliente.id && relacion.cliente.id.toString() === clienteFilter);
      
      const matchesContacto = contactoFilter === '' || 
        (relacion.contacto.id && relacion.contacto.id.toString() === contactoFilter);
      
      const matchesNivel = relacion.nivel >= nivelFilter[0] && relacion.nivel <= nivelFilter[1];

      return matchesSearch && matchesCliente && matchesContacto && matchesNivel;
    });
  }, [relaciones, searchTerm, clienteFilter, contactoFilter, nivelFilter, procesarRelaciones]);
  
  // Manejar guardado de relación
  const handleSaveRelacion = async () => {
    try {
      // Validar datos del formulario
      if (!formData.cliente || !formData.contacto) {
        toast.error('Debes seleccionar un cliente y un contacto');
        return;
      }
      
      // Crear copia de los datos para evitar problemas con referencias
      const datosAEnviar = {
        cliente: formData.cliente,
        contacto: formData.contacto,
        nivel: formData.nivel
      };
      
      if (isCreating) {
        await createRelacion(datosAEnviar);
        toast.success('Relación creada exitosamente');
      } else if (isEditing && currentRelacion) {
        await updateRelacion(currentRelacion.id, datosAEnviar);
        toast.success('Relación actualizada exitosamente');
      }
      
      setIsCreating(false);
      setIsEditing(false);
      setCurrentRelacion(null);
      getRelaciones(); // Recargar datos
    } catch (error) {
      console.error('Error completo:', error);
      toast.error('Error al guardar la relación: ' + (error.message || 'Error desconocido'));
    }
  };
  
  // Manejar eliminación de relación
  const handleDeleteRelacion = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar esta relación?')) {
      try {
        await deleteRelacion(id);
        toast.success('Relación eliminada exitosamente');
        getRelaciones(); // Recargar datos
      } catch (error) {
        toast.error('Error al eliminar la relación: ' + error.message);
      }
    }
  };

  // Función para cargar datos
  const loadData = async () => {
    try {
      console.log('Cargando datos iniciales...');
      
      // Mostrar carga inicial
      toast.info('Cargando datos de clientes y contactos...', {
        duration: 2000, 
        position: 'top-center'
      });
      
      // Utilizamos Promise.all para cargar los datos en paralelo
      const [clientesData, contactosData, relacionesData] = await Promise.all([
        getClientes().catch(error => {
          console.error('Error al cargar clientes:', error);
          return [];
        }),
        getContactos().catch(error => {
          console.error('Error al cargar contactos:', error);
          return [];
        }),
        getRelaciones().catch(error => {
          console.error('Error al cargar relaciones:', error);
          return [];
        })
      ]);
      
      // Logs para depuración
      console.log('Datos cargados - Clientes:', clientesData.length);
      console.log('Datos cargados - Contactos:', contactosData.length);
      console.log('Datos cargados - Relaciones:', relacionesData.length);
      
      // Si no hay datos, mostrar mensaje
      if (clientesData.length === 0 || contactosData.length === 0) {
        console.warn('No se obtuvieron datos de clientes o contactos');
        toast.warning('No se pudieron cargar todos los datos necesarios. Por favor, contacte con soporte técnico.', {
          duration: 5000,
          position: 'top-center'
        });
      } else {
        toast.success('Datos cargados correctamente', {
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error general al cargar datos:', error);
      toast.error('Error al cargar datos: ' + error.message);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  // Búsqueda con debounce
  const debouncedSearch = useDebouncedCallback((value) => {
    setSearchTerm(value);
  }, 500);

  // Manejadores de eventos
  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const handleOpenCreateForm = () => {
    setFormData({
      cliente: '',
      contacto: '',
      nivel: 5,
    });
    setIsCreating(true);
  };

  const handleOpenEditForm = (relacion) => {
    if (!relacion) {
      toast.error('Error: Datos de relación faltantes');
      return;
    }
    
    // Extraer IDs de cliente y contacto, gestionando distintas estructuras de datos
    let clienteId, contactoId;
    
    // Determinar el ID del cliente según la estructura
    if (relacion.cliente) {
      if (typeof relacion.cliente === 'object' && relacion.cliente.id) {
        clienteId = relacion.cliente.id;
      } else if (typeof relacion.cliente === 'number') {
        clienteId = relacion.cliente;
      } else if (typeof relacion.cliente === 'string' && !isNaN(relacion.cliente)) {
        clienteId = parseInt(relacion.cliente, 10);
      }
    }
    
    // Determinar el ID del contacto según la estructura
    if (relacion.contacto) {
      if (typeof relacion.contacto === 'object' && relacion.contacto.id) {
        contactoId = relacion.contacto.id;
      } else if (typeof relacion.contacto === 'number') {
        contactoId = relacion.contacto;
      } else if (typeof relacion.contacto === 'string' && !isNaN(relacion.contacto)) {
        contactoId = parseInt(relacion.contacto, 10);
      }
    }
    
    // Verificar que tengamos IDs válidos
    if (!clienteId || !contactoId) {
      toast.error('Error: No se pudo determinar IDs de cliente o contacto');
      console.error('Datos de relación problemáticos:', relacion);
      return;
    }
    
    console.log('Abriendo formulario con datos:', {
      cliente: clienteId,
      contacto: contactoId,
      nivel: relacion.nivel
    });
    
    setCurrentRelacion(relacion);
    setFormData({
      cliente: clienteId.toString(),
      contacto: contactoId.toString(),
      nivel: relacion.nivel,
    });
    setIsEditing(true);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setClienteFilter('');
    setContactoFilter('');
    setNivelFilter([1, 9]);
  };

  // Función para renderizar el nivel como color
  const getNivelColor = (nivel) => {
    if (nivel >= 7) return 'bg-blue-600 hover:bg-blue-700 text-white';
    if (nivel >= 4) return 'bg-blue-400 hover:bg-blue-500 text-white';
    return 'bg-blue-200 hover:bg-blue-300 text-gray-800';
  };

  const isLoading = relacionesLoading || clientesLoading || contactosLoading;

  return (
    <div className="container p-4 mx-auto space-y-6 max-w-7xl">
      <Card className="border-none shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-100 to-blue-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-blue-800">Relaciones Blue</CardTitle>
              <CardDescription className="text-blue-600">
                Gestiona las relaciones entre clientes y contactos
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <Button 
                variant="outline" 
                className="text-sm text-red-500 border-red-200 hover:bg-red-50 rounded-full"
                onClick={() => {
                  if (window.confirm('¿Está seguro que desea recargar la página? Se perderán los cambios no guardados.')) {
                    window.location.reload();
                  }
                }}
              >
                Reiniciar página
              </Button>
              <Button onClick={handleOpenCreateForm} className="bg-blue-600 hover:bg-blue-700 rounded-full shadow-md">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Relación
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por cliente o contacto..."
                  className="pl-10 rounded-full border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  onChange={handleSearchChange}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center rounded-full border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={handleClearFilters}
                  className={`flex items-center rounded-full ${!showFilters ? 'hidden' : ''}`}
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-gradient-to-r from-blue-50 to-white rounded-xl shadow-sm">
                <div className="space-y-2">
                  <Label htmlFor="cliente-filter" className="text-blue-700 font-medium">Cliente</Label>
                  <select 
                    id="cliente-filter"
                    className="w-full p-2 border border-blue-200 rounded-lg focus:ring-blue-300 focus:border-blue-400"
                    value={clienteFilter}
                    onChange={(e) => setClienteFilter(e.target.value)}
                  >
                    <option value="">Todos los clientes</option>
                    {Array.isArray(clientes) && clientes.length > 0 ? (
                      clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id.toString()}>
                          {cliente.nombre}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No hay clientes disponibles</option>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contacto-filter" className="text-blue-700 font-medium">Contacto</Label>
                  <select 
                    id="contacto-filter"
                    className="w-full p-2 border border-blue-200 rounded-lg focus:ring-blue-300 focus:border-blue-400"
                    value={contactoFilter}
                    onChange={(e) => setContactoFilter(e.target.value)}
                  >
                    <option value="">Todos los contactos</option>
                    {Array.isArray(contactos) && contactos.length > 0 ? (
                      contactos.map(contacto => (
                        <option key={contacto.id} value={contacto.id.toString()}>
                          {contacto.nombre}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No hay contactos disponibles</option>
                    )}
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="nivel-filter" className="text-blue-700 font-medium">Nivel de Relación</Label>
                    <span className="text-sm bg-blue-100 px-2 py-0.5 rounded-full text-blue-700 font-medium">
                      {nivelFilter[0]} - {nivelFilter[1]}
                    </span>
                  </div>
                  <Slider
                    id="nivel-filter"
                    min={1}
                    max={9}
                    step={1}
                    value={nivelFilter}
                    onValueChange={setNivelFilter}
                    className="py-4"
                  />
                </div>
              </div>
            )}

            <Separator className="bg-blue-100" />

            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 border-blue-600"></div>
              </div>
            ) : relacionesError ? (
              <div className="text-center py-8 bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="text-red-500 font-medium mb-2">Error al cargar datos</div>
                <div className="text-red-400 text-sm">{relacionesError.message}</div>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-320px)] rounded-xl border border-blue-100">
                <Table>
                  <TableHeader className="bg-blue-50">
                    <TableRow>
                      <TableHead className="font-semibold text-blue-700">Cliente</TableHead>
                      <TableHead className="font-semibold text-blue-700 w-1/3">Contacto</TableHead>
                      <TableHead className="text-center font-semibold text-blue-700 w-[120px]">Nivel</TableHead>
                      <TableHead className="text-right font-semibold text-blue-700 w-[120px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRelaciones?.length > 0 ? (
                      filteredRelaciones.map((relacion) => {
                        // Verificar que relacion tenga cliente y contacto como objetos
                        const clienteNombre = relacion.cliente && relacion.cliente.nombre 
                          ? relacion.cliente.nombre 
                          : (typeof relacion.cliente === 'number' 
                            ? `Cliente ID: ${relacion.cliente}` 
                            : 'Cliente desconocido');
                            
                        const contactoNombre = relacion.contacto && relacion.contacto.nombre 
                          ? relacion.contacto.nombre 
                          : (typeof relacion.contacto === 'number' 
                            ? `Contacto ID: ${relacion.contacto}` 
                            : 'Contacto desconocido');
                        
                        return (
                          <TableRow key={relacion.id} className="hover:bg-blue-50 transition-colors duration-150">
                            <TableCell className="font-medium">{clienteNombre}</TableCell>
                            <TableCell>{contactoNombre}</TableCell>
                            <TableCell className="text-center">
                              <Badge className={`${getNivelColor(relacion.nivel)} px-3 py-1 rounded-full font-semibold shadow-sm`}>
                                {relacion.nivel}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="rounded-full hover:bg-blue-100 hover:text-blue-700 w-9 h-9 p-0"
                                  onClick={() => handleOpenEditForm(relacion)}
                                  title="Editar relación"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full w-9 h-9 p-0"
                                  onClick={() => handleDeleteRelacion(relacion.id)}
                                  title="Eliminar relación"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <span className="text-lg mb-2">No se encontraron relaciones</span>
                            <Button 
                              className="rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                              onClick={handleOpenCreateForm}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Crear nueva relación
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}

            {!Array.isArray(clientes) || clientes.length === 0 || 
             !Array.isArray(contactos) || contactos.length === 0 ? (
              <div className="mb-4 p-5 border border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl shadow-sm">
                <p className="text-sm text-yellow-800 mb-4 font-medium">No se pudieron cargar los datos de clientes o contactos.</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      window.location.reload();
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 rounded-full shadow-sm"
                  >
                    Recargar página
                  </Button>
                  <Button
                    onClick={() => {
                      loadData();
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white text-sm py-1 rounded-full shadow-sm"
                  >
                    Intentar cargar datos
                  </Button>
                </div>
                <div className="mt-4 bg-white p-3 rounded-lg text-xs border border-yellow-200">
                  <div>Clientes: {JSON.stringify({length: clientes?.length, isArray: Array.isArray(clientes)})}</div>
                  <div>Contactos: {JSON.stringify({length: contactos?.length, isArray: Array.isArray(contactos)})}</div>
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo para crear o editar relación */}
      <Dialog 
        open={isCreating || isEditing} 
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setIsEditing(false);
            setCurrentRelacion(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] rounded-xl p-0 overflow-hidden border-none shadow-xl">
          <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6">
            <DialogTitle className="text-xl font-semibold">
              {isCreating ? 'Crear nueva relación' : 'Editar relación'}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-4">
            <div className="grid gap-6">
              {/* Cliente selector */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cliente-sel" className="text-right font-medium text-blue-700">Cliente</Label>
                <div className="col-span-3">
                  <select 
                    id="cliente-sel"
                    className="w-full p-2 border border-blue-200 rounded-lg focus:ring-blue-300 focus:border-blue-400"
                    value={formData.cliente ? formData.cliente.toString() : ''}
                    onChange={(e) => handleFormChange('cliente', e.target.value)}
                  >
                    <option value="">Seleccionar cliente</option>
                    {Array.isArray(clientes) && clientes.length > 0 ? (
                      clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id.toString()}>
                          {cliente.nombre}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No hay clientes disponibles</option>
                    )}
                  </select>
                </div>
              </div>
              
              {/* Contacto selector */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contacto-sel" className="text-right font-medium text-blue-700">Contacto</Label>
                <div className="col-span-3">
                  <select 
                    id="contacto-sel"
                    className="w-full p-2 border border-blue-200 rounded-lg focus:ring-blue-300 focus:border-blue-400"
                    value={formData.contacto ? formData.contacto.toString() : ''}
                    onChange={(e) => handleFormChange('contacto', e.target.value)}
                  >
                    <option value="">Seleccionar contacto</option>
                    {Array.isArray(contactos) && contactos.length > 0 ? (
                      contactos.map(contacto => (
                        <option key={contacto.id} value={contacto.id.toString()}>
                          {contacto.nombre}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No hay contactos disponibles</option>
                    )}
                  </select>
                </div>
              </div>
              
              {/* Nivel slider */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nivel-slider" className="text-right font-medium text-blue-700">Nivel</Label>
                <div className="col-span-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Bajo</span>
                    <span className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-0.5 rounded-full">{formData.nivel}</span>
                    <span className="text-sm text-gray-500">Alto</span>
                  </div>
                  <div className="pt-2">
                    <Slider
                      id="nivel-slider"
                      min={1}
                      max={9}
                      step={1}
                      value={[formData.nivel]}
                      onValueChange={(value) => handleFormChange('nivel', value[0])}
                      className="h-2"
                    />
                  </div>
                  <div className="flex justify-between pt-1">
                    <div className="w-6 h-1 bg-blue-200 rounded"></div>
                    <div className="w-6 h-1 bg-blue-300 rounded"></div>
                    <div className="w-6 h-1 bg-blue-400 rounded"></div>
                    <div className="w-6 h-1 bg-blue-500 rounded"></div>
                    <div className="w-6 h-1 bg-blue-600 rounded"></div>
                    <div className="w-6 h-1 bg-blue-700 rounded"></div>
                    <div className="w-6 h-1 bg-blue-800 rounded"></div>
                    <div className="w-6 h-1 bg-blue-900 rounded"></div>
                    <div className="w-6 h-1 bg-blue-950 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="bg-gray-50 p-4 gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
                setCurrentRelacion(null);
              }}
              className="rounded-full border-gray-300"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveRelacion} 
              className="bg-blue-600 hover:bg-blue-700 rounded-full shadow-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RelacionesBlue; 