// src/components/ProformaTemplate.jsx

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Loader2 } from "lucide-react"; // Para el indicador de carga
import { generateQuoteNumber } from "../utils/proformaUtils"; // si lo llegas a necesitar
import { format } from "date-fns";
import ItemsTable from "./ItemsTable"; // Importamos el componente de tabla de ítems
// ... importa lo que necesites

export default function ProformaTemplate({
  previewMode,
  quote,
  setQuote,
  client,
  setClient,
  items,
  setItems,
  company,
  config,
  // Búsqueda de clientes
  handleClientSearch,
  // Funciones de ítems
  addItem,
  updateItem,
  removeItem,
  reorderItems, // Nueva función para reordenar ítems
  // Funciones de formateo
  formatCurrency,
  // Lógica de búsqueda
  searchTerm,
  setSearchTerm,
  searchSource,
  setSearchSource,
  showSearchResults,
  setShowSearchResults,
  searchResults,
  addProductFromSearch,
  searchProducts,
  viewType,
  setViewType,
  loadingProducts // Estado de carga de productos
}) {
  // Estado para controlar si la sección de búsqueda está colapsada o expandida
  // Por defecto, la sección estará minimizada cuando cargue la página
  const [isSearchSectionCollapsed, setIsSearchSectionCollapsed] = useState(true);
  
  // Estados para controlar si los popovers están abiertos
  const [attentionPopoverOpen, setAttentionPopoverOpen] = useState(false);
  const [proformaNamePopoverOpen, setProformaNamePopoverOpen] = useState(false);
  const [paymentTermsPopoverOpen, setPaymentTermsPopoverOpen] = useState(false);
  const [deliveryTimePopoverOpen, setDeliveryTimePopoverOpen] = useState(false);
  
  // Referencias a los inputs para enfocarlos cuando se abren los popovers
  const attentionInputRef = useRef(null);
  const proformaNameInputRef = useRef(null);
  const paymentTermsInputRef = useRef(null);
  const deliveryTimeInputRef = useRef(null);
  
  // Referencias a los botones para poder enfocarlos después de guardar
  const attentionButtonRef = useRef(null);
  const proformaNameButtonRef = useRef(null);
  const paymentTermsButtonRef = useRef(null);
  const deliveryTimeButtonRef = useRef(null);
  
  // Efecto para loguear cada vez que cambia el cliente
  useEffect(() => {
    console.log("ProformaTemplate recibió el cliente:", client);
  }, [client]);
  
  // Monitoreo de cambios en items y quote para debugging
  useEffect(() => {
    console.log("ProformaTemplate detectó cambio en items:", 
      items.length, 
      "ítems, total calculado:", 
      items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0));
  }, [items]);
  
  useEffect(() => {
    console.log("ProformaTemplate recibió quote:", {
      subtotal: quote.subtotal,
      tax: quote.tax,
      total: quote.total,
      // Si existen los valores formateados, los mostramos
      ...(quote.subtotalFormatted && {
        subtotalFormatted: quote.subtotalFormatted,
        taxFormatted: quote.taxFormatted,
        totalFormatted: quote.totalFormatted
      })
    });
  }, [quote]);
  
  // Log para depuración de config
  useEffect(() => {
    console.log("ProformaTemplate config:", config);
    console.log("showLogo status:", config.showLogo);
  }, [config]);

  // Efecto para enfocar los inputs cuando se abren los popovers
  // Versión corregida que no causa bucles infinitos
  useEffect(() => {
    // Función para enfocar el input después de un pequeño retraso
    const focusInputWithDelay = (ref) => {
      if (ref.current) {
        const timeoutId = setTimeout(() => {
          ref.current.focus();
        }, 50);
        return () => clearTimeout(timeoutId);
      }
    };
    
    // Solo aplicamos el enfoque cuando el popover se abre, no cuando se cierra
    if (attentionPopoverOpen) {
      focusInputWithDelay(attentionInputRef);
    }
    if (proformaNamePopoverOpen) {
      focusInputWithDelay(proformaNameInputRef);
    }
    if (paymentTermsPopoverOpen) {
      focusInputWithDelay(paymentTermsInputRef);
    }
    if (deliveryTimePopoverOpen) {
      focusInputWithDelay(deliveryTimeInputRef);
    }
  }, [attentionPopoverOpen, proformaNamePopoverOpen, paymentTermsPopoverOpen, deliveryTimePopoverOpen]);
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">Proforma</h1>
          <p className="text-gray-600 mt-1">#{quote.number}</p>
        </div>
        {/* Eliminamos la condición config.showLogo para forzar la visualización del logo */}
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={company.logo} alt="Company Logo" />
              <AvatarFallback className="bg-blue-500 text-white">
                {company.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-800">{company.name}</h2>
            <p className="text-sm text-gray-600">{company.email}</p>
            <p className="text-sm text-gray-600">{company.phone}</p>
            <p className="text-sm text-gray-600">{company.website}</p>
          </div>
        </div>
      </div>

      {/* Datos de Cliente y Detalles de Proforma */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 [&>*]:flex [&>*]:flex-col [&>*]:h-full">
        {/* Card Cliente */}
        <Card className="shadow-sm">
          <CardHeader className="pt-2 pb-2 bg-blue-50">
            <CardTitle className="text-lg flex justify-between items-center h-[36px]">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Cliente
              </div>
              {/* Botones de selección de cliente (opcional) */}
              {!previewMode && (
                <div className="flex space-x-1">
                  {/* Botón de búsqueda de cliente mejorado */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    onClick={handleClientSearch}
                    title="Buscar cliente (haga doble clic sobre un cliente para seleccionarlo)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </Button>
                  
                  {/* Botón para agregar un nuevo cliente */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full text-green-600 hover:text-green-800 hover:bg-green-50"
                    onClick={() => console.log("Agregar nuevo cliente")}
                    title="Agregar nuevo cliente"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </Button>
                  
                  {/* Botón para editar cliente actual */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    onClick={() => console.log("Editar cliente actual")}
                    title="Editar cliente actual"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Button>
                  
                  {/* Botón para ver información del cliente */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    onClick={() => console.log("Ver información del cliente")}
                    title="Ver información del cliente"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-2 flex-grow">
            <div className="space-y-1">
              <div className="grid grid-cols-[130px_1fr_40px] gap-1 items-center min-h-[24px] py-0.5">
                <div className="text-sm font-medium text-gray-500">Empresa:</div>
                <div className="text-sm font-semibold">
                  {client.name ? (
                    <span className="bg-green-50 text-green-800 px-1 py-0.5 rounded border border-green-200">
                      {client.name}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic bg-gray-50 px-1 py-0.5 rounded border border-gray-200">
                      Seleccione un cliente
                    </span>
                  )}
                </div>
                <div></div>
              </div>
              <div className="grid grid-cols-[130px_1fr_40px] gap-1 items-center min-h-[24px] py-0.5">
                <div className="text-sm font-medium text-gray-500">RUC:</div>
                <div className="text-sm">{client.ruc || "-"}</div>
                <div></div>
              </div>
              <div className="grid grid-cols-[130px_1fr_40px] gap-1 items-center min-h-[24px] py-0.5">
                <div className="text-sm font-medium text-gray-500">Email:</div>
                <div className="text-sm text-blue-600">{client.email}</div>
                <div></div>
              </div>
              <div className="grid grid-cols-[130px_1fr_40px] gap-1 items-center min-h-[24px] py-0.5">
                <div className="text-sm font-medium text-gray-500">Teléfono:</div>
                <div className="text-sm">{client.phone}</div>
                <div></div>
              </div>
              <div className="grid grid-cols-[130px_1fr_40px] gap-1 items-start min-h-[24px] py-0.5">
                <div className="text-sm font-medium text-gray-500 pt-0.5">Dirección:</div>
                <div className="text-sm break-words">{client.address}</div>
                <div></div>
              </div>
              <div className="grid grid-cols-[130px_1fr_40px] gap-1 items-start min-h-[24px] py-0.5">
                <div className="text-sm font-medium text-gray-500 pt-0.5">Atención:</div>
                <div className="text-sm break-words">{client.attention}</div>
                {!previewMode && (
                  <Popover open={attentionPopoverOpen} onOpenChange={setAttentionPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button 
                        ref={attentionButtonRef}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        title="Editar atención"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[30rem] p-3">
                      <h4 className="font-medium mb-2">Atención</h4>
                      <Input 
                        ref={attentionInputRef}
                        value={client.attention || ''}
                        onChange={(e) => setClient({...client, attention: e.target.value})}
                        placeholder="Persona de contacto"
                        className="text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            // Guardar el valor y cerrar el popover al presionar Enter
                            e.preventDefault();
                            
                            // Actualizar el cliente con el nuevo valor
                            setClient({...client, attention: e.target.value});
                            
                            // Cerrar el popover
                            setAttentionPopoverOpen(false);
                            
                            // Después de un breve retraso, enfocar el siguiente botón
                            setTimeout(() => {
                              // El siguiente botón sería el de nombre de proforma
                              if (proformaNameButtonRef.current) {
                                proformaNameButtonRef.current.focus();
                              }
                            }, 100);
                          } else if (e.key === 'Escape') {
                            // Solo cerrar el popover sin guardar cambios adicionales
                            e.preventDefault();
                            e.stopPropagation();
                            setAttentionPopoverOpen(false);
                          }
                        }}
                        autoFocus
                      />
                      <div className="mt-3 text-xs text-gray-500">
                        Ingrese el nombre de la persona de contacto y presione Enter para guardar, o Esc para cancelar.
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Detalles de la Proforma */}
        <Card className="shadow-sm">
          <CardHeader className="pt-2 pb-2 bg-blue-50">
            <CardTitle className="text-lg flex items-center h-[36px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Detalles de la Proforma
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-2 flex-grow">
            <div className="space-y-1">
              <div className="grid grid-cols-[130px_1fr_40px] gap-1 items-center min-h-[24px] py-0.5">
                <div className="text-sm font-medium text-gray-500">Nombre:</div>
                <div className="text-sm">
                  {previewMode ? (
                    <span>{quote.name}</span>
                  ) : (
                    <span>{quote.name}</span>
                  )}
                </div>
                {!previewMode && (
                  <Popover open={proformaNamePopoverOpen} onOpenChange={setProformaNamePopoverOpen}>
                    <PopoverTrigger asChild>
                      <button 
                        ref={proformaNameButtonRef}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        title="Editar nombre de proforma"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[30rem] p-3">
                      <h4 className="font-medium mb-2">Nombre de la proforma</h4>
                      <Input 
                        ref={proformaNameInputRef}
                        value={quote.name || ''}
                        onChange={(e) => setQuote({...quote, name: e.target.value})}
                        placeholder="Ingrese un nombre descriptivo"
                        className="text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            // Guardar el valor y cerrar el popover al presionar Enter
                            e.preventDefault();
                            
                            // Actualizar el nombre de la proforma
                            setQuote({...quote, name: e.target.value});
                            
                            // Cerrar el popover
                            setProformaNamePopoverOpen(false);
                            
                            // Después de un breve retraso, enfocar el siguiente botón
                            setTimeout(() => {
                              // El siguiente botón sería el de forma de pago
                              if (paymentTermsButtonRef.current) {
                                paymentTermsButtonRef.current.focus();
                              }
                            }, 100);
                          } else if (e.key === 'Escape') {
                            // Solo cerrar el popover sin guardar cambios adicionales
                            e.preventDefault();
                            e.stopPropagation();
                            setProformaNamePopoverOpen(false);
                          }
                        }}
                        autoFocus
                      />
                      <div className="mt-3 text-xs text-gray-500">
                        Ingrese un nombre descriptivo y presione Enter para guardar, o Esc para cancelar.
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <div className="grid grid-cols-[130px_1fr_40px] gap-1 items-center min-h-[24px] py-0.5">
                <div className="text-sm font-medium text-gray-500">Fecha emisión:</div>
                <div className="text-sm flex items-center">
                  {typeof quote.date === 'object' && quote.date instanceof Date 
                    ? quote.date.toLocaleDateString() 
                    : new Date(quote.date).toLocaleDateString()}
                </div>
                {!previewMode && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        title="Editar fecha de emisión"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[30rem] p-2 bg-white border rounded-md shadow-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                          <h3 className="text-sm font-medium">Fecha de emisión</h3>
                          <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {typeof quote.date === 'object' && quote.date instanceof Date 
                              ? format(quote.date, "MMMM yyyy") 
                              : format(new Date(quote.date), "MMMM yyyy")}
                          </div>
                        </div>
                        <Calendar
                          mode="single"
                          selected={typeof quote.date === 'object' && quote.date instanceof Date 
                            ? quote.date 
                            : new Date(quote.date)}
                          onSelect={(date) => {
                            if (date) {
                              setQuote({...quote, date});
                            }
                          }}
                          initialFocus
                          className="rounded-md border shadow-sm"
                          classNames={{
                            day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
                            day_today: "bg-blue-100 text-blue-900",
                            day: "hover:bg-blue-50",
                            caption: "text-sm font-medium text-gray-700 mb-1",
                            head_cell: "text-xs font-medium text-gray-500",
                            nav_button: "border border-gray-200 bg-white hover:bg-gray-50",
                            nav_button_previous: "mr-1",
                            nav_button_next: "ml-1",
                          }}
                        />
                        <div className="flex justify-end pt-2 border-t border-gray-100">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-sm"
                            onClick={() => {
                              // Establecer fecha actual
                              setQuote({...quote, date: new Date()});
                            }}
                          >
                            Hoy
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              
              <div className="grid grid-cols-[130px_1fr_40px] gap-1 items-center min-h-[24px] py-0.5">
                <div className="text-sm font-medium text-gray-500">Válido hasta:</div>
                <div className="text-sm flex items-center">
                  {typeof quote.expiryDate === 'object' && quote.expiryDate instanceof Date 
                    ? quote.expiryDate.toLocaleDateString() 
                    : new Date(quote.expiryDate).toLocaleDateString()}
                </div>
                {!previewMode && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        title="Editar fecha de vencimiento"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[30rem] p-2 bg-white border rounded-md shadow-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                          <h3 className="text-sm font-medium">Fecha de vencimiento</h3>
                          <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {typeof quote.expiryDate === 'object' && quote.expiryDate instanceof Date 
                              ? format(quote.expiryDate, "MMMM yyyy") 
                              : format(new Date(quote.expiryDate), "MMMM yyyy")}
                          </div>
                        </div>
                        <Calendar
                          mode="single"
                          selected={typeof quote.expiryDate === 'object' && quote.expiryDate instanceof Date 
                            ? quote.expiryDate 
                            : new Date(quote.expiryDate)}
                          onSelect={(date) => {
                            if (date) {
                              setQuote({...quote, expiryDate: date});
                            }
                          }}
                          initialFocus
                          fromDate={new Date()} // No permitir fechas pasadas
                          className="rounded-md border shadow-sm"
                          classNames={{
                            day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
                            day_today: "bg-blue-100 text-blue-900",
                            day: "hover:bg-blue-50",
                            caption: "text-sm font-medium text-gray-700 mb-1",
                            head_cell: "text-xs font-medium text-gray-500",
                            nav_button: "border border-gray-200 bg-white hover:bg-gray-50",
                            nav_button_previous: "mr-1",
                            nav_button_next: "ml-1",
                          }}
                        />
                        <div className="flex justify-between pt-2 border-t border-gray-100">
                          <div className="text-xs text-gray-500">*No se permiten fechas pasadas</div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-sm"
                              onClick={() => {
                                // Establecer fecha a 15 días después
                                const date = new Date();
                                date.setDate(date.getDate() + 15);
                                setQuote({...quote, expiryDate: date});
                              }}
                            >
                              +15 días
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-sm"
                              onClick={() => {
                                // Establecer fecha a 30 días después
                                const date = new Date();
                                date.setDate(date.getDate() + 30);
                                setQuote({...quote, expiryDate: date});
                              }}
                            >
                              +30 días
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              
              <div className="grid grid-cols-[130px_1fr_40px] gap-1 items-center min-h-[24px] py-0.5">
                <div className="text-sm font-medium text-gray-500">Forma de pago:</div>
                <div className="text-sm flex items-center">
                  {quote.paymentTerms}
                </div>
                {!previewMode && (
                  <Popover open={paymentTermsPopoverOpen} onOpenChange={setPaymentTermsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button 
                        ref={paymentTermsButtonRef}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        title="Editar forma de pago"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[30rem] p-3">
                      <h4 className="font-medium mb-2">Forma de pago</h4>
                      <Select
                        value={quote.paymentTerms}
                        onValueChange={(value) => {
                          setQuote({...quote, paymentTerms: value});
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar forma de pago" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50% anticipo, 50% contra entrega">50% anticipo, 50% contra entrega</SelectItem>
                          <SelectItem value="Pago total anticipado">Pago total anticipado</SelectItem>
                          <SelectItem value="15 días después de entrega">15 días después de entrega</SelectItem>
                          <SelectItem value="30 días después de entrega">30 días después de entrega</SelectItem>
                          <SelectItem value="Pago al contado contra entrega">Pago al contado contra entrega</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* Opción alternativa: entrada personalizada */}
                      <div className="mt-3">
                        <h5 className="text-xs text-gray-500 mb-1">O ingrese una condición personalizada:</h5>
                        <Input 
                          ref={paymentTermsInputRef}
                          placeholder="Ej: 40% anticipo, 60% contra entrega" 
                          value={quote.paymentTerms}
                          onChange={(e) => setQuote({...quote, paymentTerms: e.target.value})}
                          className="text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              // Guardar el valor y cerrar el popover al presionar Enter
                              e.preventDefault();
                              
                              // Actualizar la forma de pago
                              setQuote({...quote, paymentTerms: e.target.value});
                              
                              // Cerrar el popover
                              setPaymentTermsPopoverOpen(false);
                              
                              // Después de un breve retraso, enfocar el siguiente botón
                              setTimeout(() => {
                                // El siguiente botón sería el de tiempo de entrega
                                if (deliveryTimeButtonRef.current) {
                                  deliveryTimeButtonRef.current.focus();
                                }
                              }, 100);
                            } else if (e.key === 'Escape') {
                              // Solo cerrar el popover sin guardar cambios adicionales
                              e.preventDefault();
                              e.stopPropagation();
                              setPaymentTermsPopoverOpen(false);
                            }
                          }}
                        />
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        Seleccione una opción o ingrese un texto personalizado y presione Enter para guardar, o Esc para cancelar.
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              
              <div className="grid grid-cols-[130px_1fr_40px] gap-1 items-center min-h-[24px] py-0.5">
                <div className="text-sm font-medium text-gray-500">Tiempo entrega:</div>
                <div className="text-sm flex items-center">
                  {quote.deliveryTime}
                </div>
                {!previewMode && (
                  <Popover open={deliveryTimePopoverOpen} onOpenChange={setDeliveryTimePopoverOpen}>
                    <PopoverTrigger asChild>
                      <button 
                        ref={deliveryTimeButtonRef}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        title="Editar tiempo de entrega"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[30rem] p-3">
                      <h4 className="font-medium mb-2">Tiempo de entrega</h4>
                      <Select
                        value={quote.deliveryTime}
                        onValueChange={(value) => {
                          setQuote({...quote, deliveryTime: value});
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar tiempo de entrega" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inmediato">Inmediato</SelectItem>
                          <SelectItem value="3 días hábiles">3 días hábiles</SelectItem>
                          <SelectItem value="5 días hábiles">5 días hábiles</SelectItem>
                          <SelectItem value="7 días hábiles">7 días hábiles</SelectItem>
                          <SelectItem value="15 días hábiles">15 días hábiles</SelectItem>
                          <SelectItem value="30 días">30 días</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* Opción alternativa: entrada personalizada */}
                      <div className="mt-3">
                        <h5 className="text-xs text-gray-500 mb-1">O ingrese un tiempo personalizado:</h5>
                        <Input 
                          ref={deliveryTimeInputRef}
                          placeholder="Ej: Según disponibilidad" 
                          value={quote.deliveryTime}
                          onChange={(e) => setQuote({...quote, deliveryTime: e.target.value})}
                          className="text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              // Guardar el valor y cerrar el popover al presionar Enter
                              e.preventDefault();
                              
                              // Actualizar el tiempo de entrega
                              setQuote({...quote, deliveryTime: e.target.value});
                              
                              // Cerrar el popover
                              setDeliveryTimePopoverOpen(false);
                              
                              // Después de un breve retraso, enfocar nuevamente el primer botón para completar el ciclo
                              setTimeout(() => {
                                // Volver al primer botón (atención)
                                if (attentionButtonRef.current) {
                                  attentionButtonRef.current.focus();
                                }
                              }, 100);
                            } else if (e.key === 'Escape') {
                              // Solo cerrar el popover sin guardar cambios adicionales
                              e.preventDefault();
                              e.stopPropagation();
                              setDeliveryTimePopoverOpen(false);
                            }
                          }}
                        />
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        Seleccione una opción o ingrese un texto personalizado y presione Enter para guardar, o Esc para cancelar.
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sección de búsqueda de productos - Ahora está encima de Productos y Servicios */}
      {!previewMode && (
        <Card className="shadow-sm mb-6 relative">
          <CardHeader 
            className="pt-3 pb-2 bg-purple-50 cursor-pointer hover:bg-purple-100 transition-colors"
            onClick={() => setIsSearchSectionCollapsed(!isSearchSectionCollapsed)}
            onDoubleClick={() => setIsSearchSectionCollapsed(false)}
            title="Haga clic para alternar o doble clic para expandir"
          >
            <CardTitle className="text-lg flex flex-col md:flex-row md:items-center md:justify-between w-full gap-3">
              <div className="flex items-center w-full" onClick={(e) => e.stopPropagation()}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                <h4 className="text-sm font-medium text-purple-800">
                  Agregar ítem desde productos disponibles:
                </h4>
                {/* Botón para minimizar/maximizar */}
                <button
                  className="ml-2 p-1.5 rounded-full bg-purple-200 hover:bg-purple-300 transition-colors"
                  onClick={(e) => {
                    // Detener la propagación para que no se active el onClick del div padre
                    e.stopPropagation();
                    setIsSearchSectionCollapsed(!isSearchSectionCollapsed);
                  }}
                  title={isSearchSectionCollapsed ? "Expandir sección" : "Minimizar sección"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-purple-800"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {isSearchSectionCollapsed ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    )}
                  </svg>
                </button>
              </div>
              
              {!isSearchSectionCollapsed && (
                <div className="flex flex-col md:flex-row gap-2" onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Buscar productos..."
                    className="h-8 pr-8 w-full md:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchTerm(value);
                      // Independientemente del contenido, mantenemos showSearchResults en false
                      setShowSearchResults(false);
                      
                      // Si hay al menos 2 caracteres o está vacío, realizamos la búsqueda
                      // para actualizar la vista de productos inferior
                      if (value.length >= 2 || value.trim() === "") {
                        searchProducts(value, searchSource);
                      }
                    }}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                      />
                    </svg>
                  </div>
                </div>

                <Select
                  value={searchSource}
                  onValueChange={(value) => {
                    setSearchSource(value);
                    // Siempre mantenemos showSearchResults en false
                    setShowSearchResults(false);
                    // Actualizamos la sección inferior con productos de la nueva fuente
                    console.log(`Cambiando a fuente: ${value} - buscando con: "${searchTerm}"`);
                    searchProducts(searchTerm || "", value);
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
                    className={`h-7 px-2 rounded-sm flex items-center justify-center ${
                      viewType === "grid" ? "bg-white shadow-sm" : ""
                    }`}
                    onClick={() => setViewType("grid")}
                    title="Vista de tarjetas"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-2 rounded-sm flex items-center justify-center ${
                      viewType === "list" ? "bg-white shadow-sm" : ""
                    }`}
                    onClick={() => setViewType("list")}
                    title="Vista de lista"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 6h16M4 10h16M4 14h16M4 18h16" 
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            )}
            </CardTitle>
          </CardHeader>
          {!isSearchSectionCollapsed && (
            <CardContent className="pt-4" onClick={(e) => e.stopPropagation()}>
            {/* Vista de tarjetas / lista con productos reales */}
            {loadingProducts ? (
              // Indicador de carga
              <div className="col-span-3 text-center py-12">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-blue-500" />
                <p className="mt-2 text-gray-500">Cargando productos...</p>
              </div>
            ) : viewType === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {searchResults.length > 0 ? (
                  // Mostrar productos de la búsqueda
                  searchResults.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-md p-3 hover:bg-gray-50 cursor-pointer transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        addProductFromSearch(product);
                      }}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">{product.code}</span>
                        {/* Quitamos el precio de la vista */}
                      </div>
                      <p className="text-sm text-gray-700 mt-1 truncate">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        {/* Datos dinámicos según la fuente */}
                        <span className={`text-xs ${
                          product.source === 'ofertados' ? 'bg-blue-100 text-blue-800' : 
                          product.source === 'disponibles' ? 'bg-green-100 text-green-800' : 
                          'bg-amber-100 text-amber-800'
                        } rounded-full px-2 py-0.5`}>
                          {product.sourceLabel || 'Producto'}
                        </span>
                        
                        {/* Información específica según la fuente */}
                        {searchSource === "ofertados" && (
                          <span className="text-xs text-gray-500">{product.unit || 'Unidad'}</span>
                        )}
                        {searchSource === "disponibles" && (
                          <span className="text-xs text-gray-500">{product.unit || 'Unidad'}</span>
                        )}
                        {searchSource === "inventario" && product.stock && (
                          <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                            Stock: {product.stock}
                          </span>
                        )}
                        {searchSource === "all" && (
                          <span className="text-xs text-gray-500">{product.unit || 'Unidad'}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  // Si no hay búsqueda, mostrar mensaje
                  <div className="col-span-3 text-center py-6">
                    <p className="text-gray-500">
                      {searchTerm 
                        ? "No se encontraron productos con ese criterio de búsqueda" 
                        : "Seleccione una fuente y haga una búsqueda para ver productos"}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Puede buscar por código, nombre o descripción
                    </p>
                    <button 
                      className="mt-3 px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                      onClick={() => searchProducts("", searchSource)}
                    >
                      Cargar productos recientes de {searchSource === "ofertados" ? "Productos Ofertados" : 
                                                    searchSource === "disponibles" ? "Productos Disponibles" : 
                                                    searchSource === "inventario" ? "Inventario" : "todas las fuentes"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Código
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Descripción
                      </th>
                      
                      {/* Eliminamos la columna dinámica de precio */}
                      
                      <th
                        scope="col"
                        className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16"
                      >
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loadingProducts ? (
                      // Indicador de carga
                      <tr>
                        <td colSpan={3} className="px-3 py-8 text-center">
                          <Loader2 className="h-6 w-6 mx-auto animate-spin text-blue-500" />
                          <p className="mt-2 text-sm text-gray-500">Cargando productos...</p>
                        </td>
                      </tr>
                    ) : searchResults.length > 0 ? (
                      // Mostrar productos de la búsqueda
                      searchResults.slice(0, 5).map((product) => (
                        <tr
                          key={product.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            addProductFromSearch(product);
                          }}
                        >
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {product.code}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-700">
                            {product.description}
                          </td>
                          
                          {/* Eliminamos la celda dinámica de precio */}
                          
                          <td className="px-3 py-2 text-center">
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              onClick={(e) => {
                                e.stopPropagation();
                                addProductFromSearch(product);
                              }}
                              title="Agregar a la proforma"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M12 4v16m8-8H4" 
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-3 py-4 text-center">
                          <p className="text-sm text-gray-500">
                            {searchTerm 
                              ? "No se encontraron productos con ese criterio de búsqueda" 
                              : "Seleccione una fuente y haga una búsqueda para ver productos"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 mb-2">
                            Puede buscar por código, nombre o descripción
                          </p>
                          <button 
                            className="mt-2 px-4 py-1.5 text-xs text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                            onClick={() => searchProducts("", searchSource)}
                          >
                            Cargar productos recientes
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
          )}
        </Card>
      )}
      
      {/* Sección de Productos/Servicios (Tabla de ítems con drag-and-drop) */}
      <ItemsTable
        items={items}
        updateItem={(id, field, value) => updateItem(id, field, value)}
        removeItem={removeItem}
        addItem={addItem}
        reorderItems={reorderItems}
        formatCurrency={formatCurrency}
        previewMode={previewMode}
        config={{
          ...config,
          showItemCodes: config.showItemCodes || true
        }}
      />

      {/* Notas y Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notas */}
        <Card className="shadow-sm">
          <CardHeader className="pt-3 pb-2 bg-blue-50">
            <CardTitle className="text-lg flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                />
              </svg>
              Notas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {!previewMode ? (
              <Textarea
                value={quote.notes}
                onChange={(e) => setQuote({ ...quote, notes: e.target.value })}
                rows={4}
                placeholder="Ingrese notas adicionales, condiciones especiales, etc."
                className="resize-none"
              />
            ) : (
              <p className="text-sm">{quote.notes}</p>
            )}
          </CardContent>
        </Card>

        {/* Resumen */}
        <Card className="shadow-sm">
          <CardHeader className="pt-3 pb-2 bg-blue-50">
            <CardTitle className="text-lg flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                />
              </svg>
              Resumen
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1 items-center py-1">
                <div className="text-sm font-medium text-gray-500">Subtotal:</div>
                <div className="text-sm text-right font-mono">
                  {formatCurrency(quote.subtotalFormatted || quote.subtotal)}
                </div>
              </div>
              {config.showTax && (
                <div className="grid grid-cols-2 gap-1 items-center py-1 bg-blue-50 rounded-md px-2">
                  <div className="text-sm font-medium text-gray-700">
                    IVA ({quote.taxRate}%):
                  </div>
                  <div className="text-sm text-right font-mono font-medium">
                    {formatCurrency(quote.taxFormatted || quote.tax)}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-1 pt-2 mt-2 border-t border-gray-300">
                <div className="text-lg font-bold text-gray-800">Total:</div>
                <div className="text-lg font-bold text-right text-blue-700 font-mono">
                  {formatCurrency(quote.totalFormatted || quote.total)}
                </div>
              </div>
              
              {/* Información para debugging */}
              <div className="mt-4 text-xs text-gray-400 border-t pt-2">
                <div className="grid grid-cols-2 gap-1">
                  <div>Items:</div>
                  <div className="text-right">{items.length} producto(s)</div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div>Valores:</div>
                  <div className="text-right">
                    {typeof quote.subtotal === 'number' 
                      ? quote.subtotal.toFixed(2) 
                      : quote.subtotal} + {typeof quote.tax === 'number' 
                      ? quote.tax.toFixed(2) 
                      : quote.tax} = {typeof quote.total === 'number' 
                      ? quote.total.toFixed(2) 
                      : quote.total}
                  </div>
                </div>
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
}