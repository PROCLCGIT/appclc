// src/components/ProformaTabs.jsx

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

export default function ProformaTabs({
  proformas,
  activeProformaId,
  setActiveProformaId,
  closeProforma,
  addNewProforma,
  children
}) {
  // Asegurar que activeProformaId es siempre un valor correcto
  const [lastActiveId, setLastActiveId] = React.useState(activeProformaId);
  const activeTabValue = activeProformaId ? activeProformaId.toString() : proformas[0]?.id.toString() || "0";
  
  // Usamos un efecto para evitar cambios de estado constantes
  // Solo registramos cambios significativos
  React.useEffect(() => {
    if (activeProformaId && activeProformaId !== lastActiveId) {
      console.log("ProformaTabs - actualizado activeProformaId:", activeProformaId);
      setLastActiveId(activeProformaId);
    }
  }, [activeProformaId, lastActiveId]);
  
  // Función que controla el cambio de pestañas
  const handleTabChange = React.useCallback((newIdStr) => {
    const newId = parseInt(newIdStr);
    if (newId !== activeProformaId) {
      console.log("Cambiando a pestaña:", newId);
      setActiveProformaId(newId);
    }
  }, [activeProformaId, setActiveProformaId]);

  const handleCloseTab = (e, id) => {
    e.stopPropagation();
    closeProforma(id);
  };

  const getTabLabel = (proforma) => {
    return `Proforma ${proforma.quote.number.split("-").pop()}`;
  };

  return (
    <Tabs
      value={activeTabValue}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="w-full h-auto flex flex-wrap bg-gray-50 p-1 rounded-lg mb-4 border">
        {proformas.map((proforma) => (
          <TabsTrigger
            key={proforma.id}
            value={proforma.id.toString()}
            className="px-4 py-2 flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:font-medium rounded-md transition-all"
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
            <button
              onClick={(e) => handleCloseTab(e, proforma.id)}
              className="ml-1 rounded-full hover:bg-gray-200 p-1 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </TabsTrigger>
        ))}
        
        <button
          onClick={addNewProforma}
          className="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md flex items-center gap-1 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">Nueva</span>
        </button>
      </TabsList>

      {/* El children normalmente son los <TabsContent> que vendrán desde el padre */}
      {children}
    </Tabs>
  );
}
