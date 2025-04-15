import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

/**
 * Reusable search bar component with clear button and customizable styling
 * 
 * @param {string} value - Current search term value
 * @param {function} onChange - Function called when search term changes
 * @param {string} placeholder - Placeholder text for the search input
 * @param {function} onClear - Function called when clear button is clicked
 * @param {boolean} disabled - Whether the search bar is disabled
 * @param {string} className - Additional CSS classes for the container
 * @param {string} inputClassName - Additional CSS classes for the input
 * @param {string} size - Size variant: 'sm', 'md', 'lg'
 * @param {boolean} autoFocus - Whether to autofocus the input
 * @param {string} ariaLabel - Accessibility label for the input
 */
const SearchBar = ({
  value,
  onChange,
  placeholder = "Buscar...",
  onClear,
  disabled = false,
  className = "",
  inputClassName = "",
  size = "md",
  autoFocus = false,
  ariaLabel = "Buscar",
}) => {
  // Size variants
  const sizeClasses = {
    sm: {
      container: "h-8",
      icon: "h-3.5 w-3.5",
      iconLeft: "left-2.5",
      input: "pl-7 pr-7 text-sm",
      clearButton: "right-1 h-6 w-6",
    },
    md: {
      container: "h-10",
      icon: "h-4 w-4",
      iconLeft: "left-3",
      input: "pl-9 pr-9",
      clearButton: "right-1.5 h-7 w-7",
    },
    lg: {
      container: "h-12",
      icon: "h-5 w-5",
      iconLeft: "left-3.5",
      input: "pl-10 pr-10 text-lg",
      clearButton: "right-2 h-8 w-8",
    },
  };

  const styles = sizeClasses[size] || sizeClasses.md;

  // Handle clear button click
  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClear) {
      onClear();
    } else {
      onChange({ target: { value: "" } });
    }
  };

  return (
    <div className={`relative w-full ${styles.container} ${className}`}>
      <Search 
        className={`absolute ${styles.iconLeft} top-1/2 transform -translate-y-1/2 ${styles.icon} text-gray-400 pointer-events-none`} 
        aria-hidden="true"
      />
      
      <Input
        type="text"
        placeholder={placeholder}
        className={`${styles.input} w-full h-full focus-visible:ring-blue-500 ${inputClassName}`}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
      />
      
      {value && (
        <Button 
          type="button"
          variant="ghost"
          size="sm"
          className={`absolute ${styles.clearButton} top-1/2 transform -translate-y-1/2 p-0 rounded-full`}
          onClick={handleClear}
          disabled={disabled}
          aria-label="Limpiar búsqueda"
        >
          <X className={`${styles.icon} text-gray-400`} />
          <span className="sr-only">Limpiar búsqueda</span>
        </Button>
      )}
    </div>
  );
};

export default SearchBar;