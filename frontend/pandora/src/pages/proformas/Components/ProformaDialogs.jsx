// src/pages/proformas/components/ProformaDialogs.jsx

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ClientSearchDialogRefactored from "./ClientSearchDialogRefactored";
import ProformasDialog from "./ProformasDialog";
import { useErrorHandler } from "@/pages/proformas/hooks/useErrorHandler.jsx";

/**
 * Componente que agrupa todos los diálogos/modales usados en el módulo de proformas
 * Esto reduce la complejidad del componente principal
 */
export default function ProformaDialogs({
  // Diálogo de búsqueda de clientes
  showClientSearch,
  closeClientSearch,
  handleClientSelection,
  clientes,
  loadingClientes,
  searchClientes, // Función para buscar clientes
  onRequestLoadClientes, // Función para cargar clientes inicialmente
  
  // Diálogo de proformas guardadas
  showProformasDialog,
  closeProformasDialog,
  handleSelectProforma,
  
  // Diálogo de confirmación/guardado
  showSaveDialog,
  saveDialogType,
  saveDialogTitle,
  saveDialogMessage,
  saveDialogDetails,
  savedProformaId,
  closeSaveDialog,
  proformas,
  activeProformaId,
  handleAction,
  onLoadProformas,
  
  // Error handling
  errorHandler: propErrorHandler
}) {
  // Usar el errorHandler pasado por props o inicializar uno nuevo
  const defaultErrorHandler = useErrorHandler();
  const errorHandler = propErrorHandler || defaultErrorHandler;
  // No longer needed since we're using the refactored component
  useEffect(() => {
    // Removed debug logs since we're transitioning to the refactored component
  }, []);
  
  return (
    <>
      {/* Diálogo de búsqueda de clientes */}
      <ClientSearchDialogRefactored
        isOpen={showClientSearch}
        onClose={closeClientSearch}
        onSelectClient={handleClientSelection}
        clientes={clientes || []}
        loadingClientes={loadingClientes}
        onRequestLoadClientes={(forceRefresh = false) => {
          console.log('ProformaDialogs: Solicitando carga de clientes desde el componente refactorizado... forceRefresh:', forceRefresh);
          if (typeof onRequestLoadClientes === 'function') {
            return onRequestLoadClientes(forceRefresh);
          }
          return Promise.resolve([]);
        }}
        searchClientes={searchClientes}
      />
      
      {/* Diálogo de proformas guardadas */}
      <ProformasDialog 
        isOpen={showProformasDialog} 
        onClose={closeProformasDialog}
        onSelectProforma={handleSelectProforma}
        onLoadProformas={onLoadProformas} // Pasar la función de carga
        proformas={proformas || []} // Pasar proformas explícitamente 
      />

      {/* Diálogo de confirmación para guardar proforma */}
      <Dialog 
        open={showSaveDialog} 
        onOpenChange={closeSaveDialog}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle className={
              saveDialogType === "success" ? "text-green-600" : 
              saveDialogType === "warning" ? "text-amber-600" : 
              "text-red-600"
            }>
              {saveDialogTitle}
            </DialogTitle>
            <DialogDescription className="text-base">
              {saveDialogMessage}
            </DialogDescription>
            
            {/* Detalles de la proforma o del error */}
            {saveDialogDetails && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md border text-sm font-mono whitespace-pre-line">
                {saveDialogDetails}
              </div>
            )}
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={closeSaveDialog}>
              Cerrar
            </Button>
            
            {/* Opciones adicionales para proformas guardadas exitosamente */}
            {saveDialogType === "success" && savedProformaId && (
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  // Función para exportar la proforma
                  const proforma = proformas.find(p => p.id === activeProformaId);
                  if (proforma) {
                    // First close dialog, then trigger action after a microtask delay
                    closeSaveDialog();
                    setTimeout(() => handleAction("export"), 50);
                  }
                }}
              >
                Exportar PDF
              </Button>
            )}
            
            {/* Opción para reintentar en caso de advertencias */}
            {saveDialogType === "warning" && (
              <Button
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => {
                  // Volver a intentar guardar - keep the timeout but increase it slightly
                  closeSaveDialog();
                  setTimeout(() => handleAction("save"), 150);
                }}
              >
                Reintentar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}