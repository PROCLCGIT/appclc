import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Reusable action bar component for displaying action buttons
 * 
 * @param {Array} actions - Array of action objects { icon, label, onClick, variant, disabled, tooltip, className, permission }
 * @param {string} className - Additional CSS classes for the container
 * @param {string} align - Alignment of buttons: 'start', 'center', 'end', 'between', 'around'
 * @param {boolean} withDivider - Whether to show dividers between buttons
 * @param {string} size - Button size: 'sm', 'md', 'lg', or 'icon'
 * @param {Object} permissions - Optional permissions object to check if user can perform actions
 */
const ActionBar = ({
  actions = [],
  className = "",
  align = "end",
  withDivider = false,
  size = "md",
  permissions = {},
}) => {
  // Alignment classes
  const alignmentClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  };

  // Button sizes
  const buttonSizes = {
    sm: "size-sm",
    md: "", // default size
    lg: "size-lg",
    icon: "size-icon p-2",
  };

  // Filter actions based on permissions
  const visibleActions = actions.filter(action => {
    // If action has a permission key, check if user has permission
    if (action.permission && permissions) {
      return permissions[action.permission] === true;
    }
    // Otherwise, show the action
    return true;
  });

  return (
    <div className={`flex items-center gap-2 ${alignmentClasses[align] || "justify-end"} ${className}`}>
      {visibleActions.map((action, index) => {
        // Create button
        const button = (
          <Button
            key={index}
            variant={action.variant || "default"}
            size={action.size || size}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`${withDivider && index > 0 ? 'border-l' : ''} ${action.className || ""}`}
            aria-label={action.label}
          >
            {action.icon && (
              <span className={action.label ? "mr-2" : ""}>
                {action.icon}
              </span>
            )}
            {action.label && <span>{action.label}</span>}
          </Button>
        );

        // Wrap in tooltip if tooltip is provided
        if (action.tooltip) {
          return (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {button}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{action.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return button;
      })}
    </div>
  );
};

export default ActionBar;