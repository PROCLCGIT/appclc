/**
 * src/pages/proformas/utils/constants.js
 * Archivo de constantes para el módulo de proformas
 */

/**
 * Colores para los estados de proformas
 * Usado en gráficos, filtros y elementos UI
 */
export const ESTADO_COLORS = {
  aprobada: '#10b981',    // Verde - Success
  enviada: '#3b82f6',     // Azul - Info
  borrador: '#6b7280',    // Gris - Draft
  rechazada: '#ef4444',   // Rojo - Error
  vencida: '#f59e0b',     // Naranja - Warning
  convertida: '#8b5cf6'   // Púrpura - Transformed
};

/**
 * Mapeo de estados a etiquetas para mostrar al usuario
 */
export const ESTADO_LABELS = {
  aprobada: 'Aprobada',
  enviada: 'Enviada',
  borrador: 'Borrador',
  rechazada: 'Rechazada',
  vencida: 'Vencida',
  convertida: 'Convertida'
};

/**
 * Lista de estados de proforma para filtros, dropdowns, etc.
 */
export const ESTADOS_PROFORMA = [
  { value: 'borrador', label: ESTADO_LABELS.borrador, color: ESTADO_COLORS.borrador },
  { value: 'enviada', label: ESTADO_LABELS.enviada, color: ESTADO_COLORS.enviada },
  { value: 'aprobada', label: ESTADO_LABELS.aprobada, color: ESTADO_COLORS.aprobada },
  { value: 'rechazada', label: ESTADO_LABELS.rechazada, color: ESTADO_COLORS.rechazada },
  { value: 'vencida', label: ESTADO_LABELS.vencida, color: ESTADO_COLORS.vencida },
  { value: 'convertida', label: ESTADO_LABELS.convertida, color: ESTADO_COLORS.convertida }
];

/**
 * Periodos predefinidos para selección de fechas
 */
export const PERIODOS_PREDEFINIDOS = [
  { id: 'este-mes', label: 'Este mes' },
  { id: 'mes-anterior', label: 'Mes anterior' },
  { id: 'ultimos-3-meses', label: 'Últimos 3 meses' },
  { id: 'ultimos-6-meses', label: 'Últimos 6 meses' },
  { id: 'todo', label: 'Todo el tiempo' }
];

/**
 * Colores para temas (usado en gráficos)
 */
export const THEME_COLORS = {
  light: {
    backgroundColor: '#ffffff',
    textColor: '#333333',
    gridColor: '#e5e7eb',
    tooltipBackground: '#f9fafb',
    tooltipBorder: '#d1d5db'
  },
  dark: {
    backgroundColor: '#1f2937',
    textColor: '#f3f4f6',
    gridColor: '#374151',
    tooltipBackground: '#111827',
    tooltipBorder: '#374151'
  }
};