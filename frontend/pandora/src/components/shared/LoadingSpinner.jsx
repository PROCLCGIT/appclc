import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Reusable loading spinner component with various sizes and customization options
 * 
 * @param {string} size - Size variant: 'sm', 'md', 'lg', or 'xl'
 * @param {string} text - Optional text to display below the spinner
 * @param {string} className - Additional CSS classes
 * @param {string} color - Color variant: 'primary', 'secondary', 'success', 'warning', 'error', or a custom color
 * @param {string} containerClassName - Additional CSS classes for the container
 */
const LoadingSpinner = ({
  size = "md",
  text,
  className = "",
  color = "primary",
  containerClassName = "",
}) => {
  // Size variants
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
    xl: "h-16 w-16",
  };

  // Color variants
  const colorClasses = {
    primary: "text-blue-600",
    secondary: "text-gray-600",
    success: "text-green-600",
    warning: "text-amber-600",
    error: "text-red-600",
  };

  // Get size class or default to medium
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  // Get color class or use provided value as a custom color
  const colorClass = colorClasses[color] || color;

  return (
    <div className={`flex flex-col items-center justify-center ${containerClassName}`}>
      <Loader2 className={`animate-spin ${sizeClass} ${colorClass} ${className}`} />
      {text && (
        <p className={`mt-2 text-sm font-medium ${colorClasses[color] || "text-gray-600"}`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;