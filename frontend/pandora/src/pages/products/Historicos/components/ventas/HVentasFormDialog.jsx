// HVentasFormDialog.jsx

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";

const HVentasFormDialog = ({
  modalOpen,
  setModalOpen,
  isEditing,
  formData,
  setFormData,
  handleSubmit,
  clientes,
  empresas,
  productos,
  isLoading
}) => {

  // Manejador de cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Manejador de cambios en selects
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Manejador para la fecha
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      fecha: date
    });
  };

  // Cuando se hace submit
  const onSubmit = (e) => {
    e.preventDefault();
    // Construir dataToSubmit
    const dataToSubmit = {
      producto: String(formData.producto),
      cliente: String(formData.cliente),
      empresa: String(formData.empresa),
      fecha: format(formData.fecha, 'yyyy-MM-dd'),
      factura: formData.factura,
      valor: parseFloat(formData.valor || 0),
      iva: parseFloat(formData.iva || 0),
      cantidad: parseInt(formData.cantidad || 1)
    };
    handleSubmit(dataToSubmit, isEditing);
  };

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Venta' : 'Registrar Nueva Venta'}
          </DialogTitle>
          <DialogDescription>
            Complete los campos para {isEditing ? 'actualizar el' : 'registrar un nuevo'} registro de venta.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="factura" className="font-medium">
                Numero de Factura <span className="text-red-500">*</span>
              </Label>
              <Input
                id="factura"
                name="factura"
                placeholder="Ejemplo: FAC-001-123456"
                value={formData.factura}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fecha" className="font-medium">
                Fecha <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fecha"
                name="fecha"
                type="date"
                value={formData.fecha ? format(formData.fecha, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  handleDateChange(date);
                }}
                required
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cliente" className="font-medium">
                Cliente <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.cliente}
                onValueChange={(value) => handleSelectChange('cliente', value)}
                required
                className="w-full"
              >
                <SelectTrigger id="cliente" className="w-full">
                  <SelectValue placeholder="Seleccione un cliente" />
                </SelectTrigger>
                <SelectContent className="max-h-80 overflow-y-auto min-w-[300px]">
                  {clientes.map(cliente => (
                    <SelectItem key={cliente.id} value={String(cliente.id)}>
                      {cliente.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="empresa" className="font-medium">
                Empresa <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.empresa}
                onValueChange={(value) => handleSelectChange('empresa', value)}
                required
                className="w-full"
              >
                <SelectTrigger id="empresa" className="w-full">
                  <SelectValue placeholder="Seleccione una empresa" />
                </SelectTrigger>
                <SelectContent className="max-h-80 overflow-y-auto min-w-[300px]">
                  {empresas.map(empresa => (
                    <SelectItem key={empresa.id} value={String(empresa.id)}>
                      {empresa.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="producto" className="font-medium">
              Producto <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.producto}
              onValueChange={(value) => handleSelectChange('producto', value)}
              required
              className="w-full"
            >
              <SelectTrigger id="producto" className="w-full">
                <SelectValue placeholder="Seleccione un producto" />
              </SelectTrigger>
              <SelectContent className="max-h-80 overflow-y-auto min-w-[350px]">
                {productos.map(prod => (
                  <SelectItem key={prod.id} value={String(prod.id)}>
                    {prod.code || prod.codigo || ''} {prod.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cantidad" className="font-medium">
                Cantidad <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cantidad"
                name="cantidad"
                type="number"
                min="1"
                placeholder="1"
                value={formData.cantidad}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="valor" className="font-medium">
                Valor <span className="text-red-500">*</span>
              </Label>
              <Input
                id="valor"
                name="valor"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.valor}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="iva" className="font-medium">
                IVA
              </Label>
              <Input
                id="iva"
                name="iva"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.iva}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-purple-700 hover:bg-purple-800"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {isEditing ? 'Actualizar Venta' : 'Registrar Venta'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HVentasFormDialog;