import { useState, useCallback, useEffect } from 'react';
import { useDebouncedCallback } from './useDebounce';

/**
 * A hook for handling form state with debounced validation and changes.
 * 
 * @param {Object} initialValues - Initial form values
 * @param {Function} validate - Validation function that returns errors object
 * @param {Function} onSubmit - Function to call on form submission
 * @param {Object} options - Configuration options
 * @param {number} options.debounceTime - Debounce delay for validation in milliseconds
 * @param {boolean} options.validateOnChange - Whether to validate on each change
 * @param {boolean} options.validateOnBlur - Whether to validate on blur
 * @returns {Object} Form state and handlers
 */
export function useDebouncedForm(
  initialValues = {},
  validate = () => ({}),
  onSubmit = () => {},
  {
    debounceTime = 500,
    validateOnChange = true,
    validateOnBlur = true
  } = {}
) {
  // Form state
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Create debounced validation function
  const debouncedValidate = useDebouncedCallback(
    (formValues) => {
      const validationErrors = validate(formValues);
      setErrors(validationErrors);
      return validationErrors;
    },
    debounceTime,
    [validate]
  );
  
  // Run validation when values change (if enabled)
  useEffect(() => {
    if (validateOnChange && isDirty) {
      debouncedValidate(values);
    }
  }, [values, debouncedValidate, validateOnChange, isDirty]);
  
  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setValues((prev) => ({
      ...prev,
      [name]: newValue
    }));
    
    setIsDirty(true);
  }, []);
  
  // Handle input blur
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));
    
    if (validateOnBlur) {
      debouncedValidate.flush?.(values) || debouncedValidate(values);
    }
  }, [values, debouncedValidate, validateOnBlur]);
  
  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    
    setTouched(allTouched);
    
    // Validate immediately
    const validationErrors = validate(values);
    setErrors(validationErrors);
    
    // Check if there are any errors
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validate, onSubmit]);
  
  // Reset form to initial values
  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsDirty(false);
    setIsSubmitting(false);
  }, [initialValues]);
  
  // Set a specific field value
  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value
    }));
    setIsDirty(true);
  }, []);
  
  // Check if all fields are valid
  const isValid = Object.keys(errors).length === 0;
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setValues
  };
}

export default useDebouncedForm;