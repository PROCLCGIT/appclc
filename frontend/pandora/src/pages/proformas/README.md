# Proformas Module

Este módulo implementa un sistema completo para la gestión de proformas (cotizaciones) con una arquitectura modular basada en hooks personalizados de React.

## Arquitectura

El sistema sigue una arquitectura modular donde cada responsabilidad se encapsula en hooks y utilidades específicas:

```
proformas/
├── components/              # Componentes de UI
│   ├── ClientSearchDialog.jsx    # Diálogo para búsqueda de clientes
│   ├── ProformaTemplate.jsx      # Plantilla de proforma
│   ├── ProformaTabs.jsx          # Pestañas para múltiples proformas
│   └── ProformasDialog.jsx       # Diálogo para listar proformas guardadas
│
├── handlers/                # Manejadores de eventos y acciones
│   ├── clientHandlers.js         # Lógica para gestión de clientes
│   ├── itemsHandlers.js          # Lógica para gestión de ítems
│   └── proformaHandlers.js       # Lógica para acciones de proforma
│
├── hooks/                   # Custom hooks
│   ├── useClientSearch.js        # Búsqueda y selección de clientes
│   ├── useDialogControl.js       # Control de diálogos/modales
│   ├── useEnhancedProforma.js    # Gestión central de proformas
│   ├── useProductSearch.js       # Búsqueda y selección de productos
│   ├── useProformaActions.js     # Acciones de proforma (guardar, exportar, etc.)
│   ├── useProformaInitialization.js # Inicialización y carga inicial
│   ├── useProformaSync.js        # Sincronización de datos
│   ├── useProformaTemplate.js    # Configuración de plantilla y visualización
│   └── useTotalsCalculation.js   # Cálculo de totales
│
├── utils/                   # Utilidades
│   ├── calculationUtils.js       # Funciones para cálculos
│   └── proformaUtils.js          # Funciones de utilidad general
│
├── EnhancedProforma.jsx     # Componente principal
└── README.md                # Esta documentación
```

## Flujo de Datos

1. El componente `EnhancedProforma` se encarga de orquestar todos los hooks y componentes
2. Los datos de las proformas se gestionan en `useEnhancedProforma` 
3. Los estados específicos (cliente, items, cotización) se sincronizan mediante `useProformaSync`
4. La presentación visual se configura a través de `useProformaTemplate`
5. Las acciones como guardar, exportar, etc. se implementan en `useProformaActions`

## Custom Hooks

### useEnhancedProforma
Maneja el estado global de las proformas, incluyendo la creación, actualización y carga de proformas desde el backend.

### useClientSearch
Gestiona la búsqueda y carga de clientes.

### useProductSearch
Gestiona la búsqueda y carga de productos para agregar a la proforma.

### useDialogControl
Controla la visibilidad y estado de los diferentes diálogos y modales en la interfaz.

### useTotalsCalculation
Realiza cálculos de subtotales, impuestos y totales para la proforma.

### useProformaActions
Implementa las acciones principales que se pueden realizar sobre una proforma (guardar, exportar, imprimir, etc.)

### useProformaTemplate
Gestiona la configuración de la plantilla y opciones de visualización.

### useProformaSync
Sincroniza los datos entre el estado global de proformas y los estados locales del componente.

### useProformaInitialization
Maneja la inicialización y carga inicial de proformas según parámetros de URL.

## Handlers

### clientHandlers
Funciones para manejar operaciones relacionadas con clientes en la proforma.

### itemsHandlers
Funciones para manejar ítems dentro de la proforma (agregar, actualizar, eliminar).

### proformaHandlers
Funciones para manejar acciones sobre la proforma completa.

## Utilidades

### calculationUtils
Funciones para cálculos comunes como formato de moneda y cálculo de totales.

### proformaUtils
Funciones de utilidad general, como la creación de proformas vacías.

## Cómo Contribuir

1. Para agregar nuevas funcionalidades, considere crear un nuevo hook si representa un dominio diferente
2. Para extender funcionalidades existentes, modifique el hook correspondiente
3. Mantenga la separación de responsabilidades: UI en componentes, lógica de negocio en hooks y utilidades

## Flujo de Trabajo

1. La carga inicial verifica los parámetros URL para determinar si es una nueva proforma o cargar existentes
2. Las proformas se muestran en pestañas para permitir trabajar con múltiples cotizaciones a la vez
3. El modo de vista previa permite visualizar la proforma como la verá el cliente
4. Al guardar, la proforma se sincroniza con el backend y se asigna un ID persistente

## API Backend

- `/proformas/` - Endpoints para gestión de proformas
- `/proforma-items/` - Endpoints para gestión de ítems de proforma
- `/clientes/` - Endpoints para búsqueda y selección de clientes
- `/productos/` - Endpoints para búsqueda de productos disponibles y ofertados