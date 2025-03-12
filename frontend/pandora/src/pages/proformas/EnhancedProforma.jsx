// src/pages/proformas/EnhancedProforma.jsx

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Estructura para una proforma única
const createEmptyProforma = (number) => {
  return {
    id: Date.now(),
    previewMode: false,
    quote: {
      number: number || generateQuoteNumber(),
      date: new Date(),
      expiryDate: new Date(new Date().setDate(new Date().getDate() + 15)),
      paymentTerms: "50% anticipo, 50% contra entrega",
      deliveryTime: "5 días hábiles",
      subtotal: 0,
      tax: 0,
      total: 0,
      taxRate: 12,
      notes: "Precios incluyen IVA. Entrega en sus oficinas sin costo adicional dentro del perímetro urbano."
    },
    client: {
      name: "",
      attention: "",
      email: "",
      phone: "",
      address: "",
      ruc: ""
    },
    items: []
  };
};

// Función para generar un nuevo número de proforma
const generateQuoteNumber = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `PRO-${year}-${randomNum}`;
};

const EnhancedProforma = () => {
  // Sistema de pestañas para múltiples proformas
  const [proformas, setProformas] = useState([createEmptyProforma("PRO-2025-0042")]);
  const [activeProformaId, setActiveProformaId] = useState(proformas[0].id);
  
  // Obtener la proforma activa
  const activeProforma = proformas.find(p => p.id === activeProformaId) || proformas[0];
  
  // Estados para la proforma activa
  const [previewMode, setPreviewMode] = useState(activeProforma.previewMode);
  
  // Datos de la proforma activa
  const [quote, setQuote] = useState(activeProforma.quote);
  
  // Estados para la búsqueda de productos
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSource, setSearchSource] = useState("all");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [viewType, setViewType] = useState("grid"); // "grid" o "list"
  
  // Datos de cliente
  const [client, setClient] = useState({
    ...activeProforma.client,
    // Valores por defecto si está vacío
    name: activeProforma.client.name || "Empresa ABC S.A.",
    attention: activeProforma.client.attention || "Ing. Juan Martínez",
    email: activeProforma.client.email || "jmartinez@empresaabc.com",
    phone: activeProforma.client.phone || "099-555-1234",
    address: activeProforma.client.address || "Av. de las Américas y Juan Tanca Marengo, Guayaquil",
    ruc: activeProforma.client.ruc || "0912345678001"
  });

  // Datos de empresa
  const [company, setCompany] = useState({
    name: "Su Empresa S.A.",
    email: "comercial@suempresa.com",
    phone: "+593 98-765-4321",
    address: "Centro Empresarial El Ducado, Torre B, Oficina 405",
    ruc: "0987654321001",
    logo: "/company-logo.png",
    website: "www.suempresa.com"
  });
  
  // Configuración
  const [config, setConfig] = useState({
    showLogo: true,
    showDiscount: true,
    showTax: true,
    footerText: "Gracias por su preferencia. Esta proforma no constituye una factura.",
    currencySymbol: "$",
    decimalPlaces: 2,
    showItemCodes: true
  });
  
  // Ítems de la proforma
  const [items, setItems] = useState(
    activeProforma.items.length > 0 
      ? activeProforma.items 
      : [
          { id: 1, code: "MED-001", description: "Equipo de diagnóstico médico", unit: "Unidad", quantity: 2, unitPrice: 1250.00, discount: 5, total: 2375.00 },
          { id: 2, code: "MED-023", description: "Kit de insumos quirúrgicos", unit: "Kit", quantity: 5, unitPrice: 450.00, discount: 0, total: 2250.00 },
          { id: 3, code: "LAB-045", description: "Microscopio digital de alta resolución", unit: "Unidad", quantity: 1, unitPrice: 3650.00, discount: 10, total: 3285.00 }
        ]
  );

  // Función para actualizar una proforma específica
  const updateProforma = (id, updates) => {
    setProformas(proformas.map(proforma => 
      proforma.id === id ? { ...proforma, ...updates } : proforma
    ));
  };
  
  // Sincronizar estados con la proforma activa actual
  useEffect(() => {
    // Guardar cambios en la proforma actual cuando cambie algún estado
    const saveCurrentProforma = () => {
      updateProforma(activeProformaId, {
        previewMode: previewMode,
        quote: quote,
        client: client,
        items: items
      });
    };
    
    saveCurrentProforma();
  }, [previewMode, quote, client, items]);
  
  // Sincronizar con la nueva proforma activa cuando cambie
  useEffect(() => {
    const currentProforma = proformas.find(p => p.id === activeProformaId);
    if (currentProforma) {
      setPreviewMode(currentProforma.previewMode);
      setQuote(currentProforma.quote);
      setClient({
        ...currentProforma.client,
        name: currentProforma.client.name || "Empresa ABC S.A.",
        attention: currentProforma.client.attention || "Ing. Juan Martínez",
        email: currentProforma.client.email || "jmartinez@empresaabc.com",
        phone: currentProforma.client.phone || "099-555-1234", 
        address: currentProforma.client.address || "Av. de las Américas y Juan Tanca Marengo, Guayaquil",
        ruc: currentProforma.client.ruc || "0912345678001"
      });
      setItems(currentProforma.items.length > 0 
        ? currentProforma.items 
        : [
            { id: 1, code: "MED-001", description: "Equipo de diagnóstico médico", unit: "Unidad", quantity: 2, unitPrice: 1250.00, discount: 5, total: 2375.00 },
            { id: 2, code: "MED-023", description: "Kit de insumos quirúrgicos", unit: "Kit", quantity: 5, unitPrice: 450.00, discount: 0, total: 2250.00 },
            { id: 3, code: "LAB-045", description: "Microscopio digital de alta resolución", unit: "Unidad", quantity: 1, unitPrice: 3650.00, discount: 10, total: 3285.00 }
          ]
      );
    }
  }, [activeProformaId]);
  
  // Función para simular acciones
  const handleAction = (action) => {
    console.log(`Acción: ${action}`);
    if (action === "new") {
      addNewProforma();
    }
  };
  
  // Función para crear una nueva pestaña de proforma
  const addNewProforma = () => {
    const newProforma = createEmptyProforma();
    setProformas([...proformas, newProforma]);
    setActiveProformaId(newProforma.id);
  };
  
  // Función para cerrar una pestaña
  const closeProforma = (id, event) => {
    if (event) event.stopPropagation();
    
    // Si hay más de una pestaña
    if (proformas.length > 1) {
      // Si estamos cerrando la pestaña activa, activar otra
      if (id === activeProformaId) {
        const index = proformas.findIndex(p => p.id === id);
        const newActiveIndex = index === 0 ? 1 : index - 1;
        setActiveProformaId(proformas[newActiveIndex].id);
      }
      
      // Eliminar la pestaña
      setProformas(proformas.filter(p => p.id !== id));
    }
  };
  
  // Función para generar un nuevo número de proforma
  const generateQuoteNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `PRO-${year}-${randomNum}`;
  };
  
  // Función para agregar un nuevo ítem a la proforma
  const addItem = () => {
    const newItem = {
      id: items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1,
      code: "",
      description: "",
      unit: "Unidad",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      total: 0
    };
    
    setItems([...items, newItem]);
  };
  
  // Función para actualizar un ítem
  const updateItem = (id, field, value) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalcula el total si cambian cantidad, precio o descuento
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
  
  // Función para eliminar un ítem
  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Formateo de moneda
  const formatCurrency = (value) => {
    return `${config.currencySymbol}${Number(value).toFixed(config.decimalPlaces)}`;
  };
  
  // Simular búsqueda de productos en las tres tablas
  const searchProducts = (term, source = "all") => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    console.log(`Buscando "${term}" en la fuente: ${source}`);
    
    // Simulación de datos para demostración
    // En una implementación real, aquí se haría una llamada a la API
    const mockProducts = [
      // Productos Ofertados
      { id: "of-001", code: "PRO-001", description: "Monitor de Signos Vitales", source: "ofertados", price: 1450.00, unit: "Unidad" },
      { id: "of-002", code: "PRO-002", description: "Bomba de Infusión", source: "ofertados", price: 875.50, unit: "Unidad" },
      { id: "of-003", code: "PRO-003", description: "Ventilador Mecánico", source: "ofertados", price: 5600.00, unit: "Unidad" },
      
      // Productos Disponibles
      { id: "disp-001", code: "MED-045", description: "Equipo de Diagnóstico", source: "disponibles", price: 850.00, unit: "Kit" },
      { id: "disp-002", code: "MED-046", description: "Estetoscopio Premium", source: "disponibles", price: 120.75, unit: "Unidad" },
      { id: "disp-003", code: "MED-047", description: "Tensiómetro Digital", source: "disponibles", price: 95.99, unit: "Unidad" },
      
      // Inventario
      { id: "inv-001", code: "INV-102", description: "Kit de Insumos Médicos", source: "inventario", price: 325.75, unit: "Kit" },
      { id: "inv-002", code: "INV-103", description: "Termómetro Infrarrojo", source: "inventario", price: 45.50, unit: "Unidad" },
      { id: "inv-003", code: "INV-104", description: "Guantes de Látex (Caja x100)", source: "inventario", price: 22.80, unit: "Caja" }
    ];
    
    // Filtrar productos según término de búsqueda y fuente seleccionada
    let results = mockProducts.filter(product => {
      // Filtrar por término de búsqueda (código o descripción)
      const matchesTerm = 
        product.code.toLowerCase().includes(term.toLowerCase()) || 
        product.description.toLowerCase().includes(term.toLowerCase());
        
      // Filtrar por fuente seleccionada
      const matchesSource = 
        source === "all" || 
        product.source === source;
        
      return matchesTerm && matchesSource;
    });
    
    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  };
  
  // Función para agregar un producto desde los resultados de búsqueda
  const addProductFromSearch = (product) => {
    const newItem = {
      id: items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1,
      code: product.code,
      description: product.description,
      unit: product.unit,
      quantity: 1,
      unitPrice: product.price,
      discount: 0,
      total: product.price // Sin descuento por defecto
    };
    
    setItems([...items, newItem]);
    
    // Limpiar búsqueda después de agregar
    setSearchTerm("");
    setShowSearchResults(false);
  };

  // Calcular totales
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * (quote.taxRate / 100);
    const total = subtotal + tax;
    
    setQuote(prev => ({
      ...prev,
      subtotal: subtotal.toFixed(config.decimalPlaces),
      tax: tax.toFixed(config.decimalPlaces),
      total: total.toFixed(config.decimalPlaces)
    }));
  }, [items, quote.taxRate, config.decimalPlaces]);

  // Renderiza el template
  const renderActiveTemplate = () => {
    return (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-blue-800">Proforma</h1>
                <p className="text-gray-600 mt-1">#{quote.number}</p>
                <Badge className="mt-2" variant="outline">
                  Válida hasta: {quote.expiryDate.toLocaleDateString()}
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
                <CardHeader className="pt-3 pb-2 bg-blue-50">
                  <CardTitle className="text-lg flex justify-between items-start">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Cliente
                    </div>
                    {!previewMode && (
                      <div className="flex">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => console.log("Seleccionar cliente")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full ml-1"
                          onClick={() => console.log("Número 1")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7v10m-5-10v10M8 7v10" />
                          </svg>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full ml-1"
                          onClick={() => console.log("Número 2")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7s1.5-1 4-1 4 1 4 1M8 11h8M8 15s1.5 1 4 1 4-1 4-1" />
                          </svg>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full ml-1"
                          onClick={() => console.log("Letra C")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8H8" />
                          </svg>
                        </Button>
                      </div>
                    )}
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
                <CardHeader className="pt-3 pb-2 bg-blue-50">
                  <CardTitle className="text-lg flex items-start">
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
                      <div className="text-sm flex items-center">
                        {quote.date.toLocaleDateString()}
                        {!previewMode && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0 ml-2"
                            onClick={() => console.log("Editar fecha emisión")}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-[130px_1fr] gap-1">
                      <div className="text-sm font-medium text-gray-500">Válido hasta:</div>
                      <div className="text-sm flex items-center">
                        {quote.expiryDate.toLocaleDateString()}
                        {!previewMode && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0 ml-2"
                            onClick={() => console.log("Editar fecha vencimiento")}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-[130px_1fr] gap-1">
                      <div className="text-sm font-medium text-gray-500">Forma de pago:</div>
                      <div className="text-sm flex items-center">
                        {quote.paymentTerms}
                        {!previewMode && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0 ml-2"
                            onClick={() => console.log("Editar forma de pago")}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-[130px_1fr] gap-1">
                      <div className="text-sm font-medium text-gray-500">Tiempo entrega:</div>
                      <div className="text-sm flex items-center">
                        {quote.deliveryTime}
                        {!previewMode && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0 ml-2"
                            onClick={() => console.log("Editar tiempo de entrega")}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Products and Services Section */}
            <Card className="shadow-sm">
              <CardHeader className="pt-3 pb-2 bg-blue-50">
                <CardTitle className="text-lg flex flex-col md:flex-row md:items-start md:justify-between w-full gap-3">
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Productos y Servicios
                  </div>
                  
                  {!previewMode && (
                    <div className="flex flex-col md:flex-row items-start gap-2">
                      <div className="relative w-full md:w-auto">
                        <Input
                          type="text"
                          placeholder="Buscar en la tabla..."
                          className="h-8 pr-8 w-full md:w-[220px]"
                          onChange={(e) => console.log("Buscando en la tabla:", e.target.value)}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1 h-8 px-2"
                          onClick={() => console.log("Ordenar elementos")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                          </svg>
                          <span>Ordenar</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1 h-8 px-2"
                          onClick={() => console.log("Filtrar elementos")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                          <span>Filtrar</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              {!previewMode && showSearchResults && (
                <div className="px-4 pt-2 pb-0">
                  <div className="bg-white border border-gray-200 rounded-md mb-2 shadow-sm">
                    <div className="flex justify-between items-center p-3 border-b">
                      <h4 className="text-sm font-medium text-gray-700">Resultados de búsqueda</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          setShowSearchResults(false);
                          setSearchTerm("");
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    </div>
                    
                    <div className="max-h-52 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Código
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nombre
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Origen
                            </th>
                            <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Precio
                            </th>
                            <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                              Acción
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {searchResults.length > 0 ? (
                            searchResults.map(product => (
                              <tr 
                                key={product.id} 
                                className="hover:bg-gray-50 cursor-pointer" 
                                onClick={() => addProductFromSearch(product)}
                              >
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {product.code}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-700">
                                  {product.description}
                                </td>
                                <td className="px-3 py-2 text-sm">
                                  {product.source === "ofertados" && (
                                    <span className="text-blue-600 font-medium">Ofertados</span>
                                  )}
                                  {product.source === "disponibles" && (
                                    <span className="text-green-600 font-medium">Disponibles</span>
                                  )}
                                  {product.source === "inventario" && (
                                    <span className="text-amber-600 font-medium">Inventario</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">
                                  {formatCurrency(product.price)}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-right text-sm">
                                  <button
                                    type="button"
                                    className="text-blue-600 hover:text-blue-900 font-medium"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addProductFromSearch(product);
                                    }}
                                  >
                                    Seleccionar
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-3 py-4 text-center text-sm text-gray-500">
                                No se encontraron resultados para "{searchTerm}"
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    <p className="text-xs text-gray-500 p-2 italic border-t">
                      Haga clic en una fila para seleccionar el producto y agregarlo a la proforma
                    </p>
                  </div>
                </div>
              )}
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
                        {!previewMode && <TableHead className="w-[50px]"></TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          {config.showItemCodes && (
                            <TableCell>
                              {previewMode ? item.code : (
                                <Input 
                                  value={item.code} 
                                  onChange={(e) => updateItem(item.id, 'code', e.target.value)}
                                  className="h-8 w-full"
                                />
                              )}
                            </TableCell>
                          )}
                          <TableCell>
                            {previewMode ? item.description : (
                              <Input 
                                value={item.description} 
                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                className="h-8 w-full"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {previewMode ? item.unit : (
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
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {previewMode ? item.quantity : (
                              <Input 
                                type="number" 
                                value={item.quantity} 
                                onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                className="h-8 w-full text-right"
                                min="0"
                                step="1"
                              />
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {previewMode ? formatCurrency(item.unitPrice) : (
                              <Input 
                                type="number" 
                                value={item.unitPrice} 
                                onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="h-8 w-full text-right"
                                min="0"
                                step="0.01"
                              />
                            )}
                          </TableCell>
                          {config.showDiscount && (
                            <TableCell className="text-right">
                              {previewMode ? `${item.discount}%` : (
                                <Input 
                                  type="number" 
                                  value={item.discount} 
                                  onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                                  className="h-8 w-full text-right"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                />
                              )}
                            </TableCell>
                          )}
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.total)}
                          </TableCell>
                          {!previewMode && (
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeItem(item.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                  <path d="M10 11v6"></path>
                                  <path d="M14 11v6"></path>
                                </svg>
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {!previewMode && (
                  <div className="mt-4 border-t pt-4">
                    <div className="mt-4 flex justify-between items-center mb-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={addItem}
                        className="flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Agregar ítem en blanco
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-blue-600"
                        onClick={() => console.log("Ver todos los productos")}
                      >
                        Ver catálogo completo →
                      </Button>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 bg-purple-50 rounded-md p-3">
                      <div className="flex items-center mb-2 md:mb-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <h4 className="text-sm font-medium text-purple-800">Agregar ítem desde productos disponibles:</h4>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-2">
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="Buscar productos..."
                            className="h-8 pr-8 w-full md:w-[250px]"
                            value={searchTerm}
                            onChange={(e) => {
                              const value = e.target.value;
                              setSearchTerm(value);
                              searchProducts(value, searchSource);
                            }}
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>
                        
                        <Select 
                          value={searchSource}
                          onValueChange={(value) => {
                            setSearchSource(value);
                            searchProducts(searchTerm, value);
                          }}
                        >
                          <SelectTrigger className="h-8 w-full md:w-[180px]">
                            <SelectValue placeholder="Seleccionar fuente" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas las tablas</SelectItem>
                            <SelectItem value="ofertados">Productos Ofertados</SelectItem>
                            <SelectItem value="disponibles">Productos Disponibles</SelectItem>
                            <SelectItem value="inventario">Inventario</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <div className="bg-gray-100 rounded-md p-0.5 flex items-center h-8">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`h-7 px-2 rounded-sm flex items-center justify-center ${viewType === 'grid' ? 'bg-white shadow-sm' : ''}`}
                            onClick={() => setViewType('grid')}
                            title="Vista de tarjetas"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`h-7 px-2 rounded-sm flex items-center justify-center ${viewType === 'list' ? 'bg-white shadow-sm' : ''}`}
                            onClick={() => setViewType('list')}
                            title="Vista de lista"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {viewType === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Vista de tarjetas */}
                        <div className="border rounded-md p-3 hover:bg-gray-50 cursor-pointer transition" 
                            onClick={() => {
                              const product = {
                                id: "prod-1", 
                                code: "MED-101", 
                                description: "Equipo de Diagnóstico Portátil", 
                                source: "productos", 
                                price: 1250.00, 
                                unit: "Unidad"
                              };
                              addProductFromSearch(product);
                            }}>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">MED-101</span>
                            <span className="text-blue-600 font-medium">${1250.00.toFixed(2)}</span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1 truncate">Equipo de Diagnóstico Portátil</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">Unidad</span>
                            <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">Stock: 15</span>
                          </div>
                        </div>
                        
                        <div className="border rounded-md p-3 hover:bg-gray-50 cursor-pointer transition"
                            onClick={() => {
                              const product = {
                                id: "prod-2", 
                                code: "MED-202", 
                                description: "Kit de Insumos Quirúrgicos", 
                                source: "productos", 
                                price: 450.00, 
                                unit: "Kit"
                              };
                              addProductFromSearch(product);
                            }}>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">MED-202</span>
                            <span className="text-blue-600 font-medium">${450.00.toFixed(2)}</span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1 truncate">Kit de Insumos Quirúrgicos</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">Kit</span>
                            <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">Stock: 28</span>
                          </div>
                        </div>
                        
                        <div className="border rounded-md p-3 hover:bg-gray-50 cursor-pointer transition"
                            onClick={() => {
                              const product = {
                                id: "prod-3", 
                                code: "LAB-305", 
                                description: "Microscopio de Alta Resolución", 
                                source: "productos", 
                                price: 3650.00, 
                                unit: "Unidad"
                              };
                              addProductFromSearch(product);
                            }}>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">LAB-305</span>
                            <span className="text-blue-600 font-medium">${3650.00.toFixed(2)}</span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1 truncate">Microscopio de Alta Resolución</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">Unidad</span>
                            <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">Stock: 5</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-md overflow-hidden">
                        {/* Vista de lista */}
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
                              <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                              <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                              <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => {
                                  const product = {
                                    id: "prod-1", 
                                    code: "MED-101", 
                                    description: "Equipo de Diagnóstico Portátil", 
                                    source: "productos", 
                                    price: 1250.00, 
                                    unit: "Unidad"
                                  };
                                  addProductFromSearch(product);
                                }}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">MED-101</td>
                              <td className="px-3 py-2 text-sm text-gray-700">Equipo de Diagnóstico Portátil</td>
                              <td className="px-3 py-2 text-sm text-gray-500">Unidad</td>
                              <td className="px-3 py-2 text-right whitespace-nowrap text-sm text-gray-500">15</td>
                              <td className="px-3 py-2 text-right whitespace-nowrap text-sm font-medium text-blue-600">${1250.00.toFixed(2)}</td>
                              <td className="px-3 py-2 text-center">
                                <button 
                                  className="text-blue-600 hover:text-blue-900"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const product = {
                                      id: "prod-1", 
                                      code: "MED-101", 
                                      description: "Equipo de Diagnóstico Portátil", 
                                      source: "productos", 
                                      price: 1250.00, 
                                      unit: "Unidad"
                                    };
                                    addProductFromSearch(product);
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => {
                                  const product = {
                                    id: "prod-2", 
                                    code: "MED-202", 
                                    description: "Kit de Insumos Quirúrgicos", 
                                    source: "productos", 
                                    price: 450.00, 
                                    unit: "Kit"
                                  };
                                  addProductFromSearch(product);
                                }}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">MED-202</td>
                              <td className="px-3 py-2 text-sm text-gray-700">Kit de Insumos Quirúrgicos</td>
                              <td className="px-3 py-2 text-sm text-gray-500">Kit</td>
                              <td className="px-3 py-2 text-right whitespace-nowrap text-sm text-gray-500">28</td>
                              <td className="px-3 py-2 text-right whitespace-nowrap text-sm font-medium text-blue-600">${450.00.toFixed(2)}</td>
                              <td className="px-3 py-2 text-center">
                                <button 
                                  className="text-blue-600 hover:text-blue-900"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const product = {
                                      id: "prod-2", 
                                      code: "MED-202", 
                                      description: "Kit de Insumos Quirúrgicos", 
                                      source: "productos", 
                                      price: 450.00, 
                                      unit: "Kit"
                                    };
                                    addProductFromSearch(product);
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => {
                                  const product = {
                                    id: "prod-3", 
                                    code: "LAB-305", 
                                    description: "Microscopio de Alta Resolución", 
                                    source: "productos", 
                                    price: 3650.00, 
                                    unit: "Unidad"
                                  };
                                  addProductFromSearch(product);
                                }}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">LAB-305</td>
                              <td className="px-3 py-2 text-sm text-gray-700">Microscopio de Alta Resolución</td>
                              <td className="px-3 py-2 text-sm text-gray-500">Unidad</td>
                              <td className="px-3 py-2 text-right whitespace-nowrap text-sm text-gray-500">5</td>
                              <td className="px-3 py-2 text-right whitespace-nowrap text-sm font-medium text-blue-600">${3650.00.toFixed(2)}</td>
                              <td className="px-3 py-2 text-center">
                                <button 
                                  className="text-blue-600 hover:text-blue-900"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const product = {
                                      id: "prod-3", 
                                      code: "LAB-305", 
                                      description: "Microscopio de Alta Resolución", 
                                      source: "productos", 
                                      price: 3650.00, 
                                      unit: "Unidad"
                                    };
                                    addProductFromSearch(product);
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Notes and Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardHeader className="pt-3 pb-2 bg-blue-50">
                  <CardTitle className="text-lg flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Notas
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {!previewMode ? (
                    <Textarea 
                      value={quote.notes}
                      onChange={(e) => setQuote({...quote, notes: e.target.value})}
                      rows={4}
                      placeholder="Ingrese notas adicionales, condiciones especiales, etc."
                      className="resize-none"
                    />
                  ) : (
                    <p className="text-sm">{quote.notes}</p>
                  )}
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader className="pt-3 pb-2 bg-blue-50">
                  <CardTitle className="text-lg flex items-start">
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
          </div>
        );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Proformas</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {previewMode ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              )}
            </svg>
            <span className="hidden sm:inline">{previewMode ? "Editar" : "Vista previa"}</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => handleAction("new")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Nueva</span>
          </Button>
        </div>
      </div>

      {/* Pestañas de Proformas */}
      <Tabs 
        value={activeProformaId.toString()} 
        onValueChange={id => setActiveProformaId(parseInt(id))}
        className="w-full"
      >
        <div className="flex items-center mb-4 overflow-x-auto pb-2">
          <TabsList className="bg-muted/20 border h-10 rounded-md p-1">
            {proformas.map(proforma => (
              <TabsTrigger 
                key={proforma.id} 
                value={proforma.id.toString()}
                className="relative px-6 data-[state=active]:bg-white"
              >
                <span className="mr-4">Proforma {proforma.quote.number.split('-').pop()}</span>
                {proformas.length > 1 && (
                  <button 
                    onClick={(e) => closeProforma(proforma.id, e)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full hover:bg-gray-200 p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </TabsTrigger>
            ))}
            <Button 
              variant="ghost" 
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
              onClick={addNewProforma}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </Button>
          </TabsList>
        </div>

        {proformas.map(proforma => (
          <TabsContent
            key={proforma.id}
            value={proforma.id.toString()}
            className="mt-0"
          >
            <Card className="border shadow-sm">
              <CardContent className="p-0">
                <div className="border-b p-4 bg-muted/20">
                  <div className="flex justify-end items-center">
                    {/* Vista previa button removed from here as it's now in the header */}
                  </div>
                </div>

                <div className={`p-6 ${previewMode ? 'bg-gray-50' : ''}`}>
                  {renderActiveTemplate()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Botones de acción en la parte inferior */}
      <div className="mt-8 border-t pt-6 pb-2 flex justify-end gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => handleAction("export")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar PDF
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => handleAction("print")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => handleAction("share")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Compartir
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => handleAction("configure")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Configurar
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => console.log("Generar proforma")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Generar
        </Button>
        <Button 
          className="bg-blue-600 hover:bg-blue-700" 
          size="sm"
          onClick={() => handleAction("save")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Guardar
        </Button>
      </div>
    </div>
  );
};

export default EnhancedProforma;
