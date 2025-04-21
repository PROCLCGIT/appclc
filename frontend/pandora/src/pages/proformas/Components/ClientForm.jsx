import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Search, Plus, History, Check } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Esquema de validación para el cliente
const clientSchema = yup.object({
  name: yup.string().required('El nombre de la empresa es obligatorio'),
  attention: yup.string(),
  email: yup.string().email('Ingrese un email válido'),
  phone: yup.string(),
  address: yup.string(),
  ruc: yup.string().matches(/^[0-9]{10,13}$/, 'RUC debe tener entre 10 y 13 dígitos')
    .when('name', {
      is: (name) => !!name, // Si name existe (se seleccionó un cliente)
      then: (schema) => schema.required('RUC es obligatorio para clientes registrados'),
    }),
});

/**
 * Componente para mostrar y editar datos del cliente con validación
 */
const ClientForm = ({ 
  client = {}, 
  onUpdate, 
  onSearch, 
  previewMode = false 
}) => {
  // Inicializar React Hook Form con validación Yup
  const { 
    control, 
    handleSubmit, 
    formState: { errors, isDirty, touchedFields },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: yupResolver(clientSchema),
    defaultValues: {
      name: client.name || '',
      attention: client.attention || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      ruc: client.ruc || '',
    },
    mode: 'onBlur',
  });

  // Estados para popovers
  const [attentionPopoverOpen, setAttentionPopoverOpen] = React.useState(false);

  // Referencias para manejo de UI
  const attentionInputRef = React.useRef(null);

  // Observar campos para tiempo real
  const clientName = watch('name');
  const clientRuc = watch('ruc');

  // Manejar actualizaciones de campo
  const handleFieldUpdate = (fieldName, value) => {
    setValue(fieldName, value, { 
      shouldValidate: true, 
      shouldDirty: true,
      shouldTouch: true
    });
    
    // Actualizar el cliente si cambia
    if (onUpdate) {
      const updatedClient = {
        ...client,
        [fieldName]: value
      };
      onUpdate(updatedClient);
    }
  };

  // Obtener el estado de un campo (para mostrar errores)
  const getFieldState = (fieldName) => {
    const hasError = errors[fieldName] && touchedFields[fieldName];
    return {
      error: hasError,
      errorMessage: hasError ? errors[fieldName]?.message : null,
    };
  };

  // Iniciales para el avatar
  const getInitials = () => {
    if (!clientName) return 'CL';
    return clientName
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pt-2 pb-2 bg-blue-50">
        <CardTitle className="text-lg flex justify-between items-center h-[36px]">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Cliente
          </div>
          
          {!previewMode && (
            <div className="flex space-x-1">
              {/* Botón búsqueda */}
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:text-blue-700 transition-colors"
                onClick={onSearch}
                title="Buscar cliente"
              >
                <Search className="h-4 w-4" />
              </Button>
              
              {/* Botón nuevo */}
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 rounded-full text-green-600 hover:text-green-800 hover:bg-green-50"
                title="Agregar nuevo cliente"
              >
                <Plus className="h-4 w-4" />
              </Button>
              
              {/* Botón editar */}
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                disabled={!client.id}
                title="Editar cliente actual"
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              {/* Botón historial */}
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 rounded-full text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                disabled={!client.id}
                title="Ver historial del cliente"
              >
                <History className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-2 pb-2 flex-grow">
        <div className="space-y-1">
          {/* Cliente (Empresa) */}
          <div className="grid grid-cols-[130px_1fr_40px] gap-1 items-center min-h-[24px] py-0.5">
            <div className="text-sm font-medium text-gray-500">Empresa:</div>
            <div className="text-sm font-semibold">
              {previewMode ? (
                clientName ? (
                  <span className="bg-green-50 text-green-800 px-1 py-0.5 rounded border border-green-200">
                    {clientName}
                  </span>
                ) : (
                  <span className="text-gray-400 italic">No seleccionado</span>
                )
              ) : (
                <div className="w-full">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        className={`h-7 text-sm px-2 ${getFieldState('name').error ? 'border-red-500' : ''}`}
                        placeholder="Seleccione o ingrese empresa"
                        readOnly={!client.id && !clientName} // Solo editable si hay cliente o si ya ingresó algo
                        onClick={!clientName ? onSearch : undefined} // Si no hay cliente, mostrar búsqueda
                      />
                    )}
                  />
                  {getFieldState('name').error && (
                    <p className="text-xs text-red-500 mt-0.5">{getFieldState('name').errorMessage}</p>
                  )}
                </div>
              )}
            </div>
            {!previewMode && clientName && (
              <Button
                variant="ghost"
                size="sm"
                className={`p-1 rounded-full ${getFieldState('name').error ? 'text-red-500' : 'text-green-500'}`}
              >
                {getFieldState('name').error ? (
                  <span className="text-red-500">!</span>
                ) : (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </Button>
            )}
          </div>
          
          {/* RUC */}
          <div className="grid grid-cols-[130px_1fr_40px] gap-1 items-center min-h-[24px] py-0.5">
            <div className="text-sm font-medium text-gray-500">RUC:</div>
            <div className="text-sm">
              {previewMode ? (
                clientRuc || "-"
              ) : (
                <div className="w-full">
                  <Controller
                    name="ruc"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        className={`h-7 text-sm px-2 ${getFieldState('ruc').error ? 'border-red-500' : ''}`}
                        placeholder="RUC"
                        disabled={!clientName}
                      />
                    )}
                  />
                  {getFieldState('ruc').error && (
                    <p className="text-xs text-red-500 mt-0.5">{getFieldState('ruc').errorMessage}</p>
                  )}
                </div>
              )}
            </div>
            {!previewMode && clientRuc && (
              <Button
                variant="ghost"
                size="sm"
                className={`p-1 rounded-full ${getFieldState('ruc').error ? 'text-red-500' : 'text-green-500'}`}
              >
                {getFieldState('ruc').error ? (
                  <span className="text-red-500">!</span>
                ) : (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </Button>
            )}
          </div>
          
          {/* Email */}
          <div className="grid grid-cols-[130px_1fr_40px] gap-1 items-center min-h-[24px] py-0.5">
            <div className="text-sm font-medium text-gray-500">Email:</div>
            <div className="text-sm">
              {previewMode ? (
                <span className="text-blue-600">{watch('email') || "-"}</span>
              ) : (
                <div className="w-full">
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        className={`h-7 text-sm px-2 ${getFieldState('email').error ? 'border-red-500' : ''}`}
                        placeholder="Email de contacto"
                        disabled={!clientName}
                      />
                    )}
                  />
                  {getFieldState('email').error && (
                    <p className="text-xs text-red-500 mt-0.5">{getFieldState('email').errorMessage}</p>
                  )}
                </div>
              )}
            </div>
            {!previewMode && watch('email') && (
              <Button
                variant="ghost"
                size="sm"
                className={`p-1 rounded-full ${getFieldState('email').error ? 'text-red-500' : 'text-green-500'}`}
              >
                {getFieldState('email').error ? (
                  <span className="text-red-500">!</span>
                ) : (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </Button>
            )}
          </div>
          
          {/* Teléfono */}
          <div className="grid grid-cols-[130px_1fr_40px] gap-1 items-center min-h-[24px] py-0.5">
            <div className="text-sm font-medium text-gray-500">Teléfono:</div>
            <div className="text-sm">
              {previewMode ? (
                watch('phone') || "-"
              ) : (
                <div className="w-full">
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        className={`h-7 text-sm px-2 ${getFieldState('phone').error ? 'border-red-500' : ''}`}
                        placeholder="Teléfono de contacto"
                        disabled={!clientName}
                      />
                    )}
                  />
                  {getFieldState('phone').error && (
                    <p className="text-xs text-red-500 mt-0.5">{getFieldState('phone').errorMessage}</p>
                  )}
                </div>
              )}
            </div>
            {!previewMode && watch('phone') && (
              <Button
                variant="ghost"
                size="sm"
                className={`p-1 rounded-full ${getFieldState('phone').error ? 'text-red-500' : 'text-green-500'}`}
              >
                {getFieldState('phone').error ? (
                  <span className="text-red-500">!</span>
                ) : (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </Button>
            )}
          </div>
          
          {/* Dirección */}
          <div className="grid grid-cols-[130px_1fr_40px] gap-1 items-start min-h-[24px] py-0.5">
            <div className="text-sm font-medium text-gray-500 pt-0.5">Dirección:</div>
            <div className="text-sm break-words">
              {previewMode ? (
                watch('address') || "-"
              ) : (
                <div className="w-full">
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        className={`h-7 text-sm px-2 ${getFieldState('address').error ? 'border-red-500' : ''}`}
                        placeholder="Dirección del cliente"
                        disabled={!clientName}
                      />
                    )}
                  />
                  {getFieldState('address').error && (
                    <p className="text-xs text-red-500 mt-0.5">{getFieldState('address').errorMessage}</p>
                  )}
                </div>
              )}
            </div>
            {!previewMode && watch('address') && (
              <Button
                variant="ghost"
                size="sm"
                className={`p-1 rounded-full ${getFieldState('address').error ? 'text-red-500' : 'text-green-500'}`}
              >
                {getFieldState('address').error ? (
                  <span className="text-red-500">!</span>
                ) : (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </Button>
            )}
          </div>
          
          {/* Atención (con popover para editar) */}
          <div className="grid grid-cols-[130px_1fr_40px] gap-1 items-start min-h-[24px] py-0.5">
            <div className="text-sm font-medium text-gray-500 pt-0.5">Atención:</div>
            <div className="text-sm break-words">
              {previewMode ? (
                watch('attention') || "-"
              ) : (
                <div className="w-full">
                  <Controller
                    name="attention"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        className={`h-7 text-sm px-2 ${getFieldState('attention').error ? 'border-red-500' : ''}`}
                        placeholder="Persona de contacto"
                        disabled={!clientName}
                      />
                    )}
                  />
                  {getFieldState('attention').error && (
                    <p className="text-xs text-red-500 mt-0.5">{getFieldState('attention').errorMessage}</p>
                  )}
                </div>
              )}
            </div>
            {!previewMode && (
              <Popover open={attentionPopoverOpen} onOpenChange={setAttentionPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    title="Editar atención"
                    disabled={!clientName}
                  >
                    <Edit className="h-4 w-4 text-blue-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[30rem] p-3">
                  <h4 className="font-medium mb-2">Atención</h4>
                  <Controller
                    name="attention"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        {...field}
                        ref={attentionInputRef}
                        placeholder="Persona de contacto"
                        className="text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleFieldUpdate('attention', field.value);
                            setAttentionPopoverOpen(false);
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            e.stopPropagation();
                            setAttentionPopoverOpen(false);
                          }
                        }}
                        autoFocus
                      />
                    )}
                  />
                  <div className="mt-3 text-xs text-gray-500">
                    Ingrese el nombre de la persona de contacto y presione Enter para guardar, o Esc para cancelar.
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientForm;