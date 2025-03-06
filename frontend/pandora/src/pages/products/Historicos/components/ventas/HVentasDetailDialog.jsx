// HVentasDetailDialog.jsx

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import React from "react";

const HVentasDetailDialog = ({
  detailModalOpen,
  setDetailModalOpen,
  currentItem,
  handleOpenModal
}) => {

  // Función para formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-EC', { 
      style: 'currency', 
      currency: 'USD'
    }).format(value);
  };

  if (!currentItem) return null;

  return (
    <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
      <DialogContent className="sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>Detalles de la Venta</DialogTitle>
          <DialogDescription>
            Información completa del registro de venta
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-purple-900">
                Factura: {currentItem.factura}
              </h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {format(new Date(currentItem.fecha), 'dd/MM/yyyy')}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Cliente:</p>
                <p className="font-medium">{currentItem.cliente_detail?.nombre || currentItem.cliente?.nombre || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Empresa:</p>
                <p className="font-medium">{currentItem.empresa_detail?.nombre || currentItem.empresa?.nombre || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <h4 className="font-semibold text-purple-900 mb-2">Producto</h4>
            <div className="space-y-2">
              <p>
                <span className="text-gray-600">Código:</span>{" "}
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border">
                  {currentItem.producto_detail?.code || currentItem.producto?.code || 'N/A'}
                </span>
              </p>
              <p>
                <span className="text-gray-600">Nombre:</span>{" "}
                <span className="font-medium">{currentItem.producto_detail?.nombre || currentItem.producto?.nombre || 'N/A'}</span>
              </p>
              <p>
                <span className="text-gray-600">Cantidad:</span>{" "}
                <span className="font-medium">{currentItem.cantidad || 1} unidad(es)</span>
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <h4 className="font-semibold text-green-900 mb-2">Valores</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Valor:</p>
                <p className="font-medium">{formatCurrency(currentItem.valor)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">IVA:</p>
                <p className="font-medium">{formatCurrency(currentItem.iva)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Total:</p>
                <p className="text-lg font-bold text-green-700">
                  {formatCurrency((parseFloat(currentItem.valor) * (currentItem.cantidad || 1)) + parseFloat(currentItem.iva))}
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-between border-t">
            <Button 
              variant="outline" 
              onClick={() => handleOpenModal(currentItem)}
              className="flex items-center"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button onClick={() => setDetailModalOpen(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HVentasDetailDialog;