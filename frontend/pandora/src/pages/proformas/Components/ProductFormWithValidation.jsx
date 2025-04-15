import React from "react";
import { useDebouncedForm } from "@/lib/hooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ActionBar, LoadingSpinner } from "@/components/shared";
import { Save, X } from "lucide-react";

/**
 * Example component using useDebouncedForm for form handling with validation
 */
const ProductFormWithValidation = ({ initialProduct = {}, onSubmit, onCancel }) => {
  // Define validation function
  const validateProduct = (values) => {
    const errors = {};
    
    if (!values.nombre?.trim()) {
      errors.nombre = "El nombre es obligatorio";
    } else if (values.nombre.length < 3) {
      errors.nombre = "El nombre debe tener al menos 3 caracteres";
    }
    
    if (values.precio !== undefined && isNaN(Number(values.precio))) {
      errors.precio = "El precio debe ser un número válido";
    } else if (Number(values.precio) <= 0) {
      errors.precio = "El precio debe ser mayor a cero";
    }
    
    if (values.stock !== undefined && isNaN(Number(values.stock))) {
      errors.stock = "El stock debe ser un número válido";
    } else if (Number(values.stock) < 0) {
      errors.stock = "El stock no puede ser negativo";
    }
    
    return errors;
  };
  
  // Initialize form with useDebouncedForm
  const {
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
    setFieldValue
  } = useDebouncedForm(
    {
      nombre: initialProduct.nombre || "",
      descripcion: initialProduct.descripcion || "",
      codigo: initialProduct.codigo || "",
      precio: initialProduct.precio || "",
      stock: initialProduct.stock || "",
      ...initialProduct
    },
    validateProduct,
    onSubmit,
    {
      debounceTime: 300,
      validateOnChange: true,
      validateOnBlur: true
    }
  );
  
  // Helper function to show field error state
  const getFieldState = (fieldName) => {
    const hasError = touched[fieldName] && errors[fieldName];
    return {
      error: hasError,
      helperText: hasError ? errors[fieldName] : "",
      className: hasError ? "border-red-500 focus:ring-red-500" : ""
    };
  };
  
  // Handle cancel
  const handleCancel = () => {
    resetForm();
    onCancel?.();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-xl mx-auto">
      <div className="space-y-2">
        <Label htmlFor="nombre" className="text-sm font-medium">
          Nombre del producto <span className="text-red-500">*</span>
        </Label>
        <Input
          id="nombre"
          name="nombre"
          value={values.nombre}
          onChange={handleChange}
          onBlur={handleBlur}
          className={getFieldState("nombre").className}
          placeholder="Ingrese nombre del producto"
        />
        {getFieldState("nombre").error && (
          <p className="text-xs text-red-500">{getFieldState("nombre").helperText}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="codigo" className="text-sm font-medium">
          Código
        </Label>
        <Input
          id="codigo"
          name="codigo"
          value={values.codigo}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Ingrese código del producto"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="descripcion" className="text-sm font-medium">
          Descripción
        </Label>
        <Input
          id="descripcion"
          name="descripcion"
          value={values.descripcion}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Ingrese descripción del producto"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="precio" className="text-sm font-medium">
            Precio <span className="text-red-500">*</span>
          </Label>
          <Input
            id="precio"
            name="precio"
            type="number"
            step="0.01"
            value={values.precio}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getFieldState("precio").className}
            placeholder="0.00"
          />
          {getFieldState("precio").error && (
            <p className="text-xs text-red-500">{getFieldState("precio").helperText}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="stock" className="text-sm font-medium">
            Stock
          </Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            value={values.stock}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getFieldState("stock").className}
            placeholder="0"
          />
          {getFieldState("stock").error && (
            <p className="text-xs text-red-500">{getFieldState("stock").helperText}</p>
          )}
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-100">
        <ActionBar
          align="end"
          actions={[
            {
              label: "Cancelar",
              onClick: handleCancel,
              variant: "outline",
              disabled: isSubmitting,
              icon: <X className="h-4 w-4" />
            },
            {
              label: isSubmitting ? "Guardando..." : "Guardar producto",
              onClick: handleSubmit,
              disabled: isSubmitting || !isValid,
              icon: isSubmitting ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />,
              className: (!isValid || !isDirty) ? "opacity-50 cursor-not-allowed" : ""
            }
          ]}
        />
      </div>
    </form>
  );
};

export default ProductFormWithValidation;