// src/page/proformas/Hook/useProforma.js

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { TEMPLATES, DATA_SOURCES } from "../Utils/constants";
import { formatCurrency } from "../Utils/formatCurrency";

/**
 * Hook personalizado para manejar la lógica principal de la Proforma.
 */
export function useProforma() {
  // Templates definitions
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATES.MODERN);

  // Base de datos y fuente de datos activa
  const [activeDataSource, setActiveDataSource] = useState(DATA_SOURCES.AVAILABLE_PRODUCTS);
  const [productsDatabase, setProductsDatabase] = useState({
    [DATA_SOURCES.AVAILABLE_PRODUCTS]: [
      { code: "MED-001", description: "Equipo de diagnóstico médico", unit: "Unidad", unitPrice: 1250.0, stock: 15 },
      { code: "MED-023", description: "Kit de insumos quirúrgicos", unit: "Kit", unitPrice: 450.0, stock: 28 },
      { code: "LAB-045", description: "Microscopio digital de alta resolución", unit: "Unidad", unitPrice: 3650.0, stock: 4 },
      { code: "MED-067", description: "Monitor de signos vitales", unit: "Unidad", unitPrice: 2150.0, stock: 7 },
      { code: "LAB-089", description: "Centrífuga de laboratorio", unit: "Unidad", unitPrice: 1850.0, stock: 3 },
    ],
    [DATA_SOURCES.OFFERED_PRODUCTS]: [
      { code: "PROMO-01", description: "Paquete promocional equipamiento básico", unit: "Kit", unitPrice: 5999.0, stock: 10 },
      { code: "PROMO-02", description: "Paquete promocional laboratorio completo", unit: "Kit", unitPrice: 8750.0, stock: 5 },
      { code: "SERV-01", description: "Servicio de mantenimiento preventivo anual", unit: "Servicio", unitPrice: 950.0, stock: null },
    ],
    [DATA_SOURCES.INVENTORY]: [
      { code: "INV-001", description: "Estetoscopio profesional", unit: "Unidad", unitPrice: 175.0, stock: 42 },
      { code: "INV-002", description: "Termómetro digital infrarrojo", unit: "Unidad", unitPrice: 65.0, stock: 120 },
      { code: "INV-003", description: "Tensiómetro automático", unit: "Unidad", unitPrice: 85.0, stock: 35 },
    ],
  });

  // Búsqueda de productos
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Información del cliente
  const [client, setClient] = useState({
    name: "Empresa ABC S.A.",
    attention: "Ing. Juan Martínez",
    email: "jmartinez@empresaabc.com",
    phone: "099-555-1234",
    address: "Av. de las Américas y Juan Tanca Marengo, Guayaquil",
    ruc: "0912345678001",
  });

  // Información de la proforma
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
    taxRate: 12,
  });

  // Información de la empresa
  const [company, setCompany] = useState({
    name: "Su Empresa S.A.",
    email: "comercial@suempresa.com",
    phone: "+593 98-765-4321",
    address: "Centro Empresarial El Ducado, Torre B, Oficina 405",
    ruc: "0987654321001",
    logo: "/company-logo.png",
    website: "www.suempresa.com",
  });

  // Configuración general
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
    showItemCodes: true,
  });

  // Items de la proforma
  const [items, setItems] = useState([
    { id: 1, code: "MED-001", description: "Equipo de diagnóstico médico", unit: "Unidad", quantity: 2, unitPrice: 1250.0, discount: 5, total: 2375.0 },
    { id: 2, code: "MED-023", description: "Kit de insumos quirúrgicos", unit: "Kit", quantity: 5, unitPrice: 450.0, discount: 0, total: 2250.0 },
    { id: 3, code: "LAB-045", description: "Microscopio digital de alta resolución", unit: "Unidad", quantity: 1, unitPrice: 3650.0, discount: 10, total: 3285.0 },
  ]);

  // Efecto para recalcular totales
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity * item.discount) / 100, 0);
    const tax = subtotal * (quote.taxRate / 100);
    const total = subtotal + tax;

    setQuote((prev) => ({
      ...prev,
      subtotal: subtotal.toFixed(config.decimalPlaces),
      discount: discount.toFixed(config.decimalPlaces),
      tax: tax.toFixed(config.decimalPlaces),
      total: total.toFixed(config.decimalPlaces),
    }));
  }, [items, quote.taxRate, config.decimalPlaces]);

  // Efecto para filtrar productos
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts([]);
      return;
    }
    const searchTermLower = searchTerm.toLowerCase();
    const filtered = productsDatabase[activeDataSource].filter(
      (product) =>
        product.description.toLowerCase().includes(searchTermLower) ||
        product.code.toLowerCase().includes(searchTermLower),
    );
    setFilteredProducts(filtered);
  }, [searchTerm, activeDataSource, productsDatabase]);

  // Funciones CRUD de ítems
  const addItem = (productData = null) => {
    const newItem = productData
      ? {
          id: items.length + 1,
          code: productData.code,
          description: productData.description,
          unit: productData.unit,
          quantity: 1,
          unitPrice: productData.unitPrice,
          discount: 0,
          total: productData.unitPrice,
        }
      : {
          id: items.length + 1,
          code: "",
          description: "",
          unit: "Unidad",
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          total: 0,
        };

    setItems([...items, newItem]);
    setSearchTerm("");
    setFilteredProducts([]);
  };

  const updateItem = (id, field, value) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (["quantity", "unitPrice", "discount"].includes(field)) {
          const quantity = field === "quantity" ? value : item.quantity;
          const unitPrice = field === "unitPrice" ? value : item.unitPrice;
          const discount = field === "discount" ? value : item.discount;
          const discountAmount = (unitPrice * quantity * discount) / 100;
          updatedItem.total = Number(((unitPrice * quantity) - discountAmount).toFixed(config.decimalPlaces));
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

  // Generar número de proforma
  const generateQuoteNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newNumber = `PRO-${year}-${randomNum}`;
    setQuote({ ...quote, number: newNumber });
  };

  // Limpiar formulario
  const clearForm = () => {
    if (confirm("¿Está seguro que desea limpiar el formulario? Se perderán los datos.")) {
      setItems([]);
      generateQuoteNumber();
      setQuote({
        ...quote,
        date: new Date(),
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 15)),
        notes: "Precios incluyen IVA. Entrega en sus oficinas dentro del perímetro urbano sin costo adicional.",
      });
    }
  };

  // Funciones de exportar, guardar, enviar, etc. (Mocks)
  const exportAsPDF = () => {
    alert("Exportando como PDF...");
    // Implementación real
  };
  const saveProforma = () => {
    alert("Guardando proforma...");
    // Implementación real
  };
  const sendByEmail = () => {
    alert("Enviando por correo electrónico...");
    // Implementación real
  };
  const copyToClipboard = () => {
    alert("Copiado al portapapeles...");
    // Implementación real
  };

  return {
    activeTemplate,
    setActiveTemplate,
    activeDataSource,
    setActiveDataSource,
    searchTerm,
    setSearchTerm,
    filteredProducts,
    client,
    setClient,
    quote,
    setQuote,
    company,
    setCompany,
    config,
    setConfig,
    items,
    addItem,
    updateItem,
    removeItem,
    clearForm,
    exportAsPDF,
    saveProforma,
    sendByEmail,
    copyToClipboard,
    generateQuoteNumber,
    formatCurrency: (value) => formatCurrency(value, config.currencySymbol, config.decimalPlaces),
  };
}
