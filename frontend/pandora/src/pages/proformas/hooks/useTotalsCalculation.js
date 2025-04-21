// src/pages/proformas/hooks/useTotalsCalculation.js

import { useState, useEffect, useRef } from 'react';
import { debounce } from '@/lib/utils/debounce';

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
  
  // Usar refs para evitar ciclos de actualización y hacer seguimiento de timestamps
  const lastUpdateTimestamp = useRef(0);
  const isUpdatingRef = useRef(false);
  
  // Crear una versión debounced de updateProforma para prevenir actualizaciones excesivas
  const debouncedUpdateProforma = useRef(
    debounce((proformaId, data) => {
      // Solo actualizar si no estamos ya en un ciclo de actualización
      if (!isUpdatingRef.current) {
        isUpdatingRef.current = true;
        try {
          updateProforma(proformaId, data);
        } finally {
          // Siempre asegurarnos de resetear la bandera
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 100);
        }
      }
    }, 500)
  ).current;
  
  // Recalcula los totales cuando cambian los items o el activeProformaId
  useEffect(() => {
    if (activeProformaId && items && items.length > 0) {
      // Verificar si hay cambios reales en los items antes de recalcular
      const activeProforma = proformas.find(p => p.id === activeProformaId);
      const currentQuote = activeProforma?.quote || {};
      
      // Solo recalcular si no hay total previo calculado o si han pasado más de 2 segundos desde el último cálculo
      const lastCalculation = currentQuote.lastCalculation || 0;
      const needsRecalculation = 
        typeof currentQuote.total !== 'number' || 
        currentQuote.total === 0 ||
        (Date.now() - lastCalculation > 2000);
      
      if (needsRecalculation) {
        console.log("Recalculando totales por cambio en items o proformaId");
        // Usamos nuestra versión con refs para evitar ciclos
        calculateTotalsWithoutCycles();
      } else {
        console.log("Omitiendo recálculo innecesario de totales");
      }
    }
  }, [activeProformaId, items, proformas]);

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
   * Versión segura de recalculateTotals que evita ciclos de actualización
   * usando refs para controlar cuándo se actualiza el estado global
   */
  const calculateTotalsWithoutCycles = (forceItems = null) => {
    // Si estamos en medio de una actualización, no hacer nada
    if (isUpdatingRef.current) {
      console.log("calculateTotalsWithoutCycles: Ya hay una actualización en progreso, evitando bucle");
      return null;
    }
    
    // Evitar actualizaciones demasiado frecuentes (menos de 300ms entre ellas)
    const now = Date.now();
    if (now - lastUpdateTimestamp.current < 300) {
      console.log("calculateTotalsWithoutCycles: Actualización demasiado frecuente, evitando cálculo");
      return null;
    }
    
    // Actualizar timestamp
    lastUpdateTimestamp.current = now;
    
    // Buscar la proforma activa
    const activeProforma = proformas.find(p => p.id === activeProformaId);
    if (!activeProforma) return null;
    
    // Usar los items forzados si se proporcionan, o los de la proforma
    const currentItems = forceItems || 
                        (Array.isArray(activeProforma.items) ? activeProforma.items : []);
    
    // Salir temprano si no hay items para evitar cálculos innecesarios
    if (currentItems.length === 0) {
      console.log("calculateTotalsWithoutCycles: No hay items, evitando cálculo innecesario");
      return null;
    }
    
    console.log("calculateTotalsWithoutCycles: usando", currentItems.length, "items");
                
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
      taxRate: taxRate,
      lastCalculation: now // Incluir timestamp
    };
    
    // Siempre actualizamos el estado local del hook (no dispara rerender del componente padre)
    setQuote(updatedQuote);
    
    // Utilizar la versión debounced para actualizar el estado global
    // Esto evita múltiples actualizaciones en cascada
    debouncedUpdateProforma(activeProformaId, { 
      quote: updatedQuote,
      lastCalculation: now
    });
    
    return updatedQuote;
  };
  
  /**
   * Versión compatible con la API anterior para no romper el código existente
   * @param {Array} forceItems - Opcionalmente usar estos items en lugar de los de la proforma
   * @param {Boolean} updateGlobalState - Parámetro ignorado, mantenido por compatibilidad
   * @returns {Object} El quote actualizado
   */
  const recalculateTotals = (forceItems = null, updateGlobalState = false) => {
    return calculateTotalsWithoutCycles(forceItems);
  };

  return {
    quote,
    setQuote,
    formatCurrency,
    recalculateTotals
  };
};

export default useTotalsCalculation;
