import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2, PlusCircle, GripVertical } from 'lucide-react';
import ConfirmationDialog from './ConfirmationDialog';

// Esquema de validación Yup para los items
const itemSchema = yup.object({
  code: yup.string().default(''),
  description: yup.string().required('La descripción es obligatoria'),
  unit: yup.string().default('Unidad'),
  quantity: yup
    .number()
    .typeError('La cantidad debe ser un número')
    .required('La cantidad es obligatoria')
    .positive('La cantidad debe ser mayor a cero'),
  unitPrice: yup
    .number()
    .typeError('El precio debe ser un número')
    .required('El precio es obligatorio')
    .min(0, 'El precio no puede ser negativo'),
  discount: yup
    .number()
    .typeError('El descuento debe ser un número')
    .min(0, 'El descuento no puede ser negativo')
    .max(100, 'El descuento no puede ser mayor a 100%')
    .default(0),
});

/**
 * Componente para editar un ítem de proforma con validación usando React Hook Form y Yup
 */
const ItemForm = ({ 
  item, 
  onUpdate, 
  onRemove, 
  formatCurrency, 
  dragHandleProps = {},
  isSelected = false 
}) => {
  // Inicializar React Hook Form con validación Yup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty, touchedFields },
    getValues,
    reset,
  } = useForm({
    resolver: yupResolver(itemSchema),
    defaultValues: {
      code: item?.code || '',
      description: item?.description || '',
      unit: item?.unit || 'Unidad',
      quantity: item?.quantity || 1,
      unitPrice: item?.unitPrice || 0,
      discount: item?.discount || 0,
    },
    mode: 'onChange', // Validar al cambiar
  });

  // Observar cambios en campos relevantes para calcular total
  const quantity = watch('quantity');
  const unitPrice = watch('unitPrice');
  const discount = watch('discount');

  // Calcular total cuando cambian los valores
  useEffect(() => {
    // Solo calcular si son números válidos
    if (!isNaN(quantity) && !isNaN(unitPrice) && !isNaN(discount)) {
      const subtotal = quantity * unitPrice;
      const discountAmount = (subtotal * discount) / 100;
      const total = subtotal - discountAmount;
      
      // Actualizar el ítem con los nuevos valores
      if (isDirty && onUpdate) {
        const formValues = getValues();
        onUpdate(item.id, {
          ...formValues,
          total,
        });
      }
    }
  }, [quantity, unitPrice, discount, isDirty, onUpdate, item?.id, getValues]);

  // Manejar cambio de unidad con el select
  const handleUnitChange = (value) => {
    setValue('unit', value, { shouldValidate: true, shouldDirty: true });
  };

  // Formatear para mostrar errores
  const getFieldError = (fieldName) => {
    if (errors[fieldName] && touchedFields[fieldName]) {
      return (
        <p className="text-xs text-red-500 mt-1">{errors[fieldName]?.message}</p>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-start py-2">
      {/* Código - 1 columna */}
      <div className="col-span-2">
        <Input
          {...register('code')}
          placeholder="Código"
          className={`h-8 w-full ${errors.code ? 'border-red-500' : ''}`}
        />
        {getFieldError('code')}
      </div>

      {/* Descripción - 3 columnas */}
      <div className="col-span-4">
        <Input
          {...register('description')}
          placeholder="Descripción del ítem"
          className={`h-8 w-full ${errors.description ? 'border-red-500' : ''}`}
        />
        {getFieldError('description')}
      </div>

      {/* Unidad - 1 columna */}
      <div className="col-span-1">
        <Select
          value={watch('unit')}
          onValueChange={handleUnitChange}
        >
          <SelectTrigger className={`h-8 ${errors.unit ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Unidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Unidad">Unidad</SelectItem>
            <SelectItem value="Kit">Kit</SelectItem>
            <SelectItem value="Caja">Caja</SelectItem>
            <SelectItem value="Servicio">Servicio</SelectItem>
            <SelectItem value="Hora">Hora</SelectItem>
            <SelectItem value="Metro">Metro</SelectItem>
            <SelectItem value="Litro">Litro</SelectItem>
          </SelectContent>
        </Select>
        {getFieldError('unit')}
      </div>

      {/* Cantidad - 1 columna */}
      <div className="col-span-1">
        <Input
          {...register('quantity')}
          type="number"
          min="0"
          step="1"
          placeholder="Cant."
          className={`h-8 w-full text-right ${errors.quantity ? 'border-red-500' : ''}`}
        />
        {getFieldError('quantity')}
      </div>

      {/* Precio unitario - 1.5 columnas */}
      <div className="col-span-1.5">
        <Input
          {...register('unitPrice')}
          type="number"
          min="0"
          step="0.01"
          placeholder="Precio"
          className={`h-8 w-full text-right ${errors.unitPrice ? 'border-red-500' : ''}`}
        />
        {getFieldError('unitPrice')}
      </div>

      {/* Descuento - 1 columna */}
      <div className="col-span-1">
        <div className="relative">
          <Input
            {...register('discount')}
            type="number"
            min="0"
            max="100"
            step="1"
            placeholder="0"
            className={`h-8 w-full text-right pr-6 ${errors.discount ? 'border-red-500' : ''}`}
          />
          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
            %
          </span>
        </div>
        {getFieldError('discount')}
      </div>

      {/* Total - 1 columna (calculado) */}
      <div className="col-span-1.5 flex items-center justify-end">
        <div className="text-right font-mono font-medium">
          {formatCurrency((quantity * unitPrice) * (1 - discount / 100))}
        </div>
      </div>

      {/* Botón eliminar - 0.5 columna */}
      <div className="col-span-0.5 flex justify-center items-center space-x-1">
        {/* Asa para arrastrar */}
        <div 
          className="cursor-grab active:cursor-grabbing flex items-center justify-center h-8 w-4 text-gray-400 hover:text-gray-600"
          aria-label="Arrastrar para reordenar"
          data-drag-handle
          {...dragHandleProps}
        >
          <GripVertical size={16} />
        </div>

        {/* Botón eliminar con confirmación */}
        <ConfirmationDialog
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 rounded-full"
              aria-label="Eliminar ítem"
            >
              <Trash2 size={16} />
            </Button>
          }
          title="Eliminar ítem"
          description={`¿Está seguro que desea eliminar este ítem: "${watch('description')}"?`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="destructive"
          onConfirm={() => onRemove(item.id)}
        />
      </div>
    </div>
  );
};

/**
 * Componente para agregar un nuevo ítem
 */
export const AddItemButton = ({ onClick }) => {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className="flex items-center mt-4"
    >
      <PlusCircle size={16} className="mr-1" />
      Agregar ítem
    </Button>
  );
};

export default ItemForm;