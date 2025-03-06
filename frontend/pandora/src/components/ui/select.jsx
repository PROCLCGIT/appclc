import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  // Para garantizar que el select se muestra correctamente, añadimos un manejador de clic
  const handleClick = React.useCallback((e) => {
    // Asegurarnos de que el portal container existe antes de procesar el clic
    if (!document.getElementById('select-portal-container')) {
      const portalContainer = document.createElement('div');
      portalContainer.id = 'select-portal-container';
      portalContainer.style.position = 'fixed';
      portalContainer.style.zIndex = '9999';
      portalContainer.style.top = '0';
      portalContainer.style.left = '0';
      portalContainer.style.width = '100%';
      document.body.appendChild(portalContainer);
    }
  }, []);

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white",
        "px-3 py-2 text-sm text-gray-900",
        "hover:border-gray-400",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "[&>span]:line-clamp-1",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => {
  // Crear un elemento div para el portal si no existe
  React.useEffect(() => {
    if (!document.getElementById('select-portal-container')) {
      const portalContainer = document.createElement('div');
      portalContainer.id = 'select-portal-container';
      portalContainer.style.position = 'fixed';
      portalContainer.style.zIndex = '9999';
      portalContainer.style.top = '0';
      portalContainer.style.left = '0';
      portalContainer.style.width = '100%';
      document.body.appendChild(portalContainer);
    }
  }, []);
  
  return (
    <SelectPrimitive.Portal container={document.getElementById('select-portal-container')}>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-[9999] max-h-96 min-w-[8rem] rounded-md border border-gray-200 bg-white text-gray-900 shadow-lg",
          className
        )}
        position={position}
        sideOffset={8}
        avoidCollisions={true}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport className="p-2">
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-2 text-sm",
      "outline-none",
      "hover:bg-blue-50 hover:text-blue-900",
      "focus:bg-blue-50 focus:text-blue-900",
      "data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900",
      "data-[state=checked]:bg-blue-100",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-blue-600" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};