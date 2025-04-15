// src/utils/proformaUtils.js

/**
 * Genera un número de proforma basado en el año y un número aleatorio.
 * Ej: "PRO-2025-1234"
 */
export const generateQuoteNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `PRO-${year}-${randomNum}`;
  };
  
  /**
   * Crea la estructura base de una proforma vacía.
   * Opcionalmente, recibe un número personalizado.
   * Por defecto, no incluye items para iniciar limpio.
   */
  export const createEmptyProforma = (number) => {
    return {
      id: Date.now(),
      previewMode: false,
      quote: {
        number: number || generateQuoteNumber(),
        date: new Date(),
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 15)),
        paymentTerms: "50% anticipo, 50% contra entrega",
        deliveryTime: "5 días hábiles",
        subtotal: "0.00",
        tax: "0.00",
        total: "0.00",
        taxRate: 12,
        notes: "Precios incluyen IVA. Entrega en sus oficinas sin costo adicional dentro del perímetro urbano."
      },
      client: {
        id: null, // Se debe seleccionar un cliente real antes de guardar
        name: "", // Se mostrará "Seleccione un cliente" en la interfaz
        attention: "",
        email: "",
        phone: "",
        address: "",
        ruc: ""
      },
      // Lista vacía de items - la proforma empieza sin productos
      items: []
    };
  };
  