// src/components/ProformaTabs.jsx

import React, { useCallback, useState, useEffect, memo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus } from "lucide-react";

// Componente de pestaña individual para reducir re-renders
const TabItem = memo(({ proforma, onClose, getTabLabel, isActive }) => {
  const handleCloseTab = (e) => {
    e.stopPropagation();
    onClose(proforma.id);
  };

  return (
    <TabsTrigger
      key={proforma.id}
      value={proforma.id.toString()}
      className="px-4 py-2 flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:font-medium rounded-md transition-all"
      data-active={isActive}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4 text-blue-600" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
        />
      </svg>
      <span className="truncate max-w-[100px]">
        {getTabLabel(proforma)}
      </span>
      <span
        onClick={handleCloseTab}
        className="ml-1 rounded-full hover:bg-gray-200 p-1 transition-colors cursor-pointer"
        role="button"
        aria-label="Cerrar pestaña"
      >
        <X className="h-3 w-3" />
      </span>
    </TabsTrigger>
  );
});

TabItem.displayName = 'TabItem';

// Botón "Nueva" memoizado para evitar re-renders
const NewTabButton = memo(({ onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md flex items-center gap-1 transition-colors"
  >
    <Plus className="h-4 w-4" />
    <span className="text-sm">Nueva</span>
  </button>
));

NewTabButton.displayName = 'NewTabButton';

// Componente principal memoizado
const ProformaTabs = ({
  proformas,
  activeProformaId,
  setActiveProformaId,
  closeProforma,
  addNewProforma,
  children
}) => {
  // Asegurar que activeProformaId es siempre un valor correcto
  const [lastActiveId, setLastActiveId] = useState(activeProformaId);
  const activeTabValue = activeProformaId ? 
    activeProformaId.toString() : 
    (proformas[0]?.id.toString() || "0");
  
  // Usamos un efecto para evitar cambios de estado constantes
  useEffect(() => {
    if (activeProformaId && activeProformaId !== lastActiveId) {
      setLastActiveId(activeProformaId);
    }
  }, [activeProformaId, lastActiveId]);
  
  // Función que controla el cambio de pestañas
  const handleTabChange = useCallback((newIdStr) => {
    const newId = parseInt(newIdStr);
    if (newId !== activeProformaId) {
      setActiveProformaId(newId);
    }
  }, [activeProformaId, setActiveProformaId]);

  // Memoizar la función de cierre de pestaña para mantener su identidad
  const handleCloseTab = useCallback((id) => {
    closeProforma(id);
  }, [closeProforma]);

  // Memoizar la función para obtener la etiqueta de la pestaña
  const getTabLabel = useCallback((proforma) => {
    return `Proforma ${proforma.quote.number.split("-").pop()}`;
  }, []);

  return (
    <Tabs
      value={activeTabValue}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="w-full h-auto flex flex-wrap bg-gray-50 p-1 rounded-lg mb-4 border">
        {proformas.map((proforma) => (
          <TabItem 
            key={proforma.id}
            proforma={proforma}
            onClose={handleCloseTab}
            getTabLabel={getTabLabel}
            isActive={proforma.id.toString() === activeTabValue}
          />
        ))}
        
        <NewTabButton onClick={addNewProforma} />
      </TabsList>

      {/* El children normalmente son los <TabsContent> que vendrán desde el padre */}
      {children}
    </Tabs>
  );
};

export default memo(ProformaTabs);