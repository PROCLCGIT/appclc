import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/**
 * Componente de diálogo de confirmación reutilizable
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.trigger - Elemento que activa el diálogo (opcional)
 * @param {string} props.title - Título del diálogo
 * @param {string} props.description - Descripción del diálogo
 * @param {string} props.cancelText - Texto del botón de cancelar
 * @param {string} props.confirmText - Texto del botón de confirmar
 * @param {string} props.variant - Variante del botón de confirmar (default, destructive, etc.)
 * @param {Function} props.onConfirm - Función a ejecutar al confirmar
 * @param {boolean} props.open - Estado del diálogo (abierto/cerrado)
 * @param {Function} props.onOpenChange - Función para cambiar el estado del diálogo
 */
const ConfirmationDialog = ({
  trigger,
  title,
  description,
  cancelText = "Cancelar",
  confirmText = "Confirmar",
  variant = "default",
  onConfirm,
  open,
  onOpenChange,
}) => {
  // Si se proporciona control de estado externo, usarlo
  const controlled = open !== undefined && onOpenChange !== undefined;

  // Función para manejar la confirmación y cerrar el diálogo
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    if (controlled && onOpenChange) {
      onOpenChange(false);
    }
  };

  // Renderizado condicional basado en si es controlado o no
  if (controlled) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{cancelText}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} variant={variant}>{confirmText}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Versión no controlada (con trigger)
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || <Button variant="outline">Abrir</Button>}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} variant={variant}>{confirmText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;