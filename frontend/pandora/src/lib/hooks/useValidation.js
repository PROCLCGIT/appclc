import { useState, useEffect, useCallback } from 'react';
import { validateForm } from '../utils/validation';

/**
 * Custom hook for real-time form validation
 * 
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationSchema - Validation schema with field names as keys and validator functions as values
 * @param {Object} options - Configuration options
 * @param {boolean} options.validateOnChange - Whether to validate on each change
 * @param {boolean} options.validateOnBlur - Whether to validate on blur
 * @param {boolean} options.validateOnMount - Whether to validate on initial mount
 * @returns {Object} Validation state and handlers
 */
export function useValidation(
  initialValues = {},
  validationSchema = {},
  {
    validateOnChange = true,
    validateOnBlur = true,
    validateOnMount = false
  } = {}
) {
  // State for form values
  const [values, setValues] = useState(initialValues);
  
  // State for validation errors
  const [errors, setErrors] = useState({});
  
  // State for touched fields
  const [touched, setTouched] = useState({});
  
  // State for form validity
  const [isValid, setIsValid] = useState(false);
  
  // Function to validate the entire form
  const validateAllFields = useCallback(() => {
    const newErrors = validateForm(values, validationSchema);
    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
    return newErrors;
  }, [values, validationSchema]);
  
  // Function to validate a single field
  const validateField = useCallback((name) => {
    if (!validationSchema[name]) return null;
    
    const error = validationSchema[name](values[name]);
    
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    return error;
  }, [values, validationSchema]);
  
  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Validate field if validateOnChange is enabled
    if (validateOnChange) {
      setTimeout(() => validateField(name), 0);
    }
  }, [validateOnChange, validateField]);
  
  // Handle input blur
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field if validateOnBlur is enabled
    if (validateOnBlur) {
      validateField(name);
    }
  }, [validateOnBlur, validateField]);
  
  // Set a specific field value
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate field if validateOnChange is enabled
    if (validateOnChange) {
      setTimeout(() => validateField(name), 0);
    }
  }, [validateOnChange, validateField]);
  
  // Set a specific field touched state
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched
    }));
    
    // Validate field if validateOnBlur is enabled
    if (validateOnBlur && isTouched) {
      validateField(name);
    }
  }, [validateOnBlur, validateField]);
  
  // Function to reset the form
  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsValid(false);
  }, [initialValues]);
  
  // Reset form when initialValues change significantly
  useEffect(() => {
    resetForm(initialValues);
  }, [initialValues, resetForm]);
  
  // Validate on mount if enabled
  useEffect(() => {
    if (validateOnMount) {
      validateAllFields();
    }
  }, [validateOnMount, validateAllFields]);
  
  // Get field meta information (error, touched)
  const getFieldMeta = useCallback((name) => {
    return {
      error: errors[name],
      touched: !!touched[name],
      isValid: !errors[name]
    };
  }, [errors, touched]);
  
  // Get field props (value, onChange, onBlur)
  const getFieldProps = useCallback((name) => {
    return {
      name,
      value: values[name] ?? '',
      onChange: handleChange,
      onBlur: handleBlur
    };
  }, [values, handleChange, handleBlur]);
  
  return {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateField,
    validateAllFields,
    setFieldValue,
    setFieldTouched,
    resetForm,
    getFieldMeta,
    getFieldProps
  };
}

export default useValidation;