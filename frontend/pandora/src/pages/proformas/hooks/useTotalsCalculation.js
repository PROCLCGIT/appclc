// src/pages/proformas/hooks/useTotalsCalculation.js

import { useState, useEffect } from 'react';

/**
 * Hook personalizado para cálculo de totales de proforma
 */
export const useTotalsCalculation = ({ 
  activeProformaId,
  proformas,
  updateProforma,
  config,
  items
}) => {
  const [quote, setQuote] = useState({
    subtotal: 0,
    subtotalFormatted: '0.00',
    tax: 0,
    taxFormatted: '0.00',
    total: 0,
    totalFormatted: '0.00',
    taxRate: 15,
  });

  // Recalcula los totales cuando cambian los items o el activeProformaId
  useEffect(() => {
    if (activeProformaId && items && items.length > 0) {
      recalculateTotals();
    }
  }, [activeProformaId, items]);

  /**
   * Formatea valores monetarios con el símbolo de moneda configurado
   */
  const formatCurrency = (value) => {
    // Asegurarnos de que value es un número válido usando parseFloat para mejor manejo de strings
    let numValue;
    
    if (typeof value === 'number') {
      numValue = value;
    } else if (typeof value === 'string') {
      // Limpiar el string de posibles símbolos de moneda, espacios, etc.
      const cleanValue = value.replace(/[^\d.-]/g, '');
      numValue = parseFloat(cleanValue) || 0;
    } else {
      numValue = 0;
    }
    
    // Prevenir errores si config no está definido
    const currencySymbol = config?.currencySymbol || "$";
    const decimalPlaces = config?.decimalPlaces || 2;
    
    // Formateamos con toFixed para asegurar el número correcto de decimales
    return `${currencySymbol}${numValue.toFixed(decimalPlaces)}`;
  };

  /**
   * Recalcula subtotal, impuesto y total basado en los items
   * @param {Array} forceItems - Opcionalmente usar estos items en lugar de los de la proforma
   * @returns {Object} El quote actualizado
   */
  const recalculateTotals = (forceItems = null) => {
    // Buscar la proforma activa
    const activeProforma = proformas.find(p => p.id === activeProformaId);
    if (!activeProforma) return null;
    
    // Usar los items forzados si se proporcionan, o los de la proforma
    const currentItems = forceItems || 
                        (Array.isArray(activeProforma.items) ? activeProforma.items : []);
    
    // Salir temprano si no hay items para evitar cálculos innecesarios
    if (currentItems.length === 0) {
      console.log("recalculateTotals: No hay items, evitando cálculo innecesario");
      return null;
    }
    
    console.log("recalculateTotals: usando", currentItems.length, "items", 
                forceItems ? "(proporcionados directamente)" : "(de la proforma)");
                
    const currentQuote = activeProforma.quote || {};
    
    // Forzar conversión a números y acumular el total con precisión
    const subtotal = currentItems.reduce((sum, item) => {
      // Convertir explícitamente a número o usar 0 si es inválido
      const itemTotal = typeof item.total === 'number' ? item.total : parseFloat(item.total) || 0;
      // Usamos números con precisión y los redondeamos al final
      return sum + itemTotal;
    }, 0);
    
    const taxRate = parseFloat(currentQuote.taxRate) || 0;
    const tax = (subtotal * taxRate) / 100;
    const total = subtotal + tax;
    
    console.log("Recalculando totales:");
    console.log("- Items:", currentItems.length);
    console.log("- Items desglosados:", currentItems.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total
    })));
    console.log("- Subtotal calculado:", subtotal);
    console.log("- IVA calculado:", tax);
    console.log("- Total calculado:", total);
  
    // Almacenamos los valores como números para facilitar cálculos futuros
    // pero los convertimos a string formateado para mantener la precisión en la interfaz
    const decimalPlaces = config.decimalPlaces || 2;
    const updatedQuote = {
      ...currentQuote,
      // Mantener tanto el valor numérico como el string formateado
      subtotal: subtotal,
      subtotalFormatted: subtotal.toFixed(decimalPlaces),
      tax: tax,
      taxFormatted: tax.toFixed(decimalPlaces),
      total: total,
      totalFormatted: total.toFixed(decimalPlaces),
      taxRate: taxRate
    };
    
    // Comparar con el quote actual para evitar actualizaciones innecesarias
    // Reutilizamos la misma referencia a la proforma activa que ya obtuvimos arriba
    const currentQuoteInProforma = activeProforma?.quote || {};
    
    // Solo actualizar si algún valor numérico ha cambiado realmente
    const needsUpdate = (
      Math.abs(parseFloat(currentQuoteInProforma.subtotal || 0) - subtotal) > 0.001 ||
      Math.abs(parseFloat(currentQuoteInProforma.tax || 0) - tax) > 0.001 ||
      Math.abs(parseFloat(currentQuoteInProforma.total || 0) - total) > 0.001 ||
      parseFloat(currentQuoteInProforma.taxRate || 0) !== taxRate
    );
    
    if (needsUpdate) {
      console.log("Actualizando quote por cambios en valores calculados");
      
      // Actualizar el quote local primero
      setQuote(updatedQuote);
      
      // Marcar la hora de la última actualización para reducir actualizaciones frecuentes
      updatedQuote.lastCalculation = Date.now();
      
      // También actualizar el quote en la proforma
      updateProforma(activeProformaId, { 
        quote: updatedQuote,
        lastCalculation: Date.now() 
      });
    } else {
      console.log("Quote ya está actualizado, evitando actualización innecesaria");
    }
    
    return updatedQuote; // Devolver el quote actualizado para posibles usos futuros
  };

  return {
    quote,
    setQuote,
    formatCurrency,
    recalculateTotals
  };
};

export default useTotalsCalculation;
