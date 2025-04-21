// src/pages/proformas/handlers/proformaHandlers.js

import React, { useCallback } from "react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { proformasService, proformaItemsService } from "@/services/api";

/**
 * Conjunto de funciones para manejar las acciones de proformas
 */
export const useProformaHandlers = ({
  proformas,
  activeProformaId,
  updateProforma,
  addNewProforma,
  closeProforma,
  loadProforma,
  formatCurrency
}) => {
  // Función para enviar/generar la proforma
  const generateProforma = async (currentProforma) => {
    if (!currentProforma.savedId) {
      toast.error("Debe guardar la proforma antes de enviarla");
      const shouldSave = window.confirm("¿Desea guardar la proforma ahora?");
      if (shouldSave) {
        await saveProforma(currentProforma);
        if (!currentProforma.savedId) return; // Si no se guardó, salir
      } else {
        return;
      }
    }
    
    try {
      // Enviar la proforma al cliente (cambio de estado "borrador" a "enviada")
      const response = await proformasService.enviar(currentProforma.savedId);
      
      toast.success(`Proforma #${currentProforma.quote.number} enviada al cliente`);
      
      // Aquí podríamos implementar una redirección a la vista de detalle
      // o bien cerrar esta proforma y abrir una nueva
      
      // Cerramos esta proforma ya que se ha enviado
      closeProforma(currentProforma.id);
      
      // Si no quedaron proformas abiertas, crear una nueva
      if (proformas.length === 0) {
        addNewProforma();
      }
      
    } catch (error) {
      console.error("Error al enviar la proforma:", error);
      toast.error("No se pudo enviar la proforma. Verifica los datos e inténtalo de nuevo.");
    }
  };
  
  // Función para configurar la proforma
  const configureProforma = () => {
    // Por ahora solo mostrar un mensaje
    toast.info("La configuración de proformas estará disponible próximamente");
    
    // En el futuro, abrir un diálogo de configuración
  };
  
  // Función para guardar la proforma en el backend
  const saveProforma = async (currentProforma) => {
    if (!currentProforma) {
      toast.error("No hay una proforma activa para guardar", {
        description: "Ocurrió un error al identificar la proforma que desea guardar"
      });
      return;
    }
    
    const currentClient = currentProforma.client || {};
    const currentItems = Array.isArray(currentProforma.items) ? currentProforma.items : [];
    const currentQuote = currentProforma.quote || {};
    
    // Lista para almacenar todos los errores de validación
    const validationErrors = [];
    
    // Validación del cliente
    if (!currentClient.name) {
      validationErrors.push("Falta seleccionar un cliente");
    }
    
    if (!currentClient.id) {
      validationErrors.push("El cliente seleccionado no tiene un ID válido");
    }
    
    // Validación de ítems
    if (currentItems.length === 0) {
      validationErrors.push("Debe agregar al menos un ítem a la proforma");
    } else {
      // Verificar datos de los ítems
      const itemsWithIssues = currentItems.filter(item => 
        !item.description || 
        !item.quantity || 
        !item.unitPrice || 
        parseFloat(item.quantity) <= 0 || 
        parseFloat(item.unitPrice) <= 0
      );
      
      if (itemsWithIssues.length > 0) {
        validationErrors.push(`Hay ${itemsWithIssues.length} ítem(s) con datos incompletos o inválidos`);
      }
    }
    
    // Validación de datos de la proforma
    if (!currentQuote.number) {
      validationErrors.push("Falta el número de proforma");
    }
    
    if (!currentQuote.paymentTerms) {
      validationErrors.push("Falta definir las condiciones de pago");
    }
    
    if (!currentQuote.deliveryTime) {
      validationErrors.push("Falta definir el tiempo de entrega");
    }
    
    // Si hay errores de validación, informar al usuario y detener el proceso
    if (validationErrors.length > 0) {
      const errorList = validationErrors.map(err => `• ${err}`).join('\n');
      toast.error("No se puede guardar la proforma", {
        description: errorList
      });
      return null;
    }
    
    // Mostrar indicador de carga
    const loadingToast = toast.loading("Guardando proforma...", {
      description: "Por favor espere mientras se procesan los datos"
    });
    
    try {
      // Preparar los datos de la proforma asegurando que los valores sean del tipo adecuado
      const proformaData = {
        numero: currentQuote.number,
        nombre: currentQuote.name || "",
        fecha_emision: typeof currentQuote.date === 'object' && currentQuote.date instanceof Date 
          ? currentQuote.date.toISOString().split('T')[0] 
          : new Date(currentQuote.date).toISOString().split('T')[0],
        fecha_vencimiento: typeof currentQuote.expiryDate === 'object' && currentQuote.expiryDate instanceof Date 
          ? currentQuote.expiryDate.toISOString().split('T')[0] 
          : new Date(currentQuote.expiryDate).toISOString().split('T')[0],
        cliente: currentClient.id,
        empresa: 1, // ID de la empresa, podría ser dinámica
        atencion_a: currentClient.attention || "",
        condiciones_pago: currentQuote.paymentTerms || "",
        tiempo_entrega: currentQuote.deliveryTime || "",
        subtotal: typeof currentQuote.subtotal === 'number' ? currentQuote.subtotal : parseFloat(currentQuote.subtotal) || 0,
        porcentaje_impuesto: typeof currentQuote.taxRate === 'number' ? currentQuote.taxRate : parseFloat(currentQuote.taxRate) || 0,
        impuesto: typeof currentQuote.tax === 'number' ? currentQuote.tax : parseFloat(currentQuote.tax) || 0,
        total: typeof currentQuote.total === 'number' ? currentQuote.total : parseFloat(currentQuote.total) || 0,
        notas: currentQuote.notes || "",
        estado: 'borrador'
      };
      
      // Guardar la proforma
      let proformaId;
      let isNewProforma = !currentProforma.savedId;
      
      try {
        // Comprobar si es una nueva proforma o una actualización
        if (currentProforma.savedId) {
          // Es una actualización
          const response = await proformasService.update(currentProforma.savedId, proformaData);
          proformaId = response.id;
        } else {
          // Es una nueva proforma
          const response = await proformasService.create(proformaData);
          proformaId = response.id;
          
          // Actualizar el ID guardado en la proforma activa
          updateProforma(currentProforma.id, { savedId: proformaId });
        }
      } catch (error) {
        console.error("Error al guardar la proforma:", error);
        toast.dismiss(loadingToast);
        
        // Proporcionar mensaje de error más específico si está disponible
        if (error.message) {
          toast.error(`Error: ${error.message}`);
        } else {
          toast.error("Error al guardar la proforma. Revise los datos e intente nuevamente.");
        }
        return null;
      }
      
      // Guardar los ítems de la proforma
      const itemErrors = [];
      
      for (const item of currentItems) {
        try {
          // Asegurarse de que todos los campos numéricos sean números válidos
          const itemData = {
            proforma: proformaId,
            tipo_item: 'personalizado', // Por defecto es personalizado
            codigo: item.code || "",
            descripcion: item.description || "",
            unidad: item.unit || "Unidad",
            cantidad: typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity) || 0,
            precio_unitario: typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(item.unitPrice) || 0,
            porcentaje_descuento: typeof item.discount === 'number' ? item.discount : parseFloat(item.discount) || 0,
            total: typeof item.total === 'number' ? item.total : parseFloat(item.total) || 0,
            orden: currentItems.indexOf(item)
          };
          
          // Determinar el tipo de producto según la fuente
          if (item.source) {
            const productId = item.productId || (item.original && item.original.id);
            
            if (productId) {
              if (item.source === 'ofertados') {
                itemData.tipo_item = 'producto_ofertado';
                itemData.producto_ofertado = productId;
              } else if (item.source === 'disponibles') {
                itemData.tipo_item = 'producto_disponible';
                itemData.producto_disponible = productId;
              } else if (item.source === 'inventario') {
                // Si hay un modelo específico para inventario, se agregaría aquí
                itemData.tipo_item = 'personalizado';
              }
            }
          }
          
          // Guardar o actualizar según si tiene savedId
          if (item.savedId) {
            await proformaItemsService.update(item.savedId, itemData);
          } else {
            const savedItem = await proformaItemsService.create(itemData);
            // Actualizar el ítem con su ID guardado
            // Aquí tendríamos que pasar una función para actualizar el ítem
            // con su ID guardado, pero por ahora lo dejamos así
          }
        } catch (itemError) {
          console.error(`Error al guardar ítem ${item.description}:`, itemError);
          itemErrors.push(item.description || `Ítem #${currentItems.indexOf(item) + 1}`);
        }
      }
      
      // Ocultar indicador de carga
      toast.dismiss(loadingToast);
      
      // Informar al usuario del resultado
      if (itemErrors.length > 0) {
        if (itemErrors.length === currentItems.length) {
          // Todos los ítems fallaron
          toast.error("Error al guardar los ítems de la proforma", {
            description: "Ningún ítem pudo ser registrado en el sistema."
          });
          return null;
        } else {
          // Algunos ítems fallaron, pero la proforma se guardó
          const errorDetails = itemErrors.length <= 3 
            ? `Ítems con error: ${itemErrors.join(", ")}` 
            : `${itemErrors.length} ítems no pudieron ser guardados`;
            
          toast.warning(isNewProforma 
            ? `Proforma #${currentQuote.number} guardada con advertencias` 
            : `Proforma #${currentQuote.number} actualizada con advertencias`, {
            description: errorDetails
          });
        }
      } else {
        // Todo fue guardado correctamente
        toast.success(isNewProforma 
          ? `¡Proforma #${currentQuote.number} guardada correctamente!` 
          : `¡Proforma #${currentQuote.number} actualizada correctamente!`);
      }
      
      return proformaId; // Devolver el ID para posibles usos posteriores
      
    } catch (error) {
      console.error("Error general al guardar la proforma:", error);
      toast.dismiss(loadingToast);
      
      let errorMessage = "Error al guardar la proforma. Verifica tu conexión e inténtalo de nuevo.";
      
      // Tratar de extraer un mensaje más específico del error
      if (error.errors?.detail) {
        errorMessage = `Error: ${error.errors.detail}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      toast.error(errorMessage);
      return null;
    }
  };
  
  // Función para exportar la proforma como PDF
  const exportProforma = async (currentProforma) => {
    if (!currentProforma) {
      toast.error("No hay una proforma activa para exportar");
      return;
    }
    
    // Verificar que la proforma ha sido guardada
    if (!currentProforma.savedId) {
      const shouldSave = window.confirm("Para exportar a PDF, primero debe guardar la proforma. ¿Desea guardar la proforma ahora?");
      if (shouldSave) {
        const proformaId = await saveProforma(currentProforma);
        if (!proformaId) {
          toast.error("No se pudo guardar la proforma para exportar a PDF.");
          return;
        }
      } else {
        return;
      }
    }
    
    // Obtenemos la URL base del backend
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    const pdfUrl = `${apiBase}/proformas/proformas/${currentProforma.savedId}/exportar_pdf/`;
    
    // Mostrar diálogo para elegir entre abrir o descargar
    const action = window.confirm("¿Desea descargar el PDF o abrirlo en una nueva pestaña?\n\nAceptar: Descargar PDF\nCancelar: Abrir en pestaña");
    
    try {
      // Mostrar indicador de carga
      const loadingToast = toast.loading("Generando PDF...");
      
      if (action) {
        // Opción de descarga directa
        const response = await fetch(pdfUrl);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        // Obtener el blob del PDF
        const blob = await response.blob();
        
        // Crear un enlace de descarga temporal
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `proforma_${currentProforma.quote.number}.pdf`;
        
        // Agregar el enlace al DOM, hacer clic y luego eliminarlo
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Liberar el objeto URL
        window.URL.revokeObjectURL(downloadUrl);
        
        toast.dismiss(loadingToast);
        toast.success("PDF descargado correctamente");
      } else {
        // Abrir en nueva pestaña (comportamiento original)
        window.open(pdfUrl, '_blank');
        toast.dismiss(loadingToast);
        toast.success("PDF abierto en nueva pestaña");
      }
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      toast.dismiss();
      
      let errorMessage = "Error al generar el PDF. Inténtelo de nuevo más tarde.";
      // Intentar extraer mensaje más específico
      if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      toast.error(errorMessage);
    }
  };
  
  // Función para imprimir la proforma
  const printProforma = () => {
    // Función simple para imprimir la página actual
    window.print();
  };

  // Ejecutar la acción solicitada
  const handleAction = async (action) => {
    console.log(`Acción: ${action}`);

    // Nueva proforma es un caso especial que no requiere verificación
    if (action === "new") {
      // Evitamos crear múltiples proformas en sucesión rápida
      // implementando un bloqueo de 1 segundo
      const now = Date.now();
      if (now - (window.lastNewProformaTime || 0) < 1000) {
        console.log("Ignorando solicitud de nueva proforma (muy rápida)");
        return;
      }
      window.lastNewProformaTime = now;
      
      addNewProforma();
      return;
    }

    // Para todas las demás acciones, verificar que existe una proforma activa
    const activeProforma = proformas.find(p => p.id === activeProformaId);
    if (!activeProforma) {
      toast.error("No hay una proforma activa para realizar esta acción");
      return;
    }
    
    if (action === "save") {
      await saveProforma(activeProforma);
    }
    else if (action === "export") {
      exportProforma(activeProforma);
    }
    else if (action === "print") {
      printProforma();
    }
    else if (action === "generate") {
      await generateProforma(activeProforma);
    }
    else if (action === "configure") {
      configureProforma();
    }
  };

  return {
    handleAction,
    saveProforma,
    exportProforma,
    printProforma,
    generateProforma,
    configureProforma
  };
};
