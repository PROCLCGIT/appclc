// src/page/proformas/Components/ItemsTable.jsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash } from 'lucide-react';
import { UNITS } from '../Utils/constants';
import { formatCurrency } from '../Utils/formatCurrency';

/**
 * Tabla para mostrar y editar los items de la proforma
 */
const ItemsTable = ({ items, onAddItem, onUpdateItem, onRemoveItem, currency = 'USD' }) => {
  // Manejar cambios en los campos de un item
  const handleItemChange = (id, field, value) => {
    onUpdateItem(id, field, value);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[100px]">Código</TableHead>
              <TableHead className="w-[300px]">Descripción</TableHead>
              <TableHead className="w-[100px]">Unidad</TableHead>
              <TableHead className="w-[90px] text-right">Cantidad</TableHead>
              <TableHead className="w-[120px] text-right">Precio Unit.</TableHead>
              <TableHead className="w-[80px] text-right">Desc. %</TableHead>
              <TableHead className="w-[120px] text-right">Total</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No hay productos añadidos a la proforma.
                  <br />
                  <Button 
                    variant="link" 
                    className="mt-2 text-blue-600" 
                    onClick={() => onAddItem()}
                  >
                    Añadir un producto
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Input
                      value={item.code || ''}
                      onChange={(e) => handleItemChange(item.id, 'code', e.target.value)}
                      className="h-8 text-sm"
                      placeholder="Código"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.description || ''}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      className="h-8 text-sm"
                      placeholder="Descripción del producto o servicio"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.unit || 'unit'}
                      onValueChange={(value) => handleItemChange(item.id, 'unit', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Unidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      className="h-8 text-sm text-right"
                      min="0"
                      step="1"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                      className="h-8 text-sm text-right"
                      min="0"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.discount}
                      onChange={(e) => handleItemChange(item.id, 'discount', e.target.value)}
                      className="h-8 text-sm text-right"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.total, currency)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => onAddItem()}
      >
        <Plus className="h-4 w-4 mr-2" /> Agregar ítem
      </Button>
    </div>
  );
};

export default ItemsTable;