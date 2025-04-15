import React, { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { proformasService } from "@/services/api";
import { toast } from "sonner";
import { SendHorizontal, CheckCircle, XCircle, ClipboardCopy } from "lucide-react";
import { ActionBar, LoadingSpinner, StatusBadge } from "@/components/shared";

/**
 * Dialog component for proforma actions (send, approve, reject)
 */
const ProformaActionsDialog = ({ 
  isOpen, 
  onClose, 
  proformaId, 
  currentStatus,
  onActionComplete,
  actionType = "send" // "send", "approve", "reject"
}) => {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Configuration for different action types
  const actionConfig = {
    send: {
      title: "Enviar Proforma",
      description: "Enviar esta proforma al cliente para su revisión",
      icon: <SendHorizontal className="h-5 w-5 text-blue-600" />,
      buttonText: "Enviar",
      buttonVariant: "default",
      confirmationText: "¿Estás seguro de que deseas enviar esta proforma?",
      successMessage: "Proforma enviada con éxito",
      errorMessage: "Error al enviar la proforma",
      action: proformasService.enviar.bind(proformasService),
      badgeStatus: "enviada",
      headerClass: "bg-blue-50 border-b border-blue-100"
    },
    approve: {
      title: "Aprobar Proforma",
      description: "Aprobar esta proforma para su procesamiento",
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      buttonText: "Aprobar",
      buttonVariant: "success",
      confirmationText: "¿Estás seguro de que deseas aprobar esta proforma?",
      successMessage: "Proforma aprobada con éxito",
      errorMessage: "Error al aprobar la proforma",
      action: proformasService.aprobar.bind(proformasService),
      badgeStatus: "aprobada",
      headerClass: "bg-green-50 border-b border-green-100"
    },
    reject: {
      title: "Rechazar Proforma",
      description: "Rechazar esta proforma",
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      buttonText: "Rechazar",
      buttonVariant: "destructive",
      confirmationText: "¿Estás seguro de que deseas rechazar esta proforma?",
      successMessage: "Proforma rechazada con éxito",
      errorMessage: "Error al rechazar la proforma",
      action: proformasService.rechazar.bind(proformasService),
      badgeStatus: "rechazada",
      headerClass: "bg-red-50 border-b border-red-100"
    }
  };
  
  // Get configuration for current action type
  const config = actionConfig[actionType] || actionConfig.send;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await config.action(proformaId, notes);
      
      // Notify success
      toast.success(config.successMessage);
      
      // Close dialog and notify parent
      onClose();
      if (onActionComplete) {
        onActionComplete({
          status: config.badgeStatus,
          notes,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error(`Error in ${actionType} action:`, error);
      
      // Show error message
      toast.error(config.errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle dialog close
  const handleClose = () => {
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className={`-m-6 mb-2 py-4 px-6 rounded-t-lg ${config.headerClass}`}>
          <DialogTitle className="text-xl font-semibold flex items-center">
            {config.icon}
            <span className="ml-2">{config.title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="py-2">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-700">Estado actual:</p>
              <StatusBadge status={currentStatus} />
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              {config.description}
            </p>
            
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-md mb-2">
              <p className="text-sm font-medium mb-1 flex items-center">
                <ClipboardCopy className="h-4 w-4 mr-1 text-gray-400" />
                Notas (opcional):
              </p>
              <Textarea
                placeholder="Ingrese notas o comentarios adicionales..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px] resize-none border-gray-200"
                disabled={loading}
              />
            </div>
          </div>
          
          <ActionBar
            align="end"
            actions={[
              {
                label: "Cancelar",
                onClick: handleClose,
                variant: "outline",
                disabled: loading
              },
              {
                label: loading ? "Procesando..." : config.buttonText,
                onClick: !loading ? handleSubmit : undefined,
                variant: config.buttonVariant,
                disabled: loading,
                icon: loading ? <LoadingSpinner size="sm" className="mr-2" /> : config.icon,
                className: loading ? "opacity-70 cursor-not-allowed" : ""
              }
            ]}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProformaActionsDialog;