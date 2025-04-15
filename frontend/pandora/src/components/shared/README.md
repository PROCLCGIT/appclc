# Shared UI Components

This directory contains reusable UI components designed to provide consistent behavior and styling across the application. These components build upon the base UI components from shadcn-ui while adding higher-level functionality.

## Available Components

### ActionBar

A flexible component for displaying action buttons with consistent spacing and alignment.

```jsx
import { ActionBar } from "@/components/shared";
import { Edit, Trash, Download } from "lucide-react";

const MyComponent = () => (
  <ActionBar
    actions={[
      {
        icon: <Edit className="h-4 w-4" />,
        label: "Editar",
        onClick: () => handleEdit(),
        tooltip: "Editar elemento"
      },
      {
        icon: <Download className="h-4 w-4" />,
        label: "Descargar",
        onClick: () => handleDownload(),
        variant: "outline"
      },
      {
        icon: <Trash className="h-4 w-4" />,
        label: "Eliminar",
        onClick: () => handleDelete(),
        variant: "destructive",
        disabled: !canDelete
      }
    ]}
    align="end"
    withDivider={false}
  />
);
```

### ConfirmationDialog

A standardized dialog for confirming actions with various presets for different scenarios.

```jsx
import { useState } from "react";
import { ConfirmationDialog } from "@/components/shared";
import { Button } from "@/components/ui/button";

const MyComponent = () => {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>Eliminar</Button>
      
      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Confirmar eliminación"
        description="¿Está seguro que desea eliminar este elemento? Esta acción no se puede deshacer."
        onConfirm={() => handleDelete()}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </>
  );
};
```

### DataCard

A consistent card component for displaying data with optional actions and styling.

```jsx
import { DataCard } from "@/components/shared";
import { User, Edit, FileText } from "lucide-react";

const MyComponent = () => (
  <DataCard
    title="Información del Cliente"
    icon={<User className="h-5 w-5" />}
    hoverable
    actions={[
      {
        icon: <Edit className="h-4 w-4" />,
        onClick: () => handleEdit(),
        position: "header"
      },
      {
        icon: <FileText className="h-4 w-4" />,
        label: "Ver detalles",
        onClick: () => handleViewDetails(),
        position: "footer"
      }
    ]}
  >
    <div className="space-y-2">
      <p><strong>Nombre:</strong> Cliente ABC</p>
      <p><strong>RUC:</strong> 1234567890</p>
      <p><strong>Teléfono:</strong> (555) 123-4567</p>
    </div>
  </DataCard>
);
```

### EmptyState

A standardized component for displaying empty states with optional actions.

```jsx
import { EmptyState } from "@/components/shared";
import { FileText, Plus } from "lucide-react";

const MyComponent = () => (
  <EmptyState
    icon={<FileText className="h-10 w-10 text-gray-400" />}
    title="No hay documentos"
    description="No tiene documentos guardados. Cree un nuevo documento para comenzar."
    action={{
      label: "Crear documento",
      onClick: () => handleCreate(),
      icon: <Plus className="h-4 w-4" />
    }}
    secondaryAction={{
      label: "Ver ejemplos",
      onClick: () => handleViewExamples(),
      variant: "outline"
    }}
  />
);
```

### LoadingSpinner

A flexible loading spinner component with various sizes and text options.

```jsx
import { LoadingSpinner } from "@/components/shared";

const MyComponent = () => (
  <div className="h-64 flex items-center justify-center">
    <LoadingSpinner 
      size="lg" 
      text="Cargando datos..." 
      color="primary" 
    />
  </div>
);
```

### SearchBar

A reusable search input with clear button and consistent styling.

```jsx
import { useState } from "react";
import { SearchBar } from "@/components/shared";

const MyComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  return (
    <SearchBar
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Buscar productos..."
      size="md"
      autoFocus
    />
  );
};
```

### SearchDialog

A comprehensive search dialog component for finding and selecting items.

```jsx
import { useState } from "react";
import { SearchDialog } from "@/components/shared";
import { User, Plus } from "lucide-react";

const MyComponent = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" }
  ]);
  
  return (
    <SearchDialog
      open={open}
      onOpenChange={setOpen}
      title="Buscar Elementos"
      icon={<User className="h-5 w-5" />}
      searchPlaceholder="Buscar por nombre..."
      items={items}
      onSelect={(item) => handleSelect(item)}
      renderItem={(item) => (
        <div className="p-3 hover:bg-blue-50 cursor-pointer rounded">
          {item.name}
        </div>
      )}
      filterItems={(items, term) => items.filter(i => 
        i.name.toLowerCase().includes(term.toLowerCase())
      )}
      onCreate={() => handleCreate()}
      createLabel={
        <>
          <Plus className="h-4 w-4 mr-1" />
          Crear nuevo
        </>
      }
    />
  );
};
```

### StatusBadge

A standardized badge component for displaying status with consistent styling.

```jsx
import { StatusBadge } from "@/components/shared";

const MyComponent = () => (
  <div className="space-y-2">
    <StatusBadge status="aprobada" showIcon />
    <StatusBadge status="enviada" variant="outline" />
    <StatusBadge status="borrador" size="lg" />
    <StatusBadge status="rechazada" variant="filled" />
    <StatusBadge 
      status="custom" 
      customStatuses={{
        custom: {
          label: "Personalizado",
          icon: <CustomIcon />,
          colors: {
            filled: "bg-purple-600 text-white",
            outline: "border-purple-200 text-purple-700",
            subtle: "bg-purple-50 text-purple-700 border-purple-100"
          }
        }
      }}
    />
  </div>
);
```

## Best Practices

1. **Import from index**: Import components from the shared index for cleaner code:
   ```jsx
   import { SearchBar, LoadingSpinner, EmptyState } from "@/components/shared";
   ```

2. **Consistent spacing**: Use consistent spacing and alignment across components.

3. **Accessibility**: Use aria attributes and keyboard navigation where appropriate.

4. **Mobile responsiveness**: All components are designed to be responsive.

5. **Color consistency**: Use the color tokens from Tailwind CSS for consistency.

6. **Icon sizing**: Use consistent icon sizes (h-4 w-4 for small, h-5 w-5 for medium, h-6 w-6 for large).

7. **Error handling**: Add appropriate error handling for components that depend on data.