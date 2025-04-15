import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";

/**
 * Reusable confirmation dialog with various presets for different scenarios
 * 
 * @param {boolean} open - Whether the dialog is open
 * @param {function} onOpenChange - Function called when open state changes
 * @param {string} title - Dialog title
 * @param {string} description - Dialog description
 * @param {function} onConfirm - Function called when confirm button is clicked
 * @param {function} onCancel - Function called when cancel button is clicked
 * @param {string} confirmText - Text for confirm button
 * @param {string} cancelText - Text for cancel button
 * @param {string} variant - Variant style: 'destructive', 'warning', 'info', 'success'
 * @param {React.ReactNode} children - Additional content to display in the dialog
 */
const ConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "info",
  children,
}) => {
  // Style configurations based on variant
  const variantStyles = {
    destructive: {
      icon: <XCircle className="h-6 w-6 text-red-500" />,
      confirmClass: "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white",
      headerClass: "bg-red-50 border-b border-red-100 text-red-900",
      iconContainer: "bg-red-100 p-2 rounded-full",
    },
    warning: {
      icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
      confirmClass: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 text-white",
      headerClass: "bg-amber-50 border-b border-amber-100 text-amber-900",
      iconContainer: "bg-amber-100 p-2 rounded-full",
    },
    info: {
      icon: <Info className="h-6 w-6 text-blue-500" />,
      confirmClass: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white",
      headerClass: "bg-blue-50 border-b border-blue-100 text-blue-900",
      iconContainer: "bg-blue-100 p-2 rounded-full",
    },
    success: {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      confirmClass: "bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white",
      headerClass: "bg-green-50 border-b border-green-100 text-green-900",
      iconContainer: "bg-green-100 p-2 rounded-full",
    },
  };

  const styles = variantStyles[variant] || variantStyles.info;

  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className={`-m-6 mb-2 py-4 px-6 rounded-t-lg ${styles.headerClass}`}>
          <div className="flex items-center gap-3">
            <div className={styles.iconContainer}>
              {styles.icon}
            </div>
            <AlertDialogTitle className="text-xl font-semibold">{title}</AlertDialogTitle>
          </div>
        </AlertDialogHeader>
        
        <div className="py-2">
          <AlertDialogDescription className="text-gray-700 text-base mb-4">
            {description}
          </AlertDialogDescription>
          
          {children}
        </div>
        
        <AlertDialogFooter className="gap-2 mt-4">
          <AlertDialogCancel 
            onClick={handleCancel}
            className="mt-0"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={styles.confirmClass}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;