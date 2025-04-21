import React, { useState, useCallback, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ItemForm, { AddItemButton } from './ItemForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SearchIcon, Filter, ArrowUpDown, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DndContext, useSensor, useSensors, closestCenter, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from '../utils/keyboardShortcuts';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';

// Componente sortable para cada ítem
const SortableItem = ({ 
  item, 
  updateItem, 
  removeItem, 
  formatCurrency,
  isSelected,
  onSelect
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id.toString()
  });

  const style = {
    transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 10 : 1,
    position: 'relative',
    opacity: isDragging ? 0.8 : 1,
    backgroundColor: isDragging 
      ? 'rgba(96, 165, 250, 0.1)' 
      : isSelected 
        ? 'rgba(96, 165, 250, 0.05)' 
        : undefined,
    borderRadius: isDragging ? '0.5rem' : undefined,
    // Añadir borde cuando está seleccionado
    borderLeft: isSelected ? '3px solid #3b82f6' : '3px solid transparent',
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect(item.id);
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`${isDragging ? 'shadow-lg' : ''} ${isSelected ? 'shadow-sm' : ''}`}
      onClick={handleClick}
      tabIndex={0}
      role="option"
      aria-selected={isSelected}
      data-item-id={item.id}
    >
      <ItemForm
        item={item}
        onUpdate={updateItem}
        onRemove={removeItem}
        formatCurrency={formatCurrency}
        dragHandleProps={{ ...attributes, ...listeners }}
        isSelected={isSelected}
      />
    </div>
  );
};

/**
 * Componente que renderiza la tabla de items con validación
 * Incluye funcionalidad de drag-and-drop y atajos de teclado para reordenar ítems
 */
const ItemsTable = ({
  items = [],
  updateItem,
  removeItem,
  addItem,
  reorderItems, // Nueva prop para reordenar ítems
  formatCurrency,
  previewMode = false,
  config = { showItemCodes: true },
}) => {
  // Estado para filtrado (opcional, pero preparado para implementación futura)
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Configuración de los sensores para DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Solo iniciar arrastre después de mover 8px (para evitar clicks accidentales)
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Encontrar el índice del item seleccionado
  const selectedIndex = selectedItemId 
    ? items.findIndex(item => item.id.toString() === selectedItemId.toString()) 
    : -1;
  
  // Definir los atajos de teclado para la tabla de ítems
  const itemShortcuts = [
    {
      ...COMMON_SHORTCUTS.MOVE_ITEM_UP,
      action: () => {
        if (selectedIndex > 0) {
          reorderItems(selectedIndex, selectedIndex - 1);
          // Actualizar la selección al nuevo índice
          setSelectedItemId(items[selectedIndex - 1].id);
        }
      }
    },
    {
      ...COMMON_SHORTCUTS.MOVE_ITEM_DOWN,
      action: () => {
        if (selectedIndex >= 0 && selectedIndex < items.length - 1) {
          reorderItems(selectedIndex, selectedIndex + 1);
          // Actualizar la selección al nuevo índice
          setSelectedItemId(items[selectedIndex + 1].id);
        }
      }
    },
    {
      ...COMMON_SHORTCUTS.ADD_ITEM,
      action: () => {
        if (!previewMode) {
          addItem();
        }
      }
    },
    {
      ...COMMON_SHORTCUTS.DELETE,
      action: () => {
        if (!previewMode && selectedIndex >= 0) {
          if (window.confirm(`¿Está seguro que desea eliminar este ítem: "${items[selectedIndex].description}"?`)) {
            removeItem(items[selectedIndex].id);
            setSelectedItemId(null);
          }
        }
      }
    }
  ];
  
  // Registrar los atajos de teclado
  useKeyboardShortcuts(itemShortcuts, {
    scope: 'items',
    enabled: !previewMode,
    dependencies: [selectedItemId, items, previewMode]
  });
  
  // Seleccionar el primer ítem si no hay ninguno seleccionado y hay ítems
  useEffect(() => {
    if (items.length > 0 && selectedItemId === null) {
      setSelectedItemId(items[0].id);
    } else if (items.length === 0) {
      setSelectedItemId(null);
    }
  }, [items, selectedItemId]);

  // Calcular totales para mostrar en el resumen
  const totals = React.useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.subtotal += parseFloat(item.unitPrice || 0) * parseFloat(item.quantity || 0);
        const discount = (item.discount || 0) / 100;
        acc.totalDiscounts += parseFloat(item.unitPrice || 0) * parseFloat(item.quantity || 0) * discount;
        acc.total += parseFloat(item.total || 0);
        return acc;
      },
      { subtotal: 0, totalDiscounts: 0, total: 0 }
    );
  }, [items]);

  // Función para manejar la actualización de un ítem
  const handleUpdateItem = (itemId, updates) => {
    if (updateItem) {
      updateItem(itemId, updates);
    }
  };

  // Función para manejar el fin del arrastre (reordenar)
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeIndex = items.findIndex(item => item.id.toString() === active.id);
      const overIndex = items.findIndex(item => item.id.toString() === over.id);
      
      if (activeIndex !== -1 && overIndex !== -1 && reorderItems) {
        reorderItems(activeIndex, overIndex);
      }
    }
  }, [items, reorderItems]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pt-3 pb-2 bg-blue-50">
        <CardTitle className="text-lg flex flex-col md:flex-row md:items-start md:justify-between w-full gap-3">
          <div className="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Productos y Servicios
          </div>

          {!previewMode && (
            <div className="flex flex-col md:flex-row items-start gap-2">
              <div className="relative w-full md:w-auto">
                <Input
                  type="text"
                  placeholder="Buscar en la tabla..."
                  className="h-8 pr-8 w-full md:w-[220px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Buscar ítems"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <SearchIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 h-8 px-2"
                  onClick={() => {
                    // Implementar ordenación
                    console.log("Ordenar");
                  }}
                  aria-label="Ordenar ítems"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  <span>Ordenar</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 h-8 px-2"
                  onClick={() => setShowFilters(!showFilters)}
                  aria-pressed={showFilters}
                  aria-label="Mostrar filtros"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filtrar</span>
                </Button>
              </div>
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Cabeceras de tabla en modo escritorio */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-2 border-b pb-2 mb-1">
          {config.showItemCodes && (
            <div className="col-span-2 text-sm font-medium text-gray-500">Código</div>
          )}
          <div className="col-span-4 text-sm font-medium text-gray-500">Descripción</div>
          <div className="col-span-1 text-sm font-medium text-gray-500">Unidad</div>
          <div className="col-span-1 text-sm font-medium text-gray-500 text-right">Cantidad</div>
          <div className="col-span-1.5 text-sm font-medium text-gray-500 text-right">Precio Unit.</div>
          <div className="col-span-1 text-sm font-medium text-gray-500 text-right">Desc. %</div>
          <div className="col-span-1.5 text-sm font-medium text-gray-500 text-right">Total</div>
          <div className="col-span-0.5"></div>
        </div>

        {/* Formulario de ítems */}
        <div className="space-y-1">
          {previewMode ? (
            // En modo vista, solo mostrar los datos sin formularios
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  {config.showItemCodes && <TableHead className="w-[80px]">Código</TableHead>}
                  <TableHead className="w-[300px]">Descripción</TableHead>
                  <TableHead className="w-[80px]">Unidad</TableHead>
                  <TableHead className="w-[80px] text-right">Cantidad</TableHead>
                  <TableHead className="w-[100px] text-right">Precio Unit.</TableHead>
                  <TableHead className="w-[80px] text-right">Desc. %</TableHead>
                  <TableHead className="w-[120px] text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    {config.showItemCodes && <TableCell>{item.code}</TableCell>}
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="text-right">{item.discount}%</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            // En modo edición, mostrar formularios para cada ítem con funcionalidad drag-and-drop
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
              <div 
                role="listbox" 
                aria-label="Lista de ítems ordenable" 
                className="items-list-sortable"
                onKeyDown={(e) => {
                  // Navegación con teclado adicional
                  if (e.key === 'ArrowDown' && !e.altKey) {
                    e.preventDefault();
                    if (selectedIndex < items.length - 1) {
                      setSelectedItemId(items[selectedIndex + 1].id);
                    }
                  } else if (e.key === 'ArrowUp' && !e.altKey) {
                    e.preventDefault();
                    if (selectedIndex > 0) {
                      setSelectedItemId(items[selectedIndex - 1].id);
                    }
                  }
                }}
              >
                <SortableContext items={items.map(item => item.id.toString())} strategy={verticalListSortingStrategy}>
                  {items.map((item) => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      updateItem={handleUpdateItem}
                      removeItem={removeItem}
                      formatCurrency={formatCurrency}
                      isSelected={selectedItemId === item.id}
                      onSelect={setSelectedItemId}
                    />
                  ))}
                </SortableContext>
              </div>
            </DndContext>
          )}
        </div>

        {/* Filtros (condicionales) */}
        {!previewMode && showFilters && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <h3 className="text-sm font-medium mb-2">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="filter-code" className="text-xs">Código contiene</Label>
                <Input id="filter-code" className="h-8 mt-1" placeholder="Código" />
              </div>
              <div>
                <Label htmlFor="filter-price" className="text-xs">Precio mayor a</Label>
                <Input id="filter-price" type="number" className="h-8 mt-1" placeholder="0.00" />
              </div>
              <div>
                <Label htmlFor="filter-unit" className="text-xs">Unidad</Label>
                <Select>
                  <SelectTrigger id="filter-unit" className="h-8 mt-1">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="Unidad">Unidad</SelectItem>
                    <SelectItem value="Kit">Kit</SelectItem>
                    <SelectItem value="Servicio">Servicio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <Button variant="outline" size="sm" className="mr-2">Limpiar</Button>
              <Button variant="default" size="sm">Aplicar filtros</Button>
            </div>
          </div>
        )}

        {/* Botón para agregar item y totales */}
        <div className="mt-4 pt-4 border-t flex justify-between items-start">
          <div className="flex-shrink-0">
            {!previewMode && <AddItemButton onClick={addItem} />}
          </div>

          <div className="flex-shrink-0 space-y-2 text-right min-w-[200px]">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Subtotal:</span>
              <span className="text-sm font-mono">{formatCurrency(totals.subtotal)}</span>
            </div>
            
            {config.showDiscount && totals.totalDiscounts > 0 && (
              <div className="flex justify-between items-center text-red-600">
                <span className="text-sm">Descuentos:</span>
                <span className="text-sm font-mono">-{formatCurrency(totals.totalDiscounts)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">IVA ({config.taxRate || 12}%):</span>
              <span className="text-sm font-mono">
                {formatCurrency((totals.total * (config.taxRate || 12)) / 100)}
              </span>
            </div>
            
            <div className="flex justify-between items-center pt-2 mt-1 border-t border-gray-200">
              <span className="text-base font-bold text-gray-700">Total:</span>
              <span className="text-base font-bold text-blue-700 font-mono">
                {formatCurrency(totals.total * (1 + (config.taxRate || 12) / 100))}
              </span>
            </div>
          </div>
        </div>
        
        {/* Información o errores para debugging */}
        {items.length === 0 && (
          <div className="text-center py-10 text-gray-500" role="status">
            No hay ítems en esta proforma. {!previewMode && 'Haga clic en "Agregar ítem" para comenzar.'}
          </div>
        )}

        {/* Atajos de teclado - Ayuda */}
        {!previewMode && (
          <div className="mt-6 pt-4 border-t flex justify-between items-center">
            <details className="text-xs text-gray-500">
              <summary className="cursor-pointer font-medium mb-2">Atajos de teclado básicos</summary>
              <div className="pl-4 space-y-1 mt-2">
                <p><kbd className="px-1 py-0.5 bg-gray-100 border rounded">Tab</kbd>: Navegar entre campos</p>
                <p><kbd className="px-1 py-0.5 bg-gray-100 border rounded">↑</kbd>/<kbd className="px-1 py-0.5 bg-gray-100 border rounded">↓</kbd>: Seleccionar ítem anterior/siguiente</p>
                <p><kbd className="px-1 py-0.5 bg-gray-100 border rounded">Alt</kbd>+<kbd className="px-1 py-0.5 bg-gray-100 border rounded">↑</kbd>/<kbd className="px-1 py-0.5 bg-gray-100 border rounded">↓</kbd>: Mover ítem hacia arriba/abajo</p>
                <p><kbd className="px-1 py-0.5 bg-gray-100 border rounded">Delete</kbd>: Eliminar ítem seleccionado (con confirmación)</p>
                <p><kbd className="px-1 py-0.5 bg-gray-100 border rounded">Alt</kbd>+<kbd className="px-1 py-0.5 bg-gray-100 border rounded">A</kbd>: Agregar nuevo ítem</p>
              </div>
            </details>
            
            <KeyboardShortcutsHelp
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 flex items-center"
                  aria-label="Ver todos los atajos de teclado"
                >
                  <Keyboard className="h-4 w-4 mr-1" />
                  <span>Ver todos los atajos</span>
                </Button>
              }
              shortcuts={[
                // Atajos específicos de este componente
                {
                  key: 'ArrowUp',
                  description: 'Seleccionar ítem anterior',
                  scope: 'items'
                },
                {
                  key: 'ArrowDown',
                  description: 'Seleccionar ítem siguiente',
                  scope: 'items'
                },
                {
                  key: 'Tab',
                  description: 'Navegar entre campos de formulario',
                  scope: 'items'
                },
                {
                  key: 'Enter',
                  description: 'Confirmar edición de campo',
                  scope: 'items'
                }
              ]}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ItemsTable;