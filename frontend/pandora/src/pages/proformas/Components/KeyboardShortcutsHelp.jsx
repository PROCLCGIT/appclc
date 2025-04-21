// src/pages/proformas/components/KeyboardShortcutsHelp.jsx

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Keyboard, HelpCircle } from 'lucide-react';
import { formatShortcut, COMMON_SHORTCUTS } from '../utils/keyboardShortcuts';

/**
 * Componente que muestra los atajos de teclado disponibles
 * Se puede usar como un botón de ayuda que abre un panel lateral
 */
const KeyboardShortcutsHelp = ({ 
  shortcuts = [], // Atajos personalizados adicionales
  trigger, // Elemento que sirve como disparador del panel
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  
  // Combinar los atajos predefinidos con los personalizados
  const allShortcuts = Object.values(COMMON_SHORTCUTS).concat(shortcuts);
  
  // Agrupar los atajos por ámbito
  const shortcutsByScope = allShortcuts.reduce((acc, shortcut) => {
    const scope = shortcut.scope || 'global';
    if (!acc[scope]) acc[scope] = [];
    acc[scope].push(shortcut);
    return acc;
  }, {});
  
  // Obtener todos los ámbitos únicos y ordenarlos
  const scopes = Object.keys(shortcutsByScope).sort((a, b) => {
    // Ordenar 'global' primero, luego alfabéticamente
    if (a === 'global') return -1;
    if (b === 'global') return 1;
    return a.localeCompare(b);
  });
  
  // Nombres legibles para los ámbitos
  const scopeNames = {
    global: 'General',
    items: 'Lista de Ítems',
    dialog: 'Diálogos',
    proforma: 'Proforma'
  };
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            aria-label="Ver atajos de teclado"
            className={`flex items-center gap-1 ${className}`}
          >
            <Keyboard className="h-4 w-4" />
            <span>Atajos de teclado</span>
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-full max-w-md sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <Keyboard className="h-5 w-5 mr-2" />
            Atajos de Teclado Disponibles
          </SheetTitle>
          <SheetDescription>
            Los siguientes atajos le ayudarán a trabajar de manera más eficiente.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6">
          {scopes.map(scope => (
            <div key={scope} className="mb-6">
              <h3 className="text-sm font-medium text-blue-600 mb-3 border-b pb-1">
                {scopeNames[scope] || scope}
              </h3>
              
              <div className="space-y-3">
                {shortcutsByScope[scope].map((shortcut, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-gray-100 border rounded text-xs font-mono">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
            <div className="flex items-start">
              <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                <strong>Consejo:</strong> Puede presionar <kbd className="px-1 py-0.5 bg-gray-100 border rounded text-xs">Alt + H</kbd> en cualquier momento para abrir esta ayuda.
              </p>
            </div>
          </div>
        </div>
        
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cerrar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default KeyboardShortcutsHelp;