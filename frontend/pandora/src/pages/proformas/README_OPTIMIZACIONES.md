# Optimizaciones UI/UX en el Módulo de Proformas

## Implementación de Atajos de Teclado

Se han implementado atajos de teclado para mejorar la productividad y accesibilidad en el módulo de proformas, permitiendo a los usuarios realizar acciones comunes sin necesidad de utilizar el ratón.

### Nuevos Atajos Globales

| Atajo | Acción |
|-------|--------|
| `Ctrl + S` | Guardar proforma actual |
| `Ctrl + N` | Crear nueva proforma |
| `Ctrl + P` | Alternar entre modo edición y vista previa |
| `Alt + H` | Mostrar panel de ayuda con todos los atajos disponibles |

### Atajos para Gestión de Ítems

| Atajo | Acción |
|-------|--------|
| `↑` / `↓` | Seleccionar ítem anterior/siguiente |
| `Alt + ↑` | Mover ítem seleccionado hacia arriba |
| `Alt + ↓` | Mover ítem seleccionado hacia abajo |
| `Alt + A` | Agregar nuevo ítem |
| `Delete` | Eliminar ítem seleccionado (con confirmación) |

## Componentes Nuevos Implementados

1. **KeyboardShortcutsHelp**: Panel lateral que muestra todos los atajos de teclado disponibles en la aplicación, organizados por contexto (global, ítems, diálogos).

2. **Utilidades de atajos de teclado**:
   - `useKeyboardShortcuts`: Hook personalizado para gestionar atajos de teclado de manera modular.
   - `formatShortcut`: Función para formatear atajos de teclado en la UI.
   - `COMMON_SHORTCUTS`: Constantes predefinidas para los atajos más comunes.

## Mejora de Accesibilidad

1. **Selección de ítems con teclado**:
   - Los ítems ahora se pueden seleccionar con las teclas de flecha (`↑`/`↓`)
   - Se proporciona feedback visual del ítem seleccionado
   - Los ítems seleccionados tienen atributos ARIA apropiados

2. **Gestión mejorada de ítem seleccionado**:
   - Se mantiene el estado de selección actual
   - Los atajos de teclado operan sobre el ítem seleccionado
   - Se proporciona feedback visual claro del ítem actualmente seleccionado

3. **Panel de ayuda**:
   - Accesible mediante atajo de teclado (`Alt + H`)
   - Teclas de atajo bien documentadas y visibles
   - Instrucciones claras para cada acción

## Integración con Drag-and-Drop

- Los atajos de teclado para mover ítems (`Alt + ↑` / `Alt + ↓`) complementan la funcionalidad existente de drag-and-drop
- Se preserva el ítem seleccionado al reordenar mediante atajos
- Se pueden realizar todas las operaciones de reordenamiento sin usar el ratón

## Feedback Visual y Notificaciones

- Se proporcionan notificaciones tipo toast al ejecutar atajos de teclado
- El ítem seleccionado tiene un destacado visual (borde izquierdo azul y fondo ligeramente coloreado)
- Los atajos disponibles se muestran en múltiples lugares (panel lateral completo y resumen en la interfaz)

## Próximos Pasos y Posibles Mejoras

1. Expandir atajos de teclado a otras áreas (búsqueda de productos, clientes, etc.)
2. Implementar atajos configurables por el usuario
3. Añadir más feedback auditivo para usuarios con discapacidad visual
4. Implementar navegación completa por teclado en toda la aplicación

---

Estas mejoras forman parte de la iniciativa para hacer la aplicación más accesible y eficiente, siguiendo los estándares WCAG 2.1 AA.