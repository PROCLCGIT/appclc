import React, { useState } from 'react';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { 
  ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, HelpCircle, 
  UserCircle, Lock, Mail, Globe, Calendar, X 
} from 'lucide-react';

// Componente para un paso del formulario
const FormStep = ({ children, isActive }) => {
  if (!isActive) return null;
  
  return (
    <div className="transition-all duration-300 ease-in-out">
      {children}
    </div>
  );
};

// Componente para el encabezado del paso
const StepHeader = ({ title, description }) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};

// Componente para las opciones de plan
const PlanOption = ({ title, price, features, isSelected, onClick }) => {
  return (
    <Card 
      className={`cursor-pointer transition-all ${
        isSelected 
          ? 'border-2 border-primary ring-2 ring-primary/10' 
          : 'hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex justify-between">
          {title}
          {isSelected && <CheckCircle2 className="text-primary h-5 w-5" />}
        </CardTitle>
        <CardDescription className="text-2xl font-bold">{price}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle2 className="text-primary h-4 w-4 mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

const MultiStepForm = () => {
  // Estado para el paso actual
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    companySize: '',
    plan: 'pro',
    acceptTerms: false,
    updates: true,
    address: '',
    city: '',
    country: 'Ecuador',
    paymentMethod: 'credit_card',
  });
  
  // Estado para los errores del formulario
  const [errors, setErrors] = useState({});
  
  // Función para manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error cuando se modifica el campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Función para manejar cambios en selects
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando se modifica el campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Función para seleccionar plan
  const handlePlanSelect = (plan) => {
    setFormData(prev => ({
      ...prev,
      plan
    }));
  };
  
  // Validar paso actual
  const validateCurrentStep = () => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
      if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido';
      if (!formData.email.trim()) {
        newErrors.email = 'El email es requerido';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Por favor ingrese un email válido';
      }
    }
    
    else if (currentStep === 2) {
      if (!formData.companyName.trim()) newErrors.companyName = 'El nombre de la empresa es requerido';
      if (!formData.companySize) newErrors.companySize = 'Por favor seleccione un tamaño de empresa';
    }
    
    else if (currentStep === 3) {
      // No hay validaciones requeridas para el plan
    }
    
    else if (currentStep === 4) {
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'Debe aceptar los términos y condiciones para continuar';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Avanzar al siguiente paso
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };
  
  // Volver al paso anterior
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  // Enviar formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateCurrentStep()) {
      alert(JSON.stringify(formData, null, 2));
      // Aquí irían las llamadas a APIs, etc.
    }
  };
  
  // Datos para las opciones de plan
  const plans = [
    {
      id: 'basic',
      title: 'Básico',
      price: '$9.99/mes',
      features: [
        'Hasta 5 usuarios',
        '5GB de almacenamiento',
        'Soporte por email',
        'Acceso a funciones básicas'
      ]
    },
    {
      id: 'pro',
      title: 'Pro',
      price: '$19.99/mes',
      features: [
        'Hasta 20 usuarios',
        '20GB de almacenamiento',
        'Soporte prioritario',
        'Acceso a todas las funciones',
        'Reportes avanzados'
      ]
    },
    {
      id: 'enterprise',
      title: 'Empresarial',
      price: '$49.99/mes',
      features: [
        'Usuarios ilimitados',
        '100GB de almacenamiento',
        'Soporte 24/7',
        'Funciones personalizadas',
        'API acceso completo',
        'Panel de administración'
      ]
    }
  ];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl">Registro de cuenta</CardTitle>
          <CardDescription>Complete el formulario para crear su cuenta</CardDescription>
          
          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>Información personal</span>
              <span>Detalles de empresa</span>
              <span>Plan</span>
              <span>Finalizar</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Paso 1: Información personal */}
            <FormStep isActive={currentStep === 1}>
              <StepHeader 
                title="Información personal" 
                description="Por favor, ingrese su información personal para comenzar."
              />
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      Nombre <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={errors.firstName ? "border-red-500" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Apellido <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={errors.lastName ? "border-red-500" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Correo electrónico <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                
                <div className="pt-4">
                  <p className="text-sm text-gray-500">
                    Todos los campos marcados con <span className="text-red-500">*</span> son obligatorios.
                  </p>
                </div>
              </div>
            </FormStep>
            
            {/* Paso 2: Detalles de empresa */}
            <FormStep isActive={currentStep === 2}>
              <StepHeader 
                title="Detalles de empresa" 
                description="Cuéntenos sobre su empresa."
              />
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Nombre de la empresa <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={errors.companyName ? "border-red-500" : ""}
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companySize">
                    Tamaño de la empresa <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.companySize}
                    onValueChange={(value) => handleSelectChange('companySize', value)}
                  >
                    <SelectTrigger className={errors.companySize ? "border-red-500" : ""}>
                      <SelectValue placeholder="Seleccione el tamaño de empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 empleados</SelectItem>
                      <SelectItem value="11-50">11-50 empleados</SelectItem>
                      <SelectItem value="51-200">51-200 empleados</SelectItem>
                      <SelectItem value="201-500">201-500 empleados</SelectItem>
                      <SelectItem value="500+">Más de 500 empleados</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.companySize && (
                    <p className="text-red-500 text-xs mt-1">{errors.companySize}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="min-h-[80px]"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">País</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => handleSelectChange('country', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione país" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ecuador">Ecuador</SelectItem>
                        <SelectItem value="Colombia">Colombia</SelectItem>
                        <SelectItem value="Perú">Perú</SelectItem>
                        <SelectItem value="Chile">Chile</SelectItem>
                        <SelectItem value="Argentina">Argentina</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </FormStep>
            
            {/* Paso 3: Selección de plan */}
            <FormStep isActive={currentStep === 3}>
              <StepHeader 
                title="Seleccione su plan" 
                description="Elija el plan que mejor se adapte a sus necesidades."
              />
              
              <div className="grid md:grid-cols-3 gap-4 py-4">
                {plans.map((plan) => (
                  <PlanOption 
                    key={plan.id}
                    title={plan.title}
                    price={plan.price}
                    features={plan.features}
                    isSelected={formData.plan === plan.id}
                    onClick={() => handlePlanSelect(plan.id)}
                  />
                ))}
              </div>
              
              <div className="rounded-lg bg-blue-50 p-4 mt-4">
                <div className="flex">
                  <HelpCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900">¿No está seguro qué plan elegir?</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Puede comenzar con el plan básico y actualizar en cualquier momento.
                      También ofrecemos una prueba gratuita de 14 días para cada plan.
                    </p>
                  </div>
                </div>
              </div>
            </FormStep>
            
            {/* Paso 4: Finalizar */}
            <FormStep isActive={currentStep === 4}>
              <StepHeader 
                title="Finalizar registro" 
                description="Revise su información y complete el registro."
              />
              
              <div className="space-y-6 py-4">
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Resumen de su registro</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Nombre:</span>
                      <span>{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Email:</span>
                      <span>{formData.email}</span>
                    </div>
                    <hr className="my-2 border-gray-200" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Empresa:</span>
                      <span>{formData.companyName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tamaño:</span>
                      <span>{formData.companySize} empleados</span>
                    </div>
                    <hr className="my-2 border-gray-200" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Plan seleccionado:</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                        {plans.find(p => p.id === formData.plan)?.title || ''}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Precio:</span>
                      <span className="font-bold">{plans.find(p => p.id === formData.plan)?.price || ''}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Método de pago</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2">
                    <div 
                      className={`flex items-center space-x-2 bg-white border rounded-md p-3 cursor-pointer hover:bg-gray-50 ${formData.paymentMethod === 'credit_card' ? 'border-primary ring-1 ring-primary' : ''}`}
                      onClick={() => handleSelectChange('paymentMethod', 'credit_card')}
                    >
                      <div className={`w-4 h-4 rounded-full border ${formData.paymentMethod === 'credit_card' ? 'border-primary' : 'border-gray-400'} flex items-center justify-center`}>
                        {formData.paymentMethod === 'credit_card' && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <Label className="flex-grow cursor-pointer">Tarjeta de crédito</Label>
                    </div>
                    <div 
                      className={`flex items-center space-x-2 bg-white border rounded-md p-3 cursor-pointer hover:bg-gray-50 ${formData.paymentMethod === 'paypal' ? 'border-primary ring-1 ring-primary' : ''}`}
                      onClick={() => handleSelectChange('paymentMethod', 'paypal')}
                    >
                      <div className={`w-4 h-4 rounded-full border ${formData.paymentMethod === 'paypal' ? 'border-primary' : 'border-gray-400'} flex items-center justify-center`}>
                        {formData.paymentMethod === 'paypal' && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <Label className="flex-grow cursor-pointer">PayPal</Label>
                    </div>
                    <div 
                      className={`flex items-center space-x-2 bg-white border rounded-md p-3 cursor-pointer hover:bg-gray-50 ${formData.paymentMethod === 'bank_transfer' ? 'border-primary ring-1 ring-primary' : ''}`}
                      onClick={() => handleSelectChange('paymentMethod', 'bank_transfer')}
                    >
                      <div className={`w-4 h-4 rounded-full border ${formData.paymentMethod === 'bank_transfer' ? 'border-primary' : 'border-gray-400'} flex items-center justify-center`}>
                        {formData.paymentMethod === 'bank_transfer' && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <Label className="flex-grow cursor-pointer">Transferencia bancaria</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div 
                      className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer ${formData.acceptTerms ? 'bg-primary border-primary' : 'border-gray-300'} ${errors.acceptTerms ? 'border-red-500' : ''}`}
                      onClick={() => {
                        const newValue = !formData.acceptTerms;
                        setFormData(prev => ({ ...prev, acceptTerms: newValue }));
                        if (errors.acceptTerms) {
                          setErrors(prev => ({ ...prev, acceptTerms: undefined }));
                        }
                      }}
                    >
                      {formData.acceptTerms && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>
                    <Label 
                      className={`text-sm ${errors.acceptTerms ? 'text-red-500' : ''} cursor-pointer`}
                      onClick={() => {
                        const newValue = !formData.acceptTerms;
                        setFormData(prev => ({ ...prev, acceptTerms: newValue }));
                        if (errors.acceptTerms) {
                          setErrors(prev => ({ ...prev, acceptTerms: undefined }));
                        }
                      }}
                    >
                      Acepto los <a href="#" className="text-primary hover:underline">términos y condiciones</a> y la <a href="#" className="text-primary hover:underline">política de privacidad</a>.
                    </Label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-red-500 text-xs">{errors.acceptTerms}</p>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <div 
                      className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer ${formData.updates ? 'bg-primary border-primary' : 'border-gray-300'}`}
                      onClick={() => {
                        const newValue = !formData.updates;
                        setFormData(prev => ({ ...prev, updates: newValue }));
                      }}
                    >
                      {formData.updates && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>
                    <Label 
                      className="text-sm cursor-pointer"
                      onClick={() => {
                        const newValue = !formData.updates;
                        setFormData(prev => ({ ...prev, updates: newValue }));
                      }}
                    >
                      Me gustaría recibir actualizaciones sobre productos y servicios.
                    </Label>
                  </div>
                </div>
              </div>
            </FormStep>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-0">
          {currentStep > 1 ? (
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
          ) : (
            <div></div>
          )}
          
          {currentStep < totalSteps ? (
            <Button type="button" onClick={nextStep}>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" onClick={handleSubmit}>
              Completar registro
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default MultiStepForm;