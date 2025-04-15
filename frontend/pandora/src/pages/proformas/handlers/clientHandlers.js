// src/pages/proformas/handlers/clientHandlers.js

import { toast } from "sonner";

/**
 * Conjunto de funciones para manejar clientes en la proforma
 */
export const useClientHandlers = ({
  activeProformaId,
  updateProforma,
  setClient
}) => {
  // Función mejorada para seleccionar un cliente
  const handleSelectClient = (selectedClient) => {
    console.log("Cliente seleccionado:", selectedClient);
    
    // Verificamos que el cliente tenga datos válidos
    if (!selectedClient || !selectedClient.id) {
      console.error("Cliente inválido seleccionado:", selectedClient);
      toast.error("Error al seleccionar cliente - datos inválidos");
      return;
    }
    
    try {
      const clientData = {
        id: selectedClient.id,
        name: selectedClient.nombre || "Cliente sin nombre",
        attention: selectedClient.persona_contacto || "",
        email: selectedClient.email || "",
        phone: selectedClient.telefono || "",
        address: selectedClient.direccion || "",
        ruc: selectedClient.ruc || ""
      };
      
      console.log("Datos de cliente formateados:", clientData);
      
      // Primero actualizar el estado local
      setClient(clientData);
      
      // Luego actualizar directamente en la proforma activa para asegurar que se refleje inmediatamente
      if (activeProformaId) {
        console.log("Actualizando cliente directamente en proforma activa:", activeProformaId);
        updateProforma(activeProformaId, { client: clientData });
      }
      
      toast.success(`Cliente '${clientData.name}' seleccionado`);
      return true;
    } catch (error) {
      console.error("Error al procesar datos del cliente:", error);
      toast.error("Error al seleccionar cliente");
      return false;
    }
  };

  return {
    handleSelectClient
  };
};
