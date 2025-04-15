import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

/**
 * Reusable data card component for displaying information with consistent styling
 * 
 * @param {string} title - Card title
 * @param {React.ReactNode} icon - Icon to display with title
 * @param {React.ReactNode} children - Card content
 * @param {Array} actions - Array of action objects { icon, label, onClick, variant, className }
 * @param {string} className - Additional CSS classes for the card
 * @param {string} headerClassName - Additional CSS classes for the header
 * @param {string} footerClassName - Additional CSS classes for the footer
 * @param {string} contentClassName - Additional CSS classes for the content
 * @param {string} link - Optional link for the entire card
 * @param {boolean} hoverable - Whether the card should have hover effects
 * @param {boolean} bordered - Whether the card should have a border
 */
const DataCard = ({
  title,
  icon,
  children,
  actions = [],
  className = "",
  headerClassName = "",
  footerClassName = "",
  contentClassName = "",
  link,
  hoverable = false,
  bordered = true,
}) => {
  // Card wrapper component based on whether it's a link
  const CardWrapper = ({ children }) => {
    if (link) {
      return (
        <a 
          href={link} 
          className="block no-underline text-inherit" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    }
    return <>{children}</>;
  };

  return (
    <CardWrapper>
      <Card 
        className={`
          ${hoverable ? 'hover:shadow-md transition-shadow' : ''}
          ${bordered ? 'border border-gray-200' : 'border-0 shadow-none'} 
          ${link ? 'cursor-pointer' : ''}
          overflow-hidden
          ${className}
        `}
      >
        {/* Card Header */}
        {title && (
          <div className={`p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 ${headerClassName}`}>
            <div className="flex items-center gap-2 font-medium text-gray-800">
              {icon && <span className="text-gray-600">{icon}</span>}
              <h3 className="text-base">{title}</h3>
              {link && <ExternalLink className="h-3.5 w-3.5 text-gray-400 ml-1" />}
            </div>
            
            {/* Header actions */}
            {actions.filter(a => a.position === 'header').length > 0 && (
              <div className="flex items-center gap-2">
                {actions
                  .filter(action => action.position === 'header')
                  .map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || "ghost"}
                      size={action.size || "sm"}
                      onClick={e => {
                        e.preventDefault(); // Prevent card link if it's a link card
                        action.onClick();
                      }}
                      className={action.className}
                    >
                      {action.icon && (
                        <span className={action.label ? "mr-2" : ""}>
                          {action.icon}
                        </span>
                      )}
                      {action.label && <span>{action.label}</span>}
                    </Button>
                  ))
                }
              </div>
            )}
          </div>
        )}
        
        {/* Card Content */}
        <div className={`p-4 ${contentClassName}`}>
          {children}
        </div>
        
        {/* Card Footer */}
        {actions.filter(a => !a.position || a.position === 'footer').length > 0 && (
          <div className={`border-t border-gray-100 p-3 bg-gray-50 flex justify-end items-center gap-2 ${footerClassName}`}>
            {actions
              .filter(action => !action.position || action.position === 'footer')
              .map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "ghost"}
                  size={action.size || "sm"}
                  onClick={e => {
                    e.preventDefault(); // Prevent card link if it's a link card
                    action.onClick();
                  }}
                  className={action.className}
                >
                  {action.icon && (
                    <span className={action.label ? "mr-2" : ""}>
                      {action.icon}
                    </span>
                  )}
                  {action.label && <span>{action.label}</span>}
                </Button>
              ))
            }
          </div>
        )}
      </Card>
    </CardWrapper>
  );
};

export default DataCard;