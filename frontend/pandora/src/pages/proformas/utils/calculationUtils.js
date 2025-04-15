// src/pages/proformas/utils/calculationUtils.js

/**
 * Funciones de utilidad para cálculos en proformas
 */

// Formateo de moneda mejorado para mayor precisión y robustez
export const formatCurrency = (value, config = {}) => {
  // Asegurarnos de que value es un número válido usando parseFloat para mejor manejo de strings
  let numValue;
  
  if (typeof value === 'number') {
    // Si ya es un número, lo usamos directamente
    numValue = value;
  } else if (typeof value === 'string') {
    // Si es un string, tratamos de limpiarlo y convertirlo
    // Limpiar el string de posibles símbolos de moneda, espacios, etc.
    const cleanValue = value.replace(/[^\d.-]/g, '');
    numValue = parseFloat(cleanValue) || 0;
  } else if (value === null || value === undefined) {
    // Valores nulos se manejan explícitamente
    console.warn("formatCurrency: valor null o undefined recibido, usando 0");
    numValue = 0;
  } else {
    // Para cualquier otro tipo, intentamos convertir o usamos 0
    console.warn(`formatCurrency: tipo inesperado (${typeof value}), usando 0`, value);
    numValue = 0;
  }
  
  // Prevenir errores si config no está definido
  const currencySymbol = config?.currencySymbol || "$";
  const decimalPlaces = config?.decimalPlaces || 2;
  
  // Verificamos si numValue es NaN o Infinity
  if (isNaN(numValue) || !isFinite(numValue)) {
    console.error("formatCurrency: valor numérico inválido", value);
    numValue = 0;
  }
  
  // Formateamos con toFixed para asegurar el número correcto de decimales
  return `${currencySymbol}${numValue.toFixed(decimalPlaces)}`;
};

// Recalcular subtotal, tax y total cuando cambien los items o el taxRate
export const recalculateTotals = (activeProformaId, proformas, updateProforma, setQuote, config = {}) => {
  // Buscar la proforma activa
  const activeProforma = proformas.find(p => p.id === activeProformaId);
  if (!activeProforma) return;
  
  const currentItems = Array.isArray(activeProforma.items) ? activeProforma.items : [];
  const currentQuote = activeProforma.quote || {};
  
  // Verificar que tenemos elementos para calcular
  console.log(`Recalculando totales para proforma ID: ${activeProformaId}`);
  console.log(`Items encontrados: ${currentItems.length}`);
  
  if (currentItems.length === 0) {
    console.log("No hay items para calcular totales, estableciendo en 0");
  }
  
  // Listar los ítems y sus totales para verificar
  currentItems.forEach((item, index) => {
    console.log(`Item #${index + 1}: ${item.description} - Cantidad: ${item.quantity} - Precio: ${item.unitPrice} - Total: ${item.total}`);
  });
  
  // Forzar conversión a números y acumular el total con precisión
  const subtotal = currentItems.reduce((sum, item) => {
    // Verificar primero que item sea un objeto válido
    if (!item || typeof item !== 'object') {
      console.warn("Item inválido en el cálculo de subtotal:", item);
      return sum;
    }
    
    // Verificar el tipo de datos de total
    let itemTotal;
    if (typeof item.total === 'number') {
      itemTotal = item.total;
    } else if (typeof item.total === 'string') {
      itemTotal = parseFloat(item.total) || 0;
    } else {
      // Si no es número ni string, recalcular basado en cantidad y precio
      const qty = typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity) || 0;
      const price = typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(item.unitPrice) || 0;
      const disc = typeof item.discount === 'number' ? item.discount : parseFloat(item.discount) || 0;
      
      const subTotal = qty * price;
      const discAmount = (subTotal * disc) / 100;
      itemTotal = subTotal - discAmount;
      
      console.warn(`Recalculando total para item (no era un número): ${item.description}`, {
        qty, price, disc, calculatedTotal: itemTotal
      });
    }
    
    // Usamos números con precisión y los redondeamos al final
    return sum + itemTotal;
  }, 0);
  
  const taxRate = parseFloat(currentQuote.taxRate) || 0;
  const tax = (subtotal * taxRate) / 100;
  const total = subtotal + tax;
  
  console.log("Resultados del recálculo:");
  console.log("- Subtotal calculado:", subtotal);
  console.log("- IVA calculado:", tax);
  console.log("- Total calculado:", total);

  // Almacenar valores formateados y numéricos
  const decimalPlaces = config.decimalPlaces || 2;
  const updatedQuote = {
    ...currentQuote,
    // Mantener tanto los valores numéricos como los formateados
    subtotal: subtotal,
    subtotalFormatted: subtotal.toFixed(decimalPlaces),
    tax: tax,
    taxFormatted: tax.toFixed(decimalPlaces),
    total: total,
    totalFormatted: total.toFixed(decimalPlaces),
    taxRate: taxRate
  };
  
  // Actualizar el quote local primero
  setQuote(updatedQuote);
  
  // También actualizar el quote en la proforma para asegurarnos que quede sincronizado
  // Usamos un key específico para esta actualización para evitar confusión con otras
  updateProforma(activeProformaId, { 
    quote: updatedQuote, 
    recalculatedAt: new Date().getTime(),  // Marca de tiempo para saber que esto fue recalculado
  });
  
  return updatedQuote; // Devolver el quote actualizado para posibles usos futuros
};
