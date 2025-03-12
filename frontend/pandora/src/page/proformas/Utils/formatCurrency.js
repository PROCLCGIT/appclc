// src/page/proformas/Utils/formatCurrency.js

/**
 * Formatea un número como moneda según la configuración regional.
 * 
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda (USD, EUR, etc.)
 * @param {string} locale - Configuración regional (es-EC, en-US, etc.), por defecto es es-EC
 * @returns {string} Cantidad formateada como moneda
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'es-EC') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Convierte una cadena con formato de moneda de nuevo a un número.
 * 
 * @param {string} formattedAmount - Cantidad con formato de moneda
 * @returns {number} Cantidad como número
 */
export const parseFormattedCurrency = (formattedAmount) => {
  // Eliminar el símbolo de moneda y otros caracteres especiales
  const cleanedString = formattedAmount.replace(/[^\d.-]/g, '');
  return parseFloat(cleanedString);
};

/**
 * Calcula el subtotal a partir de los elementos de la proforma.
 * 
 * @param {Array} items - Array de elementos de la proforma
 * @returns {number} Subtotal calculado
 */
export const calculateSubtotal = (items) => {
  return items.reduce((acc, item) => acc + (item.total || 0), 0);
};