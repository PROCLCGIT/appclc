import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Calendar, 
  User, 
  Building, 
  Plus, 
  Trash, 
  Save, 
  Printer, 
  Send, 
  Check,
  X,
  ShoppingCart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Modelo 2: Proforma con Inventario y Sistema de Cotización

const Testing22 = () => {
  // Estado para la proforma
  const [proforma, setProforma] = useState({
    numero: "PRO-2025-0128",
    fecha: new Date().toISOString().split('T')[0],
    vigencia: 30,
    clienteNombre: "Hospital Metropolitano",
    clienteRuc: "0991234567001",
    clienteDireccion: "Av. Mariana de Jesús y Occidental, Quito",
    clienteContacto: "Dra. Ana Salazar",
    clienteTelefono: "02-444-5678",
    clienteEmail: "compras@hospitalmetropolitano.org",
    vendedor: "Carlos Mendoza",
    formaPago: "Crédito 30 días",
    tiempoEntrega: "Inmediata",
    observaciones: "",
    subtotal: 0,
    descuento: 0,
    iva: 0,
    total: 0,
    estado: "Borrador" // Borrador, Enviada, Aprobada, Rechazada
  });
  
  // Estado para los items de la proforma
  const [items, setItems] = useState([]);
  
  // Estado para el inventario de productos
  const [inventario, setInventario] = useState([
    { 
      id: 1, 
      codigo: "MED-1001", 
      descripcion: "Electrocardiógrafo EKG de 12 canales", 
      precio: 2850.00, 
      stock: 3,
      categoria: "Equipos Médicos",
      imagen: "https://via.placeholder.com/100",
      disponible: true
    },
    { 
      id: 2, 
      codigo: "MED-1042", 
      descripcion: "Monitor multiparamétrico de signos vitales", 
      precio: 1950.00, 
      stock: 5,
      categoria: "Equipos Médicos",
      imagen: "https://via.placeholder.com/100",
      disponible: true
    },
    { 
      id: 3, 
      codigo: "LAB-2056", 
      descripcion: "Centrifugadora digital programable", 
      precio: 1200.00, 
      stock: 2,
      categoria: "Laboratorio",
      imagen: "https://via.placeholder.com/100",
      disponible: true
    },
    { 
      id: 4, 
      codigo: "LAB-2101", 
      descripcion: "Microscopio binocular LED", 
      precio: 850.00, 
      stock: 4,
      categoria: "Laboratorio",
      imagen: "https://via.placeholder.com/100",
      disponible: true
    },
    { 
      id: 5, 
      codigo: "INS-3020", 
      descripcion: "Kit de instrumental quirúrgico acero inoxidable", 
      precio: 450.00, 
      stock: 10,
      categoria: "Instrumental",
      imagen: "https://via.placeholder.com/100",
      disponible: true
    },
    { 
      id: 6, 
      codigo: "MOB-4123", 
      descripcion: "Camilla hospitalaria eléctrica multifuncional", 
      precio: 2200.00, 
      stock: 3,
      categoria: "Mobiliario",
      imagen: "https://via.placeholder.com/100",
      disponible: true
    }
  ]);
  
  // Estado para filtros del inventario
  const [filtro, setFiltro] = useState({
    busqueda: "",
    categoria: "todas"
  });
  
  // Estado para visualización del diálogo de inventario
  const [inventarioDialogOpen, setInventarioDialogOpen] = useState(false);
  
  // Función para filtrar el inventario
  const inventarioFiltrado = inventario.filter(producto => {
    // Filtrar por término de búsqueda
    const coincideBusqueda = 
      producto.codigo.toLowerCase().includes(filtro.busqueda.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(filtro.busqueda.toLowerCase());
    
    // Filtrar por categoría
    const coincideCategoria = 
      filtro.categoria === "todas" || 
      producto.categoria === filtro.categoria;
    
    return coincideBusqueda && coincideCategoria;
  });
  
  // Función para agregar producto desde inventario a la proforma
  const agregarProductoDesdeInventario = (producto) => {
    // Verificar si el producto ya está en la proforma
    const productoExistente = items.find(item => item.codigo === producto.codigo);
    
    if (productoExistente) {
      // Incrementar cantidad si ya existe
      const itemsActualizados = items.map(item => {
        if (item.codigo === producto.codigo) {
          return {
            ...item,
            cantidad: item.cantidad + 1,
            total: (item.cantidad + 1) * item.precioUnitario * (1 - item.descuento/100)
          };
        }
        return item;
      });
      setItems(itemsActualizados);
    } else {
      // Agregar como nuevo item si no existe
      const nuevoItem = {
        id: Date.now(),
        codigo: producto.codigo,
        descripcion: producto.descripcion,
        cantidad: 1,
        precioUnitario: producto.precio,
        descuento: 0,
        total: producto.precio
      };
      setItems([...items, nuevoItem]);
    }
    
    // Actualizar totales
    calcularTotales([...items, { 
      id: Date.now(), 
      codigo: producto.codigo, 
      descripcion: producto.descripcion, 
      cantidad: 1, 
      precioUnitario: producto.precio, 
      descuento: 0, 
      total: producto.precio 
    }]);
  };
  
  // Función para agregar un ítem manualmente
  const agregarItemManual = () => {
    const nuevoItem = {
      id: Date.now(),
      codigo: "",
      descripcion: "",
      cantidad: 1,
      precioUnitario: 0,
      descuento: 0,
      total: 0
    };
    const itemsActualizados = [...items, nuevoItem];
    setItems(itemsActualizados);
    calcularTotales(itemsActualizados);
  };
  
  // Función para actualizar un ítem
  const actualizarItem = (id, campo, valor) => {
    const itemsActualizados = items.map(item => {
      if (item.id === id) {
        const itemActualizado = { ...item, [campo]: valor };
        
        // Recalcular el total
        if (campo === 'cantidad' || campo === 'precioUnitario' || campo === 'descuento') {
          const cantidad = campo === 'cantidad' ? valor : item.cantidad;
          const precioUnitario = campo === 'precioUnitario' ? valor : item.precioUnitario;
          const descuento = campo === 'descuento' ? valor : item.descuento;
          
          itemActualizado.total = cantidad * precioUnitario * (1 - descuento/100);
        }
        
        return itemActualizado;
      }
      return item;
    });
    
    setItems(itemsActualizados);
    calcularTotales(itemsActualizados);
  };
  
  // Función para eliminar un ítem
  const eliminarItem = (id) => {
    const itemsActualizados = items.filter(item => item.id !== id);
    setItems(itemsActualizados);
    calcularTotales(itemsActualizados);
  };
  
  // Función para calcular los totales
  const calcularTotales = (itemsActuales) => {
    const subtotal = itemsActuales.reduce((sum, item) => sum + item.total, 0);
    const descuento = 0; // Se puede implementar un descuento general
    const iva = (subtotal - descuento) * 0.12;
    const total = subtotal - descuento + iva;
    
    setProforma(prev => ({
      ...prev,
      subtotal,
      descuento,
      iva,
      total
    }));
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <FileText className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nueva Proforma</h1>
            <p className="text-sm text-gray-500">Cree y envíe una proforma detallada a sus clientes</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={
            proforma.estado === "Borrador" ? "outline" : 
            proforma.estado === "Enviada" ? "secondary" : 
            proforma.estado === "Aprobada" ? "success" : 
            "destructive"
          }>
            {proforma.estado}
          </Badge>
          <Select value={proforma.estado} onValueChange={(value) => setProforma({...proforma, estado: value})}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Borrador">Borrador</SelectItem>
              <SelectItem value="Enviada">Enviada</SelectItem>
              <SelectItem value="Aprobada">Aprobada</SelectItem>
              <SelectItem value="Rechazada">Rechazada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        <div className="md:col-span-5 p-6 bg-white rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-500" />
            Información del Cliente
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="clienteNombre">Empresa/Institución</Label>
              <Input 
                id="clienteNombre" 
                value={proforma.clienteNombre} 
                onChange={(e) => setProforma({...proforma, clienteNombre: e.target.value})}
                placeholder="Nombre del cliente o empresa"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="clienteRuc">RUC</Label>
                <Input 
                  id="clienteRuc" 
                  value={proforma.clienteRuc} 
                  onChange={(e) => setProforma({...proforma, clienteRuc: e.target.value})}
                  placeholder="RUC del cliente"
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="clienteContacto">Persona de Contacto</Label>
                <Input 
                  id="clienteContacto" 
                  value={proforma.clienteContacto} 
                  onChange={(e) => setProforma({...proforma, clienteContacto: e.target.value})}
                  placeholder="Nombre de la persona de contacto"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="clienteTelefono">Teléfono</Label>
                <Input 
                  id="clienteTelefono" 
                  value={proforma.clienteTelefono} 
                  onChange={(e) => setProforma({...proforma, clienteTelefono: e.target.value})}
                  placeholder="Teléfono de contacto"
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="clienteEmail">Email</Label>
                <Input 
                  id="clienteEmail" 
                  value={proforma.clienteEmail} 
                  onChange={(e) => setProforma({...proforma, clienteEmail: e.target.value})}
                  placeholder="Email de contacto"
                  type="email"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="clienteDireccion">Dirección</Label>
              <Input 
                id="clienteDireccion" 
                value={proforma.clienteDireccion} 
                onChange={(e) => setProforma({...proforma, clienteDireccion: e.target.value})}
                placeholder="Dirección del cliente"
              />
            </div>
          </div>
        </div>
        
        <div className="md:col-span-4 p-6 bg-white rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-500" />
            Detalles de la Proforma
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="proformaNumero">Número</Label>
                <Input 
                  id="proformaNumero" 
                  value={proforma.numero} 
                  onChange={(e) => setProforma({...proforma, numero: e.target.value})}
                  placeholder="Número de proforma"
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="proformaFecha">Fecha</Label>
                <Input 
                  id="proformaFecha" 
                  value={proforma.fecha} 
                  onChange={(e) => setProforma({...proforma, fecha: e.target.value})}
                  type="date"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="proformaVigencia">Vigencia (días)</Label>
                <Input 
                  id="proformaVigencia" 
                  value={proforma.vigencia} 
                  onChange={(e) => setProforma({...proforma, vigencia: e.target.value})}
                  type="number"
                  min="1"
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="proformaVendedor">Vendedor</Label>
                <Input 
                  id="proformaVendedor" 
                  value={proforma.vendedor} 
                  onChange={(e) => setProforma({...proforma, vendedor: e.target.value})}
                  placeholder="Nombre del vendedor"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3 p-6 bg-white rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Building className="h-5 w-5 mr-2 text-blue-500" />
            Condiciones Comerciales
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="formaPago">Forma de Pago</Label>
              <Select value={proforma.formaPago} onValueChange={(value) => setProforma({...proforma, formaPago: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar forma de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Contado">Contado</SelectItem>
                  <SelectItem value="Crédito 30 días">Crédito 30 días</SelectItem>
                  <SelectItem value="Crédito 60 días">Crédito 60 días</SelectItem>
                  <SelectItem value="Crédito 90 días">Crédito 90 días</SelectItem>
                  <SelectItem value="50% anticipado, 50% contra entrega">50% anticipado, 50% contra entrega</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="tiempoEntrega">Tiempo de Entrega</Label>
              <Select value={proforma.tiempoEntrega} onValueChange={(value) => setProforma({...proforma, tiempoEntrega: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tiempo de entrega" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inmediata">Inmediata</SelectItem>
                  <SelectItem value="24 horas">24 horas</SelectItem>
                  <SelectItem value="48 horas">48 horas</SelectItem>
                  <SelectItem value="3-5 días hábiles">3-5 días hábiles</SelectItem>
                  <SelectItem value="1-2 semanas">1-2 semanas</SelectItem>
                  <SelectItem value="3-4 semanas">3-4 semanas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="incluirIva">Incluir IVA (12%)</Label>
                <Switch id="incluirIva" defaultChecked />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sección de productos */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-blue-500" />
            Productos y Servicios
          </h2>
          
          <div className="flex space-x-2">
            <Dialog open={inventarioDialogOpen} onOpenChange={setInventarioDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Desde Inventario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Seleccionar Productos del Inventario</DialogTitle>
                  <DialogDescription>
                    Busque y seleccione los productos para agregar a la proforma
                  </DialogDescription>
                </DialogHeader>
                
                <div className="my-4 flex items-center space-x-2">
                  <Input 
                    placeholder="Buscar por código o descripción..." 
                    value={filtro.busqueda} 
                    onChange={(e) => setFiltro({...filtro, busqueda: e.target.value})} 
                    className="flex-1"
                  />
                  <Select value={filtro.categoria} onValueChange={(value) => setFiltro({...filtro, categoria: value})}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas las categorías</SelectItem>
                      <SelectItem value="Equipos Médicos">Equipos Médicos</SelectItem>
                      <SelectItem value="Laboratorio">Laboratorio</SelectItem>
                      <SelectItem value="Instrumental">Instrumental</SelectItem>
                      <SelectItem value="Mobiliario">Mobiliario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
                  {inventarioFiltrado.map(producto => (
                    <div key={producto.id} className="border rounded-md p-3 flex flex-col">
                      <div className="flex items-center mb-2">
                        <img src={producto.imagen} alt={producto.descripcion} className="w-12 h-12 object-cover rounded mr-3" />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{producto.descripcion}</h4>
                          <p className="text-xs text-gray-500">{producto.codigo}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-auto">
                        <div>
                          <span className="font-bold text-blue-600">${producto.precio.toFixed(2)}</span>
                          <span className="text-xs text-gray-500 ml-2">Stock: {producto.stock}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            agregarProductoDesdeInventario(producto);
                            setInventarioDialogOpen(false);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInventarioDialogOpen(false)}>Cancelar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="sm" onClick={agregarItemManual}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Ítem
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-[80px] text-right">Cant.</TableHead>
                <TableHead className="w-[120px] text-right">P. Unitario</TableHead>
                <TableHead className="w-[80px] text-right">Desc. %</TableHead>
                <TableHead className="w-[120px] text-right">Total</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                    No hay productos agregados. Use los botones superiores para agregar.
                  </TableCell>
                </TableRow>
              ) : (
                items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input 
                        value={item.codigo} 
                        onChange={(e) => actualizarItem(item.id, 'codigo', e.target.value)}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={item.descripcion} 
                        onChange={(e) => actualizarItem(item.id, 'descripcion', e.target.value)}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input 
                        type="number" 
                        value={item.cantidad} 
                        onChange={(e) => actualizarItem(item.id, 'cantidad', Number(e.target.value))}
                        className="h-8 w-16 text-right ml-auto"
                        min="1"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input 
                        type="number" 
                        value={item.precioUnitario} 
                        onChange={(e) => actualizarItem(item.id, 'precioUnitario', Number(e.target.value))}
                        className="h-8 w-24 text-right ml-auto"
                        step="0.01"
                        min="0"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input 
                        type="number" 
                        value={item.descuento} 
                        onChange={(e) => actualizarItem(item.id, 'descuento', Number(e.target.value))}
                        className="h-8 w-16 text-right ml-auto"
                        step="0.1"
                        min="0"
                        max="100"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => eliminarItem(item.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Observaciones</h2>
          <Textarea 
            value={proforma.observaciones} 
            onChange={(e) => setProforma({...proforma, observaciones: e.target.value})}
            placeholder="Ingrese observaciones o condiciones adicionales..."
            rows={5}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Resumen</h2>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">${proforma.subtotal.toFixed(2)}</span>
            </div>
            {proforma.descuento > 0 && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Descuento:</span>
                <span className="font-medium">-${proforma.descuento.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">IVA (12%):</span>
              <span className="font-medium">${proforma.iva.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-double border-b-2">
              <span className="text-lg font-bold">TOTAL:</span>
              <span className="text-lg font-bold text-blue-700">${proforma.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium">Tiempo de Entrega:</span>
              <span>{proforma.tiempoEntrega}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium">Forma de Pago:</span>
              <span>{proforma.formaPago}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Vigencia:</span>
              <span>{proforma.vigencia} días</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <div>
          <Button variant="outline" className="mr-2">
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" /> Guardar Borrador
          </Button>
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
            <Send className="h-4 w-4 mr-2" /> Enviar Proforma
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Testing22;