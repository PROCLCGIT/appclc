import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Plus, Printer, Save, Trash, FileDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, fetchInventory, fetchOfferedProducts } from "@/redux/actions";

const Testing21 = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products);
  const inventory = useSelector((state) => state.inventory);
  const offeredProducts = useSelector((state) => state.offeredProducts);

  const [client, setClient] = useState({
    name: "Empresa ABC S.A.",
    attention: "Ing. Juan Martínez",
    email: "jmartinez@empresaabc.com",
    phone: "099-555-1234",
    address: "Av. de las Américas y Juan Tanca Marengo, Guayaquil",
  });

  const [quote, setQuote] = useState({
    number: "PRO-2025-0042",
    date: new Date(),
    expiryDate: new Date(new Date().setDate(new Date().getDate() + 15)),
    paymentTerms: "50% anticipo, 50% contra entrega",
    deliveryTime: "5 días hábiles",
    validityDays: 15,
    notes: "Precios incluyen IVA. Entrega sin costo adicional.",
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    template: "template1",
    taxRate: 12, // Configurable tax rate
  });

  const [items, setItems] = useState([]);

  // Fetch data from databases on mount
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchInventory());
    dispatch(fetchOfferedProducts());
  }, [dispatch]);

  // Calculate totals
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * (quote.taxRate / 100);
    const total = subtotal + tax - quote.discount;

    setQuote((prev) => ({
      ...prev,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    }));
  }, [items, quote.taxRate, quote.discount]);

  const addItem = () => {
    const newItem = {
      id: items.length + 1,
      code: "",
      description: "",
      unit: "Unidad",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id, field, value) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice" || field === "discount") {
          const quantity = field === "quantity" ? value : item.quantity;
          const unitPrice = field === "unitPrice" ? value : item.unitPrice;
          const discount = field === "discount" ? value : item.discount;
          const discountAmount = (unitPrice * quantity * discount) / 100;
          updatedItem.total = unitPrice * quantity - discountAmount;
        }
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto bg-white">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">Proforma</h1>
          <p className="text-gray-600 mt-1">#{quote.number}</p>
        </div>
        <div className="flex items-center">
          <Avatar className="h-12 w-12 mr-3">
            <AvatarImage src="/company-logo.png" alt="Company Logo" />
            <AvatarFallback className="bg-blue-500 text-white">CLC</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-blue-800">Su Empresa S.A.</h2>
            <p className="text-sm text-gray-600">comercial@suempresa.com</p>
            <p className="text-sm text-gray-600">+593 98-765-4321</p>
          </div>
        </div>
      </header>

      {/* Template Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Seleccionar Plantilla</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={quote.template}
            onValueChange={(value) => setQuote({ ...quote, template: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione una plantilla" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="template1">Plantilla 1 - Moderna</SelectItem>
              <SelectItem value="template2">Plantilla 2 - Clásica</SelectItem>
              <SelectItem value="template3">Plantilla 3 - Minimalista</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Client and Quote Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-[100px_1fr] gap-1">
                <Label className="text-sm font-medium text-gray-500">Empresa:</Label>
                <Input
                  value={client.name}
                  onChange={(e) => setClient({ ...client, name: e.target.value })}
                  className="h-8"
                />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-1">
                <Label className="text-sm font-medium text-gray-500">Atención:</Label>
                <Input
                  value={client.attention}
                  onChange={(e) => setClient({ ...client, attention: e.target.value })}
                  className="h-8"
                />
              </div>
              {/* Add more editable fields as needed */}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Proforma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-[120px_1fr] gap-1">
                <Label className="text-sm font-medium text-gray-500">Fecha:</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-8 w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {quote.date ? format(quote.date, "PPP") : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={quote.date}
                      onSelect={(date) => setQuote({ ...quote, date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {/* Add more fields as needed */}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products and Services */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Productos y Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Desc. %</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Select
                      value={item.code}
                      onValueChange={(value) => updateItem(item.id, "code", value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((prod) => (
                          <SelectItem key={prod.code} value={prod.code}>
                            {prod.code} - {prod.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.unit}
                      onValueChange={(value) => updateItem(item.id, "unit", value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Unidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Unidad">Unidad</SelectItem>
                        <SelectItem value="Kit">Kit</SelectItem>
                        <SelectItem value="Caja">Caja</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value))}
                      className="h-8 text-right"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value))}
                      className="h-8 text-right"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      value={item.discount}
                      onChange={(e) => updateItem(item.id, "discount", parseFloat(e.target.value))}
                      className="h-8 text-right"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">${item.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button onClick={addItem} variant="outline" className="mt-4">
            <Plus className="h-4 w-4 mr-2" /> Agregar ítem
          </Button>
        </CardContent>
      </Card>

      {/* Configuration and Summary */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Configuración y Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Tasa de Impuesto (%)</Label>
                <Input
                  type="number"
                  value={quote.taxRate}
                  onChange={(e) => setQuote({ ...quote, taxRate: parseFloat(e.target.value) })}
                  className="h-8"
                />
              </div>
              <div>
                <Label>Descuento Global ($)</Label>
                <Input
                  type="number"
                  value={quote.discount}
                  onChange={(e) => setQuote({ ...quote, discount: parseFloat(e.target.value) })}
                  className="h-8"
                />
              </div>
              <div>
                <Label>Notas</Label>
                <Textarea
                  value={quote.notes}
                  onChange={(e) => setQuote({ ...quote, notes: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1">
                <span className="text-sm font-medium text-gray-500">Subtotal:</span>
                <span className="text-sm text-right">${quote.subtotal}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-sm font-medium text-gray-500">Impuesto ({quote.taxRate}%):</span>
                <span className="text-sm text-right">${quote.tax}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-sm font-medium text-gray-500">Descuento:</span>
                <span className="text-sm text-right">${quote.discount}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 pt-2 border-t">
                <span className="text-lg font-bold text-gray-800">Total:</span>
                <span className="text-lg font-bold text-right text-blue-700">${quote.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Buttons */}
      <div className="flex justify-between mt-8">
        <div>
          <Button variant="outline" className="mr-2">
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
          <Button variant="outline" className="mr-2">
            <FileDown className="h-4 w-4 mr-2" /> Descargar PDF
          </Button>
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" /> Descargar Excel
          </Button>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" /> Guardar Proforma
        </Button>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>Su Empresa S.A. - Todos los derechos reservados © 2023</p>
        <p>Dirección: Av. Principal 123, Ciudad, País</p>
        <p>Tel: +593 98-765-4321 | Email: info@suempresa.com</p>
      </footer>
    </div>
  );
};

export default Testing21;