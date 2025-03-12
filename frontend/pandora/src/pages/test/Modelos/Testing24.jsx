import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { 
  CheckCircle, 
  DollarSign, 
  Download, 
  File, 
  FileCog, 
  FileText, 
  HelpCircle, 
  Pencil, 
  Plus, 
  PlusCircle,
  Printer, 
  Save, 
  Send, 
  Settings, 
  Trash, 
  Upload,
  Users,
  ClipboardList,
  ArrowRightLeft,
  Calendar
} from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import es from "date-fns/locale/es";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

// Componente Globe para International Template Icon
const Globe = (props) => (
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
    <circle cx="12" cy="12" r="10" />
    <line x1="2" x2="22" y1="12" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// Modelo 4: Plataforma de Proformas con Plantillas, Firmas, y Multidivisa

const Testing24 = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState("editor");
  const [currentTemplate, setCurrentTemplate] = useState("standard");
  const [currency, setCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(1.0);
  const [showExchangeRateFields, setShowExchangeRateFields] = useState(false);
  
  // Estados para la proforma actual
  const [proforma, setProforma] = useState({
    id: "PRO-24-0075",
    createdAt: new Date(),
    validUntil: new Date(new Date().setDate(new Date().getDate() + 30)),
    status: "draft", // draft, sent, accepted, rejected, expired
    title: "Proforma de Equipos de Laboratorio - Referencias 2025",
    client: {
      name: "Centro de Investigación Biomédica",
      contactPerson: "Dra. Gabriela Vélez",
      email: "gvelez@cib.org.ec",
      phone: "+593 98 765 4321",
      address: "Av. Interoceánica N28-256 y Eloy Alfaro, Quito",
      taxId: "1791234567001",
      type: "Institución Pública"
    },
    commercialTerms: {
      paymentMethod: "50% anticipo, 50% contra entrega",
      deliveryTime: "60 días tras confirmación del pedido",
      validity: "30 días",
      warranty: "12 meses contra defectos de fabricación",
      deliveryLocation: "Instalaciones del cliente",
      additionalTerms: "Incluye instalación y capacitación básica. No incluye obras civiles ni adecuaciones eléctricas especiales."
    },
    items: [
      {
        id: 1,
        name: "Espectrofotómetro UV-VIS de doble haz",
        description: "Rango 190-1100nm, ancho de banda 1nm, precisión ±0.3nm",
        code: "ESP-UV-2000",
        brand: "OptiLab",
        model: "Pro-2500",
        quantity: 1,
        unit: "Unidad",
        unitPrice: 15750.00,
        discount: 5,
        totalPrice: 14962.50
      },
      {
        id: 2,
        name: "Centrífuga refrigerada de alta velocidad",
        description: "Capacidad 6 x 500ml, velocidad máxima 20,000 rpm, temperatura -20°C a +40°C",
        code: "CENT-RF-600",
        brand: "SpinTech",
        model: "CR-6500",
        quantity: 1,
        unit: "Unidad",
        unitPrice: 12800.00,
        discount: 0,
        totalPrice: 12800.00
      },
      {
        id: 3,
        name: "Kit de micropipetas (3 unidades)",
        description: "Volúmenes 0.5-10µl, 10-100µl, 100-1000µl, con certificado de calibración",
        code: "PIP-KIT-301",
        brand: "PipeMaster",
        model: "Precision Plus",
        quantity: 2,
        unit: "Kit",
        unitPrice: 950.00,
        discount: 10,
        totalPrice: 1710.00
      },
      {
        id: 4,
        name: "Servicio de instalación y capacitación extendida",
        description: "Incluye 3 días de capacitación para hasta 5 personas",
        code: "SRV-CAP-001",
        brand: "",
        model: "",
        quantity: 1,
        unit: "Servicio",
        unitPrice: 1200.00,
        discount: 0,
        totalPrice: 1200.00
      }
    ],
    notes: "Esta proforma incluye equipos con certificación CE/ISO. Los precios incluyen costos de importación y desaduanización. Para pedidos que superen los $50,000 se ofrecerá un descuento adicional del 3%.",
    totals: {
      subtotal: 30672.50,
      discount: 0,
      tax: 3680.70,
      shipping: 350.00,
      total: 34703.20
    },
    signatures: {
      preparedBy: {
        name: "Carlos Andrade",
        position: "Asesor Comercial",
        email: "candrade@empresa.com",
        phone: "+593 99 123 4567"
      },
      approvedBy: {
        name: "Diana Mendoza",
        position: "Gerente Comercial",
        email: "dmendoza@empresa.com",
        phone: "+593 98 765 4321"
      }
    },
    attachments: [
      { id: 1, name: "Catálogo_Equipos_2025.pdf", size: "3.2 MB" },
      { id: 2, name: "Certificaciones_Garantía.pdf", size: "1.8 MB" }
    ]
  });
  
  // Estado para plantillas disponibles
  const [templates] = useState([
    { id: "standard", name: "Estándar", icon: <FileText className="h-4 w-4 mr-2" /> },
    { id: "detailed", name: "Detallada", icon: <FileCog className="h-4 w-4 mr-2" /> },
    { id: "compact", name: "Compacta", icon: <File className="h-4 w-4 mr-2" /> },
    { id: "international", name: "Internacional", icon: <Globe className="h-4 w-4 mr-2" /> }
  ]);
  
  // Manejo de ítems de la proforma
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      name: "",
      description: "",
      code: "",
      brand: "",
      model: "",
      quantity: 1,
      unit: "Unidad",
      unitPrice: 0,
      discount: 0,
      totalPrice: 0
    };
    
    setProforma({
      ...proforma,
      items: [...proforma.items, newItem]
    });
  };
  
  const updateItem = (id, field, value) => {
    const updatedItems = proforma.items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalcular el precio total si cambia cantidad, precio unitario o descuento
        if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
          const quantity = field === 'quantity' ? value : item.quantity;
          const unitPrice = field === 'unitPrice' ? value : item.unitPrice;
          const discount = field === 'discount' ? value : item.discount;
          
          const totalBeforeDiscount = quantity * unitPrice;
          const discountAmount = totalBeforeDiscount * (discount / 100);
          updatedItem.totalPrice = totalBeforeDiscount - discountAmount;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setProforma({
      ...proforma,
      items: updatedItems
    });
    
    // Recalcular totales
    calculateTotals(updatedItems);
  };
  
  const removeItem = (id) => {
    const updatedItems = proforma.items.filter(item => item.id !== id);
    
    setProforma({
      ...proforma,
      items: updatedItems
    });
    
    // Recalcular totales
    calculateTotals(updatedItems);
  };
  
  // Calcular totales
  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.12; // IVA 12%
    const shipping = proforma.totals.shipping || 0;
    const total = subtotal + tax + shipping;
    
    setProforma({
      ...proforma,
      totals: {
        ...proforma.totals,
        subtotal,
        tax,
        total
      }
    });
  };
  
  // Formatear valores monetarios
  const formatCurrency = (value, curr = currency) => {
    let symbol = "$";
    let multiplier = 1;
    
    if (curr === "USD") {
      symbol = "$";
    } else if (curr === "EUR") {
      symbol = "€";
      multiplier = exchangeRate;
    }
    
    return `${symbol} ${(value * multiplier).toFixed(2)}`;
  };
  
  // Componente interno para el encabezado de la proforma
  const ProformaHeader = () => {
    return (
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Badge variant={
              proforma.status === "draft" ? "outline" :
              proforma.status === "sent" ? "secondary" :
              proforma.status === "accepted" ? "success" :
              proforma.status === "rejected" ? "destructive" :
              "outline"
            }>
              {proforma.status === "draft" ? "Borrador" :
               proforma.status === "sent" ? "Enviada" :
               proforma.status === "accepted" ? "Aprobada" :
               proforma.status === "rejected" ? "Rechazada" :
               "Vencida"}
            </Badge>
            <h1 className="text-2xl font-bold text-gray-900">{proforma.title}</h1>
          </div>
          <div className="mt-1 text-sm text-gray-500 flex items-center space-x-4">
            <span>Proforma #{proforma.id}</span>
            <span>•</span>
            <span>Creada: {format(proforma.createdAt, "dd/MM/yyyy")}</span>
            <span>•</span>
            <span>Válida hasta: {format(proforma.validUntil, "dd/MM/yyyy")}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Select value={currentTemplate} onValueChange={setCurrentTemplate}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar plantilla" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Plantillas</SelectLabel>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center">
                      {template.icon}
                      {template.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Select value={currency} onValueChange={(value) => {
            setCurrency(value);
            setShowExchangeRateFields(value !== "USD");
          }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Moneda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };
  
  // Componente para la información del cliente y comercial
  const ClientAndTermsSection = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nombre/Razón Social</Label>
              <Input 
                id="clientName" 
                value={proforma.client.name} 
                onChange={(e) => setProforma({
                  ...proforma, 
                  client: {...proforma.client, name: e.target.value}
                })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Persona de Contacto</Label>
                <Input 
                  id="contactPerson" 
                  value={proforma.client.contactPerson} 
                  onChange={(e) => setProforma({
                    ...proforma, 
                    client: {...proforma.client, contactPerson: e.target.value}
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">RUC/Identificación Fiscal</Label>
                <Input 
                  id="taxId" 
                  value={proforma.client.taxId} 
                  onChange={(e) => setProforma({
                    ...proforma, 
                    client: {...proforma.client, taxId: e.target.value}
                  })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={proforma.client.email} 
                  onChange={(e) => setProforma({
                    ...proforma, 
                    client: {...proforma.client, email: e.target.value}
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input 
                  id="phone" 
                  value={proforma.client.phone} 
                  onChange={(e) => setProforma({
                    ...proforma, 
                    client: {...proforma.client, phone: e.target.value}
                  })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Textarea 
                id="address" 
                value={proforma.client.address} 
                onChange={(e) => setProforma({
                  ...proforma, 
                  client: {...proforma.client, address: e.target.value}
                })}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <ClipboardList className="h-5 w-5 mr-2 text-blue-600" />
              Términos Comerciales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Forma de Pago</Label>
              <Select 
                value={proforma.commercialTerms.paymentMethod} 
                onValueChange={(value) => setProforma({
                  ...proforma, 
                  commercialTerms: {...proforma.commercialTerms, paymentMethod: value}
                })}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Seleccionar forma de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Contado">Contado</SelectItem>
                  <SelectItem value="Crédito 30 días">Crédito 30 días</SelectItem>
                  <SelectItem value="Crédito 60 días">Crédito 60 días</SelectItem>
                  <SelectItem value="50% anticipo, 50% contra entrega">50% anticipo, 50% contra entrega</SelectItem>
                  <SelectItem value="30% anticipo, 70% contra entrega">30% anticipo, 70% contra entrega</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Tiempo de Entrega</Label>
                <Select 
                  value={proforma.commercialTerms.deliveryTime} 
                  onValueChange={(value) => setProforma({
                    ...proforma, 
                    commercialTerms: {...proforma.commercialTerms, deliveryTime: value}
                  })}
                >
                  <SelectTrigger id="deliveryTime">
                    <SelectValue placeholder="Seleccionar tiempo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inmediata">Inmediata</SelectItem>
                    <SelectItem value="15 días tras confirmación del pedido">15 días</SelectItem>
                    <SelectItem value="30 días tras confirmación del pedido">30 días</SelectItem>
                    <SelectItem value="60 días tras confirmación del pedido">60 días</SelectItem>
                    <SelectItem value="90 días tras confirmación del pedido">90 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="validity">Validez de la Oferta</Label>
                <Select 
                  value={proforma.commercialTerms.validity} 
                  onValueChange={(value) => setProforma({
                    ...proforma, 
                    commercialTerms: {...proforma.commercialTerms, validity: value}
                  })}
                >
                  <SelectTrigger id="validity">
                    <SelectValue placeholder="Seleccionar validez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15 días">15 días</SelectItem>
                    <SelectItem value="30 días">30 días</SelectItem>
                    <SelectItem value="45 días">45 días</SelectItem>
                    <SelectItem value="60 días">60 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="warranty">Garantía</Label>
              <Select 
                value={proforma.commercialTerms.warranty} 
                onValueChange={(value) => setProforma({
                  ...proforma, 
                  commercialTerms: {...proforma.commercialTerms, warranty: value}
                })}
              >
                <SelectTrigger id="warranty">
                  <SelectValue placeholder="Seleccionar garantía" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sin garantía">Sin garantía</SelectItem>
                  <SelectItem value="6 meses contra defectos de fabricación">6 meses</SelectItem>
                  <SelectItem value="12 meses contra defectos de fabricación">12 meses</SelectItem>
                  <SelectItem value="24 meses contra defectos de fabricación">24 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {showExchangeRateFields && (
              <div className="space-y-2 pt-2 border-t border-dashed">
                <div className="flex items-center justify-between">
                  <Label htmlFor="exchangeRate">Tasa de Cambio (USD a {currency})</Label>
                  <div className="text-xs text-gray-500">1 USD = {exchangeRate} {currency}</div>
                </div>
                <Input 
                  id="exchangeRate" 
                  type="number" 
                  value={exchangeRate} 
                  onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
                  step="0.01"
                  min="0.01"
                />
                <p className="text-xs text-gray-500">
                  Última actualización: {format(new Date(), "dd/MM/yyyy HH:mm")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Componente para la tabla de ítems
  const ItemsTable = () => {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
              Productos y Servicios
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Ítem
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Código</TableHead>
                  <TableHead className="min-w-[250px]">Descripción</TableHead>
                  {currentTemplate === "detailed" && (
                    <>
                      <TableHead className="w-[100px]">Marca</TableHead>
                      <TableHead className="w-[100px]">Modelo</TableHead>
                    </>
                  )}
                  <TableHead className="w-[60px] text-center">Cant.</TableHead>
                  <TableHead className="w-[70px]">Unidad</TableHead>
                  <TableHead className="w-[120px] text-right">Precio Unit.</TableHead>
                  <TableHead className="w-[70px] text-right">Desc.</TableHead>
                  <TableHead className="w-[120px] text-right">Total</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proforma.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        value={item.code}
                        onChange={(e) => updateItem(item.id, 'code', e.target.value)}
                        className="h-8 w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          className="h-8 w-full"
                          placeholder="Nombre del producto/servicio"
                        />
                        {currentTemplate === "detailed" && (
                          <Textarea
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="min-h-8 text-xs"
                            placeholder="Descripción detallada"
                            rows={2}
                          />
                        )}
                      </div>
                    </TableCell>
                    {currentTemplate === "detailed" && (
                      <>
                        <TableCell>
                          <Input
                            value={item.brand}
                            onChange={(e) => updateItem(item.id, 'brand', e.target.value)}
                            className="h-8 w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.model}
                            onChange={(e) => updateItem(item.id, 'model', e.target.value)}
                            className="h-8 w-full"
                          />
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                        className="h-8 w-full text-center"
                        min="1"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.unit}
                        onValueChange={(value) => updateItem(item.id, 'unit', value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Unidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Unidad">Unidad</SelectItem>
                          <SelectItem value="Kit">Kit</SelectItem>
                          <SelectItem value="Caja">Caja</SelectItem>
                          <SelectItem value="Servicio">Servicio</SelectItem>
                          <SelectItem value="Metro">Metro</SelectItem>
                          <SelectItem value="Litro">Litro</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                        className="h-8 w-full text-right"
                        step="0.01"
                        min="0"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={item.discount}
                        onChange={(e) => updateItem(item.id, 'discount', Number(e.target.value))}
                        className="h-8 w-full text-right"
                        step="0.1"
                        min="0"
                        max="100"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.totalPrice)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={currentTemplate === "detailed" ? 7 : 5} className="text-right">
                    Subtotal:
                  </TableCell>
                  <TableCell className="text-right font-medium" colSpan={2}>
                    {formatCurrency(proforma.totals.subtotal)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={currentTemplate === "detailed" ? 7 : 5} className="text-right">
                    IVA (12%):
                  </TableCell>
                  <TableCell className="text-right font-medium" colSpan={2}>
                    {formatCurrency(proforma.totals.tax)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
                {proforma.totals.shipping > 0 && (
                  <TableRow>
                    <TableCell colSpan={currentTemplate === "detailed" ? 7 : 5} className="text-right">
                      Envío:
                    </TableCell>
                    <TableCell className="text-right font-medium" colSpan={2}>
                      {formatCurrency(proforma.totals.shipping)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell colSpan={currentTemplate === "detailed" ? 7 : 5} className="text-right font-bold">
                    TOTAL:
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg" colSpan={2}>
                    {formatCurrency(proforma.totals.total)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Componente para notas y anexos
  const NotesAndAttachments = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
              Notas y Condiciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={proforma.notes}
              onChange={(e) => setProforma({...proforma, notes: e.target.value})}
              placeholder="Agregue notas, términos adicionales o cualquier información relevante para el cliente..."
              rows={5}
            />
            
            <div className="mt-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2 mb-2">
                <Switch id="includeStandardTerms" defaultChecked />
                <Label htmlFor="includeStandardTerms">
                  Incluir términos estándar
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="includeFooter" defaultChecked />
                <Label htmlFor="includeFooter">
                  Incluir pie de página con datos de la empresa
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Archivos Adjuntos
              </CardTitle>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Adjuntar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {proforma.attachments.length > 0 ? (
              <div className="space-y-2">
                {proforma.attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm">{attachment.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">{attachment.size}</Badge>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Download className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No hay archivos adjuntos</p>
                <p className="text-sm">Arrastre archivos aquí o haga clic en "Adjuntar"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Componente para firmas y autorización
  const SignaturesSection = () => {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
            Firmas y Autorización
          </CardTitle>
          <CardDescription>
            Esta información aparecerá en la versión impresa de la proforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Preparado por:</h3>
              
              <div className="space-y-2">
                <Label htmlFor="preparedByName">Nombre</Label>
                <Input 
                  id="preparedByName" 
                  value={proforma.signatures.preparedBy.name} 
                  onChange={(e) => setProforma({
                    ...proforma, 
                    signatures: {
                      ...proforma.signatures,
                      preparedBy: {
                        ...proforma.signatures.preparedBy,
                        name: e.target.value
                      }
                    }
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preparedByPosition">Cargo</Label>
                <Input 
                  id="preparedByPosition" 
                  value={proforma.signatures.preparedBy.position} 
                  onChange={(e) => setProforma({
                    ...proforma, 
                    signatures: {
                      ...proforma.signatures,
                      preparedBy: {
                        ...proforma.signatures.preparedBy,
                        position: e.target.value
                      }
                    }
                  })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preparedByEmail">Email</Label>
                  <Input 
                    id="preparedByEmail" 
                    value={proforma.signatures.preparedBy.email} 
                    onChange={(e) => setProforma({
                      ...proforma, 
                      signatures: {
                        ...proforma.signatures,
                        preparedBy: {
                          ...proforma.signatures.preparedBy,
                          email: e.target.value
                        }
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preparedByPhone">Teléfono</Label>
                  <Input 
                    id="preparedByPhone" 
                    value={proforma.signatures.preparedBy.phone} 
                    onChange={(e) => setProforma({
                      ...proforma, 
                      signatures: {
                        ...proforma.signatures,
                        preparedBy: {
                          ...proforma.signatures.preparedBy,
                          phone: e.target.value
                        }
                      }
                    })}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Aprobado por:</h3>
                <div className="flex items-center space-x-2">
                  <Switch id="includeApprover" defaultChecked />
                  <Label htmlFor="includeApprover">Incluir aprobador</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="approvedByName">Nombre</Label>
                <Input 
                  id="approvedByName" 
                  value={proforma.signatures.approvedBy.name} 
                  onChange={(e) => setProforma({
                    ...proforma, 
                    signatures: {
                      ...proforma.signatures,
                      approvedBy: {
                        ...proforma.signatures.approvedBy,
                        name: e.target.value
                      }
                    }
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="approvedByPosition">Cargo</Label>
                <Input 
                  id="approvedByPosition" 
                  value={proforma.signatures.approvedBy.position} 
                  onChange={(e) => setProforma({
                    ...proforma, 
                    signatures: {
                      ...proforma.signatures,
                      approvedBy: {
                        ...proforma.signatures.approvedBy,
                        position: e.target.value
                      }
                    }
                  })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="approvedByEmail">Email</Label>
                  <Input 
                    id="approvedByEmail" 
                    value={proforma.signatures.approvedBy.email} 
                    onChange={(e) => setProforma({
                      ...proforma, 
                      signatures: {
                        ...proforma.signatures,
                        approvedBy: {
                          ...proforma.signatures.approvedBy,
                          email: e.target.value
                        }
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approvedByPhone">Teléfono</Label>
                  <Input 
                    id="approvedByPhone" 
                    value={proforma.signatures.approvedBy.phone} 
                    onChange={(e) => setProforma({
                      ...proforma, 
                      signatures: {
                        ...proforma.signatures,
                        approvedBy: {
                          ...proforma.signatures.approvedBy,
                          phone: e.target.value
                        }
                      }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Upload className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Firma digital</span>
              </div>
              <Button variant="outline" size="sm">
                Cargar firma
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mt-4">
              <div className="border border-dashed rounded-md p-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-2">
                    <Avatar className="h-16 w-16 mx-auto">
                      <AvatarFallback className="bg-blue-100 text-blue-800">CA</AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="text-sm font-medium">{proforma.signatures.preparedBy.name}</p>
                  <p className="text-xs text-gray-500">{proforma.signatures.preparedBy.position}</p>
                </div>
              </div>
              
              <div className="border border-dashed rounded-md p-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-2">
                    <Avatar className="h-16 w-16 mx-auto">
                      <AvatarFallback className="bg-purple-100 text-purple-800">DM</AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="text-sm font-medium">{proforma.signatures.approvedBy.name}</p>
                  <p className="text-xs text-gray-500">{proforma.signatures.approvedBy.position}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Componente para acciones finales
  const ActionsFooter = () => {
    return (
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Opciones
          </Button>
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Guardar Borrador
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Send className="h-4 w-4 mr-2" />
            Enviar Proforma
          </Button>
        </div>
      </div>
    );
  };
  
  // Componente para la pestaña de plantillas
  const TemplatesTab = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Plantillas de Proforma</h2>
          <p className="text-gray-500 mt-1">
            Seleccione una plantilla existente o cree una nueva personalizada
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className={`cursor-pointer transition-all ${currentTemplate === template.id ? 'ring-2 ring-blue-600' : 'hover:shadow-md'}`}
              onClick={() => setCurrentTemplate(template.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  {template.icon}
                  {template.name}
                </CardTitle>
                <CardDescription>
                  {template.id === "standard" && "Plantilla balanceada con los campos esenciales para la mayoría de casos."}
                  {template.id === "detailed" && "Incluye campos detallados para especificaciones técnicas completas."}
                  {template.id === "compact" && "Versión simplificada para proformas rápidas y sencillas."}
                  {template.id === "international" && "Optimizada para clientes internacionales con campos multilingües."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-md mb-4"></div>
                <div className="flex justify-between">
                  <Badge variant="outline">
                    {template.id === "standard" && "Recomendada"}
                    {template.id === "detailed" && "Especializada"}
                    {template.id === "compact" && "Simplificada"}
                    {template.id === "international" && "Global"}
                  </Badge>
                  
                  <div className="text-xs text-gray-500">
                    Última actualización: {format(new Date(), "dd/MM/yyyy")}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" className="w-full">
                  Seleccionar Plantilla
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          <Card className="border-dashed cursor-pointer hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nueva Plantilla
              </CardTitle>
              <CardDescription>
                Cree una plantilla personalizada desde cero o basada en una existente
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-[220px]">
              <PlusCircle className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">
                Haga clic para iniciar la creación de una nueva plantilla personalizada
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  
  // Componente para la pestaña de configuración
  const SettingsTab = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuración de Proformas</h2>
          <p className="text-gray-500 mt-1">
            Personalice la configuración predeterminada para todas sus proformas
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  Configuración General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultTemplate">Plantilla Predeterminada</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger id="defaultTemplate">
                        <SelectValue placeholder="Seleccionar plantilla" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Estándar</SelectItem>
                        <SelectItem value="detailed">Detallada</SelectItem>
                        <SelectItem value="compact">Compacta</SelectItem>
                        <SelectItem value="international">Internacional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultValidity">Validez Predeterminada</Label>
                    <Select defaultValue="30">
                      <SelectTrigger id="defaultValidity">
                        <SelectValue placeholder="Seleccionar período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 días</SelectItem>
                        <SelectItem value="30">30 días</SelectItem>
                        <SelectItem value="45">45 días</SelectItem>
                        <SelectItem value="60">60 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultCurrency">Moneda Predeterminada</Label>
                    <Select defaultValue="USD">
                      <SelectTrigger id="defaultCurrency">
                        <SelectValue placeholder="Seleccionar moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultTaxRate">Tasa de Impuesto Predeterminada</Label>
                    <Select defaultValue="12">
                      <SelectTrigger id="defaultTaxRate">
                        <SelectValue placeholder="Seleccionar tasa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0% (Sin impuesto)</SelectItem>
                        <SelectItem value="12">12% (IVA Estándar)</SelectItem>
                        <SelectItem value="other">Otra tasa...</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultNotes">Notas Predeterminadas</Label>
                  <Textarea 
                    id="defaultNotes" 
                    placeholder="Ingrese las notas que aparecerán por defecto en todas las proformas..."
                    rows={3}
                    defaultValue="Los precios incluyen IVA. La validez de esta proforma está sujeta a disponibilidad de stock. No incluye gastos de instalación a menos que se especifique lo contrario."
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-medium">Numeración de Proformas</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="proformaPrefix">Prefijo</Label>
                      <Input 
                        id="proformaPrefix" 
                        defaultValue="PRO-"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proformaDigits">Dígitos</Label>
                      <Select defaultValue="4">
                        <SelectTrigger id="proformaDigits">
                          <SelectValue placeholder="Seleccionar número de dígitos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 dígitos (001)</SelectItem>
                          <SelectItem value="4">4 dígitos (0001)</SelectItem>
                          <SelectItem value="5">5 dígitos (00001)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch id="includeYear" defaultChecked />
                    <Label htmlFor="includeYear">Incluir año en el número (PRO-2025-0001)</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Configuración de Firmas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">Firma Digital</h3>
                    <p className="text-sm text-gray-500">Habilite la firma digital en sus proformas</p>
                  </div>
                  <Switch id="enableDigitalSignature" defaultChecked />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultPreparer">Preparador Predeterminado</Label>
                    <Select defaultValue="user1">
                      <SelectTrigger id="defaultPreparer">
                        <SelectValue placeholder="Seleccionar usuario" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user1">Carlos Andrade (Actual)</SelectItem>
                        <SelectItem value="user2">María Espinoza</SelectItem>
                        <SelectItem value="user3">Juan Pérez</SelectItem>
                        <SelectItem value="none">Ninguno (Completar manualmente)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultApprover">Aprobador Predeterminado</Label>
                    <Select defaultValue="manager1">
                      <SelectTrigger id="defaultApprover">
                        <SelectValue placeholder="Seleccionar usuario" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager1">Diana Mendoza (Actual)</SelectItem>
                        <SelectItem value="manager2">Roberto Castro</SelectItem>
                        <SelectItem value="none">Ninguno (Completar manualmente)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-2">
                  <Switch id="requireApproval" defaultChecked />
                  <Label htmlFor="requireApproval">Requerir aprobación antes de enviar</Label>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <ArrowRightLeft className="h-5 w-5 mr-2 text-blue-600" />
                  Integraciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Sistema Contable</h4>
                      <p className="text-xs text-gray-500">Conectado</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">CRM</h4>
                      <p className="text-xs text-gray-500">Conectado</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <Calendar className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Calendario</h4>
                      <p className="text-xs text-gray-500">No conectado</p>
                    </div>
                  </div>
                  <Switch />
                </div>
                
                <Button variant="outline" className="w-full mt-2">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Agregar Nueva Integración
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  Opciones Avanzadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="autoSave" defaultChecked />
                  <Label htmlFor="autoSave">Guardar automáticamente</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="enableVersioning" defaultChecked />
                  <Label htmlFor="enableVersioning">Habilitar control de versiones</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="enableNotifications" defaultChecked />
                  <Label htmlFor="enableNotifications">Notificaciones por email</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="enableAuditTrail" defaultChecked />
                  <Label htmlFor="enableAuditTrail">Registro de auditoría</Label>
                </div>
                
                <Separator />
                
                <Button variant="outline" className="w-full">
                  Restaurar Configuración Predeterminada
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };
  
  
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="editor" className="flex items-center">
              <Pencil className="h-4 w-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Plantillas
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </TabsTrigger>
          </TabsList>
          
          <div className="text-sm text-gray-500">
            Última modificación: {format(new Date(), "dd/MM/yyyy HH:mm")}
          </div>
        </div>
        
        <TabsContent value="editor" className="space-y-6">
          <ProformaHeader />
          <ClientAndTermsSection />
          <ItemsTable />
          <NotesAndAttachments />
          <SignaturesSection />
          <ActionsFooter />
        </TabsContent>
        
        <TabsContent value="templates">
          <TemplatesTab />
        </TabsContent>
        
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Testing24;