// src/page/proformas/Utils/formatCurrency.js

/**
 * Formatea el número con el símbolo de moneda y decimales
 */
export function formatCurrency(value, currencySymbol = "$", decimalPlaces = 2) {
    const num = Number(value) || 0;
    return `${currencySymbol}${num.toFixed(decimalPlaces)}`;
  }
  