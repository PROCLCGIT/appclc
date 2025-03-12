import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format, addDays } from "date-fns";
import { 
  ArrowLeft, 
  Heart, 
  Printer, 
  Share, 
  Mail, 
  Download, 
  CalendarClock, 
  CircleDollarSign, 
  Truck,
  BarChart4,
  CheckCircle2,
  ArrowUpDown,
  Clock,
  Plus,
  Trash,
  Pencil,
  FileText,
  Save,
  X
} from "lucide-react";
import es from "date-fns/locale/es";

// Modelo 3: Sistema Avanzado de Proformas con Comparativas y Validación

const Testing23 = () => {
  // Estado para las pestañas
  const [activeTab, setActiveTab] = useState("crear");
  
  // Estado para la proforma actual
  const [proforma, setProforma] = useState({
    codigo: "PRF-2025-0078",
    fecha: new Date(),
    vigencia: 15,
    cliente: {
      id: "CL-1234",
      nombre: "Instituto Nacional de Investigación Médica",
      direccion: "Av. República E7-123 y Diego de Almagro, Quito",
      telefono: "2234-5678",
      email: "compras@inim.org",
      contacto: "Dr. Javier Morales",
      tipo: "Sector Público"
    },
    items: [
      {
        id: 1,
        codigo: "PD-001",
        nombre: "Analizador hematológico automático",
        marca: "MedTech",
        modelo: "AH-500",
        cantidad: 1,
        unidad: "Unidad",
        precio: 12500,
        descuento: 5,
        total: 11875
      },
      {
        id: 2,
        codigo: "PD-045",
        nombre: "Kit de reactivos para análisis de sangre",
        marca: "BioReagents",
        modelo: "KR-200",
        cantidad: 10,
        unidad: "Kit",
        precio: 350,
        descuento: 0,
        total: 3500
      },
      {
        id: 3,
        codigo: "PD-067",
        nombre: "Sistema de refrigeración para laboratorio",
        marca: "ColdTech",
        modelo: "RF-120L",
        cantidad: 2,
        unidad: "Unidad",
        precio: 2800,
        descuento: 10,
        total: 5040
      }
    ],
    condiciones: {
      formaPago: "50% anticipo, 50% contra entrega",
      tiempoEntrega: "45 días calendario",
      garantia: "12 meses por defectos de fabricación",
      validez: "15 días calendario",
      lugarEntrega: "Instalaciones del cliente"
    },
    notas: "Los precios incluyen transporte e instalación. Capacitación gratuita para el personal. No incluye obras civiles ni adecuaciones eléctricas.",
    totales: {
      subtotal: 20415,
      descuento: 0,
      subtotalNeto: 20415,
      iva: 2449.80,
      total: 22864.80
    },
    estado: "Borrador" // Borrador, Enviada, Aprobada, Rechazada, Vencida
  });
  
  // Estado para historial de proformas
  const [historialProformas] = useState([
    {
      id: "PRF-2025-0074",
      cliente: "Hospital Metropolitano",
      fecha: new Date(2025, 2, 1),
      valor: 15345.67,
      estado: "Aprobada"
    },
    {
      id: "PRF-2025-0075",
      cliente: "Clínica Internacional",
      fecha: new Date(2025, 2, 3),
      valor: 8760.45,
      estado: "Enviada"
    },
    {
      id: "PRF-2025-0076",
      cliente: "Laboratorio Central",
      fecha: new Date(2025, 2, 5),
      valor: 34210.89,
      estado: "Rechazada"
    },
    {
      id: "PRF-2025-0077",
      cliente: "Hospital del IESS",
      fecha: new Date(2025, 2, 8),
      valor: 21678.34,
      estado: "Vencida"
    },
    {
      id: "PRF-2025-0078",
      cliente: "Instituto Nacional de Investigación Médica",
      fecha: new Date(2025, 2, 10),
      valor: 22864.80,
      estado: "Borrador"
    }
  ]);
  
  // Proformas comparativas
  const [comparativas] = useState([
    {
      cliente: "Instituto Nacional de Investigación Médica",
      periodo: "Trimestre 1 - 2025",
      proformas: [
        {
          id: "PRF-2024-0145",
          fecha: new Date(2024, 9, 10), // 10-Oct-2024
          total: 18765.40,
          estado: "Aprobada",
          items: 5
        },
        {
          id: "PRF-2024-0203",
          fecha: new Date(2024, 11, 5), // 5-Dic-2024
          total: 21450.75,
          estado: "Aprobada",
          items: 6
        },
        {
          id: "PRF-2025-0078",
          fecha: new Date(2025, 2, 10), // 10-Mar-2025
          total: 22864.80,
          estado: "Borrador",
          items: 3
        }
      ]
    }
  ]);
  
  // Función para actualizar un ítem de la proforma
  const actualizarItem = (id, campo, valor) => {
    const itemsActualizados = proforma.items.map(item => {
      if (item.id === id) {
        const nuevoItem = { ...item, [campo]: valor };
        
        // Recalcular el total si es necesario
        if (campo === 'cantidad' || campo === 'precio' || campo === 'descuento') {
          const descuentoDecimal = nuevoItem.descuento / 100;
          nuevoItem.total = nuevoItem.cantidad * nuevoItem.precio * (1 - descuentoDecimal);
        }
        
        return nuevoItem;
      }
      return item;
    });
    
    setProforma({
      ...proforma,
      items: itemsActualizados
    });
    
    // Recalcular totales
    calcularTotales(itemsActualizados);
  };
  
  // Función para agregar un nuevo ítem
  const agregarItem = () => {
    const nuevoItem = {
      id: Date.now(),
      codigo: "",
      nombre: "",
      marca: "",
      modelo: "",
      cantidad: 1,
      unidad: "Unidad",
      precio: 0,
      descuento: 0,
      total: 0
    };
    
    const itemsActualizados = [...proforma.items, nuevoItem];
    
    setProforma({
      ...proforma,
      items: itemsActualizados
    });
  };
  
  // Función para eliminar un ítem
  const eliminarItem = (id) => {
    const itemsActualizados = proforma.items.filter(item => item.id !== id);
    
    setProforma({
      ...proforma,
      items: itemsActualizados
    });
    
    // Recalcular totales
    calcularTotales(itemsActualizados);
  };
  
  // Función para calcular totales
  const calcularTotales = (items) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const descuento = 0; // Descuento adicional si lo hubiera
    const subtotalNeto = subtotal - descuento;
    const iva = subtotalNeto * 0.12;
    const total = subtotalNeto + iva;
    
    setProforma({
      ...proforma,
      totales: {
        subtotal,
        descuento,
        subtotalNeto,
        iva,
        total
      }
    });
  };
  
  // Convertir un número a formato de moneda
  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(valor);
  };
  
  // Formatear fecha
  const formatoFecha = (fecha) => {
    return format(fecha, "d 'de' MMMM 'de' yyyy", { locale: es });
  };
  
  // Renderizado de las diferentes pestañas
  const renderizarCrear = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Proforma #{proforma.codigo}</h2>
              <Badge variant={
                proforma.estado === "Borrador" ? "outline" :
                proforma.estado === "Enviada" ? "secondary" :
                proforma.estado === "Aprobada" ? "success" :
                proforma.estado === "Rechazada" ? "destructive" : "outline"
              }>
                {proforma.estado}
              </Badge>
            </div>
            <p className="text-gray-500 mt-1">
              Fecha: {formatoFecha(proforma.fecha)} | Válida hasta: {formatoFecha(addDays(proforma.fecha, proforma.vigencia))}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" /> Volver
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" /> Imprimir
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" /> Enviar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> PDF
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <Heart className="h-4 w-4 mr-2 text-blue-500" /> 
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-[100px_1fr] gap-1">
                  <Label className="text-gray-500">Empresa:</Label>
                  <div className="font-medium">{proforma.cliente.nombre}</div>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-1">
                  <Label className="text-gray-500">Contacto:</Label>
                  <div>{proforma.cliente.contacto}</div>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-1">
                  <Label className="text-gray-500">Dirección:</Label>
                  <div>{proforma.cliente.direccion}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-cols-[80px_1fr] gap-1">
                    <Label className="text-gray-500">Teléfono:</Label>
                    <div>{proforma.cliente.telefono}</div>
                  </div>
                  <div className="grid grid-cols-[50px_1fr] gap-1">
                    <Label className="text-gray-500">Email:</Label>
                    <div className="text-blue-600">{proforma.cliente.email}</div>
                  </div>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-1">
                  <Label className="text-gray-500">Tipo:</Label>
                  <div>
                    <Badge variant="secondary">{proforma.cliente.tipo}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <CircleDollarSign className="h-4 w-4 mr-2 text-blue-500" /> 
                Condiciones Comerciales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <Label className="text-gray-500">Forma de pago:</Label>
                  <Select value={proforma.condiciones.formaPago} onValueChange={(value) => {
                    setProforma({
                      ...proforma,
                      condiciones: {
                        ...proforma.condiciones,
                        formaPago: value
                      }
                    });
                  }}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Contado">Contado</SelectItem>
                      <SelectItem value="Crédito 30 días">Crédito 30 días</SelectItem>
                      <SelectItem value="Crédito 60 días">Crédito 60 días</SelectItem>
                      <SelectItem value="50% anticipo, 50% contra entrega">50% anticipo, 50% contra entrega</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <Label className="text-gray-500">Tiempo entrega:</Label>
                  <Select value={proforma.condiciones.tiempoEntrega} onValueChange={(value) => {
                    setProforma({
                      ...proforma,
                      condiciones: {
                        ...proforma.condiciones,
                        tiempoEntrega: value
                      }
                    });
                  }}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inmediata">Inmediata</SelectItem>
                      <SelectItem value="15 días calendario">15 días calendario</SelectItem>
                      <SelectItem value="30 días calendario">30 días calendario</SelectItem>
                      <SelectItem value="45 días calendario">45 días calendario</SelectItem>
                      <SelectItem value="60 días calendario">60 días calendario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <Label className="text-gray-500">Garantía:</Label>
                  <Select value={proforma.condiciones.garantia} onValueChange={(value) => {
                    setProforma({
                      ...proforma,
                      condiciones: {
                        ...proforma.condiciones,
                        garantia: value
                      }
                    });
                  }}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12 meses por defectos de fabricación">12 meses por defectos de fabricación</SelectItem>
                      <SelectItem value="24 meses por defectos de fabricación">24 meses por defectos de fabricación</SelectItem>
                      <SelectItem value="Sin garantía">Sin garantía</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <Label className="text-gray-500">Lugar entrega:</Label>
                  <Select value={proforma.condiciones.lugarEntrega} onValueChange={(value) => {
                    setProforma({
                      ...proforma,
                      condiciones: {
                        ...proforma.condiciones,
                        lugarEntrega: value
                      }
                    });
                  }}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Instalaciones del cliente">Instalaciones del cliente</SelectItem>
                      <SelectItem value="Bodegas del proveedor">Bodegas del proveedor</SelectItem>
                      <SelectItem value="Según coordenadas cliente">Según coordenadas cliente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-md flex items-center">
                <Truck className="h-4 w-4 mr-2 text-blue-500" /> 
                Productos y Servicios
              </CardTitle>
              <Button variant="outline" size="sm" onClick={agregarItem}>
                <Plus className="h-4 w-4 mr-2" /> Agregar Ítem
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[80px]">Código</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-[80px]">Marca</TableHead>
                    <TableHead className="w-[80px]">Modelo</TableHead>
                    <TableHead className="w-[60px] text-center">Cant.</TableHead>
                    <TableHead className="w-[60px]">Unidad</TableHead>
                    <TableHead className="w-[100px] text-right">Precio Unit.</TableHead>
                    <TableHead className="w-[80px] text-right">Desc %</TableHead>
                    <TableHead className="w-[120px] text-right">Total</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proforma.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input 
                          value={item.codigo}
                          onChange={(e) => actualizarItem(item.id, 'codigo', e.target.value)}
                          className="h-8 w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={item.nombre}
                          onChange={(e) => actualizarItem(item.id, 'nombre', e.target.value)}
                          className="h-8 w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={item.marca}
                          onChange={(e) => actualizarItem(item.id, 'marca', e.target.value)}
                          className="h-8 w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={item.modelo}
                          onChange={(e) => actualizarItem(item.id, 'modelo', e.target.value)}
                          className="h-8 w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          value={item.cantidad}
                          onChange={(e) => actualizarItem(item.id, 'cantidad', Number(e.target.value))}
                          className="h-8 w-full text-center"
                          min="1"
                        />
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={item.unidad}
                          onValueChange={(value) => actualizarItem(item.id, 'unidad', value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Unidad" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Unidad">Unidad</SelectItem>
                            <SelectItem value="Kit">Kit</SelectItem>
                            <SelectItem value="Caja">Caja</SelectItem>
                            <SelectItem value="Servicio">Servicio</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Input 
                          type="number"
                          value={item.precio}
                          onChange={(e) => actualizarItem(item.id, 'precio', Number(e.target.value))}
                          className="h-8 w-full text-right"
                          step="0.01"
                          min="0"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input 
                          type="number"
                          value={item.descuento}
                          onChange={(e) => actualizarItem(item.id, 'descuento', Number(e.target.value))}
                          className="h-8 w-full text-right"
                          step="0.1"
                          min="0"
                          max="100"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatoMoneda(item.total)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => eliminarItem(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <CalendarClock className="h-4 w-4 mr-2 text-blue-500" /> 
                Notas y Observaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={proforma.notas}
                onChange={(e) => setProforma({...proforma, notas: e.target.value})}
                placeholder="Ingrese notas, términos adicionales o información relevante para el cliente..."
                rows={5}
              />
              <div className="mt-4 text-sm text-gray-500">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Esta proforma tiene validez de {proforma.vigencia} días calendario.</li>
                  <li>Los precios están sujetos a existencias y pueden variar sin previo aviso.</li>
                  <li>Esta proforma no constituye un compromiso de venta.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <BarChart4 className="h-4 w-4 mr-2 text-blue-500" /> 
                Resumen de Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatoMoneda(proforma.totales.subtotal)}</span>
                </div>
                
                {proforma.totales.descuento > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Descuento adicional:</span>
                    <span className="text-red-600">-{formatoMoneda(proforma.totales.descuento)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal neto:</span>
                  <span>{formatoMoneda(proforma.totales.subtotalNeto)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between">
                  <span className="text-gray-600">IVA (12%):</span>
                  <span>{formatoMoneda(proforma.totales.iva)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold">
                  <span>TOTAL:</span>
                  <span className="text-xl text-blue-700">{formatoMoneda(proforma.totales.total)}</span>
                </div>
                
                <div className="mt-6 p-3 rounded bg-blue-50 text-blue-800 text-sm">
                  <div className="flex items-start">
                    <div className="mr-2 mt-0.5"><CalendarClock className="h-4 w-4" /></div>
                    <div>
                      <span className="font-medium">Tiempo de Entrega:</span>
                      <span className="ml-2">{proforma.condiciones.tiempoEntrega}</span>
                    </div>
                  </div>
                  <div className="flex items-start mt-2">
                    <div className="mr-2 mt-0.5"><CircleDollarSign className="h-4 w-4" /></div>
                    <div>
                      <span className="font-medium">Forma de Pago:</span>
                      <span className="ml-2">{proforma.condiciones.formaPago}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-between mt-6">
          <Button variant="outline">
            <Share className="h-4 w-4 mr-2" />
            Compartir
          </Button>
          
          <div className="space-x-2">
            <Button variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Guardar Borrador
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Finalizar y Enviar
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderizarHistorial = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Historial de Proformas</h2>
            <p className="text-gray-500 mt-1">Visualice y gestione todas sus proformas anteriores</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Input placeholder="Buscar proforma..." className="w-60" />
            <Button variant="outline" size="sm">
              <ArrowUpDown className="h-4 w-4 mr-2" /> Filtrar
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[110px]">Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="w-[130px]">Fecha</TableHead>
                  <TableHead className="w-[130px] text-right">Valor</TableHead>
                  <TableHead className="w-[110px] text-center">Estado</TableHead>
                  <TableHead className="w-[130px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historialProformas.map((proforma) => (
                  <TableRow key={proforma.id}>
                    <TableCell className="font-medium">{proforma.id}</TableCell>
                    <TableCell>{proforma.cliente}</TableCell>
                    <TableCell>{format(proforma.fecha, "dd/MM/yyyy")}</TableCell>
                    <TableCell className="text-right">{formatoMoneda(proforma.valor)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={
                        proforma.estado === "Borrador" ? "outline" :
                        proforma.estado === "Enviada" ? "secondary" :
                        proforma.estado === "Aprobada" ? "success" :
                        proforma.estado === "Rechazada" ? "destructive" : "outline"
                      }>
                        {proforma.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-500" />
            Actividad Reciente
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Proforma #PRF-2025-0077 enviada a Hospital del IESS</p>
                <p className="text-xs text-gray-500">Hace 2 días</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Proforma #PRF-2025-0075 aprobada por Clínica Internacional</p>
                <p className="text-xs text-gray-500">Hace 4 días</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-red-100 rounded-full p-2 mr-3">
                <X className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Proforma #PRF-2025-0076 rechazada por Laboratorio Central</p>
                <p className="text-xs text-gray-500">Hace 5 días</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderizarComparativas = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Comparativas de Proformas</h2>
          <p className="text-gray-500 mt-1">Análisis comparativo de proformas por cliente</p>
        </div>
        
        {comparativas.map((comparativa, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{comparativa.cliente}</span>
                <Badge variant="secondary">{comparativa.periodo}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[110px]">Número</TableHead>
                      <TableHead className="w-[130px]">Fecha</TableHead>
                      <TableHead className="w-[80px] text-center">Items</TableHead>
                      <TableHead className="w-[130px] text-right">Valor</TableHead>
                      <TableHead className="w-[110px] text-center">Estado</TableHead>
                      <TableHead>Variación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparativa.proformas.map((proforma, i) => {
                      // Calcular variación con respecto a la proforma anterior
                      const anterior = i > 0 ? comparativa.proformas[i-1].total : null;
                      const variacion = anterior ? ((proforma.total - anterior) / anterior) * 100 : 0;
                      
                      return (
                        <TableRow key={proforma.id}>
                          <TableCell className="font-medium">{proforma.id}</TableCell>
                          <TableCell>{format(proforma.fecha, "dd/MM/yyyy")}</TableCell>
                          <TableCell className="text-center">{proforma.items}</TableCell>
                          <TableCell className="text-right">{formatoMoneda(proforma.total)}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={
                              proforma.estado === "Borrador" ? "outline" :
                              proforma.estado === "Enviada" ? "secondary" :
                              proforma.estado === "Aprobada" ? "success" :
                              "destructive"
                            }>
                              {proforma.estado}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {i > 0 && (
                              <div className="flex items-center">
                                <div className={`w-24 h-2 rounded-full ${variacion >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                  <div 
                                    className={`h-2 rounded-full ${variacion >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                    style={{ width: `${Math.min(Math.abs(variacion), 100)}%` }}
                                  ></div>
                                </div>
                                <span className={`ml-2 ${variacion >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {variacion >= 0 ? '+' : ''}{variacion.toFixed(2)}%
                                </span>
                              </div>
                            )}
                            {i === 0 && <span className="text-gray-400">Línea base</span>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Resumen de análisis</h4>
                <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                  <li>Incremento promedio de valor: +10.2% por proforma</li>
                  <li>Frecuencia de compra: 90 días</li>
                  <li>Tasa de aprobación: 75%</li>
                  <li>Valor promedio por proforma: {formatoMoneda(21026.98)}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-medium mb-4">Recomendaciones</h3>
          
          <div className="space-y-4">
            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
              <h4 className="font-medium text-green-800 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Oportunidad de crecimiento
              </h4>
              <p className="text-sm text-green-700 mt-1">
                Los análisis muestran una tendencia positiva en las proformas aceptadas. 
                Considere aumentar ligeramente los precios en la próxima proforma.
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 flex items-center">
                <CircleDollarSign className="h-4 w-4 mr-2" />
                Sugerencia de descuento
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                Cliente recurrente con alta fidelidad. Considere ofrecer un descuento por 
                volumen del 5% para fomentar una compra mayor.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="crear">Crear Proforma</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="comparativas">Comparativas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="crear" className="space-y-6">
          {renderizarCrear()}
        </TabsContent>
        
        <TabsContent value="historial" className="space-y-6">
          {renderizarHistorial()}
        </TabsContent>
        
        <TabsContent value="comparativas" className="space-y-6">
          {renderizarComparativas()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Testing23;