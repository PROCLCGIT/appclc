// src/page/proformas/Components/ItemsTable.jsx

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash } from "lucide-react";

const ItemsTable = ({ items, config, updateItem, removeItem, formatCurrency }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50">
          {config.showItemCodes && <TableHead className="w-[80px]">CódigOOOOo</TableHead>}
          <TableHead className="w-[300px]">Descripción</TableHead>
          <TableHead className="w-[80px]">Unidad</TableHead>
          <TableHead className="w-[80px] text-right">Cantidad</TableHead>
          <TableHead className="w-[100px] text-right">Precio Unit.</TableHead>
          {config.showDiscount && <TableHead className="w-[80px] text-right">Desc. %</TableHead>}
          <TableHead className="w-[120px] text-right">Total</TableHead>
          <TableHead className="w-[50px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            {config.showItemCodes && (
              <TableCell>
                <Input
                  value={item.code}
                  onChange={(e) => updateItem(item.id, "code", e.target.value)}
                  className="h-8 w-full"
                />
              </TableCell>
            )}
            <TableCell>
              <Input
                value={item.description}
                onChange={(e) => updateItem(item.id, "description", e.target.value)}
                className="h-8 w-full"
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
                  <SelectItem value="Servicio">Servicio</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell className="text-right">
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                className="h-8 w-full text-right"
                step={config.allowPartialItems ? "0.01" : "1"}
                min="0"
              />
            </TableCell>
            <TableCell className="text-right">
              <Input
                type="number"
                value={item.unitPrice}
                onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                className="h-8 w-full text-right"
                step="0.01"
                min="0"
              />
            </TableCell>
            {config.showDiscount && (
              <TableCell className="text-right">
                <Input
                  type="number"
                  value={item.discount}
                  onChange={(e) => updateItem(item.id, "discount", parseFloat(e.target.value) || 0)}
                  className="h-8 w-full text-right"
                  step="0.01"
                  min="0"
                  max="100"
                />
              </TableCell>
            )}
            <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="h-8 w-8 p-0">
                <Trash className="h-4 w-4 text-red-500" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ItemsTable;
