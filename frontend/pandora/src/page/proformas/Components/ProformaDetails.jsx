// src/page/proformas/Components/ProformaDetails.jsx
import { useState } from 'react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Componente para manejar los detalles básicos de la proforma
 */
const ProformaDetails = ({ clientInfo, setClientInfo, proformaDetails, setProformaDetails }) => {
  // Estado local para las pestañas
  const [activeTab, setActiveTab] = useState('client');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Datos del cliente */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Datos del Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="client-name">Empresa/Cliente</Label>
            <Input
              id="client-name"
              value={clientInfo.name}
              onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
              placeholder="Nombre de la empresa o cliente"
            />
          </div>
          <div>
            <Label htmlFor="client-contact">Persona de contacto</Label>
            <Input
              id="client-contact"
              value={clientInfo.contact}
              onChange={(e) => setClientInfo({ ...clientInfo, contact: e.target.value })}
              placeholder="Nombre del contacto"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                type="email"
                value={clientInfo.email}
                onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                placeholder="email@ejemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="client-phone">Teléfono</Label>
              <Input
                id="client-phone"
                value={clientInfo.phone}
                onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                placeholder="+593 98-765-4321"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="client-address">Dirección</Label>
            <Textarea
              id="client-address"
              value={clientInfo.address}
              onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
              placeholder="Dirección completa"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detalles de la proforma */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Detalles de la Proforma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="proforma-number">Número de Proforma</Label>
              <Input
                id="proforma-number"
                value={proformaDetails.number}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label>Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !proformaDetails.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {proformaDetails.date ? format(proformaDetails.date, 'PPP') : "Seleccione fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={proformaDetails.date}
                    onSelect={date => setProformaDetails({ ...proformaDetails, date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Fecha de Vencimiento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !proformaDetails.expiryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {proformaDetails.expiryDate ? format(proformaDetails.expiryDate, 'PPP') : "Seleccione fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={proformaDetails.expiryDate}
                    onSelect={date => setProformaDetails({ ...proformaDetails, expiryDate: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div>
            <Label htmlFor="payment-terms">Condiciones de Pago</Label>
            <Input
              id="payment-terms"
              value={proformaDetails.paymentTerms}
              onChange={e => setProformaDetails({ ...proformaDetails, paymentTerms: e.target.value })}
              placeholder="Ej: 50% anticipo, 50% contra entrega"
            />
          </div>
          <div>
            <Label htmlFor="delivery-time">Tiempo de Entrega</Label>
            <Input
              id="delivery-time"
              value={proformaDetails.deliveryTime}
              onChange={e => setProformaDetails({ ...proformaDetails, deliveryTime: e.target.value })}
              placeholder="Ej: 15 días hábiles"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProformaDetails;