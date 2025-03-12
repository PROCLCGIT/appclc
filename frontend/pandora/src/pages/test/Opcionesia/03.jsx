import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Plus, Printer, Save, Trash, FileDown, ClipboardCheck, Settings, Search, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
// Reemplazamos la importación de next/image con un componente personalizado
const Image = ({ src, alt, width, height, className }) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      width={width} 
      height={height} 
      className={className} 
      style={{ objectFit: 'contain' }}
    />
  );
};

// Mock data for databases (replace with actual API calls)
const mockProducts = [
    { id: "MED-001", name: "Equipo de diagnóstico médico", unit: "Unidad", price: 1250.00, stock: 10 },
    { id: "MED-023", name: "Kit de insumos quirúrgicos", unit: "Kit", price: 450.00, stock: 50 },
    { id: "LAB-045", name: "Microscopio digital de alta resolución", unit: "Unidad", price: 3650.00, stock: 3 },
    { id: "OFT-002", name: "Lámpara de hendidura", unit: "Unidad", price: 2200.00, stock: 8 },
    { id: "CON-123", name: "Software de gestión de consultorio", unit: "Licencia", price: 800.00, stock: 100 },
];

const mockOfferedProducts = [
  { id: "OFERTA-01", name: "Paquete de inicio para consultorio", unit: "Paquete", price: 5000.00, discount: 10, stock: 5 },
];

// Helper function to find a product by ID
const findProduct = (productId, database) => {
    return database.find((p) => p.id === productId) || null;
};


// Primero definimos los componentes de plantillas
// Componente Modern Template
const ModernTemplate = ({ quote, client, items, companySettings }) => (
    <div className="p-8 bg-white shadow-md rounded-lg">
        {/* Encabezado */}
        <div className="flex justify-between items-start mb-6">
            <div>
                <h1 className="text-3xl font-bold text-blue-800">Proforma</h1>
                <p className="text-gray-600">#{quote.number}</p>
            </div>
            <div className="text-right">
                <h2 className="text-xl font-bold">{companySettings.name}</h2>
                <p>{companySettings.address}</p>
                <p>{companySettings.email}</p>
                <p>{companySettings.phone}</p>
            </div>
        </div>

        {/* Datos del Cliente y Detalles */}
        <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
                <h3 className="font-semibold">Cliente:</h3>
                <p>{client.name}</p>
                <p>{client.attention}</p>
                <p>{client.email}</p>
                <p>{client.phone}</p>
                <p>{client.address}</p>
            </div>
            <div>
                <h3 className="font-semibold">Detalles:</h3>
                <p>Fecha: {format(quote.date, companySettings.dateFormat)}</p>
                <p>Válido Hasta: {format(quote.expiryDate, companySettings.dateFormat)}</p>
                <p>Forma de Pago: {quote.paymentTerms}</p>
                <p>Tiempo de Entrega: {quote.deliveryTime}</p>
            </div>
        </div>

        {/* Tabla de Ítems (estilizada) */}
        <Table>
            <TableHeader>
                <TableRow className="bg-gray-100">
                    <TableHead>Código</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio Unit.</TableHead>
                    <TableHead className="text-right">Descuento</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.discount.toFixed(2)}%</TableCell>
                        <TableCell className="text-right">{(item.total).toFixed(2)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>

        {/* Resumen (alineado a la derecha) */}
        <div className="mt-6 text-right">
            <p>Subtotal: {quote.subtotal} {companySettings.currency}</p>
            <p>IVA ({companySettings.taxRate * 100}%): {quote.tax} {companySettings.currency}</p>
            <p className="font-bold text-xl">Total: {quote.total} {companySettings.currency}</p>
        </div>

        {/* Notas */}
        <div className="mt-8">
            <h3 className="font-semibold">Notas:</h3>
            <p>{quote.notes}</p>
        </div>
    </div>
);

// Componente Classic Template
const ClassicTemplate = ({ quote, client, items, companySettings }) => (
  <div className="p-8 bg-white shadow-md rounded-lg border">
      <div className="flex justify-between items-start mb-4">
           <div className="flex items-center">
              {companySettings.logo && (
                <Image src={companySettings.logo} alt="Logo" width={60} height={60} className="mr-4" />
              )}
                <div>
                      <h1 className="text-2xl font-bold">{companySettings.name}</h1>
                      <p>{companySettings.address}</p>
                      <p>{companySettings.email} | {companySettings.phone}</p>
                </div>
           </div>
            <div className="text-right">
                <h2 className="text-xl font-bold text-gray-700">PROFORMA</h2>
                <p>Número: {quote.number}</p>
                <p>Fecha: {format(quote.date, companySettings.dateFormat)}</p>
            </div>

      </div>

       <Separator className="my-4"/>

      {/*  Datos Cliente y Proforma */}
       <div className="grid grid-cols-2 gap-6 mb-6">
           <div>
               <h3 className="font-semibold mb-1">Facturar a:</h3>
                <p className="font-bold">{client.name}</p>
                <p>{client.attention}</p>
                <p>{client.address}</p>
                <p>{client.email}</p>
                <p>{client.phone}</p>
           </div>
          <div>
                <h3 className="font-semibold mb-1">Detalles:</h3>
                <p>Válido Hasta: {format(quote.expiryDate, companySettings.dateFormat)}</p>
                <p>Forma de Pago: {quote.paymentTerms}</p>
                <p>Tiempo de Entrega: {quote.deliveryTime}</p>
          </div>
       </div>

         {/* Tabla Items */}
      <Table>
          <TableHeader>
              <TableRow className="bg-gray-200">
                <TableHead>#</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Descuento</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
          </TableHeader>
          <TableBody>
             {items.map((item, index) => (
                <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{item.discount.toFixed(2)}%</TableCell>
                    <TableCell className="text-right">{(item.total).toFixed(2)}</TableCell>
                </TableRow>
             ))}
          </TableBody>
      </Table>

      {/*  Resumen y Notas */}
      <div className="grid grid-cols-2 gap-8 mt-6">
          <div>
             <h3 className="font-semibold mb-1">Notas:</h3>
             <p>{quote.notes}</p>
          </div>
          <div className="text-right">
             <p>Subtotal: {quote.subtotal} {companySettings.currency}</p>
             <p>IVA ({companySettings.taxRate * 100}%): {quote.tax} {companySettings.currency} </p>
            <p className="font-bold text-xl">Total: {quote.total} {companySettings.currency}</p>
          </div>
      </div>

  </div>
);

// Componente Minimalist Template
const MinimalistTemplate = ({ quote, client, items, companySettings }) => (
    <div className="p-6 bg-white rounded-md">
        <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Proforma</h1>
            <p className="text-gray-600">#{quote.number}</p>
             {companySettings.logo && (
                <Image src={companySettings.logo} alt="Logo" width={80} height={80} className="mx-auto mt-2" />
              )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
                <p><span className="font-semibold">Empresa:</span> {companySettings.name}</p>
                <p><span className="font-semibold">Dirección:</span> {companySettings.address}</p>
                <p><span className="font-semibold">Contacto:</span> {companySettings.email} / {companySettings.phone}</p>
            </div>
            <div className="text-right">
                <p><span className="font-semibold">Cliente:</span> {client.name}</p>
                <p><span className="font-semibold">Atención:</span> {client.attention}</p>
                <p><span className="font-semibold">Fecha:</span> {format(quote.date, companySettings.dateFormat)}</p>
                <p><span className="font-semibold">Válido hasta:</span> {format(quote.expiryDate, companySettings.dateFormat)}</p>
            </div>
        </div>

        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="text-left">Descripción</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                 {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{item.total.toFixed(2)}</TableCell>
                  </TableRow>
                 ))}
            </TableBody>
        </Table>

         <div className="mt-4 text-right text-sm">
             <p>Subtotal: {quote.subtotal} {companySettings.currency}</p>
             <p>IVA ({companySettings.taxRate * 100}%): {quote.tax} {companySettings.currency}</p>
             <p className="font-bold">Total: {quote.total} {companySettings.currency}</p>
         </div>

          <div className="mt-6 text-sm">
             <p className="font-semibold">Notas:</p>
             <p>{quote.notes}</p>
         </div>
    </div>
);

// Ahora definimos el array de templates con las referencias a los componentes ya definidos
const templates = [
    {
        id: "modern",
        name: "Moderna",
        preview: "/template-modern.png", 
        component: ModernTemplate, 
    },
    {
        id: "classic",
        name: "Clásica",
        preview: "/template-classic.png",
        component: ClassicTemplate,
    },
    {
        id: "minimalist",
        name: "Minimalista",
        preview: "/template-minimalist.png",
        component: MinimalistTemplate,
    },
];



// Componente principal de la aplicación
const QuoteGenerator = () => {
    const [selectedTemplate, setSelectedTemplate] = useState(templates[0]); // Plantilla por defecto
    const [client, setClient] = useState({
        name: "",
        attention: "",
        email: "",
        phone: "",
        address: "",
    });
    const [quote, setQuote] = useState({
        number: generateQuoteNumber(),
        date: new Date(),
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)), // +30 días por defecto
        paymentTerms: "",
        deliveryTime: "",
        notes: "",
        subtotal: 0,
        discount: 0,
        taxRate: 0.12, // IVA por defecto (configurable)
        tax: 0,
        total: 0,
    });
    const [items, setItems] = useState([]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Configuraciones de la empresa (ejemplo, podrías cargar desde localStorage)
    const [companySettings, setCompanySettings] = useState({
        name: "Su Empresa S.A.",
        logo: "/company-logo.png",
        email: "comercial@suempresa.com",
        phone: "+593 98-765-4321",
        address: "Dirección de su empresa",
        currency: "USD",
        dateFormat: "dd/MM/yyyy",
        defaultTerms: "Pago contra entrega.",
        taxRate: 0.12,
    });

     //Estados para controlar las búsquedas de las base de datos
     const [searchTerm, setSearchTerm] = useState("");
     const [selectedProduct, setSelectedProduct] = useState(null); //  o un objeto si quieres precargar


      // Funciones para la base de datos
    const handleProductSearch = (term, database) => {
        setSearchTerm(term);
        //Aquí iría la lógica de búsqueda real, usando `term` para filtrar.  Por ahora, usamos un mock.
        if (term.length < 3) {
          setSelectedProduct(null); //Limpia la seleccion
            return []; // No buscar hasta que haya 3 caracteres
        }

      const filtered = database.filter(product =>
      product.name.toLowerCase().includes(term.toLowerCase()) || product.id.toLowerCase().includes(term.toLowerCase())
       );
       return filtered;
    };


    const handleProductSelect = (product, database) => {
        setSelectedProduct(product);
        addItem(product, database);  // Agregamos el producto a la proforma
        setSearchTerm(""); // Limpiamos el término de búsqueda
    };

    const addItem = (product = null) => {
      let newItem;

      if (product) {
        // Si se seleccionó un producto de la BD, usa sus datos
        newItem = {
          id: product.id,
          description: product.name,
          unit: product.unit,
          quantity: 1,
          unitPrice: product.price,
          discount: product.discount || 0, // Si viene de offeredProducts
          total: product.price,
          stock: product.stock,
        };
      } else {
        // Item en blanco (nuevo)
        newItem = {
          id: `item-${Date.now()}`, // ID único
          description: "",
          unit: "Unidad",
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          total: 0,
          stock: null, // No hay stock para items nuevos
        };
      }

      setItems([...items, newItem]);
    };



    const updateItem = (id, field, value) => {
        const updatedItems = items.map((item) => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };

                if (field === "quantity" || field === "unitPrice" || field === "discount") {
                    const quantity = field === "quantity" ? parseFloat(value) || 0 : item.quantity;
                    const unitPrice = field === "unitPrice" ? parseFloat(value) || 0 : item.unitPrice;
                    const discount = field === "discount" ? parseFloat(value) || 0 : item.discount;

                    const discountAmount = (unitPrice * quantity * discount) / 100;
                    updatedItem.total = (unitPrice * quantity) - discountAmount;
                }

                 // Actualizar stock (si aplica)
                 if (field === "quantity" && item.stock !== null) {
                    // No permitimos sobrepasar el stock
                    updatedItem.quantity = Math.min(updatedItem.quantity, item.stock);
                }
                return updatedItem;
            }
            return item;
        });

        setItems(updatedItems);
    };

    const removeItem = (id) => {
        setItems(items.filter((item) => item.id !== id));
    };


    // Cálculo de totales (usando useEffect para recalcular cuando cambian los items o la tasa de impuesto)
      useEffect(() => {
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * companySettings.taxRate;
        const total = subtotal + tax;

        setQuote({
            ...quote,
            subtotal: subtotal.toFixed(2),
            tax: tax.toFixed(2),
            total: total.toFixed(2),
        });
    }, [items, companySettings.taxRate]);  // Dependencias del efecto


    // Generador de número de proforma (puedes usar una librería como uuid si necesitas mayor unicidad)
    function generateQuoteNumber() {
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 caracteres aleatorios
        return `PRO-${datePart}-${randomPart}`;
    }

      const handleSaveSettings = () => {
        // Aquí guardarías la configuración, idealmente en localStorage o en un backend
        // localStorage.setItem('companySettings', JSON.stringify(companySettings));
          setCompanySettings(companySettings);  // Actualiza el estado actual
        setIsSettingsOpen(false); // Cierra el diálogo
    };


     // Funciones para exportar
    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = () => {
        // Aquí usarías una librería como jsPDF o html2pdf para generar el PDF.
        // Este es un placeholder, la implementación real depende de la librería.
        alert("Generando PDF... (Implementación pendiente)");
    };

    const handleExportExcel = () => {
        // Similar a PDF, usarías una librería (ej. SheetJS/xlsx)
        alert("Generando Excel... (Implementación pendiente)");
    };




    // Renderizado del componente principal
  return (
    <div className="p-4 md:p-8 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-800">Generador de Proformas</h1>

          <div className="flex items-center space-x-2">
              {/* Selector de Plantillas */}
                <Select value={selectedTemplate.id} onValueChange={(value) => {
                    const template = templates.find(t => t.id === value);
                    if (template) setSelectedTemplate(template);
                }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Seleccionar plantilla" />
                    </SelectTrigger>
                    <SelectContent>
                        {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                                <div className="flex items-center">
                                    <Image src={template.preview} alt={template.name} width={40} height={40} className="mr-2 rounded"/>
                                    {template.name}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Botón de Configuración */}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Configuración</DialogTitle>
                  <DialogDescription>
                    Personaliza los datos de tu empresa y las opciones de la proforma.
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="company" className="w-full">
                  <TabsList>
                    <TabsTrigger value="company">Empresa</TabsTrigger>
                    <TabsTrigger value="quote">Proforma</TabsTrigger>
                  </TabsList>
                  <TabsContent value="company">
                    <div className="space-y-4 py-2 pb-4">
                        {/* Logo */}
                      <div className="space-y-2">
                        <Label htmlFor="company-logo">Logo</Label>
                        <Input
                          id="company-logo"
                          type="file"
                          accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setCompanySettings({ ...companySettings, logo: reader.result });
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                      </div>

                       {/*  Campos de texto */}
                      <div className="space-y-2">
                        <Label htmlFor="company-name">Nombre de la Empresa</Label>
                        <Input
                          id="company-name"
                          value={companySettings.name}
                          onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company-email">Email</Label>
                        <Input
                          id="company-email"
                          type="email"
                          value={companySettings.email}
                          onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company-phone">Teléfono</Label>
                        <Input
                          id="company-phone"
                          value={companySettings.phone}
                          onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company-address">Dirección</Label>
                        <Textarea
                          id="company-address"
                          value={companySettings.address}
                          onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                        />
                      </div>
                    </div>
                  </TabsContent>

                    {/* Configuracion de proforma */}
                  <TabsContent value="quote">
                    <div className="space-y-4 py-2 pb-4">
                      <div className="space-y-2">
                        <Label htmlFor="currency">Moneda</Label>
                        <Select
                          value={companySettings.currency}
                          onValueChange={(value) => setCompanySettings({ ...companySettings, currency: value })}
                        >
                          <SelectTrigger id="currency">
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD - Dólar estadounidense</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="MXN">MXN - Peso mexicano</SelectItem>
                            <SelectItem value="Otro">Otra...</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date-format">Formato de Fecha</Label>
                        <Select
                          value={companySettings.dateFormat}
                          onValueChange={(value) => setCompanySettings({ ...companySettings, dateFormat: value })}
                        >
                          <SelectTrigger id="date-format">
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                            <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                            <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tax-rate">Tasa de Impuesto (%)</Label>
                        <Input
                          id="tax-rate"
                          type="number"
                          value={companySettings.taxRate * 100} // Mostrar como porcentaje
                          onChange={(e) =>
                            setCompanySettings({ ...companySettings, taxRate: parseFloat(e.target.value) / 100 })
                          }
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="default-terms">Términos y Condiciones Predeterminados</Label>
                        <Textarea
                          id="default-terms"
                          value={companySettings.defaultTerms}
                          onChange={(e) => setCompanySettings({ ...companySettings, defaultTerms: e.target.value })}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button type="button" onClick={handleSaveSettings}>
                    Guardar Configuración
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
      </div>

      <Separator className="my-4" />

        {/*  Contenedor principal para la previsualización/edición de la proforma */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Datos del Cliente */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Datos del Cliente</h2>
              <div className="space-y-4">
                <Input
                  placeholder="Nombre de la empresa"
                  value={client.name}
                  onChange={(e) => setClient({ ...client, name: e.target.value })}
                />
                <Input
                  placeholder="Persona de contacto"
                  value={client.attention}
                  onChange={(e) => setClient({ ...client, attention: e.target.value })}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={client.email}
                  onChange={(e) => setClient({ ...client, email: e.target.value })}
                />
                <Input
                  placeholder="Teléfono"
                  value={client.phone}
                  onChange={(e) => setClient({ ...client, phone: e.target.value })}
                />
                <Textarea
                  placeholder="Dirección"
                  value={client.address}
                  onChange={(e) => setClient({ ...client, address: e.target.value })}
                />
              </div>
            </div>

              {/*  Detalles de la Proforma */}
            <div>
                <h2 className="text-lg font-semibold mb-3">Detalles de la Proforma</h2>

                 <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                      <Label htmlFor="quote-number">Número:</Label>
                      <Input
                          id="quote-number"
                          value={quote.number}
                          readOnly // El número se genera automáticamente
                          className="bg-gray-100" // Estilo para campo no editable
                      />
                  </div>

                   <div className="col-span-1">
                      <Label>Fecha:</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal h-10",
                              !quote.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {quote.date ? format(quote.date, "PPP") : <span>Seleccionar</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={quote.date}
                            onSelect={(date) => setQuote({ ...quote, date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                  </div>

                   <div className="col-span-1">
                        <Label>Válido Hasta:</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal h-10",
                              !quote.expiryDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {quote.expiryDate ? format(quote.expiryDate, "PPP") : <span>Seleccionar</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={quote.expiryDate}
                            onSelect={(date) => setQuote({ ...quote, expiryDate: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                   </div>
                   <div className="col-span-2">
                      <Label>Forma de Pago:</Label>
                      <Input value={quote.paymentTerms} onChange={(e) => setQuote({...quote, paymentTerms: e.target.value})}/>
                   </div>
                   <div className="col-span-2">
                      <Label>Tiempo de Entrega:</Label>
                      <Input value={quote.deliveryTime} onChange={(e) => setQuote({...quote, deliveryTime: e.target.value})}/>
                   </div>
                </div>
            </div>

             {/* Tabla de Ítems */}
            <div className="col-span-full">
              <h2 className="text-lg font-semibold mb-3">Ítems</h2>

                <Tabs defaultValue="available" className="w-full mb-4">
                    <TabsList>
                        <TabsTrigger value="available">Productos Disponibles</TabsTrigger>
                        <TabsTrigger value="offered">Productos Ofertados</TabsTrigger>
                        <TabsTrigger value="inventory">Inventario</TabsTrigger>
                    </TabsList>
                    <TabsContent value="available">
                         <div className="relative">
                            <Input
                                type="text"
                                placeholder="Buscar producto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-10" // Deja espacio para el ícono
                            />
                            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
                             {searchTerm && (
                                <ScrollArea className="absolute z-10 w-full max-h-60 mt-1 bg-white border rounded-md shadow-lg">
                                  {handleProductSearch(searchTerm, mockProducts).map((product) => (
                                    <div
                                        key={product.id}
                                        className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                                        onClick={() => handleProductSelect(product, mockProducts)}
                                    >
                                         <span>{product.name} ({product.id})</span>
                                          <span className="text-sm text-gray-500">
                                            Stock: {product.stock}
                                              {product.stock <= 5 && (
                                               <AlertTriangle className="inline-block ml-1 w-4 h-4 text-yellow-500" />
                                             )}
                                            </span>
                                     </div>
                                   ))}
                                  </ScrollArea>
                                )}
                        </div>
                    </TabsContent>
                    <TabsContent value="offered">
                         <div className="relative">
                            <Input
                                type="text"
                                placeholder="Buscar producto ofertado..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-10"
                            />
                            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
                                 {searchTerm && (
                                    <ScrollArea className="absolute z-10 w-full max-h-60 mt-1 bg-white border rounded-md shadow-lg">
                                         {handleProductSearch(searchTerm, mockOfferedProducts).map((product) => (
                                              <div
                                                   key={product.id}
                                                   className="p-2 hover:bg-gray-100 cursor-pointer"
                                                   onClick={() => handleProductSelect(product, mockOfferedProducts)}
                                               >
                                                  {product.name} ({product.id})
                                               </div>
                                           ))}
                                    </ScrollArea>
                                  )}

                        </div>
                    </TabsContent>
                    <TabsContent value="inventory">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                     <TableHead>ID</TableHead>
                                     <TableHead>Producto</TableHead>
                                     <TableHead>Stock</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                 {mockProducts.map((product) => (
                                     <TableRow key={product.id}>
                                         <TableCell>{product.id}</TableCell>
                                          <TableCell>{product.name}</TableCell>
                                         <TableCell>{product.stock}</TableCell>
                                        <TableCell>
                                         {product.stock > 10 ? (
                                            <span className="text-green-500">Disponible</span>
                                         ) : product.stock > 0 ? (
                                            <span className="text-yellow-500">Bajo Stock</span>
                                         ) : (
                                            <span className="text-red-500">Agotado</span>
                                         )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>

                        </Table>
                    </TabsContent>
                </Tabs>


              <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Código</TableHead>
                            <TableHead className="w-[300px]">Descripción</TableHead>
                            <TableHead className="w-[80px]">Unidad</TableHead>
                            <TableHead className="w-[80px] text-right">Cantidad</TableHead>
                            <TableHead className="w-[100px] text-right">Precio Unit.</TableHead>
                            <TableHead className="w-[80px] text-right">Desc. %</TableHead>
                            <TableHead className="w-[120px] text-right">Total</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input
                            value={item.id}
                            readOnly  // El código se muestra, pero no se edita aquí
                            className="h-8 w-full bg-gray-100"
                          />
                        </TableCell>
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
                              <SelectItem value="Paquete">Paquete</SelectItem> {/* Agregado */}

                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                            className="h-8 w-full text-right"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                            className="h-8 w-full text-right"
                            step="0.01"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={item.discount}
                            onChange={(e) => updateItem(item.id, 'discount', e.target.value)}
                            className="h-8 w-full text-right"
                            step="0.01"
                            max="100"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                            {item.total.toFixed(2)}  {/*  Ya no es un input */}
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
                onClick={() =>addItem()}
                variant="outline"
                className="mt-4"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" /> Agregar ítem (en blanco)
              </Button>
            </div>

              {/*  Notas y Resumen */}
            <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Notas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={quote.notes}
                            onChange={(e) => setQuote({...quote, notes: e.target.value})}
                            rows={4}
                            placeholder="Condiciones especiales, información adicional..."
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Resumen</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>{quote.subtotal} {companySettings.currency}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>IVA ({companySettings.taxRate * 100}%):</span>
                                <span>{quote.tax} {companySettings.currency}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                                <span>Total:</span>
                                <span>{quote.total} {companySettings.currency}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
          </div>
        </CardContent>
      </Card>

        {/*  Botones de Acción */}
        <div className="mt-6 flex justify-end space-x-4">

             <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" /> Imprimir
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
                <FileDown className="h-4 w-4 mr-2" /> PDF
            </Button>
             <Button variant="outline" onClick={handleExportExcel}>
               <FileDown className="h-4 w-4 mr-2" /> Excel
             </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Save className="h-4 w-4 mr-2" /> Guardar
            </Button>
      </div>
    </div>
  );
};




// Los componentes de plantilla ya están definidos al principio del archivo




export default QuoteGenerator;
