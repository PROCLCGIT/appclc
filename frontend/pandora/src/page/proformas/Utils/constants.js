// src/page/proformas/Utils/constants.js

export const TEMPLATE_TYPES = {
  MODERN: 'modern',
  CLASSIC: 'classic',
  MINIMAL: 'minimal'
};

export const DEFAULT_TAX_RATE = 0.12; // 12% IVA

export const PAYMENT_METHODS = [
  { id: 'cash', name: 'Efectivo' },
  { id: 'credit_card', name: 'Tarjeta de crédito' },
  { id: 'bank_transfer', name: 'Transferencia bancaria' },
  { id: 'check', name: 'Cheque' }
];

export const CURRENCY_OPTIONS = [
  { id: 'USD', name: 'USD - Dólar estadounidense' },
  { id: 'EUR', name: 'EUR - Euro' },
  { id: 'MXN', name: 'MXN - Peso mexicano' }
];

export const UNITS = [
  { id: 'unit', name: 'Unidad' },
  { id: 'kit', name: 'Kit' },
  { id: 'package', name: 'Paquete' },
  { id: 'service', name: 'Servicio' },
  { id: 'hour', name: 'Hora' },
  { id: 'day', name: 'Día' },
  { id: 'month', name: 'Mes' }
];