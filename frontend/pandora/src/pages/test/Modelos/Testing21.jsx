import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Plus, Printer, Save, Trash, FileDown, ClipboardCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Modelo 1: Proforma Empresarial Moderna

const Testing21 = () => {
  const [client, setClient] = useState({
    name: "Empresa ABC S.A.",
    attention: "Ing. Juan Martínez",
    email: "jmartinez@empresaabc.com",
    phone: "099-555-1234",
    address: "Av. de las Américas y Juan Tanca Marengo, Guayaquil"
  });
  
  const [quote, setQuote] = useState({
    number: "PRO-2025-0042",
    date: new Date(),
    expiryDate: new Date(new Date().setDate(new Date().getDate() + 15)),
    paymentTerms: "50% anticipo, 50% contra entrega",
    deliveryTime: "5 días hábiles",
    validityDays: 15,
    notes: "Precios incluyen IVA. Entrega en sus oficinas dentro del perímetro urbano sin costo adicional.",
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0
  });
  
  const [items, setItems] = useState([
    { id: 1, code: "MED-001", description: "Equipo de diagnóstico médico", unit: "Unidad", quantity: 2, unitPrice: 1250.00, discount: 5, total: 2375.00 },
    { id: 2, code: "MED-023", description: "Kit de insumos quirúrgicos", unit: "Kit", quantity: 5, unitPrice: 450.00, discount: 0, total: 2250.00 },
    { id: 3, code: "LAB-045", description: "Microscopio digital de alta resolución", unit: "Unidad", quantity: 1, unitPrice: 3650.00, discount: 10, total: 3285.00 }
  ]);
  
  // Calculate totals
  React.useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.12;
    const total = subtotal + tax;
    
    setQuote(prev => ({
      ...prev,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2)
    }));
  }, [items]);
  
  const addItem = () => {
    const newItem = {
      id: items.length + 1,
      code: "",
      description: "",
      unit: "Unidad",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };
  
  const updateItem = (id, field, value) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total if needed
        if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
          const quantity = field === 'quantity' ? value : item.quantity;
          const unitPrice = field === 'unitPrice' ? value : item.unitPrice;
          const discount = field === 'discount' ? value : item.discount;
          
          const discountAmount = (unitPrice * quantity * discount) / 100;
          updatedItem.total = (unitPrice * quantity) - discountAmount;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setItems(updatedItems);
  };
  
  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  return (
    <div className="p-8 max-w-6xl mx-auto bg-white">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">Proforma</h1>
          <p className="text-gray-600 mt-1">#{quote.number}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center mb-2">
            <div className="bg-blue-100 p-3 rounded-full mr-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/company-logo.png" alt="Company Logo" />
                <AvatarFallback className="bg-blue-500 text-white">CLC</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-800">Su Empresa S.A.</h2>
              <p className="text-sm text-gray-600">comercial@suempresa.com</p>
              <p className="text-sm text-gray-600">+593 98-765-4321</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-[100px_1fr] gap-1">
                <div className="text-sm font-medium text-gray-500">Empresa:</div>
                <div className="text-sm font-semibold">{client.name}</div>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-1">
                <div className="text-sm font-medium text-gray-500">Atención:</div>
                <div className="text-sm">{client.attention}</div>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-1">
                <div className="text-sm font-medium text-gray-500">Email:</div>
                <div className="text-sm text-blue-600">{client.email}</div>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-1">
                <div className="text-sm font-medium text-gray-500">Teléfono:</div>
                <div className="text-sm">{client.phone}</div>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-1">
                <div className="text-sm font-medium text-gray-500">Dirección:</div>
                <div className="text-sm">{client.address}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Detalles de la Proforma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-[120px_1fr] gap-1">
                <div className="text-sm font-medium text-gray-500">Fecha:</div>
                <div className="text-sm">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-8",
                          !quote.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {quote.date ? format(quote.date, "PPP") : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={quote.date}
                        onSelect={(date) => setQuote({...quote, date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-1">
                <div className="text-sm font-medium text-gray-500">Válido hasta:</div>
                <div className="text-sm">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-8",
                          !quote.expiryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {quote.expiryDate ? format(quote.expiryDate, "PPP") : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={quote.expiryDate}
                        onSelect={(date) => setQuote({...quote, expiryDate: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-1">
                <div className="text-sm font-medium text-gray-500">Forma de pago:</div>
                <div className="text-sm">{quote.paymentTerms}</div>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-1">
                <div className="text-sm font-medium text-gray-500">Tiempo entrega:</div>
                <div className="text-sm">{quote.deliveryTime}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Productos y Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[80px]">Código</TableHead>
                  <TableHead className="w-[300px]">Descripción</TableHead>
                  <TableHead className="w-[80px]">Unidad</TableHead>
                  <TableHead className="w-[80px] text-right">Cantidad</TableHead>
                  <TableHead className="w-[100px] text-right">Precio Unit.</TableHead>
                  <TableHead className="w-[80px] text-right">Desc. %</TableHead>
                  <TableHead className="w-[120px] text-right">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input 
                        value={item.code} 
                        onChange={(e) => updateItem(item.id, 'code', e.target.value)}
                        className="h-8 w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={item.description} 
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="h-8 w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={item.unit} 
                        onValueChange={(value) => updateItem(item.id, 'unit', value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Unidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Unidad">Unidad</SelectItem>
                          <SelectItem value="Kit">Kit</SelectItem>
                          <SelectItem value="Caja">Caja</SelectItem>
                          <SelectItem value="Servicio">Servicio</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))}
                        className="h-8 w-full text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input 
                        type="number" 
                        value={item.unitPrice} 
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                        className="h-8 w-full text-right"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input 
                        type="number" 
                        value={item.discount} 
                        onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value))}
                        className="h-8 w-full text-right"
                        step="0.01"
                        max="100"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${item.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <Button 
            onClick={addItem} 
            variant="outline" 
            className="mt-4"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" /> Agregar ítem
          </Button>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={quote.notes}
              onChange={(e) => setQuote({...quote, notes: e.target.value})}
              rows={4}
              placeholder="Ingrese notas adicionales, condiciones especiales, etc."
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium text-gray-500">Subtotal:</div>
                <div className="text-sm text-right">${quote.subtotal}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium text-gray-500">IVA (12%):</div>
                <div className="text-sm text-right">${quote.tax}</div>
              </div>
              <div className="grid grid-cols-2 gap-1 pt-2 border-t">
                <div className="text-lg font-bold text-gray-800">Total:</div>
                <div className="text-lg font-bold text-right text-blue-700">${quote.total}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between mt-8">
        <div>
          <Button variant="outline" className="mr-2">
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
          <Button variant="outline" className="mr-2">
            <FileDown className="h-4 w-4 mr-2" /> Descargar PDF
          </Button>
        </div>
        <div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" /> Guardar Proforma
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Testing21;