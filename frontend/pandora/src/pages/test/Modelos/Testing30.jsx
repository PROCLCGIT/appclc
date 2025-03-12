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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  AlertCircle,
  ArrowRight,
  CalendarIcon,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Copy,
  CreditCard,
  Download,
  Edit,
  File,
  FileEdit,
  FileText,
  Filter,
  HelpCircle,
  Loader2,
  Mail,
  MapPin,
  MoreHorizontal,
  Package,
  Pencil,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings,
  Share,
  ShoppingCart,
  Trash,
  User,
  X
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";

// Sistema Integral de Generación y Seguimiento de Proformas Médicas

// Mock data: Productos
const productos = [
  {
    id: 1,
    codigo: "ECG-2025-M",
    nombre: "Electrocardiograma Digital de 12 Canales",
    categoria: "Equipos de Diagnóstico",
    descripcion: "Sistema avanzado para diagnóstico cardíaco con conectividad DICOM y análisis automático.",
    precio: 4850.00,
    impuesto: 12,
    descuento_maximo: 10,
    stock: 5,
    unidad: "Unidad",
    imagen: "https://via.placeholder.com/150",
    estado: "activo"
  },
  {
    id: 2,
    codigo: "DEFIB-500",
    nombre: "Desfibrilador Externo Automático",
    categoria: "Equipos de Emergencia",
    descripcion: "DEA con tecnología bifásica y pantalla de alta resolución. Incluye electrodos adulto y pediátrico.",
    precio: 3750.00,
    impuesto: 12,
    descuento_maximo: 8,
    stock: 3,
    unidad: "Unidad",
    imagen: "https://via.placeholder.com/150",
    estado: "activo"
  },
  {
    id: 3,
    codigo: "ECOX-900",
    nombre: "Ecógrafo Doppler Color 4D",
    categoria: "Equipos de Diagnóstico",
    descripcion: "Sistema de ultrasonido de última generación con tecnología 4D y doppler color avanzado.",
    precio: 35000.00,
    impuesto: 12,
    descuento_maximo: 5,
    stock: 2,
    unidad: "Unidad",
    imagen: "https://via.placeholder.com/150",
    estado: "activo"
  },
  {
    id: 4,
    codigo: "VENT-ICU",
    nombre: "Ventilador Mecánico para UCI",
    categoria: "Equipos de Cuidados Intensivos",
    descripcion: "Ventilador mecánico multimodal para pacientes adultos, pediátricos y neonatales.",
    precio: 22500.00,
    impuesto: 12,
    descuento_maximo: 5,
    stock: 1,
    unidad: "Unidad",
    imagen: "https://via.placeholder.com/150",
    estado: "activo"
  },
  {
    id: 5,
    codigo: "MONPM-450",
    nombre: "Monitor de Paciente Multiparamétrico",
    categoria: "Monitoreo de Pacientes",
    descripcion: "Monitor de signos vitales con pantalla táctil de 15\" y medición de ECG, SpO2, NIBP, IBP, temperatura y respiración.",
    precio: 8750.00,
    impuesto: 12,
    descuento_maximo: 10,
    stock: 7,
    unidad: "Unidad",
    imagen: "https://via.placeholder.com/150",
    estado: "activo"
  },
  {
    id: 6,
    codigo: "SERV-INST",
    nombre: "Instalación y Puesta en Marcha",
    categoria: "Servicios",
    descripcion: "Servicio de instalación, configuración inicial y capacitación básica para equipos médicos.",
    precio: 750.00,
    impuesto: 12,
    descuento_maximo: 0,
    stock: null,
    unidad: "Servicio",
    imagen: "https://via.placeholder.com/150",
    estado: "activo"
  }
];

// Mock data: Clientes
const clientes = [
  {
    id: 1,
    codigo: "HGM-001",
    nombre: "Hospital General Metropolitano",
    tipo: "Hospital Público",
    ruc: "1790845632001",
    direccion: "Av. De los Shyris y Eloy Alfaro, Quito",
    telefono: "(593) 2-3981600",
    email: "info@hgm.gob.ec",
    contacto: "Dr. Fernando Espinoza",
    cargo_contacto: "Director de Adquisiciones",
    email_contacto: "f.espinoza@hgm.gob.ec",
    telefono_contacto: "(593) 98-765-4321",
    notas: "Cliente institucional con procesos de compra regulados por SERCOP",
    avatar: null
  },
  {
    id: 2,
    codigo: "CSM-002",
    nombre: "Clínica Santa María",
    tipo: "Clínica Privada",
    ruc: "1792654789001",
    direccion: "Av. América y Mariana de Jesús, Quito",
    telefono: "(593) 2-2507800",
    email: "administracion@clinicasm.med.ec",
    contacto: "Dra. Carolina Suárez",
    cargo_contacto: "Gerente de Operaciones",
    email_contacto: "c.suarez@clinicasm.med.ec",
    telefono_contacto: "(593) 98-123-4567",
    notas: "Cliente de alta prioridad, solicita siempre equipos de última generación",
    avatar: null
  },
  {
    id: 3,
    codigo: "LABVU-003",
    nombre: "Laboratorios Valle Unido",
    tipo: "Laboratorio Clínico",
    ruc: "1793546782001",
    direccion: "Av. 10 de Agosto y República, Quito",
    telefono: "(593) 2-2234567",
    email: "compras@labvu.com.ec",
    contacto: "Ing. Roberto Mendoza",
    cargo_contacto: "Jefe de Compras",
    email_contacto: "r.mendoza@labvu.com.ec",
    telefono_contacto: "(593) 99-876-5432",
    notas: "",
    avatar: null
  },
  {
    id: 4,
    codigo: "HPDN-004",
    nombre: "Hospital Pediátrico Del Norte",
    tipo: "Hospital Especializado",
    ruc: "1795678432001",
    direccion: "Av. Galo Plaza Lasso y Real Audiencia, Quito",
    telefono: "(593) 2-3456789",
    email: "adquisiciones@hpdn.gob.ec",
    contacto: "Dra. Mariana López",
    cargo_contacto: "Directora Administrativa",
    email_contacto: "m.lopez@hpdn.gob.ec",
    telefono_contacto: "(593) 99-345-6789",
    notas: "Especializado en equipamiento pediátrico",
    avatar: null
  }
];

// Componente principal
const Testing30 = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState("cliente");
  const [proforma, setProforma] = useState({
    id: "PRO-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000),
    fecha: new Date(),
    validez: 30, // días
    clienteId: null,
    cliente: null,
    items: [],
    subtotal: 0,
    impuestos: 0,
    total: 0,
    condiciones: {
      formaPago: "50% anticipo, 50% contra entrega",
      tiempoEntrega: "45 días calendario",
      garantia: "12 meses",
      incluirInstalacion: true,
      notas: "Esta proforma está sujeta a cambios sin previo aviso. Los precios no incluyen costos de transporte a menos que se especifique lo contrario."
    }
  });
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [searchCliente, setSearchCliente] = useState("");
  const [searchProducto, setSearchProducto] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [productDiscount, setProductDiscount] = useState(0);
  const [productNotes, setProductNotes] = useState("");
  const [showClienteDialog, setShowClienteDialog] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Funciones utilitarias
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date) => {
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
  };

  // Funciones para la selección de cliente
  const handleSelectCliente = (cliente) => {
    setProforma({
      ...proforma,
      clienteId: cliente.id,
      cliente: cliente
    });
    setShowClienteDialog(false);
  };

  const filteredClientes = searchCliente
    ? clientes.filter(cliente => 
        cliente.nombre.toLowerCase().includes(searchCliente.toLowerCase()) ||
        cliente.codigo.toLowerCase().includes(searchCliente.toLowerCase()) ||
        cliente.ruc.includes(searchCliente))
    : clientes;

  // Funciones para los productos
  const filteredProductos = searchProducto
    ? productos.filter(producto => 
        producto.nombre.toLowerCase().includes(searchProducto.toLowerCase()) ||
        producto.codigo.toLowerCase().includes(searchProducto.toLowerCase()) ||
        producto.categoria.toLowerCase().includes(searchProducto.toLowerCase()))
    : productos;

  const calculateProductSubtotal = (product, quantity, discount) => {
    if (!product) return 0;
    return product.precio * quantity * (1 - discount/100);
  };

  const addProductToProforma = () => {
    if (!selectedProduct) return;
    
    const subtotal = calculateProductSubtotal(selectedProduct, productQuantity, productDiscount);
    const impuesto = subtotal * (selectedProduct.impuesto/100);
    
    const newItem = {
      id: Date.now(),
      producto: selectedProduct,
      cantidad: productQuantity,
      descuento: productDiscount,
      notas: productNotes,
      subtotal: subtotal,
      impuesto: impuesto
    };
    
    const updatedItems = [...proforma.items, newItem];
    
    // Recalcular totales
    const newSubtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const newImpuestos = updatedItems.reduce((sum, item) => sum + item.impuesto, 0);
    const newTotal = newSubtotal + newImpuestos;
    
    setProforma({
      ...proforma,
      items: updatedItems,
      subtotal: newSubtotal,
      impuestos: newImpuestos,
      total: newTotal
    });
    
    // Resetear formulario
    setSelectedProduct(null);
    setProductQuantity(1);
    setProductDiscount(0);
    setProductNotes("");
    
    // Mostrar mensaje de éxito
    setSuccessMessage("Producto agregado correctamente");
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };

  const removeProductFromProforma = (itemId) => {
    const updatedItems = proforma.items.filter(item => item.id !== itemId);
    
    // Recalcular totales
    const newSubtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const newImpuestos = updatedItems.reduce((sum, item) => sum + item.impuesto, 0);
    const newTotal = newSubtotal + newImpuestos;
    
    setProforma({
      ...proforma,
      items: updatedItems,
      subtotal: newSubtotal,
      impuestos: newImpuestos,
      total: newTotal
    });
  };

  // Función para actualizar condiciones
  const updateCondiciones = (field, value) => {
    setProforma({
      ...proforma,
      condiciones: {
        ...proforma.condiciones,
        [field]: value
      }
    });
  };

  // Función para guardar/enviar proforma
  const handleSaveProforma = (isFinal = false) => {
    setIsLoading(true);
    
    // Simular llamada API
    setTimeout(() => {
      setIsLoading(false);
      
      if (isFinal) {
        setSuccessMessage("¡Proforma enviada correctamente al cliente!");
      } else {
        setSuccessMessage("Proforma guardada como borrador");
      }
      
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    }, 1500);
  };

  // Generar PDF
  const handleGeneratePDF = () => {
    setIsLoading(true);
    
    // Simular generación de PDF
    setTimeout(() => {
      setIsLoading(false);
      alert("PDF generado correctamente");
    }, 1500);
  };

  // Obtener iniciales para avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Validar si se puede continuar
  const canContinueToProductos = !!proforma.cliente;
  const canContinueToCondiciones = proforma.items.length > 0;
  const canFinalize = proforma.items.length > 0;

  // Obtener fecha de expiración
  const getExpirationDate = () => {
    const expirationDate = new Date(proforma.fecha);
    expirationDate.setDate(expirationDate.getDate() + proforma.validez);
    return formatDate(expirationDate);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nueva Proforma</h1>
          <p className="text-gray-500 mt-1">
            {proforma.id} · Creando el {formatDate(proforma.fecha)}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" onClick={() => handleSaveProforma(false)} disabled={isLoading || !canFinalize}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar borrador
          </Button>
          <Button variant="outline" onClick={handleGeneratePDF} disabled={isLoading || !canFinalize}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            Vista previa PDF
          </Button>
          <Button onClick={() => handleSaveProforma(true)} disabled={isLoading || !canFinalize}>
            <Send className="h-4 w-4 mr-2" />
            Finalizar y enviar
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {showSuccessAlert && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Check className="h-5 w-5 mr-2 text-green-600" />
            <span>{successMessage}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowSuccessAlert(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Pestañas principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b">
          <div className="flex">
            <TabsList className="mx-auto mb-0 mt-0 bg-white">
              <TabsTrigger 
                value="cliente" 
                className="relative rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <User className="h-4 w-4 mr-2" />
                Cliente
              </TabsTrigger>
              <TabsTrigger 
                value="productos" 
                className="relative rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                disabled={!canContinueToProductos}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Productos
              </TabsTrigger>
              <TabsTrigger 
                value="condiciones" 
                className="relative rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                disabled={!canContinueToCondiciones}
              >
                <FileText className="h-4 w-4 mr-2" />
                Condiciones
              </TabsTrigger>
              <TabsTrigger 
                value="resumen" 
                className="relative rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                disabled={!canContinueToCondiciones}
              >
                <FileEdit className="h-4 w-4 mr-2" />
                Resumen
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Panel de Cliente */}
        <TabsContent value="cliente" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Selección de Cliente</CardTitle>
              <CardDescription>
                Seleccione el cliente para el cual se generará esta proforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {proforma.cliente ? (
                // Cliente seleccionado
                <div>
                  <div className="flex items-start gap-4 mb-6">
                    <Avatar className="h-16 w-16 border-2 border-primary/10">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {getInitials(proforma.cliente.nombre)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{proforma.cliente.nombre}</h3>
                        <Badge variant="outline" className="ml-2">{proforma.cliente.tipo}</Badge>
                      </div>
                      <p className="text-gray-500">{proforma.cliente.codigo} · RUC: {proforma.cliente.ruc}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                          <span>{proforma.cliente.direccion}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                          <span>{proforma.cliente.telefono}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                          <span>{proforma.cliente.email}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-auto" 
                      onClick={() => setShowClienteDialog(true)}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1.5" />
                      Cambiar
                    </Button>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Información de Contacto</h4>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="contacto">Contacto</Label>
                          <Input 
                            id="contacto" 
                            value={proforma.cliente.contacto} 
                            className="mt-1" 
                            readOnly 
                          />
                        </div>
                        <div>
                          <Label htmlFor="cargo">Cargo</Label>
                          <Input 
                            id="cargo" 
                            value={proforma.cliente.cargo_contacto} 
                            className="mt-1" 
                            readOnly 
                          />
                        </div>
                        <div>
                          <Label htmlFor="email-contacto">Email</Label>
                          <Input 
                            id="email-contacto" 
                            value={proforma.cliente.email_contacto} 
                            className="mt-1" 
                            readOnly 
                          />
                        </div>
                        <div>
                          <Label htmlFor="telefono-contacto">Teléfono</Label>
                          <Input 
                            id="telefono-contacto" 
                            value={proforma.cliente.telefono_contacto} 
                            className="mt-1" 
                            readOnly 
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Notas</h4>
                      <Textarea 
                        className="h-40" 
                        placeholder="Agregar notas específicas para esta proforma..."
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // No hay cliente seleccionado
                <div className="text-center py-6">
                  <div className="bg-primary/5 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-primary/70" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Seleccione un cliente</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Para continuar con la creación de la proforma, debe seleccionar un cliente al cual se le generará la cotización.
                  </p>
                  <Button onClick={() => setShowClienteDialog(true)}>
                    <User className="h-4 w-4 mr-2" />
                    Seleccionar Cliente
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div></div>
              <Button 
                disabled={!canContinueToProductos} 
                onClick={() => setActiveTab("productos")}
              >
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Panel de Productos */}
        <TabsContent value="productos" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Productos y Servicios</CardTitle>
              <CardDescription>
                Agregue productos y servicios a la proforma, especificando cantidades y descuentos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Buscar y agregar productos */}
              <div className="bg-gray-50 border rounded-lg p-4">
                <h3 className="font-medium mb-3">Agregar producto o servicio</h3>
                
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nombre, código o categoría..."
                      className="pl-9"
                      value={searchProducto}
                      onChange={(e) => setSearchProducto(e.target.value)}
                    />
                  </div>
                  
                  <ScrollArea className="h-56 border rounded-md bg-white">
                    <div className="p-2">
                      {filteredProductos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <Package className="h-8 w-8 text-gray-300 mb-2" />
                          <p className="text-gray-500">No se encontraron productos con esos criterios</p>
                        </div>
                      ) : (
                        filteredProductos.map((producto) => (
                          <div
                            key={producto.id}
                            className={`p-3 rounded-md cursor-pointer border-l-2 hover:bg-gray-50 transition-colors mb-2 ${
                              selectedProduct?.id === producto.id 
                                ? 'border-l-primary bg-primary/5' 
                                : 'border-l-transparent'
                            }`}
                            onClick={() => setSelectedProduct(producto)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                  <img 
                                    src={producto.imagen} 
                                    alt={producto.nombre}
                                    className="w-full h-full object-cover rounded"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://via.placeholder.com/150?text=Sin+Imagen';
                                    }}
                                  />
                                </div>
                                <div>
                                  <p className="font-medium">{producto.nombre}</p>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>{producto.codigo}</span>
                                    <span className="text-gray-300">•</span>
                                    <span>{producto.categoria}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(producto.precio)}</p>
                                <div className="mt-1">
                                  <Badge variant="outline" className={`text-xs ${
                                    producto.stock > 3 
                                      ? 'bg-green-50 text-green-700 border-green-200' 
                                      : producto.stock > 0 
                                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                        : producto.stock === null
                                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                                          : 'bg-red-50 text-red-700 border-red-200'
                                  }`}>
                                    {producto.stock === null ? 'Servicio' : producto.stock > 0 ? `Stock: ${producto.stock}` : 'Sin stock'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>

                  {selectedProduct && (
                    <div className="border rounded-md p-4 bg-white">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium">{selectedProduct.nombre}</h4>
                          <p className="text-sm text-gray-500">{selectedProduct.codigo} - {selectedProduct.categoria}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="product-quantity">Cantidad</Label>
                          <Input
                            id="product-quantity"
                            type="number"
                            min="1"
                            className="mt-1"
                            value={productQuantity}
                            onChange={(e) => setProductQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="product-discount">
                            Descuento (%)
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-block ml-1 cursor-help">
                                    <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Descuento máximo: {selectedProduct.descuento_maximo}%</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Label>
                          <Input
                            id="product-discount"
                            type="number"
                            min="0"
                            max={selectedProduct.descuento_maximo}
                            className="mt-1"
                            value={productDiscount}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              setProductDiscount(Math.min(selectedProduct.descuento_maximo, Math.max(0, value)));
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor="product-price">Precio unitario</Label>
                          <Input
                            id="product-price"
                            className="mt-1 bg-gray-50"
                            value={formatCurrency(selectedProduct.precio)}
                            readOnly
                          />
                        </div>
                        <div>
                          <Label htmlFor="product-subtotal">Subtotal</Label>
                          <Input
                            id="product-subtotal"
                            className="mt-1 bg-gray-50"
                            value={formatCurrency(calculateProductSubtotal(selectedProduct, productQuantity, productDiscount))}
                            readOnly
                          />
                        </div>
                        <div className="md:col-span-4">
                          <Label htmlFor="product-notes">Notas adicionales</Label>
                          <Textarea
                            id="product-notes"
                            placeholder="Especificaciones, detalles o condiciones particulares..."
                            className="mt-1"
                            value={productNotes}
                            onChange={(e) => setProductNotes(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button onClick={addProductToProforma}>
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar a la proforma
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de productos agregados */}
              <div>
                <h3 className="font-medium mb-3">Productos y servicios en la proforma</h3>
                {proforma.items.length === 0 ? (
                  <div className="border rounded-lg p-8 text-center bg-gray-50">
                    <div className="mx-auto h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                      <ShoppingCart className="h-6 w-6 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-500 mb-1">No hay productos agregados</h4>
                    <p className="text-gray-500 text-sm mb-4">
                      Busque y agregue productos del catálogo para incluirlos en su proforma.
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40%]">Producto</TableHead>
                          <TableHead className="text-center">Cantidad</TableHead>
                          <TableHead className="text-right">Precio Unit.</TableHead>
                          <TableHead className="text-right">Desc.</TableHead>
                          <TableHead className="text-right">Impuesto</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {proforma.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.producto.nombre}</p>
                                <p className="text-xs text-gray-500">{item.producto.codigo} - {item.producto.categoria}</p>
                                {item.notas && <p className="text-xs text-gray-500 mt-1 italic">{item.notas}</p>}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{item.cantidad}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.producto.precio)}</TableCell>
                            <TableCell className="text-right">{item.descuento > 0 ? `${item.descuento}%` : '-'}</TableCell>
                            <TableCell className="text-right">{item.producto.impuesto}%</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                            <TableCell>
                              <div className="flex justify-end">
                                <Button variant="ghost" size="icon" onClick={() => removeProductFromProforma(item.id)}>
                                  <Trash className="h-4 w-4 text-gray-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Resumen de totales */}
              {proforma.items.length > 0 && (
                <div className="flex justify-end">
                  <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>{formatCurrency(proforma.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IVA:</span>
                      <span>{formatCurrency(proforma.impuestos)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(proforma.total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("cliente")}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Atrás
              </Button>
              <Button 
                disabled={!canContinueToCondiciones} 
                onClick={() => setActiveTab("condiciones")}
              >
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Panel de Condiciones */}
        <TabsContent value="condiciones" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Términos y Condiciones</CardTitle>
              <CardDescription>
                Establezca los términos comerciales y condiciones de la proforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="validez">Validez de la oferta (días)</Label>
                    <Input
                      id="validez"
                      type="number"
                      min="1"
                      className="mt-1"
                      value={proforma.validez}
                      onChange={(e) => setProforma({...proforma, validez: parseInt(e.target.value) || 30})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="formaPago">Forma de pago</Label>
                    <Select 
                      value={proforma.condiciones.formaPago} 
                      onValueChange={(value) => updateCondiciones('formaPago', value)}
                    >
                      <SelectTrigger id="formaPago" className="mt-1">
                        <SelectValue placeholder="Seleccionar forma de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Contado (100%)">Contado (100%)</SelectItem>
                        <SelectItem value="50% anticipo, 50% contra entrega">50% anticipo, 50% contra entrega</SelectItem>
                        <SelectItem value="30% anticipo, 70% contra entrega">30% anticipo, 70% contra entrega</SelectItem>
                        <SelectItem value="Crédito 30 días">Crédito 30 días</SelectItem>
                        <SelectItem value="Crédito 60 días">Crédito 60 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tiempoEntrega">Tiempo de entrega</Label>
                    <Select 
                      value={proforma.condiciones.tiempoEntrega} 
                      onValueChange={(value) => updateCondiciones('tiempoEntrega', value)}
                    >
                      <SelectTrigger id="tiempoEntrega" className="mt-1">
                        <SelectValue placeholder="Seleccionar tiempo de entrega" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inmediata">Inmediata</SelectItem>
                        <SelectItem value="15 días calendario">15 días calendario</SelectItem>
                        <SelectItem value="30 días calendario">30 días calendario</SelectItem>
                        <SelectItem value="45 días calendario">45 días calendario</SelectItem>
                        <SelectItem value="60 días calendario">60 días calendario</SelectItem>
                        <SelectItem value="90 días calendario">90 días calendario</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="garantia">Garantía</Label>
                    <Select 
                      value={proforma.condiciones.garantia} 
                      onValueChange={(value) => updateCondiciones('garantia', value)}
                    >
                      <SelectTrigger id="garantia" className="mt-1">
                        <SelectValue placeholder="Seleccionar garantía" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sin garantía">Sin garantía</SelectItem>
                        <SelectItem value="3 meses">3 meses</SelectItem>
                        <SelectItem value="6 meses">6 meses</SelectItem>
                        <SelectItem value="12 meses">12 meses</SelectItem>
                        <SelectItem value="24 meses">24 meses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="incluirInstalacion" 
                      checked={proforma.condiciones.incluirInstalacion}
                      onCheckedChange={(checked) => updateCondiciones('incluirInstalacion', checked)}
                    />
                    <label
                      htmlFor="incluirInstalacion"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Los precios incluyen instalación
                    </label>
                  </div>
                  
                  <div>
                    <Label htmlFor="notas">Notas y condiciones adicionales</Label>
                    <Textarea
                      id="notas"
                      className="mt-1"
                      rows={10}
                      value={proforma.condiciones.notas}
                      onChange={(e) => updateCondiciones('notas', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("productos")}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Atrás
              </Button>
              <Button onClick={() => setActiveTab("resumen")}>
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Panel de Resumen */}
        <TabsContent value="resumen" className="pt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Resumen de la Proforma</CardTitle>
                  <CardDescription>
                    Revise los detalles de la proforma antes de finalizar.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-white p-8 border-t">
                {/* Cabecera de la proforma */}
                <div className="flex flex-col md:flex-row justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">PROFORMA</h2>
                    <p className="text-gray-600 mt-1">{proforma.id}</p>
                    <p className="text-gray-500 mt-1">Fecha: {formatDate(proforma.fecha)}</p>
                    <p className="text-gray-500">Válida hasta: {getExpirationDate()}</p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <div className="h-16 w-16 bg-primary rounded-lg flex items-center justify-center mb-2 ml-auto">
                      <CircleDollarSign className="h-8 w-8 text-white" />
                    </div>
                    <p className="font-bold text-gray-900">Su Empresa S.A.</p>
                    <p className="text-gray-500 text-sm">Av. 10 de Agosto y República, Quito</p>
                    <p className="text-gray-500 text-sm">Ecuador</p>
                    <p className="text-gray-500 text-sm">info@suempresa.com</p>
                    <p className="text-gray-500 text-sm">+593 2-123-4567</p>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Información del Cliente */}
                {proforma.cliente && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Cliente</h3>
                      <p className="font-medium">{proforma.cliente.nombre}</p>
                      <p className="text-gray-600">RUC: {proforma.cliente.ruc}</p>
                      <p className="text-gray-600">{proforma.cliente.direccion}</p>
                      <p className="text-gray-600">{proforma.cliente.telefono}</p>
                      <p className="text-gray-600">{proforma.cliente.email}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Contacto</h3>
                      <p className="font-medium">{proforma.cliente.contacto}</p>
                      <p className="text-gray-600">{proforma.cliente.cargo_contacto}</p>
                      <p className="text-gray-600">{proforma.cliente.email_contacto}</p>
                      <p className="text-gray-600">{proforma.cliente.telefono_contacto}</p>
                    </div>
                  </div>
                )}

                {/* Productos */}
                <div className="mb-8">
                  <h3 className="font-medium text-gray-900 mb-3">Productos y servicios</h3>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-medium">Descripción</TableHead>
                          <TableHead className="font-medium text-center">Cantidad</TableHead>
                          <TableHead className="font-medium text-right">Precio Unit.</TableHead>
                          <TableHead className="font-medium text-right">Desc.</TableHead>
                          <TableHead className="font-medium text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {proforma.items.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              No hay productos agregados a la proforma
                            </TableCell>
                          </TableRow>
                        ) : (
                          proforma.items.map((item) => (
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
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Totales */}
                <div className="flex justify-end mb-8">
                  <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>{formatCurrency(proforma.subtotal)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">IVA (12%):</span>
                      <span>{formatCurrency(proforma.impuestos)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between py-2 font-medium text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(proforma.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Términos y Condiciones */}
                <div className="mb-8">
                  <h3 className="font-medium text-gray-900 mb-3">Términos y condiciones</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p><span className="font-medium">Validez:</span> {proforma.validez} días</p>
                        <p><span className="font-medium">Forma de pago:</span> {proforma.condiciones.formaPago}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Tiempo de entrega:</span> {proforma.condiciones.tiempoEntrega}</p>
                        <p><span className="font-medium">Garantía:</span> {proforma.condiciones.garantia}</p>
                      </div>
                    </div>

                    {proforma.condiciones.incluirInstalacion && (
                      <p className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        Los precios incluyen instalación
                      </p>
                    )}

                    <p className="whitespace-pre-line">{proforma.condiciones.notas}</p>
                  </div>
                </div>

                {/* Firmas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                  <div className="border-t pt-2">
                    <p className="text-sm text-gray-500">Elaborado por</p>
                    <p className="font-medium">Representante Comercial</p>
                    <p className="text-sm">Su Empresa S.A.</p>
                  </div>
                  <div className="border-t pt-2">
                    <p className="text-sm text-gray-500">Aceptado por</p>
                    <p className="font-medium">_______________________</p>
                    <p className="text-sm">{proforma.cliente?.contacto || 'Cliente'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t">
              <Button variant="outline" onClick={() => setActiveTab("condiciones")}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Atrás
              </Button>
              <Button onClick={() => handleSaveProforma(true)} disabled={isLoading}>
                <Send className="h-4 w-4 mr-2" />
                Finalizar y enviar
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de selección de cliente */}
      <Dialog open={showClienteDialog} onOpenChange={setShowClienteDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Seleccionar Cliente</DialogTitle>
            <DialogDescription>
              Busque y seleccione un cliente existente para la proforma.
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-2">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, código o RUC..."
                className="pl-9"
                value={searchCliente}
                onChange={(e) => setSearchCliente(e.target.value)}
              />
            </div>
            
            <ScrollArea className="h-96 border rounded-md">
              <div className="p-2">
                {filteredClientes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-gray-500">No se encontraron clientes con esos criterios</p>
                  </div>
                ) : (
                  filteredClientes.map((cliente) => (
                    <div
                      key={cliente.id}
                      className="p-3 rounded-md cursor-pointer hover:bg-gray-50 transition-colors mb-2 border"
                      onClick={() => handleSelectCliente(cliente)}
                    >
                      <div className="flex gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(cliente.nombre)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{cliente.nombre}</p>
                              <p className="text-xs text-gray-500">{cliente.codigo} · RUC: {cliente.ruc}</p>
                            </div>
                            <Badge variant="outline">{cliente.tipo}</Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 text-xs text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{cliente.direccion}</span>
                            </div>
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              <span>{cliente.email}</span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              <span>{cliente.telefono}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClienteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Testing30;