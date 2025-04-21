// src/pages/proformas/utils/keyboardShortcuts.js

/**
 * Utilidad para gestionar atajos de teclado de manera centralizada
 * Implementa un hook y una función de ayuda para registrar y ejecutar atajos
 */

import { useEffect, useCallback, useRef } from 'react';

/**
 * Tipo de dato para un atajo de teclado
 * @typedef {Object} ShortcutAction
 * @property {string} key - La tecla principal del atajo (e.g., 'a', 'ArrowUp')
 * @property {boolean} [alt] - Si se requiere la tecla Alt
 * @property {boolean} [ctrl] - Si se requiere la tecla Ctrl
 * @property {boolean} [shift] - Si se requiere la tecla Shift
 * @property {boolean} [meta] - Si se requiere la tecla Meta (Command en Mac, Windows en PC)
 * @property {Function} action - Función a ejecutar cuando se activa el atajo
 * @property {string} [description] - Descripción del atajo para la ayuda
 * @property {string} [scope] - Ámbito del atajo (e.g., 'global', 'items', 'dialog')
 */

/**
 * Comprueba si un evento de teclado coincide con un atajo definido
 * @param {KeyboardEvent} event - El evento de teclado
 * @param {ShortcutAction} shortcut - La definición del atajo
 * @returns {boolean} - true si el atajo coincide
 */
export function matchesShortcut(event, shortcut) {
  // Comprobar si las teclas modificadoras coinciden
  const altMatches = (shortcut.alt === undefined) ? true : event.altKey === shortcut.alt;
  const ctrlMatches = (shortcut.ctrl === undefined) ? true : event.ctrlKey === shortcut.ctrl;
  const shiftMatches = (shortcut.shift === undefined) ? true : event.shiftKey === shortcut.shift;
  const metaMatches = (shortcut.meta === undefined) ? true : event.metaKey === shortcut.meta;
  
  // Comprobar si la tecla principal coincide (case insensitive)
  const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
  
  // Devolver true si todos los criterios coinciden
  return altMatches && ctrlMatches && shiftMatches && metaMatches && keyMatches;
}

/**
 * Hook para registrar atajos de teclado en un componente
 * @param {ShortcutAction[]} shortcuts - Array de definiciones de atajos
 * @param {Object} options - Opciones para personalizar el comportamiento
 * @param {string} [options.scope='global'] - Ámbito predeterminado para los atajos
 * @param {boolean} [options.preventDefault=true] - Si se debe prevenir la acción por defecto
 * @param {boolean} [options.stopPropagation=false] - Si se debe detener la propagación del evento
 * @param {boolean} [options.enabled=true] - Si los atajos están habilitados
 * @param {Array} [options.dependencies=[]] - Dependencias para actualizar los atajos
 */
export function useKeyboardShortcuts(shortcuts, options = {}) {
  const {
    scope = 'global',
    preventDefault = true,
    stopPropagation = false,
    enabled = true,
    dependencies = []
  } = options;
  
  // Mantener los atajos en una referencia para evitar re-renderizados innecesarios
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;
  
  // Manejar el evento de teclado
  const handleKeyDown = useCallback((event) => {
    // Si los atajos están desactivados, no hacer nada
    if (!enabled) return;
    
    // Verificar cada atajo definido
    for (const shortcut of shortcutsRef.current) {
      // Si el ámbito no coincide, continuar con el siguiente
      if (shortcut.scope && shortcut.scope !== scope) continue;
      
      // Si el atajo coincide, ejecutar la acción
      if (matchesShortcut(event, shortcut)) {
        if (preventDefault) event.preventDefault();
        if (stopPropagation) event.stopPropagation();
        
        // Ejecutar la acción del atajo
        shortcut.action(event);
        return; // Salir después de ejecutar la primera acción que coincida
      }
    }
  }, [enabled, preventDefault, scope, stopPropagation]);
  
  // Registrar y eliminar el listener de eventos
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, ...dependencies]);
  
  // Devolver funciones útiles
  return {
    isEnabled: enabled,
    getShortcuts: () => shortcutsRef.current,
    getShortcutsByScope: (targetScope) => 
      shortcutsRef.current.filter(s => s.scope === targetScope || !s.scope),
  };
}

/**
 * Genera una representación legible del atajo de teclado para mostrar en la UI
 * @param {ShortcutAction} shortcut - La definición del atajo
 * @returns {string} - Representación legible del atajo
 */
export function formatShortcut(shortcut) {
  const parts = [];
  
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.meta) parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Win');
  
  // Formatear tecla principal
  let key = shortcut.key;
  
  // Reemplazar nombres de teclas especiales con símbolos más amigables
  const keyMap = {
    'arrowup': '↑',
    'arrowdown': '↓',
    'arrowleft': '←',
    'arrowright': '→',
    'enter': '↵',
    'escape': 'Esc',
    'delete': 'Del',
    'backspace': '⌫',
    'tab': 'Tab',
    'space': 'Space',
    ' ': 'Space'
  };
  
  // Usar el símbolo si existe, o la tecla capitalizada
  const lowercaseKey = key.toLowerCase();
  key = keyMap[lowercaseKey] || key.length === 1 ? key.toUpperCase() : key;
  
  parts.push(key);
  
  return parts.join(' + ');
}

/**
 * Lista de atajos predefinidos que podrían usarse en la aplicación
 */
export const COMMON_SHORTCUTS = {
  SAVE: { key: 's', ctrl: true, description: 'Guardar', scope: 'global' },
  NEW: { key: 'n', ctrl: true, description: 'Nuevo', scope: 'global' },
  PREVIEW: { key: 'p', ctrl: true, description: 'Vista previa', scope: 'global' },
  DELETE: { key: 'Delete', description: 'Eliminar seleccionado', scope: 'items' },
  ADD_ITEM: { key: 'a', alt: true, description: 'Agregar ítem', scope: 'items' },
  MOVE_ITEM_UP: { key: 'ArrowUp', alt: true, description: 'Mover ítem arriba', scope: 'items' },
  MOVE_ITEM_DOWN: { key: 'ArrowDown', alt: true, description: 'Mover ítem abajo', scope: 'items' },
  CANCEL: { key: 'Escape', description: 'Cancelar/Cerrar', scope: 'dialog' },
  CONFIRM: { key: 'Enter', description: 'Confirmar', scope: 'dialog' },
  SEARCH: { key: 'f', ctrl: true, description: 'Buscar', scope: 'global' },
  HELP: { key: 'h', alt: true, description: 'Mostrar ayuda', scope: 'global' },
};

export default useKeyboardShortcuts;