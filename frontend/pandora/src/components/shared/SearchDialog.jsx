import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import LoadingSpinner from "./LoadingSpinner";
import SearchBar from "./SearchBar";
import EmptyState from "./EmptyState";

/**
 * Reusable search dialog component for searching and selecting items
 * 
 * @param {boolean} open - Whether the dialog is open
 * @param {function} onOpenChange - Function called when open state changes
 * @param {string} title - Dialog title
 * @param {React.ReactNode} icon - Icon to display with title
 * @param {string} searchPlaceholder - Placeholder text for the search input
 * @param {Array} items - Items to search and display
 * @param {function} onSelect - Function called when an item is selected
 * @param {function} renderItem - Function to render each item
 * @param {function} filterItems - Function to filter items based on search term
 * @param {function} onCreate - Optional function to create a new item
 * @param {string} createLabel - Label for the create button
 * @param {boolean} loading - Whether items are loading
 * @param {string} loadingText - Text to display while loading
 * @param {string} emptyTitle - Title for empty state
 * @param {string} emptyDescription - Description for empty state
 * @param {React.ReactNode} emptyIcon - Icon for empty state
 * @param {string} noResultsTitle - Title for no results state
 * @param {string} noResultsDescription - Description for no results state
 * @param {string} maxWidth - Maximum width of the dialog
 * @param {string} maxHeight - Maximum height of the dialog
 */
const SearchDialog = ({
  open,
  onOpenChange,
  title,
  icon,
  searchPlaceholder = "Buscar...",
  items = [],
  onSelect,
  renderItem,
  filterItems,
  onCreate,
  createLabel = "Crear nuevo",
  loading = false,
  loadingText = "Cargando...",
  emptyTitle = "No hay elementos",
  emptyDescription = "No hay elementos disponibles.",
  emptyIcon,
  noResultsTitle = "No se encontraron resultados",
  noResultsDescription = "Intenta con otra búsqueda o crea un nuevo elemento.",
  maxWidth = "max-w-2xl",
  maxHeight = "max-h-[90vh]",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);

  // Filter items when search term changes
  useEffect(() => {
    if (filterItems) {
      // Use provided filter function
      setFilteredItems(filterItems(items, searchTerm));
    } else {
      // Default filter: case-insensitive substring match on any string property
      const filtered = items.filter(item => {
        if (!searchTerm.trim()) return true;
        
        const searchLower = searchTerm.toLowerCase();
        
        // Check if any string property contains the search term
        return Object.values(item).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(searchLower)
        );
      });
      
      setFilteredItems(filtered);
    }
  }, [searchTerm, items, filterItems]);

  // Reset search when dialog opens
  useEffect(() => {
    if (open) {
      setSearchTerm("");
    }
  }, [open]);

  // Handle close
  const handleClose = () => {
    onOpenChange(false);
  };

  // Handle selection
  const handleSelect = (item) => {
    onSelect(item);
    handleClose();
  };

  // Handle create
  const handleCreate = () => {
    if (onCreate) {
      onCreate();
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${maxWidth} ${maxHeight} flex flex-col`}>
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-blue-100 -m-6 mb-2 py-3 px-6 rounded-t-lg border-b border-blue-200">
          <DialogTitle className="text-xl font-bold flex items-center text-black">
            {icon && <span className="mr-2 text-blue-600">{icon}</span>}
            {title}
            {!loading && items.length > 0 && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {items.length} disponibles
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 flex-grow flex flex-col">
          <div className="mb-4 flex gap-2">
            <div className="flex-grow">
              <SearchBar
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                disabled={loading || items.length === 0}
                autoFocus
              />
            </div>
            {onCreate && (
              <Button 
                onClick={handleCreate}
                className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap shadow-sm"
              >
                {createLabel}
              </Button>
            )}
          </div>

          <div className="flex-grow overflow-auto">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <LoadingSpinner 
                  size="lg" 
                  text={loadingText} 
                  color="primary" 
                />
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                icon={emptyIcon}
                title={emptyTitle}
                description={emptyDescription}
                action={onCreate ? {
                  label: createLabel,
                  onClick: handleCreate,
                  variant: "default"
                } : undefined}
              />
            ) : filteredItems.length === 0 ? (
              <EmptyState
                icon={emptyIcon}
                title={noResultsTitle}
                description={`No se encontraron resultados para "${searchTerm}". ${noResultsDescription}`}
                action={{
                  label: "Limpiar búsqueda",
                  onClick: () => setSearchTerm(""),
                  variant: "outline"
                }}
                secondaryAction={onCreate ? {
                  label: createLabel,
                  onClick: handleCreate,
                  variant: "default"
                } : undefined}
              />
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-1">
                  {filteredItems.map((item, index) => (
                    <div 
                      key={item.id || index} 
                      onClick={() => handleSelect(item)}
                    >
                      {renderItem ? renderItem(item, index) : (
                        <div className="p-3 hover:bg-blue-50 cursor-pointer rounded">
                          {item.name || item.nombre || item.title || JSON.stringify(item)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center sm:justify-end gap-2">
          <div className="text-xs text-gray-500 sm:hidden">
            Clic para seleccionar un elemento
          </div>
          <Button variant="outline" onClick={handleClose} className="ml-auto">
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;