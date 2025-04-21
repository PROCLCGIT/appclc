// src/pages/proformas/hooks/useProformaActions.js

import { toast } from 'sonner';
import { proformasService, proformaItemsService } from '@/services/api';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { debounce } from 'lodash';

/**
 * Hook personalizado para manejar acciones de proforma (guardar, exportar, etc.)
 * Con implementación de debounce para evitar acciones repetidas
 */
export const useProformaActions = ({
  proformas, 
  activeProformaId, 
  updateProforma, 
  addNewProforma, 
  closeProforma, 
  loadProforma,
  formatCurrency,
  showSuccessDialog,
  showErrorDialog,
  showWarningDialog
}) => {
  // Variable para almacenar el último tiempo de creación de proforma nueva
  const [lastNewProformaTime, setLastNewProformaTime] = useState(0);

// These declarations will be moved after the other function definitions

  /**
   * Guarda una proforma en el backend
   */
  const saveProformaRaw = useCallback(async (currentProforma) => {
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
      // Verificar datos de los ítems - asegurándonos de convertir a números antes de comparar
      const itemsWithIssues = currentItems.filter(item => {
        const quantity = parseFloat(item.quantity);
        const unitPrice = parseFloat(item.unitPrice);
        return !item.description || 
               isNaN(quantity) || 
               isNaN(unitPrice) || 
               quantity <= 0 || 
               unitPrice <= 0;
      });
      
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
      
      // Si hay diálogo disponible, usarlo
      if (showErrorDialog) {
        showErrorDialog(
          "No se puede guardar la proforma", 
          "Por favor, corrija los siguientes errores antes de guardar:", 
          errorList
        );
      } else {
        // De lo contrario, usar toast
        toast.error("No se puede guardar la proforma", {
          description: errorList
        });
      }
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
      // Array para almacenar los ítems actualizados con sus savedIds
      const updatedItems = [...currentItems];
      
      for (let i = 0; i < currentItems.length; i++) {
        const item = currentItems[i];
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
            orden: i
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
          
          let savedItem;
          // Guardar o actualizar según si tiene savedId
          if (item.savedId) {
            savedItem = await proformaItemsService.update(item.savedId, itemData);
            console.log(`Ítem actualizado: ${item.description}, savedId: ${item.savedId}`);
          } else {
            savedItem = await proformaItemsService.create(itemData);
            console.log(`Ítem creado: ${item.description}, nuevo savedId: ${savedItem.id}`);
          }
          
          // Actualizar el ítem con su ID guardado
          if (savedItem && savedItem.id) {
            updatedItems[i] = {
              ...updatedItems[i],
              savedId: savedItem.id
            };
          }
        } catch (itemError) {
          console.error(`Error al guardar ítem ${item.description}:`, itemError);
          itemErrors.push(item.description || `Ítem #${i + 1}`);
        }
      }
      
      // Actualizar la proforma con los ítems actualizados
      if (updatedItems.length > 0) {
        updateProforma(currentProforma.id, { items: updatedItems });
        console.log("Ítems actualizados con IDs guardados:", updatedItems);
      }
      
      // Ocultar indicador de carga
      toast.dismiss(loadingToast);
      
      // Preparar información para mostrar al usuario
      const savedDetails = `
ID: ${proformaId}
Cliente: ${currentClient.name}
Fecha: ${new Date().toLocaleString()}
Total: ${formatCurrency ? formatCurrency(currentQuote.total) : currentQuote.total}
Ítems: ${currentItems.length}`;
      
      // Informar al usuario del resultado
      if (itemErrors.length > 0) {
        if (itemErrors.length === currentItems.length) {
          // Todos los ítems fallaron
          if (showErrorDialog) {
            showErrorDialog(
              "Error al guardar los ítems de la proforma",
              "Ningún ítem pudo ser registrado en el sistema. Verifique la información e intente nuevamente.",
              `ID de la proforma: ${proformaId}\nCliente: ${currentClient.name}\nFecha: ${new Date().toLocaleString()}`
            );
          } else {
            toast.error("Error al guardar los ítems de la proforma", {
              description: "Ningún ítem pudo ser registrado en el sistema."
            });
          }
          return null;
        } else {
          // Algunos ítems fallaron, pero la proforma se guardó
          const errorDetails = itemErrors.length <= 3 
            ? `Ítems con error: ${itemErrors.join(", ")}` 
            : `${itemErrors.length} ítems no pudieron ser guardados`;
          
          const title = isNewProforma 
            ? `Proforma #${currentQuote.number} guardada con advertencias` 
            : `Proforma #${currentQuote.number} actualizada con advertencias`;
          
          if (showWarningDialog) {
            showWarningDialog(
              title,
              `La proforma se guardó correctamente, pero ${errorDetails}`,
              savedDetails + "\nEstado: Guardada con " + itemErrors.length + " ítem(s) con errores",
              proformaId
            );
          } else {
            toast.warning(title, {
              description: errorDetails
            });
          }
        }
      } else {
        // Todo fue guardado correctamente
        const title = isNewProforma 
          ? `¡Proforma #${currentQuote.number} guardada correctamente!` 
          : `¡Proforma #${currentQuote.number} actualizada correctamente!`;
          
        const message = isNewProforma
          ? `Se ha creado una nueva proforma para ${currentClient.name} por un total de ${formatCurrency ? formatCurrency(currentQuote.total) : currentQuote.total}`
          : `Se han actualizado los datos de la proforma para ${currentClient.name} por un total de ${formatCurrency ? formatCurrency(currentQuote.total) : currentQuote.total}`;
        
        if (showSuccessDialog) {
          showSuccessDialog(
            title,
            message,
            savedDetails + "\nEstado: Guardada con éxito",
            proformaId
          );
        } else {
          toast.success(title);
        }
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
      
      if (showErrorDialog) {
        showErrorDialog(
          "Error al guardar la proforma",
          errorMessage,
          `Fecha y hora: ${new Date().toLocaleString()}\nCliente: ${currentClient.name || "No especificado"}\nDetalles técnicos: ${error.toString()}`
        );
      } else {
        toast.error(errorMessage);
      }
      
      return null;
    }
  }, [updateProforma, formatCurrency, showSuccessDialog, showErrorDialog, showWarningDialog]);

  /**
   * Versión con debounce de saveProforma
   */
  const saveProforma = useMemo(
    () => debounce(saveProformaRaw, 800),  // tiempo más largo para operación crítica
    [saveProformaRaw]
  );

  /**
   * Exporta la proforma como PDF
   */
  const exportProformaRaw = useCallback(async (currentProforma) => {
    try {
      if (!currentProforma) {
        toast.error("No hay una proforma activa para exportar");
        return;
      }
      
      // Verificar que la proforma ha sido guardada
      if (!currentProforma.savedId) {
        // Usar el diálogo más claro en lugar de confirm
        if (showWarningDialog) {
          const confirmed = await new Promise(resolve => {
            showWarningDialog(
              "Se requiere guardar la proforma",
              "Para exportar a PDF, primero debe guardar la proforma.",
              "¿Desea guardar la proforma ahora?",
              null,
              () => resolve(true),
              () => resolve(false)
            );
          });
          
          if (confirmed) {
            const proformaId = await saveProforma(currentProforma);
            if (!proformaId) {
              toast.error("No se pudo guardar la proforma para exportar a PDF.");
              return;
            }
            // Recargar la proforma actualizada para obtener el savedId
            await loadProforma(proformaId);
          } else {
            return;
          }
        } else {
          // Si no hay diálogo disponible, usar el confirm estándar
          const shouldSave = window.confirm("Para exportar a PDF, primero debe guardar la proforma. ¿Desea guardar la proforma ahora?");
          if (shouldSave) {
            const proformaId = await saveProforma(currentProforma);
            if (!proformaId) {
              toast.error("No se pudo guardar la proforma para exportar a PDF.");
              return;
            }
            // Recargar la proforma actualizada para obtener el savedId
            await loadProforma(proformaId);
          } else {
            return;
          }
        }
      }
      
      // Mostrar indicador de carga
      const loadingToast = toast.loading("Generando PDF...", {
        description: "Espere mientras se procesa el documento"
      });
      
      try {
        // Usar la API de proformas que ya tiene configurada la autenticación
        const proformaId = currentProforma.savedId;
        console.log(`Exportando proforma ID: ${proformaId} a PDF usando ProformaService`);
        
        // Importar la clase de servicio para usar su método exportPdf
        const { ProformaService } = await import('@/services/classes/ProformaService');
        const proformaService = new ProformaService();
        
        try {
          // Método 1: Usar axios con el servicio para obtener el PDF (mejor manejo de autenticación)
          const pdfBlob = await proformaService.exportPdf(proformaId);
          
          // Una vez obtenido el blob, crear URL y abrirlo
          const url = window.URL.createObjectURL(new Blob([pdfBlob]));
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank'; // Abrir en nueva pestaña
          document.body.appendChild(link);
          link.click();
          
          // Limpiar
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
          }, 100);
          
          toast.dismiss(loadingToast);
          toast.success("PDF generado correctamente", {
            description: `Proforma #${currentProforma.quote?.number || proformaId}`
          });
          
        } catch (serviceError) {
          console.error("Error usando ProformaService.exportPdf:", serviceError);
          
          // Método 2: Usar proformasService.api directamente (como fallback)
          try {
            console.log("Intentando con método alternativo usando axios directamente");
            
            const apiBase = window._baseApiUrl || 'http://localhost:8000/api/v1/';
            let pdfUrl = `${apiBase.replace(/\/+$/, '')}/proformas/proformas/${proformaId}/exportar_pdf/`;
            
            // Usar axios (que ya tiene el token configurado) para obtener el archivo
            const response = await proformasService.api({
              url: pdfUrl,
              method: 'GET',
              responseType: 'blob',
              timeout: 30000 // Timeout extendido para archivos grandes
            });
            
            // Crear URL y abrirlo
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank'; // Abrir en nueva pestaña
            document.body.appendChild(link);
            link.click();
            
            // Limpiar
            setTimeout(() => {
              window.URL.revokeObjectURL(url);
              document.body.removeChild(link);
            }, 100);
            
            toast.dismiss(loadingToast);
            toast.success("PDF generado correctamente", {
              description: `Proforma #${currentProforma.quote?.number || proformaId}`
            });
            
          } catch (axiosError) {
            console.error("Error usando axios directo:", axiosError);
            
            // Método 3: Última opción - usar una iframe embebida 
            toast.dismiss(loadingToast);
            toast.info("Abriendo PDF en ventana emergente...", {
              description: "Si se bloquea, permita ventanas emergentes en su navegador"
            });
            
            // Obtener token actual
            const token = localStorage.getItem('auth-token');
            if (!token) {
              throw new Error("No se puede obtener el token de autenticación");
            }
            
            // Crear un iframe oculto con un formulario que hará POST con el token
            const iframe = document.createElement('iframe');
            iframe.name = 'pdf_iframe';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            
            // Crear formulario para enviar el token como Authorization header
            const form = document.createElement('form');
            form.method = 'GET';
            form.action = pdfUrl;
            form.target = 'pdf_iframe';
            
            // Añadir token como campo oculto (el backend necesitará extraerlo)
            const tokenField = document.createElement('input');
            tokenField.type = 'hidden';
            tokenField.name = 'token';
            tokenField.value = token;
            form.appendChild(tokenField);
            
            // Añadir formulario al documento y enviarlo
            document.body.appendChild(form);
            form.submit();
            
            // Limpiar después de un momento
            setTimeout(() => {
              document.body.removeChild(form);
              document.body.removeChild(iframe);
            }, 5000);
          }
        }
      } catch (error) {
        console.error("Error general al exportar PDF:", error);
        toast.dismiss(loadingToast);
        toast.error("Error al generar el PDF", {
          description: "Intente de nuevo más tarde o contacte al soporte técnico"
        });
      }
    } catch (error) {
      console.error("Error general en exportProforma:", error);
      toast.error("Ocurrió un error inesperado al exportar el PDF");
    }
  }, [saveProforma, loadProforma, showWarningDialog]);

  /**
   * Versión con debounce de exportProforma
   */
  const exportProforma = useMemo(
    () => debounce(exportProformaRaw, 600),
    [exportProformaRaw]
  );

  /**
   * Imprime la proforma actual
   */
  const printProformaRaw = useCallback(() => {
    window.print();
  }, []);

  /**
   * Versión con debounce de printProforma
   */
  const printProforma = useMemo(
    () => debounce(printProformaRaw, 500),
    [printProformaRaw]
  );

  /**
   * Genera/envía la proforma (cambia su estado a enviada)
   */
  const generateProformaRaw = useCallback(async (currentProforma) => {
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
  }, [saveProforma, closeProforma, proformas, addNewProforma]);

  /**
   * Versión con debounce de generateProforma
   */
  const generateProforma = useMemo(
    () => debounce(generateProformaRaw, 800),
    [generateProformaRaw]
  );

  /**
   * Configura las opciones de la proforma
   */
  const configureProformaRaw = useCallback(() => {
    toast.info("La configuración de proformas estará disponible próximamente");
  }, []);

  /**
   * Versión con debounce de configureProforma
   */
  const configureProforma = useMemo(
    () => debounce(configureProformaRaw, 500),
    [configureProformaRaw]
  );

  /**
   * Función auxiliar para obtener la proforma activa
   * Esta función se coloca fuera del callback principal para evitar
   * dependencias innecesarias con proformas completo
   */
  const getActiveProforma = useCallback(() => {
    if (!activeProformaId) return null;
    return proformas.find(p => p.id === activeProformaId);
  }, [activeProformaId, proformas]);

  /**
   * Exporta la proforma en otros formatos (Excel, CSV, etc.)
   */
  const exportOtherFormatsRaw = useCallback(async (currentProforma, format) => {
    try {
      if (!currentProforma) {
        toast.error("No hay una proforma activa para exportar");
        return;
      }
      
      // Verificar que la proforma ha sido guardada para formatos que lo requieren
      const requiresSaved = ['excel_detalle', 'csv', 'pdf'];
      if (requiresSaved.includes(format) && !currentProforma.savedId) {
        // Usar el diálogo para confirmar el guardado
        if (showWarningDialog) {
          const confirmed = await new Promise(resolve => {
            showWarningDialog(
              "Se requiere guardar la proforma",
              `Para exportar a ${format.toUpperCase()}, primero debe guardar la proforma.`,
              "¿Desea guardar la proforma ahora?",
              null,
              () => resolve(true),
              () => resolve(false)
            );
          });
          
          if (confirmed) {
            const proformaId = await saveProforma(currentProforma);
            if (!proformaId) {
              toast.error(`No se pudo guardar la proforma para exportar a ${format.toUpperCase()}.`);
              return;
            }
            // Recargar la proforma actualizada para obtener el savedId
            await loadProforma(proformaId);
          } else {
            return;
          }
        } else {
          // Si no hay diálogo disponible, usar el confirm estándar
          const shouldSave = window.confirm(`Para exportar a ${format.toUpperCase()}, primero debe guardar la proforma. ¿Desea guardar la proforma ahora?`);
          if (shouldSave) {
            const proformaId = await saveProforma(currentProforma);
            if (!proformaId) {
              toast.error(`No se pudo guardar la proforma para exportar a ${format.toUpperCase()}.`);
              return;
            }
            // Recargar la proforma actualizada para obtener el savedId
            await loadProforma(proformaId);
          } else {
            return;
          }
        }
      }
      
      // Mostrar indicador de carga
      const formatDisplay = format.replace('_', ' ').toUpperCase();
      const loadingToast = toast.loading(`Generando ${formatDisplay}...`, {
        description: "Espere mientras se procesa el documento"
      });
      
      try {
        // Usar la API de proformas que ya tiene configurada la autenticación
        const proformaId = currentProforma.savedId;
        console.log(`Exportando proforma ID: ${proformaId} a ${format} usando ProformaService`);
        
        // Importar la clase de servicio para usar su método de exportación
        const { ProformaService } = await import('@/services/classes/ProformaService');
        const proformaService = new ProformaService();
        
        // Obtener la URL para la descarga según el formato seleccionado
        let downloadUrl = '';
        let exportResult = null;
        
        // Seleccionar método según formato
        switch (format) {
          case 'pdf':
            exportResult = await proformaService.exportPdf(proformaId);
            break;
          case 'excel_detalle':
            exportResult = await proformaService.exportExcelDetail(proformaId);
            break;
          case 'csv':
            exportResult = await proformaService.exportCsv(proformaId);
            break;
          case 'excel':
            exportResult = await proformaService.exportExcelList();
            break;
          case 'estadisticas':
            exportResult = await proformaService.exportStatisticalReport();
            break;
          default:
            throw new Error(`Formato de exportación no soportado: ${format}`);
        }
        
        // Crear URL y descargar/abrir el archivo
        if (exportResult) {
          // Para PDF en modo visualización, abrirlo en lugar de descargarlo
          if (format === 'pdf' && format.viewMode) {
            // Obtener URL con token
            const apiBase = window._baseApiUrl || 'http://localhost:8000/api/v1/';
            downloadUrl = `${apiBase.replace(/\/+$/, '')}/proformas/proformas/${proformaId}/exportar_pdf/?inline=true`;
            
            // Abrir en nueva ventana
            window.open(downloadUrl, '_blank');
          } else {
            // Para otros formatos, descargar directamente
            const contentType = format === 'pdf' ? 'application/pdf' : 
                               format === 'csv' ? 'text/csv' :
                               'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                               
            const blob = new Blob([exportResult], { type: contentType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `proforma_${currentProforma.quote?.number || proformaId}_${format}.${format === 'pdf' ? 'pdf' : format === 'csv' ? 'csv' : 'xlsx'}`;
            document.body.appendChild(link);
            link.click();
            
            // Limpiar
            setTimeout(() => {
              window.URL.revokeObjectURL(url);
              document.body.removeChild(link);
            }, 100);
          }
          
          toast.dismiss(loadingToast);
          toast.success(`${formatDisplay} generado correctamente`, {
            description: `Proforma #${currentProforma.quote?.number || proformaId}`
          });
        } else {
          throw new Error(`No se pudo generar el archivo ${format}`);
        }
      } catch (error) {
        console.error(`Error al exportar a ${format}:`, error);
        toast.dismiss(loadingToast);
        toast.error(`Error al generar el archivo ${formatDisplay}`, {
          description: error.message || "Error durante la exportación"
        });
      }
    } catch (error) {
      console.error(`Error general en exportar formato ${format}:`, error);
      toast.error("Ocurrió un error inesperado al exportar");
    }
  }, [saveProforma, loadProforma, showWarningDialog]);
  
  /**
   * Versión con debounce de exportOtherFormats
   */
  const exportOtherFormats = useMemo(
    () => debounce(exportOtherFormatsRaw, 600),
    [exportOtherFormatsRaw]
  );

  /**
   * Maneja la acción principal solicitada por el usuario (con debounce)
   */
  const handleActionRaw = useCallback(async (action, params = {}) => {
    console.log(`Acción: ${action}`, params);

    // Nueva proforma es un caso especial que no requiere verificación
    if (action === "new") {
      // Evitamos crear múltiples proformas en sucesión rápida
      const now = Date.now();
      if (now - lastNewProformaTime < 1000) {
        console.log("Ignorando solicitud de nueva proforma (muy rápida)");
        return;
      }
      setLastNewProformaTime(now);
      
      addNewProforma();
      return;
    }

    // Para todas las demás acciones, verificar que existe una proforma activa
    const activeProforma = getActiveProforma();
    if (!activeProforma && !['dashboard', 'reports', 'batch_export'].includes(action)) {
      toast.error("No hay una proforma activa para realizar esta acción");
      return;
    }
    
    // Manejo de acciones según el tipo
    switch (action) {
      case "save":
        await saveProforma(activeProforma);
        break;
        
      case "export":
        // Si se proporciona un formato específico, usar el exportador específico
        if (params.format) {
          if (params.format === 'pdf' && !params.viewMode) {
            exportProforma(activeProforma); // El exportador PDF original si es descarga
          } else {
            exportOtherFormats(activeProforma, params.format);
          }
        } else {
          exportProforma(activeProforma); // Por defecto exportar a PDF
        }
        break;
        
      case "print":
        printProforma();
        break;
        
      case "generate":
      case "send":
        await generateProforma(activeProforma);
        break;
        
      case "configure":
        configureProforma();
        break;
        
      case "share":
        toast.info("Función de compartir proforma estará disponible próximamente");
        break;
        
      case "dashboard":
        toast.info("Accediendo al dashboard de proformas...");
        break;
        
      case "reports":
        toast.info("Generando reportes de proformas...");
        break;
        
      case "batch_export":
        toast.info("Exportación masiva de proformas en desarrollo");
        break;
        
      default:
        toast.warning(`Acción desconocida: ${action}`);
    }
  }, [
    getActiveProforma, 
    addNewProforma,
    lastNewProformaTime, 
    setLastNewProformaTime,
    saveProforma,
    exportProforma,
    exportOtherFormats,
    printProforma,
    generateProforma,
    configureProforma
  ]);

  /**
   * Versión con debounce de handleAction
   */
  const handleAction = useMemo(
    () => debounce(handleActionRaw, 500),
    [handleActionRaw]
  );

  // Limpiar las funciones debounced al desmontar para evitar fugas de memoria
  useEffect(() => {
    return () => {
      handleAction.cancel();
      saveProforma.cancel();
      exportProforma.cancel();
      printProforma.cancel();
      generateProforma.cancel();
      configureProforma.cancel();
    };
  }, [handleAction, saveProforma, exportProforma, printProforma, generateProforma, configureProforma]);

  return {
    handleAction,
    saveProforma,
    exportProforma,
    printProforma,
    generateProforma,
    configureProforma
  };
};

export default useProformaActions;
