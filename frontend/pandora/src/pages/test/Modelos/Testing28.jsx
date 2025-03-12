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
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  Calculator,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  Download,
  Edit,
  FileText,
  Globe,
  HelpCircle,
  Image,
  Info,
  Loader2,
  Mail,
  MoreHorizontal,
  Package,
  PackageCheck,
  PackageOpen,
  PackageX,
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
  Truck,
  Upload,
  User,
  Users,
  X
} from "lucide-react";

// Mock data
const initialData = {
  id: "PRO-2025-0089",
  fecha: new Date().toISOString(),
  cliente: {
    id: "CL-0052",
    nombre: "Hospital General Metropolitano",
    contacto: "Dra. Valentina Suárez",
    cargo: "Directora de Adquisiciones",
    email: "v.suarez@hgm.org.ec",
    telefono: "+593 2-394-5670",
    direccion: "Av. De los Shyris y Eloy Alfaro, Quito, Ecuador",
    ruc: "1791234567001"
  },
  productos: [],
  subtotal: 0,
  impuestos: 0,
  total: 0,
  condiciones: {
    validez: 30,
    formaPago: "50% anticipo, 50% contra entrega",
    tiempoEntrega: "45 días",
    garantia: "12 meses",
    incluirInstalacion: true,
    incluirCapacitacion: true,
    notas: "Los precios pueden variar según cambios en tasas de importación. Esta proforma no incluye costos de transporte a menos que se especifique lo contrario."
  },
  estado: "borrador" // borrador, enviada, aprobada, rechazada
};

// Catálogo de productos
const catalogo = [
  {
    id: "EQUIP-001",
    codigo: "ECG-350",
    nombre: "Electrocardiógrafo Digital de 12 Canales",
    descripcion: "Dispositivo médico avanzado para registro de actividad eléctrica del corazón. Incluye software de interpretación automática y conectividad DICOM.",
    categoria: "Equipos de Diagnóstico",
    precio: 4850.00,
    unidad: "Unidad",
    garantia: "24 meses",
    procedencia: "Alemania",
    imagen: "https://via.placeholder.com/100",
    disponibilidad: "En stock"
  },
  {
    id: "EQUIP-002",
    codigo: "DEFIB-500",
    nombre: "Desfibrilador Externo Automático",
    descripcion: "Desfibrilador con tecnología bifásica, pantalla LCD de alta resolución y guía de voz en español. Incluye electrodos adulto/pediátrico y batería de larga duración.",
    categoria: "Equipos de Emergencia",
    precio: 3250.75,
    unidad: "Unidad",
    garantia: "24 meses",
    procedencia: "Estados Unidos",
    imagen: "https://via.placeholder.com/100",
    disponibilidad: "En stock"
  },
  {
    id: "EQUIP-003",
    codigo: "VENT-700",
    nombre: "Ventilador Mecánico de Cuidados Intensivos",
    descripcion: "Ventilador de última generación con modos de ventilación avanzados para pacientes adultos, pediátricos y neonatales. Incluye sistema de monitoreo de parámetros respiratorios.",
    categoria: "Equipos de Cuidados Intensivos",
    precio: 19500.00,
    unidad: "Unidad",
    garantia: "36 meses",
    procedencia: "Suiza",
    imagen: "https://via.placeholder.com/100",
    disponibilidad: "Bajo pedido (30 días)"
  },
  {
    id: "CONS-001",
    codigo: "SURG-KIT",
    nombre: "Kit de Instrumentación Quirúrgica",
    descripcion: "Set completo de instrumentos quirúrgicos de acero inoxidable grado médico. Incluye pinzas, tijeras, separadores y porta-agujas.",
    categoria: "Instrumentos Quirúrgicos",
    precio: 860.50,
    unidad: "Kit",
    garantia: "12 meses",
    procedencia: "Alemania",
    imagen: "https://via.placeholder.com/100",
    disponibilidad: "En stock"
  },
  {
    id: "CONS-002",
    codigo: "CATH-SET",
    nombre: "Set de Cateterismo Urinario",
    descripcion: "Kit estéril para procedimientos de cateterismo urinario. Incluye catéteres, guantes, paños estériles y antisépticos.",
    categoria: "Material Médico",
    precio: 28.75,
    unidad: "Set",
    garantia: "N/A",
    procedencia: "Brasil",
    imagen: "https://via.placeholder.com/100",
    disponibilidad: "En stock"
  },
  {
    id: "SERV-001",
    codigo: "INST-BASIC",
    nombre: "Instalación Básica de Equipos",
    descripcion: "Servicio de instalación y configuración inicial de equipos médicos. Incluye verificación de funcionamiento y pruebas de seguridad eléctrica.",
    categoria: "Servicios",
    precio: 350.00,
    unidad: "Servicio",
    garantia: "3 meses",
    procedencia: "Ecuador",
    imagen: "https://via.placeholder.com/100",
    disponibilidad: "Programable"
  },
  {
    id: "SERV-002",
    codigo: "TRAIN-ADV",
    nombre: "Capacitación Avanzada para Personal Médico",
    descripcion: "Programa de capacitación para uso óptimo de equipos médicos complejos. Incluye sesiones teóricas y prácticas con especialistas certificados.",
    categoria: "Servicios",
    precio: 560.00,
    unidad: "Jornada",
    garantia: "N/A",
    procedencia: "Ecuador",
    imagen: "https://via.placeholder.com/100",
    disponibilidad: "Programable"
  }
];

// Main component - Proforma Builder
const Testing28 = () => {
  const [proforma, setProforma] = useState(initialData);
  const [currentTab, setCurrentTab] = useState("general");
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [productNotes, setProductNotes] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Filter products based on search
  const filteredProducts = catalogo.filter(product => {
    if (!searchProduct) return true;
    const searchLower = searchProduct.toLowerCase();
    return (
      product.nombre.toLowerCase().includes(searchLower) ||
      product.codigo.toLowerCase().includes(searchLower) ||
      product.categoria.toLowerCase().includes(searchLower)
    );
  });

  // Calculate subtotal for a product
  const calculateProductSubtotal = (product, qty, disc) => {
    return product.precio * qty * (1 - disc / 100);
  };

  // Add product to proforma
  const addProduct = () => {
    if (!selectedProduct) return;
    
    const subtotal = calculateProductSubtotal(selectedProduct, quantity, discount);
    
    const newProduct = {
      id: `item-${Date.now()}`,
      producto: selectedProduct,
      cantidad: quantity,
      descuento: discount,
      notas: productNotes,
      subtotal
    };
    
    const updatedProducts = [...proforma.productos, newProduct];
    
    // Calculate new totals
    const newSubtotal = updatedProducts.reduce((sum, item) => sum + item.subtotal, 0);
    const newImpuestos = newSubtotal * 0.12; // 12% IVA
    const newTotal = newSubtotal + newImpuestos;
    
    setProforma({
      ...proforma,
      productos: updatedProducts,
      subtotal: newSubtotal,
      impuestos: newImpuestos,
      total: newTotal
    });
    
    // Reset form
    setSelectedProduct(null);
    setQuantity(1);
    setDiscount(0);
    setProductNotes("");
  };

  // Remove product from proforma
  const removeProduct = (productId) => {
    const updatedProducts = proforma.productos.filter(item => item.id !== productId);
    
    // Calculate new totals
    const newSubtotal = updatedProducts.reduce((sum, item) => sum + item.subtotal, 0);
    const newImpuestos = newSubtotal * 0.12; // 12% IVA
    const newTotal = newSubtotal + newImpuestos;
    
    setProforma({
      ...proforma,
      productos: updatedProducts,
      subtotal: newSubtotal,
      impuestos: newImpuestos,
      total: newTotal
    });
  };

  // Update proforma conditions
  const updateConditions = (field, value) => {
    setProforma({
      ...proforma,
      condiciones: {
        ...proforma.condiciones,
        [field]: value
      }
    });
  };

  // Save proforma
  const saveProforma = (status = "borrador") => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setProforma({
        ...proforma,
        estado: status,
        fecha: new Date().toISOString()
      });
      setIsSaving(false);
      setShowSuccessAlert(true);
      
      // Hide success alert after 3 seconds
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);
    }, 1500);
  };

  // Generate PDF
  const generatePDF = () => {
    setIsGeneratingPDF(true);
    
    // Simulate PDF generation
    setTimeout(() => {
      setIsGeneratingPDF(false);
      // In a real app, you would trigger a download or open a preview
      alert("PDF generado correctamente");
    }, 2000);
  };

  // Get availability badge
  const getAvailabilityBadge = (availability) => {
    if (availability === "En stock") {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">En stock</Badge>;
    } else if (availability.includes("Bajo pedido")) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">{availability}</Badge>;
    } else {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{availability}</Badge>;
    }
  };

  // Get proforma valid until date
  const getValidUntilDate = () => {
    const date = new Date(proforma.fecha);
    date.setDate(date.getDate() + proforma.condiciones.validez);
    return formatDate(date);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">Generador de Proformas</h1>
            {proforma.estado !== "borrador" && (
              <Badge variant={proforma.estado === "enviada" ? "outline" : (proforma.estado === "aprobada" ? "success" : "destructive")}>
                {proforma.estado.charAt(0).toUpperCase() + proforma.estado.slice(1)}
              </Badge>
            )}
          </div>
          <p className="text-gray-500 mt-1">
            {proforma.id} • Creada el {formatDate(proforma.fecha)}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" onClick={() => saveProforma("borrador")} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar borrador
          </Button>
          <Button variant="outline" onClick={generatePDF} disabled={isGeneratingPDF}>
            {isGeneratingPDF ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            Vista previa
          </Button>
          <Button onClick={() => saveProforma("enviada")} disabled={proforma.productos.length === 0 || isSaving}>
            <Send className="h-4 w-4 mr-2" />
            Finalizar y enviar
          </Button>
        </div>
      </div>

      {/* Success notification */}
      {showSuccessAlert && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center">
            <Check className="h-5 w-5 mr-2" />
            <span>La proforma ha sido guardada correctamente.</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowSuccessAlert(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Main tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid grid-cols-1 md:grid-cols-4 md:w-full">
          <TabsTrigger value="general">
            <User className="h-4 w-4 mr-2" />
            Información General
          </TabsTrigger>
          <TabsTrigger value="productos">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Productos y Servicios
          </TabsTrigger>
          <TabsTrigger value="condiciones">
            <FileText className="h-4 w-4 mr-2" />
            Términos y Condiciones
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Vista Previa
          </TabsTrigger>
        </TabsList>

        {/* General Information Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Información del Cliente</CardTitle>
              <CardDescription>
                Información detallada sobre el cliente y destinatario de la proforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{proforma.cliente.nombre}</h3>
                  <p className="text-gray-500">{proforma.cliente.id}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cliente-contacto">Contacto</Label>
                    <Input 
                      id="cliente-contacto" 
                      value={proforma.cliente.contacto}
                      onChange={(e) => setProforma({
                        ...proforma, 
                        cliente: {...proforma.cliente, contacto: e.target.value}
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cliente-cargo">Cargo</Label>
                    <Input 
                      id="cliente-cargo" 
                      value={proforma.cliente.cargo}
                      onChange={(e) => setProforma({
                        ...proforma, 
                        cliente: {...proforma.cliente, cargo: e.target.value}
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cliente-email">Email</Label>
                    <Input 
                      id="cliente-email" 
                      type="email"
                      value={proforma.cliente.email}
                      onChange={(e) => setProforma({
                        ...proforma, 
                        cliente: {...proforma.cliente, email: e.target.value}
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cliente-telefono">Teléfono</Label>
                    <Input 
                      id="cliente-telefono" 
                      value={proforma.cliente.telefono}
                      onChange={(e) => setProforma({
                        ...proforma, 
                        cliente: {...proforma.cliente, telefono: e.target.value}
                      })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cliente-ruc">RUC / Identificación fiscal</Label>
                    <Input 
                      id="cliente-ruc" 
                      value={proforma.cliente.ruc}
                      onChange={(e) => setProforma({
                        ...proforma, 
                        cliente: {...proforma.cliente, ruc: e.target.value}
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cliente-direccion">Dirección</Label>
                    <Textarea 
                      id="cliente-direccion" 
                      value={proforma.cliente.direccion}
                      onChange={(e) => setProforma({
                        ...proforma, 
                        cliente: {...proforma.cliente, direccion: e.target.value}
                      })}
                      className="mt-1"
                      rows={5}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => setCurrentTab("productos")}>
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="productos">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Productos y Servicios</CardTitle>
              <CardDescription>
                Agregue los productos y servicios a incluir en la proforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product search and selection */}
              <div className="bg-gray-50 border rounded-lg p-4">
                <h3 className="font-medium mb-3">Agregar producto o servicio</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nombre, código o categoría..."
                      className="pl-9"
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                    />
                  </div>
                  
                  <ScrollArea className="h-64 border rounded-md bg-white">
                    <div className="p-2">
                      {filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <Package className="h-8 w-8 text-gray-300 mb-2" />
                          <p className="text-gray-500">No se encontraron productos con esos criterios</p>
                        </div>
                      ) : (
                        filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className={`p-3 rounded-md cursor-pointer border-l-2 hover:bg-gray-50 transition-colors mb-2 ${
                              selectedProduct?.id === product.id 
                                ? 'border-l-blue-500 bg-blue-50/50' 
                                : 'border-l-transparent'
                            }`}
                            onClick={() => setSelectedProduct(product)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                  <img 
                                    src={product.imagen} 
                                    alt={product.nombre}
                                    className="w-full h-full object-cover rounded"
                                  />
                                </div>
                                <div>
                                  <p className="font-medium">{product.nombre}</p>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>{product.codigo}</span>
                                    <span className="text-gray-300">•</span>
                                    <span>{product.categoria}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(product.precio)}</p>
                                <div className="mt-1">
                                  {getAvailabilityBadge(product.disponibilidad)}
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="product-quantity">Cantidad</Label>
                          <Input
                            id="product-quantity"
                            type="number"
                            min="1"
                            className="mt-1"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="product-discount">Descuento (%)</Label>
                          <Input
                            id="product-discount"
                            type="number"
                            min="0"
                            max="100"
                            className="mt-1"
                            value={discount}
                            onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="product-subtotal">Subtotal</Label>
                          <Input
                            id="product-subtotal"
                            className="mt-1 bg-gray-50"
                            value={formatCurrency(calculateProductSubtotal(selectedProduct, quantity, discount))}
                            readOnly
                          />
                        </div>
                        <div className="md:col-span-3">
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
                        <Button onClick={addProduct}>
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar a la proforma
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Products list */}
              <div>
                <h3 className="font-medium mb-3">Productos y servicios en la proforma</h3>
                {proforma.productos.length === 0 ? (
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
                          <TableHead className="text-right">Subtotal</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {proforma.productos.map((item) => (
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
                            <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedProduct(item.producto);
                                    setQuantity(item.cantidad);
                                    setDiscount(item.descuento);
                                    setProductNotes(item.notas);
                                    removeProduct(item.id);
                                  }}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => removeProduct(item.id)}>
                                    <Trash className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Totals */}
              {proforma.productos.length > 0 && (
                <div className="flex justify-end">
                  <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>{formatCurrency(proforma.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IVA (12%):</span>
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
              <Button variant="outline" onClick={() => setCurrentTab("general")}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Atrás
              </Button>
              <Button onClick={() => setCurrentTab("condiciones")} disabled={proforma.productos.length === 0}>
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Terms and Conditions Tab */}
        <TabsContent value="condiciones">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Términos y Condiciones</CardTitle>
              <CardDescription>
                Establezca los términos comerciales y condiciones de la proforma
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
                      value={proforma.condiciones.validez}
                      onChange={(e) => updateConditions('validez', parseInt(e.target.value) || 30)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="formaPago">Forma de pago</Label>
                    <Input
                      id="formaPago"
                      className="mt-1"
                      value={proforma.condiciones.formaPago}
                      onChange={(e) => updateConditions('formaPago', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tiempoEntrega">Tiempo de entrega</Label>
                    <Input
                      id="tiempoEntrega"
                      className="mt-1"
                      value={proforma.condiciones.tiempoEntrega}
                      onChange={(e) => updateConditions('tiempoEntrega', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="garantia">Garantía</Label>
                    <Input
                      id="garantia"
                      className="mt-1"
                      value={proforma.condiciones.garantia}
                      onChange={(e) => updateConditions('garantia', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="incluirInstalacion"
                        checked={proforma.condiciones.incluirInstalacion}
                        onCheckedChange={(checked) => updateConditions('incluirInstalacion', checked)}
                      />
                      <Label htmlFor="incluirInstalacion">
                        Los precios incluyen instalación
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="incluirCapacitacion"
                        checked={proforma.condiciones.incluirCapacitacion}
                        onCheckedChange={(checked) => updateConditions('incluirCapacitacion', checked)}
                      />
                      <Label htmlFor="incluirCapacitacion">
                        Los precios incluyen capacitación básica
                      </Label>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="notas">Notas y condiciones adicionales</Label>
                    <Textarea
                      id="notas"
                      className="mt-1"
                      rows={4}
                      value={proforma.condiciones.notas}
                      onChange={(e) => updateConditions('notas', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="terminos-legales">
                  <AccordionTrigger>Términos legales estándar</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 space-y-2">
                    <p>1. Los precios están sujetos a cambio sin previo aviso. La cotización tiene validez únicamente durante el período especificado.</p>
                    <p>2. Los valores expresados en esta proforma no constituyen un compromiso de venta. Los precios finales serán confirmados al momento de procesar el pedido.</p>
                    <p>3. Las cantidades, características y especificaciones de los productos/servicios están sujetas a disponibilidad al momento de la confirmación del pedido.</p>
                    <p>4. El tiempo de entrega es aproximado y puede variar dependiendo de factores externos como disponibilidad, importación, aduana y transporte.</p>
                    <p>5. La garantía cubre únicamente defectos de fabricación durante el período especificado y bajo condiciones normales de uso.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="info-tributaria">
                  <AccordionTrigger>Información tributaria</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 space-y-2">
                    <p>1. Todos los precios incluyen IVA del 12% a menos que se especifique lo contrario.</p>
                    <p>2. Para efectos de facturación, se requerirán los datos fiscales completos del cliente.</p>
                    <p>3. Las retenciones de impuestos serán responsabilidad del cliente según la normativa tributaria vigente.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentTab("productos")}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Atrás
              </Button>
              <Button onClick={() => setCurrentTab("preview")}>
                Vista previa
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">Vista Previa de la Proforma</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6 md:p-8 bg-white">
                {/* Proforma Header */}
                <div className="flex flex-col md:flex-row justify-between items-start mb-10">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">PROFORMA</h2>
                    <p className="text-gray-600 mt-1">{proforma.id}</p>
                    <p className="text-gray-500 mt-1">Fecha: {formatDate(proforma.fecha)}</p>
                    <p className="text-gray-500">Válida hasta: {getValidUntilDate()}</p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <div className="h-16 w-16 bg-blue-600 rounded-lg flex items-center justify-center mb-2 ml-auto">
                      <Globe className="h-8 w-8 text-white" />
                    </div>
                    <p className="font-bold text-gray-900">Su Empresa S.A.</p>
                    <p className="text-gray-500 text-sm">Av. Amazonas N34-451 y Av. Atahualpa</p>
                    <p className="text-gray-500 text-sm">Quito, Ecuador</p>
                    <p className="text-gray-500 text-sm">info@suempresa.com</p>
                    <p className="text-gray-500 text-sm">+593 2-123-4567</p>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Client Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Cliente</h3>
                    <p className="font-medium">{proforma.cliente.nombre}</p>
                    <p className="text-gray-600">RUC: {proforma.cliente.ruc}</p>
                    <p className="text-gray-600">{proforma.cliente.direccion}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Contacto</h3>
                    <p className="font-medium">{proforma.cliente.contacto}</p>
                    <p className="text-gray-600">{proforma.cliente.cargo}</p>
                    <p className="text-gray-600">{proforma.cliente.email}</p>
                    <p className="text-gray-600">{proforma.cliente.telefono}</p>
                  </div>
                </div>

                {/* Products Table */}
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
                        {proforma.productos.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              No hay productos agregados a la proforma
                            </TableCell>
                          </TableRow>
                        ) : (
                          proforma.productos.map((item) => (
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

                {/* Totals */}
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

                {/* Terms and Conditions */}
                <div className="mb-8">
                  <h3 className="font-medium text-gray-900 mb-3">Términos y condiciones</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p><span className="font-medium">Validez:</span> {proforma.condiciones.validez} días</p>
                        <p><span className="font-medium">Forma de pago:</span> {proforma.condiciones.formaPago}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Tiempo de entrega:</span> {proforma.condiciones.tiempoEntrega}</p>
                        <p><span className="font-medium">Garantía:</span> {proforma.condiciones.garantia}</p>
                      </div>
                    </div>

                    <div className="text-sm space-y-1">
                      {proforma.condiciones.incluirInstalacion && (
                        <p className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-600" />
                          Los precios incluyen instalación
                        </p>
                      )}
                      {proforma.condiciones.incluirCapacitacion && (
                        <p className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-600" />
                          Los precios incluyen capacitación básica
                        </p>
                      )}
                    </div>

                    <div className="text-sm">
                      <p className="whitespace-pre-line">{proforma.condiciones.notas}</p>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                  <div className="border-t pt-2">
                    <p className="text-sm text-gray-500">Elaborado por</p>
                    <p className="font-medium">Juan Pérez</p>
                    <p className="text-sm">Asesor Comercial</p>
                  </div>
                  <div className="border-t pt-2">
                    <p className="text-sm text-gray-500">Aceptado por</p>
                    <p className="font-medium">_______________________</p>
                    <p className="text-sm">{proforma.cliente.contacto}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t">
              <Button variant="outline" onClick={() => setCurrentTab("condiciones")}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Atrás
              </Button>
              <Button onClick={() => saveProforma("enviada")} disabled={proforma.productos.length === 0 || isSaving}>
                <Send className="h-4 w-4 mr-2" />
                Finalizar y enviar
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Eye icon component
const Eye = (props) => (
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
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default Testing28;