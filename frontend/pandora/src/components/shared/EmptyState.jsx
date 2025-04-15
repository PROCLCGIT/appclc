import React from "react";
import { Button } from "@/components/ui/button";

/**
 * Reusable empty state component for displaying when no content is available
 * 
 * @param {React.ReactNode} icon - Icon to display
 * @param {string} title - Main title text
 * @param {string} description - Description text
 * @param {Object} action - Action button configuration { label, onClick, variant }
 * @param {Object} secondaryAction - Secondary action button configuration { label, onClick, variant }
 * @param {string} className - Additional CSS classes
 * @param {string} iconContainerClassName - Additional CSS classes for the icon container
 */
const EmptyState = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
  iconContainerClassName = "bg-blue-50 p-6 rounded-full",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-10 ${className}`}>
      {icon && (
        <div className={iconContainerClassName}>
          {icon}
        </div>
      )}
      
      {title && (
        <h3 className="mt-4 text-xl font-semibold text-gray-800">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="mt-2 text-gray-500 max-w-md">
          {description}
        </p>
      )}
      
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
              className={action.className}
            >
              {action.icon && (
                <span className="mr-2">{action.icon}</span>
              )}
              {action.label}
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant || "outline"}
              className={secondaryAction.className}
            >
              {secondaryAction.icon && (
                <span className="mr-2">{secondaryAction.icon}</span>
              )}
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;