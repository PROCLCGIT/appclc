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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertCircle,
  ArrowRight,
  Calculator,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  Download,
  Edit,
  FileText,
  HelpCircle,
  Image,
  Info,
  Languages,
  LayoutGrid,
  List,
  Loader2,
  Mail,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Percent,
  Plus,
  PlusCircle,
  Printer,
  Save,
  Search,
  Send,
  Settings,
  Share,
  ShoppingCart,
  Tag,
  Trash2,
  User,
  Users,
  X
} from "lucide-react";

// Modelo 2: Editor de Proformas con múltiples secciones

// Mock data
const clientesData = [
  { id: 1, nombre: "Hospital General Metropolitano", email: "compras@hgm.org", telefono: "(593) 2-343-5566", direccion: "Av. De los Shyris y Eloy Alfaro, Quito" },
  { id: 2, nombre: "Clínica Santa María", email: "adquisiciones@clinicasm.com", telefono: "(593) 4-267-9900", direccion: "Cdla. Kennedy Norte, Guayaquil" },
  { id: 3, nombre: "Laboratorios Farmacéuticos Unidos", email: "proveedores@labfu.com", telefono: "(593) 2-398-7700", direccion: "Parque Industrial, Vía a Daule Km 10.5, Guayaquil" }
];

const productosData = [
  { id: 1, codigo: "MED-001", nombre: "Respirador Médico Avanzado", categoria: "Equipos", precio: 12500.00, unidad: "Unidad", impuesto: 12 },
  { id: 2, codigo: "LAB-032", nombre: "Microscopio Digital de Alta Precisión", categoria: "Laboratorio", precio: 8750.50, unidad: "Unidad", impuesto: 12 },
  { id: 3, codigo: "DIAG-103", nombre: "Sistema de Diagnóstico por Imágenes", categoria: "Diagnóstico", precio: 35250.75, unidad: "Unidad", impuesto: 12 },
  { id: 4, codigo: "CONS-054", nombre: "Kit de Material Quirúrgico Desechable", categoria: "Consumibles", precio: 450.25, unidad: "Kit", impuesto: 12 },
  { id: 5, codigo: "SERV-021", nombre: "Instalación y Capacitación", categoria: "Servicios", precio: 1200.00, unidad: "Servicio", impuesto: 12 }
];

// Main component
const Testing26 = () => {
  // States for form
  const [activeTab, setActiveTab] = useState("general");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    producto: null,
    cantidad: 1,
    descuento: 0,
    notas: ""
  });
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [terminos, setTerminos] = useState({
    validez: "30",
    formaPago: "50% anticipo, 50% contra entrega",
    tiempoEntrega: "45 días",
    garantia: "12 meses",
    incluyeInstalacion: true,
    notas: "Esta proforma no incluye costos de transporte a menos que se especifique lo contrario. Los precios están sujetos a cambio sin previo aviso."
  });
  
  // Filtered clients
  const clientesFiltrados = busquedaCliente 
    ? clientesData.filter(c => 
        c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) || 
        c.email.toLowerCase().includes(busquedaCliente.toLowerCase())
      ) 
    : clientesData;
    
  // Filtered products
  const productosFiltrados = busquedaProducto 
    ? productosData.filter(p => 
        p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) || 
        p.codigo.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
        p.categoria.toLowerCase().includes(busquedaProducto.toLowerCase())
      ) 
    : productosData;
  
  // Add item to proforma
  const agregarItem = () => {
    if (!currentItem.producto) return;
    
    const nuevoItem = {
      id: Date.now(),
      producto: currentItem.producto,
      cantidad: currentItem.cantidad,
      descuento: currentItem.descuento,
      notas: currentItem.notas,
      subtotal: calculateItemSubtotal(currentItem)
    };
    
    setItems([...items, nuevoItem]);
    setCurrentItem({
      producto: null,
      cantidad: 1,
      descuento: 0,
      notas: ""
    });
    setShowProductSelector(false);
  };
  
  // Remove item from proforma
  const eliminarItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  // Calculate subtotal for an item
  const calculateItemSubtotal = (item) => {
    if (!item.producto) return 0;
    const precio = item.producto.precio * item.cantidad;
    const descuento = precio * (item.descuento / 100);
    return precio - descuento;
  };
  
  // Calculate totals
  const calcularTotales = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const impuestos = subtotal * 0.12; // 12% IVA
    const total = subtotal + impuestos;
    
    return {
      subtotal,
      impuestos,
      total
    };
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Handle product selection
  const seleccionarProducto = (producto) => {
    setCurrentItem({
      ...currentItem,
      producto
    });
  };
  
  // Get next proforma number
  const getNumeroProforma = () => {
    return "PRO-2025-0076";
  };
  
  // Calculate totals
  const totales = calcularTotales();
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nueva Proforma</h1>
            <p className="text-gray-500 mt-1">
              {getNumeroProforma()} - {formatDate(new Date())}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Guardar borrador
            </Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Vista previa
            </Button>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Finalizar y enviar
            </Button>
          </div>
        </div>
      </div>

      {/* Pestañas principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 md:w-auto md:inline-grid">
          <TabsTrigger value="general">Información General</TabsTrigger>
          <TabsTrigger value="items">Productos y Servicios</TabsTrigger>
          <TabsTrigger value="terminos">Términos y Condiciones</TabsTrigger>
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
        </TabsList>

        {/* Contenido de Información General */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Información del Cliente
              </CardTitle>
              <CardDescription>
                Seleccione un cliente existente o ingrese información para un nuevo cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!clienteSeleccionado ? (
                <>
                  <div className="relative mb-6">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Buscar cliente por nombre o email..."
                      className="pl-9"
                      value={busquedaCliente}
                      onChange={(e) => setBusquedaCliente(e.target.value)}
                    />
                  </div>
                  
                  <ScrollArea className="h-72 border rounded-md">
                    <div className="p-4 space-y-4">
                      {clientesFiltrados.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                            <AlertCircle className="h-6 w-6 text-gray-500" />
                          </div>
                          <p className="text-gray-500 text-sm">No se encontraron clientes con esos criterios</p>
                          <Button variant="link" onClick={() => setBusquedaCliente("")}>
                            Mostrar todos los clientes
                          </Button>
                        </div>
                      ) : (
                        clientesFiltrados.map((cliente) => (
                          <div 
                            key={cliente.id} 
                            className="flex items-start p-4 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setClienteSeleccionado(cliente)}
                          >
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mr-4">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-grow">
                              <p className="font-medium">{cliente.nombre}</p>
                              <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                                  <span>{cliente.email}</span>
                                </div>
                                <div className="flex items-center">
                                  <Phone className="h-3.5 w-3.5 mr-1.5" />
                                  <span>{cliente.telefono}</span>
                                </div>
                                <div className="flex items-center md:col-span-2">
                                  <MapPin className="h-3.5 w-3.5 mr-1.5" />
                                  <span>{cliente.direccion}</span>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" className="ml-2" size="icon">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                  
                  <Separator />
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-3">¿No encuentra al cliente que busca?</p>
                    <Button>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Ingresar nuevo cliente
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{clienteSeleccionado.nombre}</h3>
                        <p className="text-gray-500">Cliente #CL-{clienteSeleccionado.id.toString().padStart(4, '0')}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setClienteSeleccionado(null)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Cambiar
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cliente-email">Email</Label>
                        <Input id="cliente-email" value={clienteSeleccionado.email} readOnly className="mt-1 bg-gray-50" />
                      </div>
                      <div>
                        <Label htmlFor="cliente-telefono">Teléfono</Label>
                        <Input id="cliente-telefono" value={clienteSeleccionado.telefono} readOnly className="mt-1 bg-gray-50" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cliente-direccion">Dirección</Label>
                        <Textarea 
                          id="cliente-direccion" 
                          value={clienteSeleccionado.direccion} 
                          readOnly 
                          className="mt-1 bg-gray-50"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="tipo-cliente">Tipo de cliente</Label>
                        <Select defaultValue="empresa">
                          <SelectTrigger id="tipo-cliente" className="mt-1">
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="empresa">Empresa</SelectItem>
                            <SelectItem value="gobierno">Institución gubernamental</SelectItem>
                            <SelectItem value="hospital">Hospital/Clínica</SelectItem>
                            <SelectItem value="laboratorio">Laboratorio</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="contacto-principal">Contacto principal</Label>
                        <Input id="contacto-principal" placeholder="Nombre completo del contacto" className="mt-1" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="ruc">RUC / Identificación fiscal</Label>
                        <Input id="ruc" placeholder="1792345678001" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="cargo-contacto">Cargo del contacto</Label>
                        <Input id="cargo-contacto" placeholder="Ej: Jefe de Adquisiciones" className="mt-1" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              {clienteSeleccionado && (
                <Button 
                  onClick={() => setActiveTab("items")}
                  className="ml-auto"
                >
                  Continuar
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Contenido de Productos y Servicios */}
        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
                Productos y Servicios
              </CardTitle>
              <CardDescription>
                Agregue los productos y servicios a incluir en la proforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lista de items actuales */}
              {items.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto / Servicio</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Precio</TableHead>
                        <TableHead className="text-right">Descuento</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.producto.nombre}</p>
                              <p className="text-xs text-gray-500">{item.producto.codigo} - {item.producto.categoria}</p>
                              {item.notas && <p className="text-xs text-gray-500 mt-1 italic">{item.notas}</p>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{item.cantidad}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.producto.precio)}</TableCell>
                          <TableCell className="text-right">{item.descuento}%</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => eliminarItem(item.id)}>
                              <Trash2 className="h-4 w-4 text-gray-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 bg-gray-50 rounded-lg border flex items-center justify-center">
                  <div className="text-center px-6">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No hay productos agregados</h3>
                    <p className="text-gray-500 mb-4">Comience añadiendo productos y servicios a su proforma.</p>
                  </div>
                </div>
              )}
              
              {/* Agregar nuevo item */}
              {!showProductSelector ? (
                <div className="flex justify-center">
                  <Button onClick={() => setShowProductSelector(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar producto o servicio
                  </Button>
                </div>
              ) : (
                <Card className="border-blue-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Seleccionar producto</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => setShowProductSelector(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Buscar por nombre, código o categoría..."
                        className="pl-9"
                        value={busquedaProducto}
                        onChange={(e) => setBusquedaProducto(e.target.value)}
                      />
                    </div>
                    
                    <ScrollArea className="h-48 border rounded-md">
                      <div className="p-2">
                        {productosFiltrados.map((producto) => (
                          <div
                            key={producto.id}
                            className={`p-3 rounded-md hover:bg-gray-50 cursor-pointer transition-colors ${
                              currentItem.producto?.id === producto.id ? 'bg-blue-50 border-blue-200 border' : ''
                            }`}
                            onClick={() => seleccionarProducto(producto)}
                          >
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">{producto.nombre}</p>
                                <p className="text-xs text-gray-500">{producto.codigo} - {producto.categoria}</p>
                              </div>
                              <p className="font-medium">{formatCurrency(producto.precio)}/{producto.unidad}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    {currentItem.producto && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                          <Label htmlFor="cantidad">Cantidad</Label>
                          <Input
                            id="cantidad"
                            type="number"
                            min="1"
                            className="mt-1"
                            value={currentItem.cantidad}
                            onChange={(e) => setCurrentItem({...currentItem, cantidad: parseInt(e.target.value) || 1})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="descuento">Descuento (%)</Label>
                          <Input
                            id="descuento"
                            type="number"
                            min="0"
                            max="100"
                            className="mt-1"
                            value={currentItem.descuento}
                            onChange={(e) => setCurrentItem({...currentItem, descuento: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="item-subtotal">Subtotal</Label>
                          <Input
                            id="item-subtotal"
                            className="mt-1 bg-gray-50"
                            value={formatCurrency(calculateItemSubtotal(currentItem))}
                            readOnly
                          />
                        </div>
                        <div className="md:col-span-3">
                          <Label htmlFor="notas">Notas adicionales</Label>
                          <Textarea
                            id="notas"
                            placeholder="Especificaciones, detalles o condiciones particulares..."
                            className="mt-1"
                            value={currentItem.notas}
                            onChange={(e) => setCurrentItem({...currentItem, notas: e.target.value})}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setShowProductSelector(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={agregarItem} 
                      disabled={!currentItem.producto}
                    >
                      Agregar a la proforma
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {/* Resumen de totales */}
              {items.length > 0 && (
                <div className="bg-gray-50 rounded-lg border p-4">
                  <h3 className="font-medium mb-3">Resumen</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(totales.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVA (12%):</span>
                      <span>{formatCurrency(totales.impuestos)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-lg pt-2 border-t mt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(totales.total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("general")}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Atrás
              </Button>
              <Button onClick={() => setActiveTab("terminos")} disabled={items.length === 0}>
                Continuar
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Contenido de Términos y Condiciones */}
        <TabsContent value="terminos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Términos y Condiciones
              </CardTitle>
              <CardDescription>
                Establezca los términos comerciales y condiciones de la proforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="validez">Validez de la oferta</Label>
                  <Select value={terminos.validez} onValueChange={(value) => setTerminos({...terminos, validez: value})}>
                    <SelectTrigger id="validez" className="mt-1">
                      <SelectValue placeholder="Seleccionar validez" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 días</SelectItem>
                      <SelectItem value="30">30 días</SelectItem>
                      <SelectItem value="45">45 días</SelectItem>
                      <SelectItem value="60">60 días</SelectItem>
                      <SelectItem value="90">90 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="forma-pago">Forma de pago</Label>
                  <Select value={terminos.formaPago} onValueChange={(value) => setTerminos({...terminos, formaPago: value})}>
                    <SelectTrigger id="forma-pago" className="mt-1">
                      <SelectValue placeholder="Seleccionar forma de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contado">Contado (100%)</SelectItem>
                      <SelectItem value="50% anticipo, 50% contra entrega">50% anticipo, 50% contra entrega</SelectItem>
                      <SelectItem value="30% anticipo, 70% contra entrega">30% anticipo, 70% contra entrega</SelectItem>
                      <SelectItem value="credito 30">Crédito 30 días</SelectItem>
                      <SelectItem value="credito 60">Crédito 60 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tiempo-entrega">Tiempo de entrega</Label>
                  <Select value={terminos.tiempoEntrega} onValueChange={(value) => setTerminos({...terminos, tiempoEntrega: value})}>
                    <SelectTrigger id="tiempo-entrega" className="mt-1">
                      <SelectValue placeholder="Seleccionar tiempo de entrega" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inmediata">Entrega inmediata</SelectItem>
                      <SelectItem value="15 días">15 días</SelectItem>
                      <SelectItem value="30 días">30 días</SelectItem>
                      <SelectItem value="45 días">45 días</SelectItem>
                      <SelectItem value="60 días">60 días</SelectItem>
                      <SelectItem value="90 días">90 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="garantia">Garantía</Label>
                  <Select value={terminos.garantia} onValueChange={(value) => setTerminos({...terminos, garantia: value})}>
                    <SelectTrigger id="garantia" className="mt-1">
                      <SelectValue placeholder="Seleccionar garantía" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sin garantia">Sin garantía</SelectItem>
                      <SelectItem value="3 meses">3 meses</SelectItem>
                      <SelectItem value="6 meses">6 meses</SelectItem>
                      <SelectItem value="12 meses">12 meses</SelectItem>
                      <SelectItem value="24 meses">24 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="incluye-instalacion" 
                    checked={terminos.incluyeInstalacion}
                    onCheckedChange={(checked) => setTerminos({...terminos, incluyeInstalacion: checked})}
                  />
                  <label
                    htmlFor="incluye-instalacion"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Los precios incluyen instalación y capacitación básica
                  </label>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notas-terminos">Notas y condiciones especiales</Label>
                <Textarea
                  id="notas-terminos"
                  className="mt-1"
                  rows={5}
                  value={terminos.notas}
                  onChange={(e) => setTerminos({...terminos, notas: e.target.value})}
                />
              </div>
              
              <Accordion type="single" collapsible className="bg-gray-50 rounded-lg border">
                <AccordionItem value="legal">
                  <AccordionTrigger className="px-4">Términos legales estándar</AccordionTrigger>
                  <AccordionContent className="px-4 text-sm text-gray-600 space-y-2">
                    <p>1. Los precios están sujetos a cambio sin previo aviso. La cotización tiene validez únicamente durante el período especificado.</p>
                    <p>2. Los valores expresados en esta proforma no constituyen un compromiso de venta. Los precios finales serán confirmados al momento de procesar el pedido.</p>
                    <p>3. Las cantidades, características y especificaciones de los productos/servicios están sujetas a disponibilidad al momento de la confirmación del pedido.</p>
                    <p>4. El tiempo de entrega es aproximado y puede variar dependiendo de factores externos como disponibilidad, importación, aduana y transporte.</p>
                    <p>5. La garantía cubre únicamente defectos de fabricación durante el período especificado y bajo condiciones normales de uso.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tax">
                  <AccordionTrigger className="px-4">Información tributaria</AccordionTrigger>
                  <AccordionContent className="px-4 text-sm text-gray-600 space-y-2">
                    <p>1. Todos los precios incluyen IVA del 12% a menos que se especifique lo contrario.</p>
                    <p>2. Para efectos de facturación, se requerirán los datos fiscales completos del cliente.</p>
                    <p>3. Las retenciones de impuestos serán responsabilidad del cliente según la normativa tributaria vigente.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("items")}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Atrás
              </Button>
              <Button onClick={() => setActiveTab("preview")}>
                Vista previa
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Contenido de Vista Previa */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Vista Previa de la Proforma
              </CardTitle>
              <CardDescription>
                Revise la proforma antes de finalizarla
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              {/* Vista previa de proforma */}
              <div className="p-6 border rounded-lg space-y-8">
                {/* Encabezado */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">PROFORMA</h2>
                    <p className="text-lg text-gray-600">{getNumeroProforma()}</p>
                    <p className="text-gray-500">Fecha: {formatDate(new Date())}</p>
                  </div>
                  <div className="text-right">
                    <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center mb-2 ml-auto">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium">Su Empresa S.A.</p>
                    <p className="text-xs text-gray-500">Dirección de la empresa</p>
                    <p className="text-xs text-gray-500">contacto@suempresa.com</p>
                    <p className="text-xs text-gray-500">(+593) 2-123-4567</p>
                  </div>
                </div>
                
                <Separator />
                
                {/* Información del cliente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Cliente</h3>
                    {clienteSeleccionado && (
                      <div>
                        <p className="font-medium">{clienteSeleccionado.nombre}</p>
                        <p className="text-sm text-gray-600">{clienteSeleccionado.direccion}</p>
                        <p className="text-sm text-gray-600">{clienteSeleccionado.email}</p>
                        <p className="text-sm text-gray-600">{clienteSeleccionado.telefono}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Detalles</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Validez:</span>
                        <span>{terminos.validez} días</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Forma de pago:</span>
                        <span>{terminos.formaPago}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tiempo de entrega:</span>
                        <span>{terminos.tiempoEntrega}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Garantía:</span>
                        <span>{terminos.garantia}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tabla de items */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Productos y Servicios</h3>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40%]">Descripción</TableHead>
                          <TableHead className="text-center">Cantidad</TableHead>
                          <TableHead className="text-right">Precio unitario</TableHead>
                          <TableHead className="text-right">Descuento</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.producto.nombre}</p>
                                <p className="text-xs text-gray-500">{item.producto.codigo}</p>
                                {item.notas && <p className="text-xs text-gray-500 mt-1 italic">{item.notas}</p>}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{item.cantidad}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.producto.precio)}</TableCell>
                            <TableCell className="text-right">{item.descuento > 0 ? `${item.descuento}%` : '-'}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                {/* Totales */}
                <div className="flex justify-end">
                  <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>{formatCurrency(totales.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IVA (12%):</span>
                      <span>{formatCurrency(totales.impuestos)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(totales.total)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Términos y condiciones */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Términos y Condiciones</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{terminos.incluyeInstalacion ? "✓ Los precios incluyen instalación y capacitación básica" : "✗ Los precios no incluyen instalación"}</p>
                    <p className="whitespace-pre-line">{terminos.notas}</p>
                  </div>
                </div>
                
                {/* Firmas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12">
                  <div className="border-t pt-2">
                    <p className="text-sm text-gray-500">Elaborado por</p>
                    <p className="font-medium">Nombre del vendedor</p>
                    <p className="text-sm">Asesor Comercial</p>
                  </div>
                  <div className="border-t pt-2">
                    <p className="text-sm text-gray-500">Aceptado por</p>
                    <p className="font-medium">_______________________</p>
                    <p className="text-sm">Cliente</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("terminos")}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Atrás
              </Button>
              <div className="flex gap-3">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Finalizar y enviar
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper components
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

const MapPin = (props) => (
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
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default Testing26;