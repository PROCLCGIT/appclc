// src/pages/proformas/utils/formatUtils.js
import i18next from 'i18next';

/**
 * Obtiene el código de idioma actual
 * @returns {string} Código de idioma (ej: 'es', 'en')
 */
const getCurrentLanguage = () => {
  return i18next.language || 'es';
};

/**
 * Obtiene la configuración regional basada en el idioma
 * @returns {string} Configuración regional (ej: 'es-EC', 'en-US')
 */
const getLocale = () => {
  const lang = getCurrentLanguage();
  switch (lang) {
    case 'en':
      return 'en-US';
    case 'es':
    default:
      return 'es-EC';
  }
};

/**
 * Formatea un número como moneda
 * @param {number} value - Valor a formatear
 * @param {Object} options - Opciones de formateo
 * @returns {string} Valor formateado como moneda
 */
export const formatCurrency = (value, options = {}) => {
  const defaultOptions = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  };

  // Merger opciones personalizadas con las predeterminadas
  const config = { ...defaultOptions, ...options };
  
  // Manejar valores nulos o indefinidos
  if (value === null || value === undefined) {
    return new Intl.NumberFormat(getLocale(), config).format(0);
  }

  // Convertir a número si es necesario
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Verificar si es un número válido
  if (isNaN(numericValue)) {
    console.warn('formatCurrency recibió un valor no numérico:', value);
    return new Intl.NumberFormat(getLocale(), config).format(0);
  }
  
  return new Intl.NumberFormat(getLocale(), config).format(numericValue);
};

/**
 * Formatea un número como porcentaje
 * @param {number} value - Valor a formatear (ej: 0.45)
 * @param {Object} options - Opciones de formateo
 * @returns {string} Valor formateado como porcentaje (ej: 45%)
 */
export const formatPercent = (value, options = {}) => {
  const defaultOptions = {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  };
  
  // Merger opciones personalizadas con las predeterminadas
  const config = { ...defaultOptions, ...options };
  
  // Manejar valores nulos o indefinidos
  if (value === null || value === undefined) {
    return new Intl.NumberFormat(getLocale(), config).format(0);
  }
  
  // Convertir a número si es necesario
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Verificar si es un número válido
  if (isNaN(numericValue)) {
    console.warn('formatPercent recibió un valor no numérico:', value);
    return new Intl.NumberFormat(getLocale(), config).format(0);
  }
  
  // Convertir del formato decimal (0-1) a porcentaje si es necesario
  if (options.normalizeToPercent && numericValue <= 1) {
    return new Intl.NumberFormat(getLocale(), config).format(numericValue);
  } else {
    // Si es mayor a 1, asumimos que ya está en forma de porcentaje (ej: 45)
    return new Intl.NumberFormat(getLocale(), config).format(numericValue / 100);
  }
};

/**
 * Formatea un número con separadores de miles
 * @param {number} value - Valor a formatear
 * @param {Object} options - Opciones de formateo
 * @returns {string} Valor formateado con separador de miles
 */
export const formatNumber = (value, options = {}) => {
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  };
  
  // Merger opciones personalizadas con las predeterminadas
  const config = { ...defaultOptions, ...options };
  
  // Manejar valores nulos o indefinidos
  if (value === null || value === undefined) {
    return new Intl.NumberFormat(getLocale(), config).format(0);
  }
  
  // Convertir a número si es necesario
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Verificar si es un número válido
  if (isNaN(numericValue)) {
    console.warn('formatNumber recibió un valor no numérico:', value);
    return new Intl.NumberFormat(getLocale(), config).format(0);
  }
  
  return new Intl.NumberFormat(getLocale(), config).format(numericValue);
};

/**
 * Formatea una fecha a un formato localizado según el idioma actual
 * @param {Date|string} date - Fecha a formatear
 * @param {string} formatType - Tipo de formato (short, medium, long, full)
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, formatType = 'short') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Verificar si es una fecha válida
    if (isNaN(dateObj.getTime())) {
      console.warn('formatDate recibió una fecha inválida:', date);
      return '';
    }
    
    // Usar formato de fecha del archivo de traducciones si está disponible
    const dateFormat = i18next.t('dashboard.dateFormat', { defaultValue: 'dd/MM/yyyy' });
    if (dateFormat && formatType === 'custom') {
      // Si se requiere un formato personalizado basado en las traducciones,
      // debería implementarse aquí usando date-fns o similar
      
      // Por ahora, volvemos al formato estándar
    }
    
    const options = { dateStyle: formatType };
    return new Intl.DateTimeFormat(getLocale(), options).format(dateObj);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return '';
  }
};

/**
 * Genera iniciales a partir de un nombre
 * @param {string} name - Nombre completo
 * @param {number} maxInitials - Número máximo de iniciales
 * @returns {string} Iniciales (ej: "JD" para "John Doe")
 */
export const generateInitials = (name, maxInitials = 2) => {
  if (!name || typeof name !== 'string') return 'NA';
  
  return name
    .split(' ')
    .filter(word => word.length > 0)
    .slice(0, maxInitials)
    .map(word => word[0].toUpperCase())
    .join('');
};