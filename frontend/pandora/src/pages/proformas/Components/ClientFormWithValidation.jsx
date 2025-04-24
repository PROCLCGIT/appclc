import React, { useState } from "react";
import { useValidation } from "@/lib/hooks";
import * as validators from "@/lib/utils/validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ActionBar, LoadingSpinner } from "@/components/shared";
import { Save, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

/**
 * Client form with real-time validation
 */
const ClientFormWithValidation = ({ initialClient = {}, onSubmit, onCancel, zonas = [], ciudades = [], tiposCliente = [] }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Define validation schema
  const validationSchema = {
    nombre: validators.compose([
      validators.required("El nombre del cliente es obligatorio"),
      validators.minLength(3, "El nombre debe tener al menos 3 caracteres")
    ]),
    ruc: validators.compose([
      validators.required("El RUC es obligatorio"),
      validators.ruc("El formato del RUC es inválido (debe tener 13 dígitos)")
    ]),
    email: validators.compose([
      // Email is not required, but if provided must be valid
      validators.email("El formato del correo electrónico es inválido")
    ]),
    telefono: validators.compose([
      // Phone is not required, but if provided must be valid
      validators.phone("El formato del número de teléfono es inválido")
    ]),
    zona: validators.required("Debe seleccionar una zona"),
    ciudad: validators.required("Debe seleccionar una ciudad"),
    tipo_cliente: validators.required("Debe seleccionar un tipo de cliente")
  };
  
  // Initialize validation hook
  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldTouched,
    validateAllFields,
    resetForm,
    getFieldMeta
  } = useValidation(
    {
      nombre: initialClient.nombre || "",
      ruc: initialClient.ruc || "",
      razon_social: initialClient.razon_social || "",
      email: initialClient.email || "",
      telefono: initialClient.telefono || "",
      direccion: initialClient.direccion || "",
      zona: initialClient.zona || "",
      ciudad: initialClient.ciudad || "",
      tipo_cliente: initialClient.tipo_cliente || "",
      activo: initialClient.activo !== undefined ? initialClient.activo : true
    },
    validationSchema,
    {
      validateOnChange: true,
      validateOnBlur: true,
      validateOnMount: false
    }
  );
  
  // Helper component to display validation errors
  const FieldError = ({ name }) => {
    const meta = getFieldMeta(name);
    if (meta.touched && meta.error) {
      return (
        <div className="flex items-center text-xs text-red-500 mt-1">
          <AlertCircle className="h-3 w-3 mr-1" />
          <span>{meta.error}</span>
        </div>
      );
    }
    return null;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const validationErrors = validateAllFields();
    
    // If there are validation errors, mark all fields as touched
    if (Object.keys(validationErrors).length > 0) {
      // Mark all fields as touched to show errors
      Object.keys(validationSchema).forEach(field => {
        setFieldTouched(field, true);
      });
      
      toast.error("Por favor, corrija los errores en el formulario");
      return;
    }
    
    // Preparar datos para envío, asegurándonos que los IDs estén en formato correcto
    const clienteData = {
      ...values,
      // Asegurar formato numérico para IDs (fundamental para APIs Django)
      zona: values.zona ? Number(values.zona) : null,
      ciudad: values.ciudad ? Number(values.ciudad) : null,
      tipo_cliente: values.tipo_cliente ? Number(values.tipo_cliente) : null,
    };
    
    console.log("Datos de cliente a enviar:", clienteData);
    
    // Submit form
    try {
      setIsSubmitting(true);
      await onSubmit(clienteData);
      resetForm();
      toast.success("Cliente guardado exitosamente");
    } catch (error) {
      console.error("Error completo al guardar cliente:", error);
      
      let errorMessage = "Error al guardar cliente";
      
      // Extraer mensaje de error más específico si está disponible
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // Si el servidor devuelve errores específicos por campo, actualizar el estado del formulario
      if (error.response?.data && typeof error.response.data === 'object') {
        const serverErrors = {};
        const errorData = error.response.data;
        
        // Recorrer los errores de campo devueltos por el servidor
        Object.entries(errorData).forEach(([field, message]) => {
          // Ignorar campos que no son errores
          if (field !== 'id' && field !== 'created_at' && field !== 'updated_at') {
            // Convertir mensaje de error a string si es un array
            const errorMessage = Array.isArray(message) ? message[0] : message;
            serverErrors[field] = errorMessage;
            setFieldTouched(field, true);
            // Añadir el error directamente al estado del formulario
            setFieldValue(field, values[field], errorMessage);
          }
        });
        
        console.log("Errores de servidor por campo:", serverErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle form cancel
  const handleCancel = () => {
    resetForm();
    onCancel?.();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className={touched.nombre && errors.nombre ? "text-red-500" : ""}>
              Nombre del Cliente <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              name="nombre"
              value={values.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.nombre && errors.nombre ? "border-red-500 focus-visible:ring-red-500" : ""}
              placeholder="Ingrese nombre del cliente"
            />
            <FieldError name="nombre" />
          </div>
          
          {/* RUC */}
          <div className="space-y-2">
            <Label htmlFor="ruc" className={touched.ruc && errors.ruc ? "text-red-500" : ""}>
              RUC <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ruc"
              name="ruc"
              value={values.ruc}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.ruc && errors.ruc ? "border-red-500 focus-visible:ring-red-500" : ""}
              placeholder="Ingrese RUC (13 dígitos)"
              maxLength={13}
            />
            <FieldError name="ruc" />
          </div>
          
          {/* Razón Social */}
          <div className="space-y-2">
            <Label htmlFor="razon_social">
              Razón Social
            </Label>
            <Input
              id="razon_social"
              name="razon_social"
              value={values.razon_social}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ingrese razón social"
            />
          </div>
          
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className={touched.email && errors.email ? "text-red-500" : ""}>
              Correo Electrónico
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.email && errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
              placeholder="ejemplo@empresa.com"
            />
            <FieldError name="email" />
          </div>
        </div>
        
        {/* Right column */}
        <div className="space-y-4">
          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono" className={touched.telefono && errors.telefono ? "text-red-500" : ""}>
              Teléfono
            </Label>
            <Input
              id="telefono"
              name="telefono"
              value={values.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.telefono && errors.telefono ? "border-red-500 focus-visible:ring-red-500" : ""}
              placeholder="Ingrese número de teléfono"
            />
            <FieldError name="telefono" />
          </div>
          
          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="direccion">
              Dirección
            </Label>
            <Input
              id="direccion"
              name="direccion"
              value={values.direccion}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ingrese dirección"
            />
          </div>
          
          {/* Zona, Ciudad y Tipo de Cliente */}
          <div className="grid grid-cols-3 gap-3">
            {/* Zona */}
            <div className="space-y-2">
              <Label htmlFor="zona" className={touched.zona && errors.zona ? "text-red-500" : ""}>
                Zona <span className="text-red-500">*</span>
              </Label>
              <Select
                value={values.zona}
                onValueChange={(value) => {
                  setFieldValue("zona", value);
                  setFieldTouched("zona", true);
                }}
              >
                <SelectTrigger 
                  className={touched.zona && errors.zona ? "border-red-500 focus-visible:ring-red-500" : ""}
                >
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {zonas.map((zona) => (
                    <SelectItem key={zona.id} value={zona.id.toString()}>
                      {zona.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError name="zona" />
            </div>
            
            {/* Ciudad */}
            <div className="space-y-2">
              <Label htmlFor="ciudad" className={touched.ciudad && errors.ciudad ? "text-red-500" : ""}>
                Ciudad <span className="text-red-500">*</span>
              </Label>
              <Select
                value={values.ciudad}
                onValueChange={(value) => {
                  setFieldValue("ciudad", value);
                  setFieldTouched("ciudad", true);
                }}
              >
                <SelectTrigger 
                  className={touched.ciudad && errors.ciudad ? "border-red-500 focus-visible:ring-red-500" : ""}
                >
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {ciudades.map((ciudad) => (
                    <SelectItem key={ciudad.id} value={ciudad.id.toString()}>
                      {ciudad.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError name="ciudad" />
            </div>
            
            {/* Tipo de Cliente */}
            <div className="space-y-2">
              <Label htmlFor="tipo_cliente" className={touched.tipo_cliente && errors.tipo_cliente ? "text-red-500" : ""}>
                Tipo <span className="text-red-500">*</span>
              </Label>
              <Select
                value={values.tipo_cliente}
                onValueChange={(value) => {
                  setFieldValue("tipo_cliente", value);
                  setFieldTouched("tipo_cliente", true);
                }}
              >
                <SelectTrigger 
                  className={touched.tipo_cliente && errors.tipo_cliente ? "border-red-500 focus-visible:ring-red-500" : ""}
                >
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {tiposCliente.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id.toString()}>
                      {tipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError name="tipo_cliente" />
            </div>
          </div>
          
          {/* Activo */}
          <div className="flex items-center space-x-2 pt-4">
            <Checkbox
              id="activo"
              name="activo"
              checked={values.activo}
              onCheckedChange={(checked) => {
                setFieldValue("activo", checked);
              }}
            />
            <Label htmlFor="activo" className="font-normal cursor-pointer">
              Cliente activo
            </Label>
          </div>
        </div>
      </div>
      
      {/* Validation summary */}
      {!isValid && Object.keys(touched).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
          <div className="font-medium">Por favor corrija los siguientes errores:</div>
          <ul className="mt-1 pl-5 list-disc space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Form actions */}
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
              label: isSubmitting ? "Guardando..." : "Guardar cliente",
              onClick: handleSubmit,
              disabled: isSubmitting || (!isValid && Object.keys(touched).length > 0),
              icon: isSubmitting ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />,
              className: (!isValid && Object.keys(touched).length > 0) ? "opacity-50 cursor-not-allowed" : ""
            }
          ]}
        />
      </div>
    </form>
  );
};

export default ClientFormWithValidation;