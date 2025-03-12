// src/page/proformas/Components/ProformaConfigDialog.jsx
import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENCY_OPTIONS, TEMPLATE_TYPES } from '../Utils/constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';

/**
 * Diálogo de configuración de la proforma
 */
const ProformaConfigDialog = ({ companyInfo, setCompanyInfo, proformaDetails, setProformaDetails }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [taxRate, setTaxRate] = useState((companyInfo.taxRate * 100).toString());
  
  // Actualizar la tasa de impuesto en el estado al cambiar
  const handleTaxRateChange = (value) => {
    setTaxRate(value);
    // Convertir a decimales (ej. 12% -> 0.12)
    const taxRateDecimal = parseFloat(value) / 100;
    if (!isNaN(taxRateDecimal)) {
      setCompanyInfo({ ...companyInfo, taxRate: taxRateDecimal });
    }
  };

  // Guardar los cambios
  const handleSaveChanges = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Configuración">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configuración de Proforma</DialogTitle>
          <DialogDescription>
            Personaliza la información de la empresa y opciones de la proforma.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="company">Empresa</TabsTrigger>
            <TabsTrigger value="template">Plantilla</TabsTrigger>
            <TabsTrigger value="options">Opciones</TabsTrigger>
          </TabsList>
          
          {/* Pestaña de Empresa */}
          <TabsContent value="company" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nombre de la Empresa</Label>
              <Input
                id="company-name"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-email">Email</Label>
                <Input
                  id="company-email"
                  type="email"
                  value={companyInfo.email}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company-phone">Teléfono</Label>
                <Input
                  id="company-phone"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company-address">Dirección</Label>
              <Textarea
                id="company-address"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company-logo">Logo (URL)</Label>
              <Input
                id="company-logo"
                value={companyInfo.logo}
                onChange={(e) => setCompanyInfo({ ...companyInfo, logo: e.target.value })}
                placeholder="URL de la imagen del logo"
              />
            </div>
          </TabsContent>
          
          {/* Pestaña de Plantilla */}
          <TabsContent value="template" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-type">Plantilla</Label>
              <Select
                value={proformaDetails.template}
                onValueChange={(value) => setProformaDetails({ ...proformaDetails, template: value })}
              >
                <SelectTrigger id="template-type">
                  <SelectValue placeholder="Seleccione plantilla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TEMPLATE_TYPES.MODERN}>Moderna</SelectItem>
                  <SelectItem value={TEMPLATE_TYPES.CLASSIC}>Clásica</SelectItem>
                  <SelectItem value={TEMPLATE_TYPES.MINIMAL}>Minimalista</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Seleccione el diseño que se usará para mostrar la proforma.
              </p>
            </div>
          </TabsContent>
          
          {/* Pestaña de Opciones */}
          <TabsContent value="options" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select
                value={companyInfo.currency}
                onValueChange={(value) => setCompanyInfo({ ...companyInfo, currency: value })}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Seleccione moneda" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tax-rate">Tasa de Impuesto (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                value={taxRate}
                onChange={(e) => handleTaxRateChange(e.target.value)}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notas por defecto</Label>
              <Textarea
                id="notes"
                value={proformaDetails.notes}
                onChange={(e) => setProformaDetails({ ...proformaDetails, notes: e.target.value })}
                rows={3}
                placeholder="Términos y condiciones, notas adicionales, etc."
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProformaConfigDialog;