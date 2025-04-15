import React from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, FileText, X, AlertTriangle, File } from "lucide-react";

/**
 * Reusable status badge component with consistent styling for different statuses
 * 
 * @param {string} status - The status value: 'approved', 'pending', 'draft', 'rejected', etc.
 * @param {Object} customStatuses - Optional custom status configurations
 * @param {string} className - Additional CSS classes
 * @param {boolean} showIcon - Whether to show an icon
 * @param {string} size - Size variant: 'sm', 'md', 'lg'
 * @param {string} variant - Badge variant: 'filled', 'outline', 'subtle'
 */
const StatusBadge = ({
  status,
  customStatuses,
  className = "",
  showIcon = true,
  size = "md",
  variant = "subtle",
}) => {
  // Default status configurations
  const defaultStatuses = {
    aprobada: {
      label: "Aprobada",
      icon: <Check />,
      colors: {
        filled: "bg-green-600 text-white",
        outline: "border-green-200 text-green-700",
        subtle: "bg-green-50 text-green-700 border-green-100"
      }
    },
    enviada: {
      label: "Enviada",
      icon: <Clock />,
      colors: {
        filled: "bg-blue-600 text-white",
        outline: "border-blue-200 text-blue-700",
        subtle: "bg-blue-50 text-blue-700 border-blue-100"
      }
    },
    borrador: {
      label: "Borrador",
      icon: <FileText />,
      colors: {
        filled: "bg-gray-600 text-white",
        outline: "border-gray-200 text-gray-700",
        subtle: "bg-gray-50 text-gray-700 border-gray-100"
      }
    },
    rechazada: {
      label: "Rechazada",
      icon: <X />,
      colors: {
        filled: "bg-red-600 text-white",
        outline: "border-red-200 text-red-700",
        subtle: "bg-red-50 text-red-700 border-red-100"
      }
    },
    vencida: {
      label: "Vencida",
      icon: <AlertTriangle />,
      colors: {
        filled: "bg-amber-600 text-white",
        outline: "border-amber-200 text-amber-700",
        subtle: "bg-amber-50 text-amber-700 border-amber-100"
      }
    },
    // Add default fallback
    default: {
      label: "Estado",
      icon: <File />,
      colors: {
        filled: "bg-gray-600 text-white",
        outline: "border-gray-200 text-gray-700",
        subtle: "bg-gray-50 text-gray-700 border-gray-100"
      }
    }
  };

  // Merge custom statuses with default ones
  const allStatuses = { ...defaultStatuses, ...(customStatuses || {}) };
  
  // Get the status configuration or use default
  const statusKey = status?.toLowerCase() || "default";
  const statusConfig = allStatuses[statusKey] || allStatuses.default;
  
  // Determine the label (capitalize first letter)
  const label = statusConfig.label || status;
  
  // Get the appropriate icon
  const icon = showIcon ? (statusConfig.icon || defaultStatuses.default.icon) : null;
  
  // Size variants
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base",
  };
  
  // Get styling based on variant
  const variantColor = statusConfig.colors[variant] || statusConfig.colors.subtle;
  
  // Combine all classes
  const badgeClass = `font-medium rounded-full ${sizeClasses[size] || sizeClasses.md} ${variantColor} ${className}`;
  
  // Icon size based on badge size
  const iconSizeClass = {
    sm: "h-3 w-3 mr-1",
    md: "h-3.5 w-3.5 mr-1.5",
    lg: "h-4 w-4 mr-2",
  };

  return (
    <Badge variant="outline" className={badgeClass}>
      {icon && React.cloneElement(icon, { className: iconSizeClass[size] || iconSizeClass.md })}
      <span className="capitalize">{label}</span>
    </Badge>
  );
};

export default StatusBadge;