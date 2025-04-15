/**
 * Validation utility functions for form inputs
 */

/**
 * Validates if a string is required and not empty
 * @param {string} value - The value to validate
 * @param {string} [errorMessage="Este campo es obligatorio"] - Custom error message
 * @returns {string|null} Error message or null if valid
 */
export const required = (value, errorMessage = "Este campo es obligatorio") => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return errorMessage;
  }
  return null;
};

/**
 * Validates if a value has a minimum length
 * @param {string} value - The value to validate
 * @param {number} min - Minimum length
 * @param {string} [errorMessage] - Custom error message
 * @returns {string|null} Error message or null if valid
 */
export const minLength = (value, min, errorMessage) => {
  if (!value || value.length < min) {
    return errorMessage || `Debe tener al menos ${min} caracteres`;
  }
  return null;
};

/**
 * Validates if a value has a maximum length
 * @param {string} value - The value to validate
 * @param {number} max - Maximum length
 * @param {string} [errorMessage] - Custom error message
 * @returns {string|null} Error message or null if valid
 */
export const maxLength = (value, max, errorMessage) => {
  if (value && value.length > max) {
    return errorMessage || `No debe exceder los ${max} caracteres`;
  }
  return null;
};

/**
 * Validates if a string value is a valid email address
 * @param {string} value - The value to validate
 * @param {string} [errorMessage="Correo electrónico inválido"] - Custom error message
 * @returns {string|null} Error message or null if valid
 */
export const email = (value, errorMessage = "Correo electrónico inválido") => {
  if (!value) return null; // Don't validate empty values, use required() for that
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(value)) {
    return errorMessage;
  }
  return null;
};

/**
 * Validates if a string is a valid Ecuadorian RUC
 * @param {string} value - The RUC to validate
 * @param {string} [errorMessage="RUC inválido"] - Custom error message
 * @returns {string|null} Error message or null if valid
 */
export const ruc = (value, errorMessage = "RUC inválido") => {
  if (!value) return null; // Don't validate empty values, use required() for that
  
  // Basic validation for Ecuadorian RUC
  // RUC must be 13 digits
  if (!/^\d{13}$/.test(value)) {
    return errorMessage;
  }
  
  // More specific validation could be added here if needed
  
  return null;
};

/**
 * Validates if a string is a valid phone number
 * @param {string} value - The phone number to validate
 * @param {string} [errorMessage="Número de teléfono inválido"] - Custom error message
 * @returns {string|null} Error message or null if valid
 */
export const phone = (value, errorMessage = "Número de teléfono inválido") => {
  if (!value) return null; // Don't validate empty values, use required() for that
  
  // Basic validation for phone numbers (can be customized for specific formats)
  const phoneRegex = /^[0-9()+\-\s]{7,15}$/;
  if (!phoneRegex.test(value)) {
    return errorMessage;
  }
  return null;
};

/**
 * Validates if a value is a valid number
 * @param {any} value - The value to validate
 * @param {string} [errorMessage="Debe ser un número válido"] - Custom error message
 * @returns {string|null} Error message or null if valid
 */
export const number = (value, errorMessage = "Debe ser un número válido") => {
  if (value === undefined || value === null || value === '') return null;
  
  if (isNaN(Number(value))) {
    return errorMessage;
  }
  return null;
};

/**
 * Validates if a number is within a range
 * @param {number} value - The number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} [errorMessage] - Custom error message
 * @returns {string|null} Error message or null if valid
 */
export const range = (value, min, max, errorMessage) => {
  if (value === undefined || value === null || value === '') return null;
  
  const numValue = Number(value);
  if (isNaN(numValue) || numValue < min || numValue > max) {
    return errorMessage || `Debe estar entre ${min} y ${max}`;
  }
  return null;
};

/**
 * Validates if a number is greater than a minimum value
 * @param {number} value - The number to validate
 * @param {number} min - Minimum value
 * @param {string} [errorMessage] - Custom error message
 * @returns {string|null} Error message or null if valid
 */
export const min = (value, min, errorMessage) => {
  if (value === undefined || value === null || value === '') return null;
  
  const numValue = Number(value);
  if (isNaN(numValue) || numValue < min) {
    return errorMessage || `Debe ser mayor o igual a ${min}`;
  }
  return null;
};

/**
 * Validates if a number is less than a maximum value
 * @param {number} value - The number to validate
 * @param {number} max - Maximum value
 * @param {string} [errorMessage] - Custom error message
 * @returns {string|null} Error message or null if valid
 */
export const max = (value, max, errorMessage) => {
  if (value === undefined || value === null || value === '') return null;
  
  const numValue = Number(value);
  if (isNaN(numValue) || numValue > max) {
    return errorMessage || `Debe ser menor o igual a ${max}`;
  }
  return null;
};

/**
 * Validates a value with a custom validation function
 * @param {any} value - The value to validate
 * @param {Function} validatorFn - A function that takes the value and returns an error message or null
 * @returns {string|null} Error message or null if valid
 */
export const custom = (value, validatorFn) => {
  return validatorFn(value);
};

/**
 * Combines multiple validators and returns the first error message
 * @param {Array<Function>} validators - Array of validator functions
 * @returns {Function} A function that takes a value and returns the first error message or null
 */
export const compose = (validators) => {
  return (value) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        return error;
      }
    }
    return null;
  };
};

/**
 * Validates a complete form object with validation schema
 * @param {Object} values - Form values
 * @param {Object} validationSchema - Validation schema with field names as keys and validator functions as values
 * @returns {Object} Object with field names as keys and error messages as values
 */
export const validateForm = (values, validationSchema) => {
  const errors = {};
  
  Object.entries(validationSchema).forEach(([field, validator]) => {
    const error = validator(values[field]);
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};

export default {
  required,
  minLength,
  maxLength,
  email,
  ruc,
  phone,
  number,
  range,
  min,
  max,
  custom,
  compose,
  validateForm
};