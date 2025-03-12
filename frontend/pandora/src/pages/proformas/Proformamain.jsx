import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CalendarIcon, 
  Plus, 
  Printer, 
  Save, 
  Trash, 
  FileDown, 
  ClipboardCheck,
  Settings,
  Database,
  FileText,
  Mail,
  Check,
  Copy,
  Search,
  RefreshCw
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Templates definitions
const TEMPLATES = {
  MODERN: "modern",
  CLASSIC: "classic",
  MINIMAL: "minimal"
};

// Database sources
const DATA_SOURCES = {
  AVAILABLE_PRODUCTS: "productosDisponibles",
  OFFERED_PRODUCTS: "productosOfertados",
  INVENTORY: "inventario"
};

const EnhancedProforma = () => {
  // Main state
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATES.MODERN);
  const [activeDataSource, setActiveDataSource] = useState(DATA_SOURCES.AVAILABLE_PRODUCTS);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Client information
  const [client, setClient] = useState({
    name: "Empresa ABC S.A.",
    attention: "Ing. Juan Martínez",
    email: "jmartinez@empresaabc.com",
    phone: "099-555-1234",
    address: "Av. de las Américas y Juan Tanca Marengo, Guayaquil",
    ruc: "0912345678001"
  });
  
  // Quote information
  const [quote, setQuote] = useState({
    number: "PRO-2025-0042",
    date: new Date(),
    expiryDate: new Date(new Date().setDate(new Date().getDate() + 15)),
    paymentTerms: "50% anticipo, 50% contra entrega",
    deliveryTime: "5 días hábiles",
    validityDays: 15,
    notes: "Precios incluyen IVA. Entrega en sus oficinas dentro del perímetro urbano sin costo adicional.",
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    currency: "USD",
    taxRate: 12
  });
  
  // Company information
  const [company, setCompany] = useState({
    name: "Su Empresa S.A.",
    email: "comercial@suempresa.com",
    phone: "+593 98-765-4321",
    address: "Centro Empresarial El Ducado, Torre B, Oficina 405",
    ruc: "0987654321001",
    logo: "/company-logo.png",
    website: "www.suempresa.com"
  });
  
  // Configuration options
  const [config, setConfig] = useState({
    showLogo: true,
    showDiscount: true,
    showTax: true,
    enableProductSearch: true,
    footerText: "Gracias por su preferencia. Esta proforma no constituye una factura.",
    allowPartialItems: true,
    includeAttachments: false,
    currencySymbol: "$",
    decimalPlaces: 2,
    showItemCodes: true
  });
  
  // Products data (would come from databases normally)
  const [productsDatabase, setProductsDatabase] = useState({
    [DATA_SOURCES.AVAILABLE_PRODUCTS]: [
      { code: "MED-001", description: "Equipo de diagnóstico médico", unit: "Unidad", unitPrice: 1250.00, stock: 15 },
      { code: "MED-023", description: "Kit de insumos quirúrgicos", unit: "Kit", unitPrice: 450.00, stock: 28 },
      { code: "LAB-045", description: "Microscopio digital de alta resolución", unit: "Unidad", unitPrice: 3650.00, stock: 4 },
      { code: "MED-067", description: "Monitor de signos vitales", unit: "Unidad", unitPrice: 2150.00, stock: 7 },
      { code: "LAB-089", description: "Centrífuga de laboratorio", unit: "Unidad", unitPrice: 1850.00, stock: 3 }
    ],
    [DATA_SOURCES.OFFERED_PRODUCTS]: [
      { code: "PROMO-01", description: "Paquete promocional equipamiento básico", unit: "Kit", unitPrice: 5999.00, stock: 10 },
      { code: "PROMO-02", description: "Paquete promocional laboratorio completo", unit: "Kit", unitPrice: 8750.00, stock: 5 },
      { code: "SERV-01", description: "Servicio de mantenimiento preventivo anual", unit: "Servicio", unitPrice: 950.00, stock: null }
    ],
    [DATA_SOURCES.INVENTORY]: [
      { code: "INV-001", description: "Estetoscopio profesional", unit: "Unidad", unitPrice: 175.00, stock: 42 },
      { code: "INV-002", description: "Termómetro digital infrarrojo", unit: "Unidad", unitPrice: 65.00, stock: 120 },
      { code: "INV-003", description: "Tensiómetro automático", unit: "Unidad", unitPrice: 85.00, stock: 35 }
    ]
  });
  
  // Line items
  const [items, setItems] = useState([
    { id: 1, code: "MED-001", description: "Equipo de diagnóstico médico", unit: "Unidad", quantity: 2, unitPrice: 1250.00, discount: 5, total: 2375.00 },
    { id: 2, code: "MED-023", description: "Kit de insumos quirúrgicos", unit: "Kit", quantity: 5, unitPrice: 450.00, discount: 0, total: 2250.00 },
    { id: 3, code: "LAB-045", description: "Microscopio digital de alta resolución", unit: "Unidad", quantity: 1, unitPrice: 3650.00, discount: 10, total: 3285.00 }
  ]);
  
  // Filtered products based on search
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Calculate totals
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discount = items.reduce((sum, item) => sum + ((item.unitPrice * item.quantity * item.discount) / 100), 0);
    const tax = (subtotal) * (quote.taxRate / 100);
    const total = subtotal + tax;
    
    setQuote(prev => ({
      ...prev,
      subtotal: subtotal.toFixed(config.decimalPlaces),
      discount: discount.toFixed(config.decimalPlaces),
      tax: tax.toFixed(config.decimalPlaces),
      total: total.toFixed(config.decimalPlaces)
    }));
  }, [items, quote.taxRate, config.decimalPlaces]);
  
  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts([]);
      return;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    const filtered = productsDatabase[activeDataSource].filter(product => 
      product.description.toLowerCase().includes(searchTermLower) || 
      product.code.toLowerCase().includes(searchTermLower)
    );
    
    setFilteredProducts(filtered);
  }, [searchTerm, activeDataSource, productsDatabase]);
  
  // Add new item
  const addItem = (productData = null) => {
    const newItem = productData ? {
      id: items.length + 1,
      code: productData.code,
      description: productData.description,
      unit: productData.unit,
      quantity: 1,
      unitPrice: productData.unitPrice,
      discount: 0,
      total: productData.unitPrice
    } : {
      id: items.length + 1,
      code: "",
      description: "",
      unit: "Unidad",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      total: 0
    };
    
    setItems([...items, newItem]);
    setSearchTerm("");
    setFilteredProducts([]);
  };
  
  // Update item
  const updateItem = (id, field, value) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total if needed
        if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
          const quantity = field === 'quantity' ? value : item.quantity;
          const unitPrice = field === 'unitPrice' ? value : item.unitPrice;
          const discount = field === 'discount' ? value : item.discount;
          
          const discountAmount = (unitPrice * quantity * discount) / 100;
          updatedItem.total = Number(((unitPrice * quantity) - discountAmount).toFixed(config.decimalPlaces));
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setItems(updatedItems);
  };
  
  // Remove item
  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  // Generate new quote number
  const generateQuoteNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newNumber = `PRO-${year}-${randomNum}`;
    setQuote({...quote, number: newNumber});
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return `${config.currencySymbol}${Number(value).toFixed(config.decimalPlaces)}`;
  };
  
  // Export as PDF (mock function)
  const exportAsPDF = () => {
    alert("Exportando como PDF...");
    // Implementation would go here
  };
  
  // Save proforma (mock function)
  const saveProforma = () => {
    alert("Guardando proforma...");
    // Implementation would go here
  };
  
  // Send by email (mock function)
  const sendByEmail = () => {
    alert("Enviando por correo electrónico...");
    // Implementation would go here
  };
  
  // Copy to clipboard (mock function)
  const copyToClipboard = () => {
    alert("Copiado al portapapeles...");
    // Implementation would go here
  };
  
  // Clear form
  const clearForm = () => {
    if (confirm("¿Está seguro que desea limpiar el formulario? Perderá todos los datos ingresados.")) {
      setItems([]);
      generateQuoteNumber();
      setQuote({
        ...quote,
        date: new Date(),
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 15)),
        notes: "Precios incluyen IVA. Entrega en sus oficinas dentro del perímetro urbano sin costo adicional."
      });
    }
  };
  
  // Modern template
  const ModernTemplate = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">Proforma</h1>
          <p className="text-gray-600 mt-1">#{quote.number}</p>
          <Badge className="mt-2" variant="outline">
            Válida hasta: {format(quote.expiryDate, "PPP")}
          </Badge>
        </div>
        {config.showLogo && (
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-3">
              <Avatar className="h-16 w-16">
                <AvatarImage src={company.logo} alt="Company Logo" />
                <AvatarFallback className="bg-blue-500 text-white">{company.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-800">{company.name}</h2>
              <p className="text-sm text-gray-600">{company.email}</p>
              <p className="text-sm text-gray-600">{company.phone}</p>
              <p className="text-sm text-gray-600">{company.website}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Client and Quote Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2 bg-blue-50">
            <CardTitle className="text-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="grid grid-cols-[100px_1fr] gap-1">
                <div className="text-sm font-medium text-gray-500">Empresa:</div>
                <div className="text-sm font-semibold">{client.name}</div>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-1">
                <div className="text-sm font-medium text-gray-500">RUC:</div>
                <div className="text-sm">{client.ruc}</div>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-1">
                <div className="text-sm font-medium text-gray-500">Atención:</div>
                <div className="text-sm">{client.attention}</div>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-1">
                <div className="text-sm font-medium text-gray-500">Email:</div>
                <div className="text-sm text-blue-600">{client.email}</div>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-1">
                <div className="text-sm font-medium text-gray-500">Teléfono:</div>
                <div className="text-sm">{client.phone}</div>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-1">
                <div className="text-sm font-medium text-gray-500">Dirección:</div>
                <div className="text-sm">{client.address}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2 bg-blue-50">
            <CardTitle className="text-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Detalles de la Proforma
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="grid grid-cols-[130px_1fr] gap-1">
                <div className="text-sm font-medium text-gray-500">Fecha emisión:</div>
                <div className="text-sm">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-8",
                          !quote.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {quote.date ? format(quote.date, "PPP") : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={quote.date}
                        onSelect={(date) => setQuote({...quote, date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-[130px_1fr] gap-1">
                <div className="text-sm font-medium text-gray-500">Válido hasta:</div>
                <div className="text-sm">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-8",
                          !quote.expiryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {quote.expiryDate ? format(quote.expiryDate, "PPP") : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={quote.expiryDate}
                        onSelect={(date) => setQuote({...quote, expiryDate: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-[130px_1fr] gap-1">
                <div className="text-sm font-medium text-gray-500">Forma de pago:</div>
                <div className="text-sm">
                  <Select 
                    value={quote.paymentTerms} 
                    onValueChange={(value) => setQuote({...quote, paymentTerms: value})}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Seleccionar forma de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50% anticipo, 50% contra entrega">50% anticipo, 50% contra entrega</SelectItem>
                      <SelectItem value="100% anticipado">100% anticipado</SelectItem>
                      <SelectItem value="30 días crédito">30 días crédito</SelectItem>
                      <SelectItem value="45 días crédito">45 días crédito</SelectItem>
                      <SelectItem value="60 días crédito">60 días crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-[130px_1fr] gap-1">
                <div className="text-sm font-medium text-gray-500">Tiempo entrega:</div>
                <div className="text-sm">
                  <Select 
                    value={quote.deliveryTime} 
                    onValueChange={(value) => setQuote({...quote, deliveryTime: value})}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Seleccionar tiempo de entrega" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inmediata">Inmediata</SelectItem>
                      <SelectItem value="3 días hábiles">3 días hábiles</SelectItem>
                      <SelectItem value="5 días hábiles">5 días hábiles</SelectItem>
                      <SelectItem value="10 días hábiles">10 días hábiles</SelectItem>
                      <SelectItem value="15 días hábiles">15 días hábiles</SelectItem>
                      <SelectItem value="30 días hábiles">30 días hábiles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-[130px_1fr] gap-1">
                <div className="text-sm font-medium text-gray-500">Moneda:</div>
                <div className="text-sm">
                  <Select 
                    value={quote.currency} 
                    onValueChange={(value) => setQuote({...quote, currency: value})}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Seleccionar moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Products and Services Section */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2 bg-blue-50">
          <CardTitle className="text-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Productos y Servicios
          </CardTitle>
          {config.enableProductSearch && (
            <div className="mt-2 flex items-center">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <Select
                value={activeDataSource}
                onValueChange={setActiveDataSource}
                className="ml-2 w-44"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar fuente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DATA_SOURCES.AVAILABLE_PRODUCTS}>Productos Disponibles</SelectItem>
                  <SelectItem value={DATA_SOURCES.OFFERED_PRODUCTS}>Productos Ofertados</SelectItem>
                  <SelectItem value={DATA_SOURCES.INVENTORY}>Inventario</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="ml-2" onClick={() => setSearchTerm("")}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* Search Results */}
          {filteredProducts.length > 0 && (
            <div className="mt-2 border rounded-md bg-white max-h-60 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Código</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-[80px]">Precio</TableHead>
                    <TableHead className="w-[80px]">Stock</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.code} className="cursor-pointer hover:bg-gray-50">
                      <TableCell className="font-medium">{product.code}</TableCell>
                      <TableCell>{product.description}</TableCell>
                      <TableCell>{formatCurrency(product.unitPrice)}</TableCell>
                      <TableCell>{product.stock !== null ? product.stock : "N/A"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => addItem(product)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  {config.showItemCodes && (
                    <TableHead className="w-[80px]">Código</TableHead>
                  )}
                  <TableHead className="w-[300px]">Descripción</TableHead>
                  <TableHead className="w-[80px]">Unidad</TableHead>
                  <TableHead className="w-[80px] text-right">Cantidad</TableHead>
                  <TableHead className="w-[100px] text-right">Precio Unit.</TableHead>
                  {config.showDiscount && (
                    <TableHead className="w-[80px] text-right">Desc. %</TableHead>
                  )}
                  <TableHead className="w-[120px] text-right">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    {config.showItemCodes && (
                      <TableCell>
                        <Input 
                          value={item.code} 
                          onChange={(e) => updateItem(item.id, 'code', e.target.value)}
                          className="h-8 w-full"
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <Input 
                        value={item.description} 
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="h-8 w-full"
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
                          <SelectItem value="Hora">Hora</SelectItem>
                          <SelectItem value="Metro">Metro</SelectItem>
                          <SelectItem value="Litro">Litro</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="h-8 w-full text-right"
                        step={config.allowPartialItems ? "0.01" : "1"}
                        min="0"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input 
                        type="number" 
                        value={item.unitPrice} 
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="h-8 w-full text-right"
                        step="0.01"
                        min="0"
                      />
                    </TableCell>
                    {config.showDiscount && (
                      <TableCell className="text-right">
                        <Input 
                          type="number" 
                          value={item.discount} 
                          onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                          className="h-8 w-full text-right"
                          step="0.01"
                          min="0"
                          max="100"
                        />
                      </TableCell>
                    )}
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.total)}
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
            </Table>
          </div>
          
          <Button 
            onClick={() => addItem()} 
            variant="outline" 
            className="mt-4"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" /> Agregar ítem
          </Button>
        </CardContent>
      </Card>
      
      {/* Notes and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2 bg-blue-50">
            <CardTitle className="text-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Notas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Textarea 
              value={quote.notes}
              onChange={(e) => setQuote({...quote, notes: e.target.value})}
              rows={4}
              placeholder="Ingrese notas adicionales, condiciones especiales, etc."
              className="resize-none"
            />
            {config.includeAttachments && (
              <div className="mt-4">
                <Label className="text-sm font-medium text-gray-700">Adjuntos</Label>
                <div className="mt-1 flex items-center">
                  <Button variant="outline" className="mr-2">
                    <Plus className="h-4 w-4 mr-2" /> Agregar adjunto
                  </Button>
                  <p className="text-xs text-gray-500">No hay archivos adjuntos</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2 bg-blue-50">
            <CardTitle className="text-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Resumen
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium text-gray-500">Subtotal:</div>
                <div className="text-sm text-right">{formatCurrency(quote.subtotal)}</div>
              </div>
              {config.showDiscount && Number(quote.discount) > 0 && (
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium text-gray-500">Descuento:</div>
                  <div className="text-sm text-right">- {formatCurrency(quote.discount)}</div>
                </div>
              )}
              {config.showTax && (
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium text-gray-500">
                    IVA ({quote.taxRate}%):
                  </div>
                  <div className="text-sm text-right">{formatCurrency(quote.tax)}</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-1 pt-2 border-t">
                <div className="text-lg font-bold text-gray-800">Total:</div>
                <div className="text-lg font-bold text-right text-blue-700">{formatCurrency(quote.total)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Footer */}
      <div className="mt-4 text-center text-sm text-gray-500">
        {config.footerText}
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row justify-between mt-8 gap-4">
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={exportAsPDF}>
                  <FileDown className="h-4 w-4 mr-2" /> Exportar PDF
                </Button>
              </TooltipTrigger>
              <TooltipContent>Descargar como PDF</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">
                  <Printer className="h-4 w-4 mr-2" /> Imprimir
                </Button>
              </TooltipTrigger>
              <TooltipContent>Imprimir proforma</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={sendByEmail}>
                  <Mail className="h-4 w-4 mr-2" /> Enviar
                </Button>
              </TooltipTrigger>
              <TooltipContent>Enviar por correo electrónico</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" /> Copiar
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copiar al portapapeles</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearForm}>
            <RefreshCw className="h-4 w-4 mr-2" /> Nueva
          </Button>
          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" /> Configurar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Configuración de Proforma</DialogTitle>
                <DialogDescription>
                  Personalice las opciones de visualización y funcionalidad
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-logo" className="flex-1">
                    Mostrar logotipo
                  </Label>
                  <Switch 
                    id="show-logo" 
                    checked={config.showLogo}
                    onCheckedChange={(checked) => setConfig({...config, showLogo: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-discount" className="flex-1">
                    Mostrar descuentos
                  </Label>
                  <Switch 
                    id="show-discount" 
                    checked={config.showDiscount}
                    onCheckedChange={(checked) => setConfig({...config, showDiscount: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-tax" className="flex-1">
                    Mostrar impuestos
                  </Label>
                  <Switch 
                    id="show-tax" 
                    checked={config.showTax}
                    onCheckedChange={(checked) => setConfig({...config, showTax: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-item-codes" className="flex-1">
                    Mostrar códigos de ítems
                  </Label>
                  <Switch 
                    id="show-item-codes" 
                    checked={config.showItemCodes}
                    onCheckedChange={(checked) => setConfig({...config, showItemCodes: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-product-search" className="flex-1">
                    Habilitar búsqueda de productos
                  </Label>
                  <Switch 
                    id="enable-product-search" 
                    checked={config.enableProductSearch}
                    onCheckedChange={(checked) => setConfig({...config, enableProductSearch: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="allow-partial-items" className="flex-1">
                    Permitir cantidades parciales
                  </Label>
                  <Switch 
                    id="allow-partial-items" 
                    checked={config.allowPartialItems}
                    onCheckedChange={(checked) => setConfig({...config, allowPartialItems: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-attachments" className="flex-1">
                    Incluir adjuntos
                  </Label>
                  <Switch 
                    id="include-attachments" 
                    checked={config.includeAttachments}
                    onCheckedChange={(checked) => setConfig({...config, includeAttachments: checked})}
                  />
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="tax-rate">Tasa de impuesto (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    value={quote.taxRate}
                    onChange={(e) => setQuote({...quote, taxRate: parseFloat(e.target.value) || 0})}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="decimal-places">Decimales</Label>
                  <Select 
                    value={config.decimalPlaces.toString()} 
                    onValueChange={(value) => setConfig({...config, decimalPlaces: parseInt(value)})}
                  >
                    <SelectTrigger id="decimal-places">
                      <SelectValue placeholder="2" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="currency-symbol">Símbolo de moneda</Label>
                  <Input
                    id="currency-symbol"
                    value={config.currencySymbol}
                    onChange={(e) => setConfig({...config, currencySymbol: e.target.value})}
                    maxLength={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsConfigOpen(false)}>
                  <Check className="h-4 w-4 mr-2" /> Aplicar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={saveProforma}>
            <Save className="h-4 w-4 mr-2" /> Guardar
          </Button>
        </div>
      </div>
    </div>
  );
  
  // Classic template
  const ClassicTemplate = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-6">
        {config.showLogo && (
          <div className="flex items-center">
            <Avatar className="h-16 w-16 mr-4">
              <AvatarImage src={company.logo} alt="Company Logo" />
              <AvatarFallback className="bg-gray-200 text-gray-700">{company.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{company.name}</h2>
              <p className="text-sm text-gray-600">{company.address}</p>
              <p className="text-sm text-gray-600">{company.phone} | {company.email}</p>
            </div>
          </div>
        )}
        <div className="text-right">
          <h1 className="text-2xl font-bold">PROFORMA</h1>
          <p className="text-gray-600">#{quote.number}</p>
          <p className="text-gray-600">Fecha: {format(quote.date, "dd/MM/yyyy")}</p>
          <p className="text-gray-600">Válida hasta: {format(quote.expiryDate, "dd/MM/yyyy")}</p>
        </div>
      </div>
      
      {/* Client Information */}
      <div className="border p-4 rounded">
        <h3 className="font-bold mb-2 border-b pb-2">DATOS DEL CLIENTE</h3>
        <div className="grid grid-cols-2">
          <div>
            <p><span className="font-semibold">Empresa:</span> {client.name}</p>
            <p><span className="font-semibold">RUC:</span> {client.ruc}</p>
            <p><span className="font-semibold">Dirección:</span> {client.address}</p>
          </div>
          <div>
            <p><span className="font-semibold">Atención:</span> {client.attention}</p>
            <p><span className="font-semibold">Email:</span> {client.email}</p>
            <p><span className="font-semibold">Teléfono:</span> {client.phone}</p>
          </div>
        </div>
      </div>
      
      {/* Items Table */}
      <div>
        <Table className="border">
          <TableHeader>
            <TableRow className="bg-gray-100">
              {config.showItemCodes && <TableHead className="border">Código</TableHead>}
              <TableHead className="border">Descripción</TableHead>
              <TableHead className="border">Unidad</TableHead>
              <TableHead className="border text-right">Cantidad</TableHead>
              <TableHead className="border text-right">Precio Unit.</TableHead>
              {config.showDiscount && <TableHead className="border text-right">Desc. %</TableHead>}
              <TableHead className="border text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                {config.showItemCodes && <TableCell className="border">{item.code}</TableCell>}
                <TableCell className="border">{item.description}</TableCell>
                <TableCell className="border">{item.unit}</TableCell>
                <TableCell className="border text-right">{item.quantity}</TableCell>
                <TableCell className="border text-right">{formatCurrency(item.unitPrice)}</TableCell>
                {config.showDiscount && <TableCell className="border text-right">{item.discount}%</TableCell>}
                <TableCell className="border text-right">{formatCurrency(item.total)}</TableCell>
              </TableRow>
            ))}
            {/* Summary Rows */}
            <TableRow>
              <TableCell colSpan={config.showItemCodes ? 6 : 5} className="border text-right font-semibold">
                Subtotal:
              </TableCell>
              <TableCell className="border text-right">{formatCurrency(quote.subtotal)}</TableCell>
            </TableRow>
            {config.showTax && (
              <TableRow>
                <TableCell colSpan={config.showItemCodes ? 6 : 5} className="border text-right font-semibold">
                  IVA ({quote.taxRate}%):
                </TableCell>
                <TableCell className="border text-right">{formatCurrency(quote.tax)}</TableCell>
              </TableRow>
            )}
            <TableRow className="bg-gray-50">
              <TableCell colSpan={config.showItemCodes ? 6 : 5} className="border text-right font-bold">
                TOTAL:
              </TableCell>
              <TableCell className="border text-right font-bold">{formatCurrency(quote.total)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
      {/* Terms and Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-4 rounded">
          <h3 className="font-bold mb-2 border-b pb-2">CONDICIONES</h3>
          <p><span className="font-semibold">Forma de pago:</span> {quote.paymentTerms}</p>
          <p><span className="font-semibold">Tiempo de entrega:</span> {quote.deliveryTime}</p>
          <p><span className="font-semibold">Validez:</span> {quote.validityDays} días</p>
        </div>
        <div className="border p-4 rounded">
          <h3 className="font-bold mb-2 border-b pb-2">NOTAS</h3>
          <p>{quote.notes}</p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center text-sm text-gray-500 border-t pt-4">
        {config.footerText}
      </div>
    </div>
  );
  
  // Minimal template
  const MinimalTemplate = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Proforma #{quote.number}</h1>
          <p className="text-gray-600">Emitida: {format(quote.date, "dd MMM, yyyy")}</p>
          <p className="text-gray-600">Válida hasta: {format(quote.expiryDate, "dd MMM, yyyy")}</p>
        </div>
        {config.showLogo && (
          <Avatar className="h-14 w-14">
            <AvatarImage src={company.logo} alt="Company Logo" />
            <AvatarFallback className="bg-gray-200 text-gray-700">{company.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
      </div>
      
      {/* Company and Client */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="font-bold mb-1">{company.name}</p>
          <p className="text-sm text-gray-600">{company.address}</p>
          <p className="text-sm text-gray-600">{company.email}</p>
          <p className="text-sm text-gray-600">{company.phone}</p>
        </div>
        <div className="text-right">
          <p className="font-bold mb-1">{client.name}</p>
          <p className="text-sm text-gray-600">{client.address}</p>
          <p className="text-sm text-gray-600">Atención: {client.attention}</p>
          <p className="text-sm text-gray-600">{client.email}</p>
        </div>
      </div>
      
      {/* Items */}
      <div>
        <Table>
          <TableHeader>
            <TableRow className="border-b">
              <TableHead className="text-left">Descripción</TableHead>
              <TableHead className="text-right">Cant.</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="border-b">
                <TableCell>
                  {item.description}
                  {config.showItemCodes && <span className="text-gray-500 text-xs block">Código: {item.code}</span>}
                </TableCell>
                <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Summary */}
      <div className="w-2/5 ml-auto">
        <div className="flex justify-between py-2">
          <span>Subtotal:</span>
          <span>{formatCurrency(quote.subtotal)}</span>
        </div>
        {config.showTax && (
          <div className="flex justify-between py-2 border-t">
            <span>IVA ({quote.taxRate}%):</span>
            <span>{formatCurrency(quote.tax)}</span>
          </div>
        )}
        <div className="flex justify-between py-2 border-t border-b">
          <span className="font-bold">Total:</span>
          <span className="font-bold">{formatCurrency(quote.total)}</span>
        </div>
      </div>
      
      {/* Terms */}
      <div className="text-sm text-gray-600">
        <p><span className="font-semibold">Forma de pago:</span> {quote.paymentTerms}</p>
        <p><span className="font-semibold">Tiempo de entrega:</span> {quote.deliveryTime}</p>
        <p className="mt-2">{quote.notes}</p>
      </div>
      
      {/* Footer */}
      <div className="text-xs text-center text-gray-500 border-t pt-4">
        {config.footerText}
      </div>
    </div>
  );
  
  return (
    <div className="p-6 max-w-6xl mx-auto bg-white">
      {/* Template Switcher */}
      <Tabs value={activeTemplate} onValueChange={setActiveTemplate} className="mb-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value={TEMPLATES.MODERN} className="data-[state=active]:bg-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Moderno
          </TabsTrigger>
          <TabsTrigger value={TEMPLATES.CLASSIC} className="data-[state=active]:bg-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            Clásico
          </TabsTrigger>
          <TabsTrigger value={TEMPLATES.MINIMAL} className="data-[state=active]:bg-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Minimalista
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={TEMPLATES.MODERN}>
          <ModernTemplate />
        </TabsContent>
        <TabsContent value={TEMPLATES.CLASSIC}>
          <ClassicTemplate />
        </TabsContent>
        <TabsContent value={TEMPLATES.MINIMAL}>
          <MinimalTemplate />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedProforma;