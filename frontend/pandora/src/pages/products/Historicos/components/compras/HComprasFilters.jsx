// HComprasFilters.jsx

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const HComprasFilters = ({
  filters,
  handleFilterChange,
  handleResetFilters,
  applyFilters,
  proveedores,
  productos,
  empresas
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <Label>Proveedor</Label>
          <Select
            value={filters.proveedor}
            onValueChange={(value) => handleFilterChange('proveedor', value)}
            className="w-full"
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los proveedores" />
            </SelectTrigger>
            <SelectContent className="max-h-80 overflow-y-auto min-w-[300px]">
              <SelectItem value="all_proveedores">Todos los proveedores</SelectItem>
              {proveedores.map((proveedor) => (
                <SelectItem key={proveedor.id} value={String(proveedor.id)}>
                  {proveedor.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Producto</Label>
          <Select
            value={filters.producto}
            onValueChange={(value) => handleFilterChange('producto', value)}
            className="w-full"
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los productos" />
            </SelectTrigger>
            <SelectContent className="max-h-80 overflow-y-auto min-w-[300px]">
              <SelectItem value="all_productos">Todos los productos</SelectItem>
              {productos.map((producto) => (
                <SelectItem key={producto.id} value={String(producto.id)}>
                  {producto.code || producto.codigo || ''} {producto.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Empresa</Label>
          <Select
            value={filters.empresa}
            onValueChange={(value) => handleFilterChange('empresa', value)}
            className="w-full"
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas las empresas" />
            </SelectTrigger>
            <SelectContent className="max-h-80 overflow-y-auto min-w-[300px]">
              <SelectItem value="all_empresas">Todas las empresas</SelectItem>
              {empresas.map((emp) => (
                <SelectItem key={emp.id} value={String(emp.id)}>
                  {emp.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="fecha_inicio">Fecha inicio</Label>
          <Input
            id="fecha_inicio"
            type="date"
            value={filters.fecha_inicio ? format(filters.fecha_inicio, 'yyyy-MM-dd') : ''}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : null;
              handleFilterChange('fecha_inicio', date);
            }}
            className="w-full"
          />
        </div>
        
        <div>
          <Label htmlFor="fecha_fin">Fecha fin</Label>
          <Input
            id="fecha_fin"
            type="date"
            value={filters.fecha_fin ? format(filters.fecha_fin, 'yyyy-MM-dd') : ''}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : null;
              handleFilterChange('fecha_fin', date);
            }}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleResetFilters}>
          Limpiar filtros
        </Button>
        <Button onClick={applyFilters}>
          Aplicar filtros
        </Button>
      </div>
    </div>
  );
};

export default HComprasFilters;